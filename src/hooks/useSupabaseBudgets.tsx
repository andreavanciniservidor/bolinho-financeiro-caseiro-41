
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService, BudgetWithCategory } from '@/services/budgetService';
import { useAuth } from './useAuth';

export interface Budget {
  id: string;
  name: string;
  category?: string;
  plannedAmount: number;
  spentAmount: number;
  alertPercentage: number;
  isActive: boolean;
}

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

  const budgets = budgetData?.map(b => ({
    id: b.id,
    name: b.name,
    category: b.category?.name || 'Sem categoria',
    plannedAmount: b.planned_amount,
    spentAmount: b.spent_amount,
    alertPercentage: b.alert_percentage,
    isActive: b.is_active
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
