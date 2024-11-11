// src/store/useAuthStore.ts
import { create } from 'zustand';
import { api } from '@/apis/axios';
import { config } from '@/config/env';

interface AuthStore {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  checkAuthStatus: () => boolean;
  login: (provider: 'google' | 'naver' | 'github') => void;
  logout: () => Promise<void>;
}

const getJwtFromCookie = () => {
  try {
    console.log('Checking cookies:', document.cookie);
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const hasJwt = cookies.some(cookie => cookie.startsWith('jwt='));
    console.log('JWT found in cookies:', hasJwt);
    return hasJwt;
  } catch (error) {
    console.error('Error checking JWT cookie:', error);
    return false;
  }
};

export const useAuthStore = create<AuthStore>(set => {
  console.log('Creating auth store');
  const initialAuth = getJwtFromCookie();
  console.log('Initial auth state:', initialAuth);

  return {
    isAuthenticated: initialAuth,

    setAuthenticated: (value: boolean) => {
      console.log('Setting authenticated:', value);
      set({ isAuthenticated: value });
    },

    checkAuthStatus: () => {
      console.log('Checking auth status');
      const hasJwt = getJwtFromCookie();
      console.log('Auth status result:', hasJwt);
      set({ isAuthenticated: hasJwt });
      return hasJwt;
    },

    login: provider => {
      console.log('Login initiated for provider:', provider);
      const params = new URLSearchParams({
        client_id: config.auth[provider].clientId,
        redirect_uri: config.auth[provider].redirectUri,
      });

      switch (provider) {
        case 'github':
          window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
          break;
        case 'google':
          params.append('response_type', 'code');
          params.append('scope', 'email profile');
          window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
          break;
        case 'naver':
          params.append('response_type', 'code');
          params.append('state', Math.random().toString(36).substring(7));
          window.location.href = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
          break;
      }
    },

    logout: async () => {
      console.log('Logout initiated');
      try {
        await api.post('/auth/logout');
        document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        set({ isAuthenticated: false });
        console.log('Logout successful');
      } catch (error) {
        console.error('Logout failed:', error);
        throw error;
      }
    },
  };
});
