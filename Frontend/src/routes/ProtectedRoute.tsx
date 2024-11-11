import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
      return !!jwtCookie;
    };

    if (!isAuthenticated && checkAuth()) {
      useAuthStore.getState().setAuthenticated(true);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
