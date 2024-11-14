import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@apis/category';
import { AxiosError } from 'axios';
import type { Category } from '@/types/category';

export const categoryKeys = {
  all: ['categories'] as const,
  detail: (id: string) => ['categories', id] as const,
};

export const useCategories = () => {
  return useQuery<Category[], AxiosError>({
    queryKey: categoryKeys.all,
    queryFn: categoryApi.getCategories,
  });
};

export const useCategoryDetail = (categoryId: string) => {
  return useQuery<Category, AxiosError>({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoryApi.getCategoryById(categoryId),
    enabled: !!categoryId,
  });
};
