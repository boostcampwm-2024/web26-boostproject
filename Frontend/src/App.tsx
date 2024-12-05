import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AppRoutes from '@routes/index';
import { queryClient } from '@/config/queryClient';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useStudioStore } from '@store/useStudioStore';

function AppContent() {
  const location = useLocation();
  const cleanup = useStudioStore(state => state.cleanup);

  useEffect(() => {
    const isLeavingStudioPage = (pathname: string) => {
      return !pathname.includes('/studio');
    };

    if (isLeavingStudioPage(location.pathname)) {
      cleanup();
    }

    return () => {
      if (isLeavingStudioPage(location.pathname)) {
        cleanup();
      }
    };
  }, [location.pathname, cleanup]);

  return <AppRoutes />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
