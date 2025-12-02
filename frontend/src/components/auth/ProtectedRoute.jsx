import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';

export default function ProtectedRoute({ allowedRoles, redirectTo = '/app' }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const userRole = user?.role ?? 'employee';

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
}
