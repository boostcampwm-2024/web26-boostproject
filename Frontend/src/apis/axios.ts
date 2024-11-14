import axios from 'axios';
import { config } from '@/config/env';
import { useAuthStore } from '@/store/useAuthStore';
import { RefreshTokenResponse } from '@/types/auth';

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    // const originalRequest = error.config;

    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;

    //   try {
    //     const response = await api.post<RefreshTokenResponse>('/auth/refresh');
    //     const { accessToken, user } = response.data;

    //     useAuthStore.getState().setAuth({ accessToken, user });
    //     originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    //     return api(originalRequest);
    //   } catch (refreshError) {
    //     useAuthStore.getState().clearAuth();
    //     window.location.href = '/login';
    //     return Promise.reject(refreshError);
    //   }
    // }

    return Promise.reject(error);
  },
);
