import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginCallback() {
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setAuthenticated(true);
        navigate('/');
      } catch (error) {
        console.error('Login callback failed:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setAuthenticated]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-lg">로그인 처리중...</div>
    </div>
  );
}
