
import { useState, useMemo } from 'react';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { CategoryBarChart } from '@/components/reports/CategoryBarChart';
import { CategoryPieChart } from '@/components/reports/CategoryPieChart';
import { ExpenseTrendChart } from '@/components/reports/ExpenseTrendChart';
import { MonthlyComparisonChart } from '@/components/reports/MonthlyComparisonChart';
import { ReportExport } from '@/components/reports/ReportExport';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportFiltersState {
  startDate?: Date;
  endDate?: Date;
  categories: string[];
  type: 'all' | 'income' | 'expense';
}

export function Reports() {
  const { transactions, isLoading } = useSupabaseTransactions();
  const { categories } = useSupabaseCategories();
  
  const [filters, setFilters] = useState<ReportFiltersState>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    categories: [],
    type: 'all'
  });

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Date filter
      if (filters.startDate && new Date(transaction.date) < filters.startDate) {
        return false;
      }
      if (filters.endDate && new Date(transaction.date) > filters.endDate) {
        return false;
      }

      // Type filter
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(transaction.category_id || '')) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Calculate category data for charts
  const categoryData = useMemo(() => {
    const categoryTotals = new Map<string, { name: string; value: number; color: string }>();

    filteredTransactions.forEach(transaction => {
      if (transaction.category) {
        const categoryId = transaction.category.id;
        const existing = categoryTotals.get(categoryId);
        const amount = Math.abs(transaction.amount);

        if (existing) {
          existing.value += amount;
        } else {
          categoryTotals.set(categoryId, {
            name: transaction.category.name,
            value: amount,
            color: transaction.category.color
          });
        }
      }
    });

    return Array.from(categoryTotals.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Calculate expense trend data
  const expenseTrendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        displayDate: format(date, 'dd/MM', { locale: ptBR }),
        expenses: 0,
        income: 0
      };
    });

    filteredTransactions.forEach(transaction => {
      const transactionDate = format(new Date(transaction.date), 'yyyy-MM-dd');
      const dayData = last30Days.find(day => day.date === transactionDate);
      
      if (dayData) {
        if (transaction.type === 'expense') {
          dayData.expenses += Math.abs(transaction.amount);
        } else if (transaction.type === 'income') {
          dayData.income += Math.abs(transaction.amount);
        }
      }
    });

    return last30Days;
  }, [filteredTransactions]);

  const handleFilterChange = (newFilters: ReportFiltersState) => {
    setFilters(newFilters);
  };

  const exportData = useMemo(() => {
    return filteredTransactions.map(t => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      date: t.date,
      category: t.category?.name || 'Sem categoria',
      category_id: t.category_id || '',
      category_color: t.category?.color || '#gray'
    }));
  }, [filteredTransactions]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Relatórios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Análise detalhada das suas finanças
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Configure os filtros para personalizar seus relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportFilters
            categories={categories.map(c => ({
              id: c.id,
              name: c.name,
              type: c.type as 'income' | 'expense'
            }))}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {filteredTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {filteredTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {(filteredTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0) -
                filteredTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
              ).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={categoryData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart 
              data={categoryData}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Gastos (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseTrendChart data={expenseTrendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparação Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyComparisonChart 
              transactions={filteredTransactions}
            />
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Dados</CardTitle>
          <CardDescription>
            Exporte os dados filtrados para PDF ou Excel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportExport 
            data={exportData}
            startDate={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
            endDate={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}
