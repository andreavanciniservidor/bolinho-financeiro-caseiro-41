import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

class CategoryService {
  async getCategories(type?: 'income' | 'expense') {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCategory(category: CategoryInsert) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, updates: CategoryUpdate) {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string) {
    // Check if category is being used in transactions or budgets
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    const { data: budgets } = await supabase
      .from('budgets')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (transactions && transactions.length > 0) {
      throw new Error('Não é possível excluir categoria que possui transações associadas');
    }

    if (budgets && budgets.length > 0) {
      throw new Error('Não é possível excluir categoria que possui orçamentos associados');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  async deactivateCategory(id: string) {
    return this.updateCategory(id, { is_active: false });
  }

  async getCategoryUsage(id: string) {
    const [transactionsResult, budgetsResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('id, amount, type')
        .eq('category_id', id),
      supabase
        .from('budgets')
        .select('id, name, planned_amount')
        .eq('category_id', id)
    ]);

    if (transactionsResult.error) throw transactionsResult.error;
    if (budgetsResult.error) throw budgetsResult.error;

    const transactions = transactionsResult.data || [];
    const budgets = budgetsResult.data || [];

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      transactionCount: transactions.length,
      budgetCount: budgets.length,
      totalIncome,
      totalExpenses,
      canDelete: transactions.length === 0 && budgets.length === 0
    };
  }

  async getDefaultCategories(): Promise<CategoryInsert[]> {
    return [
      // Expense categories
      { name: 'Alimentação', type: 'expense', color: '#ef4444', icon: '🍽️' },
      { name: 'Transporte', type: 'expense', color: '#f97316', icon: '🚗' },
      { name: 'Moradia', type: 'expense', color: '#eab308', icon: '🏠' },
      { name: 'Saúde', type: 'expense', color: '#84cc16', icon: '🏥' },
      { name: 'Educação', type: 'expense', color: '#06b6d4', icon: '📚' },
      { name: 'Lazer', type: 'expense', color: '#8b5cf6', icon: '🎮' },
      { name: 'Roupas', type: 'expense', color: '#ec4899', icon: '👕' },
      { name: 'Outros', type: 'expense', color: '#64748b', icon: '📦' },
      
      // Income categories
      { name: 'Salário', type: 'income', color: '#22c55e', icon: '💼' },
      { name: 'Freelance', type: 'income', color: '#10b981', icon: '💻' },
      { name: 'Investimentos', type: 'income', color: '#059669', icon: '📈' },
      { name: 'Outros', type: 'income', color: '#047857', icon: '💰' }
    ];
  }

  async createDefaultCategories() {
    const defaultCategories = await this.getDefaultCategories();
    
    const results = [];
    for (const category of defaultCategories) {
      try {
        const result = await this.createCategory(category);
        results.push(result);
      } catch (error) {
        console.warn(`Failed to create category ${category.name}:`, error);
      }
    }
    
    return results;
  }

  async validateCategoryData(category: Partial<CategoryInsert | CategoryUpdate>) {
    const errors: string[] = [];

    if (category.name && category.name.trim().length === 0) {
      errors.push('Nome da categoria é obrigatório');
    }

    if (category.name && category.name.length > 50) {
      errors.push('Nome da categoria deve ter no máximo 50 caracteres');
    }

    if (category.type && !['income', 'expense'].includes(category.type)) {
      errors.push('Tipo da categoria deve ser "income" ou "expense"');
    }

    if (category.color && !/^#[0-9A-F]{6}$/i.test(category.color)) {
      errors.push('Cor deve estar no formato hexadecimal (#RRGGBB)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const categoryService = new CategoryService();