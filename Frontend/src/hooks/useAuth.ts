import { authApi } from '@apis/auth';
import { Provider, AuthCallbackParams } from '@/types/auth';
import { useAuthStore } from '@store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { config } from '@config/env';

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuthStore();

  const getOAuthUrl = (provider: Provider) => {
    const { clientId, redirectUri } = config.auth[provider];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
    });

    switch (provider) {
      case 'google':
        params.append('response_type', 'code');
        params.append('scope', 'openid email profile');
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      case 'github':
        params.append('scope', 'user:email read:user');
        return `https://github.com/login/oauth/authorize?${params.toString()}`;

      case 'naver':
        params.append('response_type', 'code');
        params.append('state', crypto.randomUUID());
        params.append('scope', 'email profile');
        return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  };

  const login = (provider: Provider) => {
    const url = getOAuthUrl(provider);
    window.location.href = url;
  };

  const handleCallback = async (params: AuthCallbackParams) => {
    try {
      const response = await authApi.handleCallback(params);
      if (response.success) {
        setAuth({
          accessToken: response.accessToken,
          user: response.user,
        });
        navigate('/');
      }
    } catch {
      navigate('/login');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      clearAuth();
      navigate('/');
    } catch {}
  };

  // const refreshToken = async () => {
  //   try {
  //     const data = await authApi.refreshToken();
  //     setAuth({
  //       accessToken: data.accessToken,
  //       user: data.user,
  //     });
  //   } catch {
  //     clearAuth();
  //     navigate('/login');
  //   }
  // };

  return {
    login,
    handleCallback,
    logout,
    // refreshToken,
  };
}
