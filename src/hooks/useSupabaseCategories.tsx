
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/categoryService';
import { useAuth } from './useAuth';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  is_active?: boolean;
}

export function useSupabaseCategories(type?: 'income' | 'expense') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories', type],
    queryFn: () => categoryService.getCategories(type),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories change less frequently
  });

  const addCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      categoryService.updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const addCategory = useCallback(async (category: Omit<Category, 'id'>) => {
    try {
      const result = await addCategoryMutation.mutateAsync(category);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [addCategoryMutation]);

  const updateCategory = useCallback(async (id: string, updates: any) => {
    try {
      const result = await updateCategoryMutation.mutateAsync({ id, updates });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [updateCategoryMutation]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(id);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }, [deleteCategoryMutation]);

  return {
    categories,
    isLoading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch,
    isAdding: addCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
}
