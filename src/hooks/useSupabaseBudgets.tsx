
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Budget {
  id: string;
  name: string;
  category: string;
  plannedAmount: number;
  spentAmount: number;
  alertPercentage: number;
  isActive: boolean;
}

export function useSupabaseBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchBudgets = async () => {
    if (!user) {
      setBudgets([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          categories!inner(name)
        `)
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      const formattedBudgets = data?.map(b => ({
        id: b.id,
        name: b.name,
        category: b.categories?.name || 'Sem categoria',
        plannedAmount: Number(b.planned_amount),
        spentAmount: Number(b.spent_amount || 0),
        alertPercentage: b.alert_percentage || 80,
        isActive: b.is_active !== false,
      })) || [];

      setBudgets(formattedBudgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setBudgets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  const addBudget = async (budget: Omit<Budget, 'id' | 'spentAmount'>) => {
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
      // Find category by name
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', budget.category)
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          name: budget.name,
          category_id: categoryData?.id,
          planned_amount: budget.plannedAmount,
          alert_percentage: budget.alertPercentage,
          is_active: budget.isActive,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchBudgets();
      return { data, error: null };
    } catch (error) {
      console.error('Error adding budget:', error);
      return { data: null, error: error.message };
    }
  };

  const updateBudget = async (id: string, budget: Partial<Budget>) => {
    if (!user) return { data: null, error: 'User not authenticated' };

    try {
      let categoryId = null;
      if (budget.category) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', budget.category)
          .eq('user_id', user.id)
          .single();
        categoryId = categoryData?.id;
      }

      const updateData: any = {};
      if (budget.name) updateData.name = budget.name;
      if (categoryId) updateData.category_id = categoryId;
      if (budget.plannedAmount !== undefined) updateData.planned_amount = budget.plannedAmount;
      if (budget.alertPercentage !== undefined) updateData.alert_percentage = budget.alertPercentage;
      if (budget.isActive !== undefined) updateData.is_active = budget.isActive;

      const { error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchBudgets();
      return { data: null, error: null };
    } catch (error) {
      console.error('Error updating budget:', error);
      return { data: null, error: error.message };
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgets(prev => prev.filter(b => b.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting budget:', error);
      return { error: error.message };
    }
  };

  return {
    budgets,
    isLoading,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
}
