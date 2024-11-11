import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ChannelProvider } from '@/contexts/ChannelContext';
import AppRoutes from '@routes/index';
import { queryClient } from '@/config/queryClient';
import { useAuthStore } from '@/store/useAuthStore';

export default function App() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuthStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuthStatus]);

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
