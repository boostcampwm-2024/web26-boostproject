import { api } from './axios';
import type { UserProfileResponse } from '@/types/user';

export const userApi = {
  updateProfile: async (userId: number, formData: FormData) => {
    const { data } = await api.put<UserProfileResponse>(`/users/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
