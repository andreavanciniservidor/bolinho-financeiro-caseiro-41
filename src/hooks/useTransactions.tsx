
import { useState, useEffect } from 'react';
import { Transaction } from '@/types';

// Mock data para transações
const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Salário',
    amount: 5000,
    date: '2024-07-01',
    type: 'income',
    category: 'Trabalho',
    paymentMethod: 'PIX'
  },
  {
    id: '2',
    description: 'Supermercado',
    amount: 250,
    date: '2024-07-02',
    type: 'expense',
    category: 'Alimentação',
    paymentMethod: 'Cartão de Débito'
  },
  {
    id: '3',
    description: 'Conta de Luz',
    amount: 120,
    date: '2024-07-03',
    type: 'expense',
    category: 'Casa',
    paymentMethod: 'Débito Automático'
  }
];

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento dos dados
    setTimeout(() => {
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 500);
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    return { data: newTransaction, error: null };
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...transaction } : t)
    );
    return { data: null, error: null };
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    return { error: null };
  };

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
