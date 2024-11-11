// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ChannelProvider } from '@/contexts/ChannelContext';
import AppRoutes from '@routes/index';
import { queryClient } from '@/config/queryClient';
import { useAuthStore } from '@/store/useAuthStore';

export default function App() {
  console.log('App component rendered'); // 1. 컴포넌트 렌더링 확인

  const { checkAuthStatus, isAuthenticated } = useAuthStore();
  console.log('Current auth state:', isAuthenticated); // 2. 현재 인증 상태 확인

  useEffect(() => {
    console.log('useEffect running'); // 3. useEffect 실행 확인

    const initialCheck = () => {
      console.log('Running initial auth check'); // 4. 초기 체크 실행 확인
      const isAuth = checkAuthStatus();
      console.log('Auth check result:', isAuth); // 5. 체크 결과 확인
      console.log('Cookie value:', document.cookie); // 6. 실제 쿠키 값 확인
    };

    initialCheck();

    const handleVisibilityChange = () => {
      console.log('Visibility changed'); // 7. visibility 변경 확인
      if (document.visibilityState === 'visible') {
        checkAuthStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('Cleanup running'); // 8. cleanup 실행 확인
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
