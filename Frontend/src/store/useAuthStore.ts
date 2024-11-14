import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  nickname: string;
  liveId: number | null;
  profileImage?: string;
  channelId: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (auth: { accessToken: string; user: User }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      user: null,
      setAuth: auth =>
        set({
          accessToken: auth.accessToken,
          user: auth.user,
        }),
      clearAuth: () =>
        set({
          accessToken: null,
          user: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: state => ({ user: state.user }),
    },
  ),
);
