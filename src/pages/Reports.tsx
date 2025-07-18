
import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, DollarSign, Download, Filter, Calendar, BarChart3, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { CategoryPieChart } from '@/components/reports/CategoryPieChart';
import { MonthlyComparisonChart } from '@/components/reports/MonthlyComparisonChart';
import { ExpenseTrendChart } from '@/components/reports/ExpenseTrendChart';
import { ReportFilters as ReportFiltersComponent } from '@/components/reports/ReportFilters';
import { ReportExport } from '@/components/reports/ReportExport';
import { PageHeader, ContentSection, GridLayout, CardLayout, Stack } from '@/components/layout/Layout';

interface ReportsFilters {
  startDate: string;
  endDate: string;
  type: 'all' | 'income' | 'expense';
  categoryId?: string;
}

export function Reports() {
  const [filters, setFilters] = useState<ReportsFilters>({
    startDate: format(startOfMonth(subMonths(new Date(), 11)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: 'all' as const
  });

  const { transactions = [], isLoading } = useSupabaseTransactions({
    filters: {
      start_date: filters.startDate,
      end_date: filters.endDate,
      type: filters.type !== 'all' ? filters.type as 'income' | 'expense' : undefined,
      category_id: filters.categoryId
    }
  });

  const { categories = [] } = useSupabaseCategories();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Process data for reports
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  // Prepare data for charts with proper type casting
  const expensesByCategory = transactions
    .filter(t => (t.type as 'income' | 'expense') === 'expense')
    .reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Sem categoria';
      acc[categoryName] = (acc[categoryName] || 0) + Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
    color: categories.find(c => c.name === name)?.color || '#64748b'
  }));

  // Monthly comparison data
  const monthlyData = transactions.reduce((acc, transaction) => {
    const month = format(new Date(transaction.date), 'MMM yyyy', { locale: ptBR });
    if (!acc[month]) {
      acc[month] = { month, receitas: 0, despesas: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[month].receitas += Math.abs(transaction.amount);
    } else {
      acc[month].despesas += Math.abs(transaction.amount);
    }
    
    return acc;
  }, {} as Record<string, { month: string; receitas: number; despesas: number }>);

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => 
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  // Cast categories to expected format
  const formattedCategories = categories.map(cat => ({ 
    id: cat.id, 
    name: cat.name, 
    type: cat.type as 'income' | 'expense' 
  }));

  return (
    <Stack space="lg">
      {/* Header */}
      <PageHeader 
        title="Relatórios" 
        description="Análise detalhada das suas finanças e tendências de gastos"
      />

      {/* Filters */}
      <ContentSection>
        <CardLayout padding="md">
          <ReportFiltersComponent
            categories={formattedCategories}
            onFilterChange={(newFilters) => {
              // Handle filter changes if needed
              console.log('Filter changed:', newFilters);
            }}
          />
        </CardLayout>
      </ContentSection>

      {/* Summary Cards */}
      <ContentSection>
        <GridLayout cols={4} gap="md">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas Totais</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {Math.abs(balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Economia</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0.0'}%
              </div>
            </CardContent>
          </Card>
        </GridLayout>
      </ContentSection>

      {/* Charts */}
      <GridLayout cols={2} gap="lg">
        <CardLayout padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Despesas por Categoria</h3>
            <PieChart className="h-5 w-5 text-gray-500" />
          </div>
          <CategoryPieChart 
            data={categoryData}
            height={300}
          />
        </CardLayout>

        <CardLayout padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Comparação Mensal</h3>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <MonthlyComparisonChart 
            data={monthlyChartData}
            height={300}
          />
        </CardLayout>
      </GridLayout>

      {/* Trend Chart */}
      <ContentSection>
        <CardLayout padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Tendência de Gastos</h3>
            <TrendingDown className="h-5 w-5 text-gray-500" />
          </div>
          <ExpenseTrendChart 
            transactions={transactions.map(t => ({
              id: t.id,
              amount: Math.abs(t.amount),
              type: t.type as 'income' | 'expense',
              date: t.date,
              category: t.category?.name,
              category_id: t.category_id,
              category_color: t.category?.color
            }))}
            height={400}
          />
        </CardLayout>
      </ContentSection>

      {/* Export Section */}
      <ContentSection>
        <CardLayout padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Exportar Relatório</h3>
              <p className="text-gray-600">Baixe seus dados financeiros em diferentes formatos</p>
            </div>
            <ReportExport 
              data={transactions.map(t => ({
                id: t.id,
                amount: Math.abs(t.amount),
                type: t.type as 'income' | 'expense',
                date: t.date,
                category: t.category?.name,
                category_id: t.category_id,
                category_color: t.category?.color
              }))}
              startDate={filters.startDate}
              endDate={filters.endDate}
            />
          </div>
        </CardLayout>
      </ContentSection>
    </Stack>
  );
}
