const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { env } = require('./config/env');
const { isDBReady } = require('./config/db');
const { mongoSanitizeMiddleware } = require('./utils/mongoSanitize');
const { errorHandler } = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const questionRoutes = require('./modules/questions/question.routes');
const examinationRoutes = require('./modules/examinations/examination.routes');
const attemptRoutes = require('./modules/attempts/attempt.routes');
const resultRoutes = require('./modules/results/result.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

// ── 1. Root & Health Probes ───────────────────────────────────────────
app.get('/', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    name: 'Online Examination and Assessment System API',
    version: '1.0.0',
    documentation: '/docs/API_DOCUMENTATION.md',
    health: '/health',
    ready: '/ready',
    apiBase: '/api/v1'
  });
});

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', (req, res) => {
  if (isDBReady()) {
    return res.status(200).json({ status: 'ready', database: 'connected' });
  }
  return res.status(503).json({ status: 'unavailable', database: 'disconnected' });
});

// ── 2. Security Headers ────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false // Allows API to serve JSON responses cleanly
  })
);

// ── 3. CORS Configuration ──────────────────────────────────────────────
const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// ── 4. Body Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── 5. NoSQL Injection Prevention ─────────────────────────────────────
app.use(mongoSanitizeMiddleware);

// ── 6. HTTP Request Logging ───────────────────────────────────────────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── 7. Global Rate Limiter ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
});
app.use('/api', globalLimiter);

// ── 8. Strict Rate Limiter for Authentication ──────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again after a minute.'
    }
  }
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ── 9. Mount API Routes ────────────────────────────────────────────────
const apiV1Router = express.Router();
apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/users', userRoutes);
apiV1Router.use('/questions', questionRoutes);
apiV1Router.use('/examinations', examinationRoutes);
apiV1Router.use('/exams', examinationRoutes);
apiV1Router.use('/attempts', attemptRoutes);
apiV1Router.use('/results', resultRoutes);
apiV1Router.use('/dashboard', dashboardRoutes);

app.use('/api/v1', apiV1Router);
app.use('/api', apiV1Router);

// ── 10. 404 Route Handler ──────────────────────────────────────────────
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    }
  });
});

// ── 11. Centralized Error Handler ──────────────────────────────────────
app.use(errorHandler);

module.exports = { app };

