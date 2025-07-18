
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { useAuth } from './useAuth';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: {
    id: string;
    name: string;
    color: string;
    type: 'income' | 'expense';
  };
  category_id?: string;
  payment_method: string;
  installments?: number;
  installment_number?: number;
  is_recurring?: boolean;
  observations?: string;
  tags?: string[];
  user_id: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  category_id?: string;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface PaginationOptions {
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: TransactionFilters;
}

export function useSupabaseTransactions(options: PaginationOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { limit = 50, sortBy = 'date', sortOrder = 'desc', filters } = options;

  const {
    data: transactionData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['transactions', { limit, sortBy, sortOrder, filters }],
    queryFn: () => transactionService.getTransactions(filters, { limit }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Add missing properties to transactions
  const transactions = (transactionData?.data || []).map(t => ({
    ...t,
    installment_number: t.installment_number || 1,
    tags: t.tags || [],
    type: t.type as 'income' | 'expense'
  }));
  
  const totalCount = transactionData?.count || 0;

  // Mutations
  const addTransactionMutation = useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      transactionService.updateTransaction(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const duplicateTransactionMutation = useMutation({
    mutationFn: transactionService.duplicateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // Helper functions
  const addTransaction = useCallback(async (transaction: any) => {
    try {
      const result = await addTransactionMutation.mutateAsync(transaction);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [addTransactionMutation]);

  const updateTransaction = useCallback(async (id: string, updates: any) => {
    try {
      const result = await updateTransactionMutation.mutateAsync({ id, updates });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [updateTransactionMutation]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await deleteTransactionMutation.mutateAsync(id);
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }, [deleteTransactionMutation]);

  const duplicateTransaction = useCallback(async (id: string) => {
    try {
      const result = await duplicateTransactionMutation.mutateAsync(id);
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  }, [duplicateTransactionMutation]);

  return {
    transactions,
    isLoading,
    error,
    totalCount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    refetch,
    // Mutation states
    isAdding: addTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
    isDuplicating: duplicateTransactionMutation.isPending,
  };
}
