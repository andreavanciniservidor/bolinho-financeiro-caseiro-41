
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useOrganization } from './useOrganization';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export function useSupabaseCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();

  const fetchCategories = async () => {
    if (!user || !currentOrganization) {
      setCategories([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('categories')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('name');

      if (error) throw error;

      // Convert Supabase data to Category interface with proper typing
      const typedCategories: Category[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type as 'income' | 'expense',
        color: item.color
      }));

      setCategories(typedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user, currentOrganization]);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user || !currentOrganization) return { data: null, error: 'User not authenticated or no organization selected' };

    try {
      const { data, error } = await (supabase as any)
        .from('categories')
        .insert([{ 
          ...category, 
          user_id: user.id,
          organization_id: currentOrganization.id 
        }])
        .select()
        .single();

      if (error) throw error;

      // Convert the returned data to Category interface
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        type: data.type as 'income' | 'expense',
        color: data.color
      };

      setCategories(prev => [...prev, newCategory]);
      return { data: newCategory, error: null };
    } catch (error) {
      console.error('Error adding category:', error);
      return { data: null, error: (error as Error).message };
    }
  };

  return {
    categories,
    isLoading,
    addCategory,
    refetch: fetchCategories,
  };
}
