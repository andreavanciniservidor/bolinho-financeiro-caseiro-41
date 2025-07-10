
import { Transaction, Budget, Category } from '../types';

export const categories: Category[] = [
  // Expense categories
  { id: '1', name: 'Alimentação', type: 'expense', color: '#ef4444' },
  { id: '2', name: 'Transporte', type: 'expense', color: '#f97316' },
  { id: '3', name: 'Moradia', type: 'expense', color: '#eab308' },
  { id: '4', name: 'Saúde', type: 'expense', color: '#84cc16' },
  { id: '5', name: 'Educação', type: 'expense', color: '#06b6d4' },
  { id: '6', name: 'Lazer', type: 'expense', color: '#8b5cf6' },
  { id: '7', name: 'Roupas', type: 'expense', color: '#ec4899' },
  { id: '8', name: 'Outros', type: 'expense', color: '#64748b' },
  // Income categories
  { id: '9', name: 'Salário', type: 'income', color: '#22c55e' },
  { id: '10', name: 'Freelance', type: 'income', color: '#10b981' },
  { id: '11', name: 'Investimentos', type: 'income', color: '#059669' },
  { id: '12', name: 'Outros', type: 'income', color: '#047857' },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Supermercado',
    amount: -150.50,
    date: '2025-01-08',
    type: 'expense',
    category: 'Alimentação',
    paymentMethod: 'Cartão de Débito'
  },
  {
    id: '2',
    description: 'Salário',
    amount: 5000.00,
    date: '2025-01-05',
    type: 'income',
    category: 'Salário',
    paymentMethod: 'Transferência'
  },
  {
    id: '3',
    description: 'Gasolina',
    amount: -80.00,
    date: '2025-01-07',
    type: 'expense',
    category: 'Transporte',
    paymentMethod: 'Dinheiro'
  },
  {
    id: '4',
    description: 'Aluguel',
    amount: -1200.00,
    date: '2025-01-01',
    type: 'expense',
    category: 'Moradia',
    paymentMethod: 'Transferência'
  }
];

export const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'Alimentação',
    category: 'Alimentação',
    plannedAmount: 800,
    spentAmount: 550,
    alertPercentage: 80,
    isActive: true
  },
  {
    id: '2',
    name: 'Transporte',
    category: 'Transporte',
    plannedAmount: 400,
    spentAmount: 320,
    alertPercentage: 75,
    isActive: true
  },
  {
    id: '3',
    name: 'Lazer',
    category: 'Lazer',
    plannedAmount: 300,
    spentAmount: 180,
    alertPercentage: 70,
    isActive: true
  }
];

export const paymentMethods = [
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'PIX',
  'Transferência',
  'Outro'
];
