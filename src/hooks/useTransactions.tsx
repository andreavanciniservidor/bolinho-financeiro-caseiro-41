
import { useState, useEffect } from 'react';

// Mock data with proper category objects
const mockTransactions = [
  {
    id: '1',
    description: 'Supermercado',
    amount: -150.00,
    date: '2024-01-15',
    type: 'expense' as const,
    category: {
      id: '1',
      name: 'Alimentação',
      color: '#ef4444',
      type: 'expense' as const
    },
    payment_method: 'Cartão de Crédito',
    user_id: '1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    description: 'Salário',
    amount: 5000.00,
    date: '2024-01-01',
    type: 'income' as const,
    category: {
      id: '2',
      name: 'Salário',
      color: '#10b981',
      type: 'income' as const
    },
    payment_method: 'Transferência',
    user_id: '1',
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2024-01-01T09:00:00Z'
  },
  {
    id: '3',
    description: 'Conta de Luz',
    amount: -120.00,
    date: '2024-01-10',
    type: 'expense' as const,
    category: {
      id: '3',
      name: 'Utilities',
      color: '#f59e0b',
      type: 'expense' as const
    },
    payment_method: 'Débito Automático',
    user_id: '1',
    created_at: '2024-01-10T14:00:00Z',
    updated_at: '2024-01-10T14:00:00Z'
  }
];

export interface UseTransactionsResult {
  transactions: typeof mockTransactions;
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: any) => Promise<void>;
  updateTransaction: (id: string, updates: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refetch: () => void;
}

export function useTransactions(): UseTransactionsResult {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTransaction = async (transaction: any) => {
    setIsLoading(true);
    try {
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setTransactions(prev => [newTransaction, ...prev]);
    } catch (err) {
      setError('Failed to add transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: any) => {
    setIsLoading(true);
    try {
      setTransactions(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t)
      );
    } catch (err) {
      setError('Failed to update transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    setIsLoading(true);
    try {
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    // Mock refetch - in real app this would refetch from API
    setTransactions(mockTransactions);
  };

  return {
    transactions,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch
  };
}
