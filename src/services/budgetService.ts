
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Budget = Database['public']['Tables']['budgets']['Row'];
type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
type BudgetUpdate = Database['public']['Tables']['budgets']['Update'];

export interface BudgetWithCategory extends Budget {
  category?: {
    id: string;
    name: string;
    color: string;
    type: string;
  };
}

class BudgetService {
  async getBudgets() {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BudgetWithCategory[];
  }

  async getBudgetById(id: string) {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as BudgetWithCategory;
  }

  async createBudget(budget: BudgetInsert) {
    const { data, error } = await supabase
      .from('budgets')
      .insert(budget)
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .single();

    if (error) throw error;
    return data as BudgetWithCategory;
  }

  async updateBudget(id: string, updates: BudgetUpdate) {
    const { data, error } = await supabase
      .from('budgets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .single();

    if (error) throw error;
    return data as BudgetWithCategory;
  }

  async deleteBudget(id: string) {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  async deactivateBudget(id: string) {
    return this.updateBudget(id, { is_active: false });
  }

  async getBudgetProgress(budgetId: string) {
    const budget = await this.getBudgetById(budgetId);
    
    const percentage = budget.planned_amount > 0 
      ? (budget.spent_amount / budget.planned_amount) * 100 
      : 0;

    const remaining = budget.planned_amount - budget.spent_amount;
    const isOverBudget = budget.spent_amount > budget.planned_amount;
    const isNearLimit = percentage >= budget.alert_percentage;

    return {
      budget,
      percentage,
      remaining,
      isOverBudget,
      isNearLimit,
      status: isOverBudget ? 'over' : isNearLimit ? 'warning' : 'good'
    };
  }

  async getBudgetAlerts() {
    const budgets = await this.getBudgets();
    
    return budgets
      .map(budget => {
        const percentage = budget.planned_amount > 0 
          ? (budget.spent_amount / budget.planned_amount) * 100 
          : 0;
        
        const isOverBudget = budget.spent_amount > budget.planned_amount;
        const isNearLimit = percentage >= budget.alert_percentage;

        if (isOverBudget || isNearLimit) {
          return {
            budget,
            percentage,
            type: isOverBudget ? 'over_budget' : 'near_limit',
            message: isOverBudget 
              ? `Orçamento "${budget.name}" excedido em R$ ${(budget.spent_amount - budget.planned_amount).toFixed(2)}`
              : `Orçamento "${budget.name}" próximo do limite (${percentage.toFixed(0)}%)`
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  async recalculateSpentAmounts() {
    const budgets = await this.getBudgets();
    
    for (const budget of budgets) {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('category_id', budget.category_id)
        .eq('type', 'expense');

      const spentAmount = transactions?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

      await this.updateBudget(budget.id, { spent_amount: spentAmount });
    }
  }
}

export const budgetService = new BudgetService();
