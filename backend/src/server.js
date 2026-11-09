const { env } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { startExaminationExpiryJob, stopExaminationExpiryJob } = require('./jobs/examinationExpiry.job');
const { app } = require('./app');

let server;

async function bootstrap() {
  try {
    // 1. Start Express HTTP Server
    server = app.listen(env.PORT, () => {
      console.log(`🚀 Online Assessment API server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`🔗 Health check: http://localhost:${env.PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${env.PORT}/api/v1`);
    });

    // 2. Connect to Database
    await connectDB();

    // 3. Start Background Jobs
    startExaminationExpiryJob();
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handling
async function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  stopExaminationExpiryJob();

  if (server) {
    server.close(() => {
      console.log('🔒 HTTP server closed');
    });
  }

  await disconnectDB();
  console.log('👋 Process terminated gracefully');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

bootstrap();

