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
    const cookies = document.cookie.split(';');
    const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
    return jwtCookie ? jwtCookie.split('=')[1] : null;
  } catch (error) {
    console.error('Error checking JWT cookie:', error);
    return null;
  }
};

export const useAuthStore = create<AuthStore>(set => ({
  isAuthenticated: false,

  setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),

  checkAuthStatus: () => {
    const jwt = getJwtFromCookie();
    const newAuthState = !!jwt;
    set({ isAuthenticated: newAuthState });
    return newAuthState;
  },

  login: provider => {
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
    try {
      await api.post('/auth/logout');
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      set({ isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
}));
