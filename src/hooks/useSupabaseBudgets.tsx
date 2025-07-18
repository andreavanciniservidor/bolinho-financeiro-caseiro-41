
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService, BudgetWithCategory } from '@/services/budgetService';
import { useAuth } from './useAuth';
import type { Budget } from '@/types';

export function useSupabaseBudgets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: budgetData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['budgets'],
    queryFn: budgetService.getBudgets,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Map the data to match our Budget interface (using snake_case as per database)
  const budgets: Budget[] = budgetData?.map(b => ({
    id: b.id,
    name: b.name,
    category: b.category?.name || 'Sem categoria',
    category_id: b.category_id,
    planned_amount: b.planned_amount,
    spent_amount: b.spent_amount,
    alert_percentage: b.alert_percentage,
    is_active: b.is_active,
    user_id: b.user_id,
    organization_id: b.organization_id,
    created_at: b.created_at || new Date().toISOString(),
    updated_at: b.updated_at || new Date().toISOString()
  })) || [];

  const addBudgetMutation = useMutation({
    mutationFn: budgetService.createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      budgetService.updateBudget(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: budgetService.deleteBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const addBudget = useCallback(async (budget: any) => {
    try {
      const result = await addBudgetMutation.mutateAsync(budget);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [addBudgetMutation]);

  const updateBudget = useCallback(async (id: string, updates: any) => {
    try {
      const result = await updateBudgetMutation.mutateAsync({ id, updates });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [updateBudgetMutation]);

  const deleteBudget = useCallback(async (id: string) => {
    try {
      await deleteBudgetMutation.mutateAsync(id);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }, [deleteBudgetMutation]);

  return {
    budgets,
    isLoading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch,
    isAdding: addBudgetMutation.isPending,
    isUpdating: updateBudgetMutation.isPending,
    isDeleting: deleteBudgetMutation.isPending,
  };
}
