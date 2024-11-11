import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ChannelProvider } from '@/contexts/ChannelContext';
import AppRoutes from '@routes/index';
import { queryClient } from '@/config/queryClient';
import { useAuthStore } from '@/store/useAuthStore';

export default function App() {
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
      const isAuthenticated = !!jwtCookie;
      setAuthenticated(isAuthenticated);
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [setAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ChannelProvider>
          <AppRoutes />
        </ChannelProvider>
      </Router>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
