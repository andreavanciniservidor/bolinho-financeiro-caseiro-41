
import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { TransactionFilters, TransactionFiltersData } from '../components/transactions/TransactionFilters';
import { TransactionList } from '../components/transactions/TransactionList';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

export function Transactions() {
  const { transactions, isLoading, addTransaction, updateTransaction, deleteTransaction, duplicateTransaction } = useSupabaseTransactions();
  const { categories } = useSupabaseCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<TransactionFiltersData>({
    search: '',
    type: 'all',
    categoryId: '',
    paymentMethod: '',
    startDate: undefined,
    endDate: undefined,
    tags: [],
    amountMin: undefined,
    amountMax: undefined,
  });

  // Get available tags from transactions (using empty array since tags don't exist in DB)
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    transactions.forEach(transaction => {
      const transactionTags = transaction.tags || [];
      transactionTags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [transactions]);

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDescription = transaction.description.toLowerCase().includes(searchLower);
        const matchesCategory = transaction.category?.name?.toLowerCase().includes(searchLower);
        const matchesObservations = transaction.observations?.toLowerCase().includes(searchLower);
        
        if (!matchesDescription && !matchesCategory && !matchesObservations) {
          return false;
        }
      }

      // Type filter
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.categoryId && transaction.category_id !== filters.categoryId) {
        return false;
      }

      // Payment method filter
      if (filters.paymentMethod && transaction.payment_method !== filters.paymentMethod) {
        return false;
      }

      // Date range filter
      if (filters.startDate) {
        const transactionDate = new Date(transaction.date);
        if (transactionDate < filters.startDate) {
          return false;
        }
      }

      if (filters.endDate) {
        const transactionDate = new Date(transaction.date);
        if (transactionDate > filters.endDate) {
          return false;
        }
      }

      // Amount range filter
      const amount = Math.abs(transaction.amount);
      if (filters.amountMin !== undefined && amount < filters.amountMin) {
        return false;
      }
      if (filters.amountMax !== undefined && amount > filters.amountMax) {
        return false;
      }

      // Tags filter (using empty array since tags don't exist in DB)
      if (filters.tags.length > 0) {
        const transactionTags = transaction.tags || [];
        const hasMatchingTag = filters.tags.some(tag => transactionTags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filters]);

  // Calculate summary
  const summary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Handlers
  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteTransaction(id);
    if (result.error) {
      toast({
        title: "Erro ao excluir",
        description: result.error,
        variant: "destructive",
      });
    }
  }, [deleteTransaction]);

  const handleDuplicate = useCallback(async (id: string) => {
    const result = await duplicateTransaction(id);
    if (result.error) {
      toast({
        title: "Erro ao duplicar",
        description: result.error,
        variant: "destructive",
      });
    }
  }, [duplicateTransaction]);

  const handleExport = useCallback(async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const exportData = filteredTransactions.map(t => ({
        id: t.id,
        description: t.description,
        amount: t.amount,
        date: t.date,
        type: t.type,
        category: t.category ? { name: t.category.name, color: t.category.color } : undefined,
        payment_method: t.payment_method,
        installments: t.installments,
        installment_number: t.installment_number,
        is_recurring: t.is_recurring,
        observations: t.observations,
        tags: t.tags,
      }));

      // Simple export functionality
      if (format === 'csv') {
        const csvContent = exportData.map(row => Object.values(row).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        a.click();
      }

      toast({
        title: "Exportação concluída",
        description: `Arquivo ${format.toUpperCase()} baixado com sucesso.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [filteredTransactions]);

  const handleUpdate = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const result = await updateTransaction(id, updates);
    if (result.error) {
      toast({
        title: "Erro ao atualizar",
        description: result.error,
        variant: "destructive",
      });
    }
  }, [updateTransaction]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600">Gerenciar receitas e despesas</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type as 'income' | 'expense',
          color: c.color
        }))}
        availableTags={availableTags}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receitas</p>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">
            R$ {summary.totalIncome.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas</p>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">
            R$ {summary.totalExpenses.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo</p>
          </div>
          <p className={cn(
            "text-2xl font-bold mt-2",
            summary.balance >= 0 ? "text-green-600" : "text-red-600"
          )}>
            R$ {summary.balance.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transações</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {summary.count}
          </p>
        </div>
      </div>

      {/* Enhanced Transaction List with Virtualization */}
      <TransactionList
        transactions={filteredTransactions.map(t => ({
          ...t,
          type: t.type as 'income' | 'expense',
          category: t.category ? {
            ...t.category,
            type: t.category.type as 'income' | 'expense'
          } : undefined
        }))}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onUpdate={handleUpdate}
        isLoading={isLoading}
      />

      {/* Transaction Form */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTransaction(undefined);
        }}
        transaction={editingTransaction}
        onSuccess={() => {
          setShowForm(false);
          setEditingTransaction(undefined);
        }}
      />
    </div>
  );
}
