
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  paymentMethod: string;
  isRecurring?: boolean;
  installments?: number;
  observations?: string;
}

export function useSupabaseTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  const fetchTransactions = async () => {
    if (!user || !currentOrganization) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories!inner(name)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedTransactions = data?.map(t => ({
        id: t.id,
        description: t.description,
        amount: Number(t.amount),
        date: t.date,
        type: t.type as 'income' | 'expense',
        category: t.categories?.name || 'Sem categoria',
        paymentMethod: t.payment_method,
        isRecurring: t.is_recurring,
        installments: t.installments,
        observations: t.observations,
      })) || [];

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, currentOrganization]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user || !currentOrganization) return { data: null, error: 'User not authenticated or no organization selected' };

    try {
      // Find category by name
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', transaction.category)
        .eq('organization_id', currentOrganization.id)
        .single();

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          type: transaction.type,
          category_id: categoryData?.id,
          payment_method: transaction.paymentMethod,
          is_recurring: transaction.isRecurring,
          installments: transaction.installments,
          observations: transaction.observations,
          user_id: user.id,
          organization_id: currentOrganization.id,
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchTransactions();
      return { data, error: null };
    } catch (error) {
      console.error('Error adding transaction:', error);
      return { data: null, error: error.message };
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    if (!user || !currentOrganization) return { data: null, error: 'User not authenticated or no organization selected' };

    try {
      let categoryId = null;
      if (transaction.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', transaction.category)
          .eq('organization_id', currentOrganization.id)
          .single();
        categoryId = categoryData?.id;
      }

      const updateData: any = {};
      if (transaction.description) updateData.description = transaction.description;
      if (transaction.amount !== undefined) updateData.amount = transaction.amount;
      if (transaction.date) updateData.date = transaction.date;
      if (transaction.type) updateData.type = transaction.type;
      if (categoryId) updateData.category_id = categoryId;
      if (transaction.paymentMethod) updateData.payment_method = transaction.paymentMethod;
      if (transaction.isRecurring !== undefined) updateData.is_recurring = transaction.isRecurring;
      if (transaction.installments) updateData.installments = transaction.installments;
      if (transaction.observations) updateData.observations = transaction.observations;

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      await fetchTransactions();
      return { data: null, error: null };
    } catch (error) {
      console.error('Error updating transaction:', error);
      return { data: null, error: error.message };
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user || !currentOrganization) return { error: 'User not authenticated or no organization selected' };

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return { error: error.message };
    }
  };

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
}
