import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/apis/axios';
import { config } from '@/config/env';

interface AuthStore {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  login: (provider: 'google' | 'naver' | 'github') => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      isAuthenticated: false,
      setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
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
          set({ isAuthenticated: false });
        } catch (error) {
          console.error('Logout failed:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);
