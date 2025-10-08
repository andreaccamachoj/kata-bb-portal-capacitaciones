import { Navigate } from 'react-router-dom';
import { UserRole } from '@/types/autentication.interface';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();

  // Mostramos un loading mientras se verifica la autenticación
  if (isLoading) {
    return <div>Loading...</div>; // Puedes reemplazar esto con un componente de loading
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole([...roles])) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}