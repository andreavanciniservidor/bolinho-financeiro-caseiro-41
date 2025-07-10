
import { useState, useEffect } from 'react';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

// Mock data para categorias
const mockCategories: Category[] = [
  { id: '1', name: 'Trabalho', type: 'income', color: '#10b981' },
  { id: '2', name: 'Freelance', type: 'income', color: '#06b6d4' },
  { id: '3', name: 'Alimentação', type: 'expense', color: '#f59e0b' },
  { id: '4', name: 'Casa', type: 'expense', color: '#ef4444' },
  { id: '5', name: 'Transporte', type: 'expense', color: '#8b5cf6' },
  { id: '6', name: 'Saúde', type: 'expense', color: '#ec4899' },
  { id: '7', name: 'Educação', type: 'expense', color: '#14b8a6' },
  { id: '8', name: 'Lazer', type: 'expense', color: '#f97316' },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula carregamento dos dados
    setTimeout(() => {
      setCategories(mockCategories);
      setIsLoading(false);
    }, 300);
  }, []);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    
    setCategories(prev => [...prev, newCategory]);
    return { data: newCategory, error: null };
  };

  return {
    categories,
    isLoading,
    addCategory,
  };
}
