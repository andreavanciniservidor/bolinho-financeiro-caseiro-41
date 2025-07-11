
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';

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
  const { currentOrganization } = useOrganization();

  const fetchBudgets = async () => {
    if (!user || !currentOrganization) {
      setBudgets([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('budgets')
        .select(`
          *,
          categories!inner(name)
        `)
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (error) throw error;

      const formattedBudgets = data?.map((b: any) => ({
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
  }, [user, currentOrganization]);

  const addBudget = async (budget: Omit<Budget, 'id' | 'spentAmount'>) => {
    if (!user || !currentOrganization) return { data: null, error: 'User not authenticated or no organization selected' };

    try {
      // Find category by name
      const { data: categoryData } = await (supabase as any)
        .from('categories')
        .select('id')
        .eq('name', budget.category)
        .eq('organization_id', currentOrganization.id)
        .single();

      const { data, error } = await (supabase as any)
        .from('budgets')
        .insert([{
          name: budget.name,
          category_id: categoryData?.id,
          planned_amount: budget.plannedAmount,
          alert_percentage: budget.alertPercentage,
          is_active: budget.isActive,
          user_id: user.id,
          organization_id: currentOrganization.id,
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchBudgets();
      return { data, error: null };
    } catch (error) {
      console.error('Error adding budget:', error);
      return { data: null, error: (error as Error).message };
    }
  };

  const updateBudget = async (id: string, budget: Partial<Budget>) => {
    if (!user || !currentOrganization) return { data: null, error: 'User not authenticated or no organization selected' };

    try {
      let categoryId = null;
      if (budget.category) {
        const { data: categoryData } = await (supabase as any)
          .from('categories')
          .select('id')
          .eq('name', budget.category)
          .eq('organization_id', currentOrganization.id)
          .single();
        categoryId = categoryData?.id;
      }

      const updateData: any = {};
      if (budget.name) updateData.name = budget.name;
      if (categoryId) updateData.category_id = categoryId;
      if (budget.plannedAmount !== undefined) updateData.planned_amount = budget.plannedAmount;
      if (budget.alertPercentage !== undefined) updateData.alert_percentage = budget.alertPercentage;
      if (budget.isActive !== undefined) updateData.is_active = budget.isActive;

      const { error } = await (supabase as any)
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      await fetchBudgets();
      return { data: null, error: null };
    } catch (error) {
      console.error('Error updating budget:', error);
      return { data: null, error: (error as Error).message };
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user || !currentOrganization) return { error: 'User not authenticated or no organization selected' };

    try {
      const { error } = await (supabase as any)
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      setBudgets(prev => prev.filter(b => b.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting budget:', error);
      return { error: (error as Error).message };
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
