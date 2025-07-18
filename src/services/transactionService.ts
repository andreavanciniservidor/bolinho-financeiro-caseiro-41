import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  search?: string;
  tags?: string[];
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

class TransactionService {
  async getTransactions(filters?: TransactionFilters, pagination?: PaginationOptions) {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .order('date', { ascending: false });

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.search) {
      query = query.ilike('description', `%${filters.search}%`);
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    // Apply pagination
    if (pagination?.page && pagination?.limit) {
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page: pagination?.page || 1,
      limit: pagination?.limit || data?.length || 0
    };
  }

  async getTransactionById(id: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createTransaction(transaction: TransactionInsert) {
    // Handle installments - create multiple transactions if installments > 1
    if (transaction.installments && transaction.installments > 1) {
      return this.createInstallmentTransactions(transaction);
    }

    // Handle recurring transactions
    if (transaction.is_recurring && transaction.recurrence_rule) {
      return this.createRecurringTransaction(transaction);
    }

    // Create single transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  private async createInstallmentTransactions(baseTransaction: TransactionInsert) {
    const installments = baseTransaction.installments || 1;
    const installmentAmount = (baseTransaction.amount || 0) / installments;
    const baseDate = new Date(baseTransaction.date || new Date());
    
    const transactions: TransactionInsert[] = [];
    
    for (let i = 0; i < installments; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);
      
      transactions.push({
        ...baseTransaction,
        amount: installmentAmount,
        date: installmentDate.toISOString().split('T')[0],
        installment_number: i + 1,
        description: `${baseTransaction.description} (${i + 1}/${installments})`,
        parent_transaction_id: i === 0 ? undefined : undefined, // Will be set after first insert
      });
    }

    // Insert first transaction to get parent ID
    const { data: firstTransaction, error: firstError } = await supabase
      .from('transactions')
      .insert(transactions[0])
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .single();

    if (firstError) throw firstError;

    // Insert remaining transactions with parent reference
    if (transactions.length > 1) {
      const remainingTransactions = transactions.slice(1).map(t => ({
        ...t,
        parent_transaction_id: firstTransaction.id
      }));

      const { error: remainingError } = await supabase
        .from('transactions')
        .insert(remainingTransactions);

      if (remainingError) throw remainingError;
    }

    return firstTransaction;
  }

  private async createRecurringTransaction(baseTransaction: TransactionInsert) {
    const rule = baseTransaction.recurrence_rule;
    if (!rule) throw new Error('Recurrence rule is required for recurring transactions');

    // Create the first transaction
    const { data: firstTransaction, error } = await supabase
      .from('transactions')
      .insert(baseTransaction)
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .single();

    if (error) throw error;

    // Generate future recurring transactions (up to next 12 occurrences or rule.count)
    const maxOccurrences = Math.min(rule.count || 12, 12);
    const baseDate = new Date(baseTransaction.date || new Date());
    const futureTransactions: TransactionInsert[] = [];

    for (let i = 1; i < maxOccurrences; i++) {
      const nextDate = this.calculateNextRecurrenceDate(baseDate, rule, i);
      
      futureTransactions.push({
        ...baseTransaction,
        date: nextDate.toISOString().split('T')[0],
        description: `${baseTransaction.description} (Recorrente)`,
        parent_transaction_id: firstTransaction.id,
      });
    }

    if (futureTransactions.length > 0) {
      const { error: futureError } = await supabase
        .from('transactions')
        .insert(futureTransactions);

      if (futureError) throw futureError;
    }

    return firstTransaction;
  }

  private calculateNextRecurrenceDate(baseDate: Date, rule: any, occurrence: number): Date {
    const nextDate = new Date(baseDate);
    
    switch (rule.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + (rule.interval * occurrence));
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (rule.interval * occurrence * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + (rule.interval * occurrence));
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + (rule.interval * occurrence));
        break;
    }
    
    return nextDate;
  }

  async updateTransaction(id: string, updates: TransactionUpdate) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, color, type)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTransaction(id: string) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  async duplicateTransaction(id: string) {
    const original = await this.getTransactionById(id);
    
    const duplicate: TransactionInsert = {
      description: `${original.description} (Cópia)`,
      amount: original.amount,
      date: new Date().toISOString().split('T')[0],
      type: original.type,
      category_id: original.category_id,
      payment_method: original.payment_method,
      observations: original.observations,
      tags: original.tags,
      user_id: original.user_id,
      organization_id: original.organization_id
    };

    return this.createTransaction(duplicate);
  }

  async getTransactionSummary(filters?: TransactionFilters) {
    let query = supabase
      .from('transactions')
      .select('amount, type');

    // Apply same filters as getTransactions
    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const summary = data?.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpenses += Math.abs(transaction.amount);
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0 }
    ) || { totalIncome: 0, totalExpenses: 0 };

    return {
      ...summary,
      balance: summary.totalIncome - summary.totalExpenses
    };
  }

  async getCategoryExpenses(filters?: TransactionFilters) {
    let query = supabase
      .from('transactions')
      .select(`
        amount,
        category:categories(name, color)
      `)
      .eq('type', 'expense');

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const categoryMap = new Map();
    
    data?.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Sem categoria';
      const categoryColor = transaction.category?.color || '#64748b';
      const amount = Math.abs(transaction.amount);
      
      if (categoryMap.has(categoryName)) {
        categoryMap.get(categoryName).value += amount;
      } else {
        categoryMap.set(categoryName, {
          name: categoryName,
          value: amount,
          color: categoryColor
        });
      }
    });

    return Array.from(categoryMap.values());
  }
}

export const transactionService = new TransactionService();