import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to={`/${user.role}`} replace />;
  return <Outlet />;
}
