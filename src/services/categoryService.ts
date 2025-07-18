import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];
type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

class CategoryService {
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
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
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string) {
    // Check if category is being used in transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (transactions && transactions.length > 0) {
      throw new Error('Cannot delete category that is being used in transactions');
    }

    // Check if category is being used in budgets
    const { data: budgets } = await supabase
      .from('budgets')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (budgets && budgets.length > 0) {
      throw new Error('Cannot delete category that is being used in budgets');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  async deactivateCategory(id: string) {
    // Since is_active doesn't exist in the database, we'll just keep this for compatibility
    // but it won't actually do anything
    console.warn('Category deactivation not supported - is_active field does not exist in database');
    return { success: true };
  }

  async getCategoriesByType(type: 'income' | 'expense') {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('name');

    if (error) throw error;
    return data;
  }

  async getDefaultCategories() {
    // Create default categories if they don't exist
    const existingCategories = await this.getCategories();
    
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: 'Alimentação', type: 'expense', color: '#ef4444' },
        { name: 'Transporte', type: 'expense', color: '#f97316' },
        { name: 'Moradia', type: 'expense', color: '#eab308' },
        { name: 'Saúde', type: 'expense', color: '#22c55e' },
        { name: 'Educação', type: 'expense', color: '#3b82f6' },
        { name: 'Lazer', type: 'expense', color: '#8b5cf6' },
        { name: 'Salário', type: 'income', color: '#10b981' },
        { name: 'Freelance', type: 'income', color: '#06b6d4' },
        { name: 'Investimentos', type: 'income', color: '#84cc16' },
        { name: 'Outros', type: 'expense', color: '#64748b' }
      ];

      for (const category of defaultCategories) {
        try {
          await this.createCategory(category);
        } catch (error) {
          console.error('Error creating default category:', error);
        }
      }

      return this.getCategories();
    }

    return existingCategories;
  }
}

export const categoryService = new CategoryService();
