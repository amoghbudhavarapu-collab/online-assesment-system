import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';
import RequireAuth from './routes/RequireAuth';
import RoleGuard from './routes/RoleGuard';
import PublicOnly from './routes/PublicOnly';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProfilePage from './pages/shared/ProfilePage';
import ResultDetail from './pages/shared/ResultDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import AdminExamsPage from './pages/admin/AdminExamsPage';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminResultsOverview from './pages/admin/AdminResultsOverview';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import QuestionBank from './pages/teacher/QuestionBank';
import QuestionForm from './pages/teacher/QuestionForm';
import QuestionPreview from './pages/teacher/QuestionPreview';
import ExamList from './pages/teacher/ExamList';
import ExamForm from './pages/teacher/ExamForm';
import ExamDetail from './pages/teacher/ExamDetail';
import ExamResults from './pages/teacher/ExamResults';
import TeacherAnalytics from './pages/teacher/TeacherAnalytics';
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams from './pages/student/AvailableExams';
import ExamInstructions from './pages/student/ExamInstructions';
import AttemptPage from './pages/student/AttemptPage';
import ExamHistory from './pages/student/ExamHistory';
import StudentResults from './pages/student/StudentResults';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/student/attempt/:attemptId" element={<AttemptPage />} />

        <Route element={<AppLayout />}>
          <Route element={<RoleGuard roles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/students" element={<UsersPage roleFilter="student" title="Manage students" description="Student accounts, activation, and role changes." />} />
            <Route path="/admin/teachers" element={<UsersPage roleFilter="teacher" title="Manage teachers" description="Promote users to teacher or deactivate examiner accounts." />} />
            <Route path="/admin/examinations" element={<AdminExamsPage />} />
            <Route path="/admin/examinations/:id" element={<ExamDetail />} />
            <Route path="/admin/examinations/:id/results" element={<ExamResults />} />
            <Route path="/admin/results" element={<AdminResultsOverview />} />
            <Route path="/admin/results/:id" element={<ResultDetail />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<RoleGuard roles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/questions" element={<QuestionBank />} />
            <Route path="/teacher/questions/new" element={<QuestionForm />} />
            <Route path="/teacher/questions/:id" element={<QuestionPreview />} />
            <Route path="/teacher/questions/:id/edit" element={<QuestionForm />} />
            <Route path="/teacher/examinations" element={<ExamList />} />
            <Route path="/teacher/examinations/new" element={<ExamForm />} />
            <Route path="/teacher/examinations/:id" element={<ExamDetail />} />
            <Route path="/teacher/examinations/:id/edit" element={<ExamForm />} />
            <Route path="/teacher/examinations/:id/attempts" element={<ExamResults />} />
            <Route path="/teacher/examinations/:id/results" element={<ExamResults />} />
            <Route path="/teacher/results/:id" element={<ResultDetail />} />
            <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
            <Route path="/teacher/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<RoleGuard roles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/exams" element={<AvailableExams />} />
            <Route path="/student/exams/upcoming" element={<AvailableExams upcomingOnly />} />
            <Route path="/student/exams/:id" element={<ExamInstructions />} />
            <Route path="/student/history" element={<ExamHistory />} />
            <Route path="/student/results" element={<StudentResults />} />
            <Route path="/student/results/:id" element={<ResultDetail />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
