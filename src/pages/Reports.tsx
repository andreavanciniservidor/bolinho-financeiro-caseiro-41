
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileDown, FileText, Share2, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { useSupabaseBudgets } from '@/hooks/useSupabaseBudgets';
import { useMemo } from 'react';
import { ReportFilters, ReportFilters as ReportFiltersType } from '@/components/reports/ReportFilters';
import { CategoryPieChart } from '@/components/reports/CategoryPieChart';
import { CategoryBarChart } from '@/components/reports/CategoryBarChart';
import { ExpenseTrendChart } from '@/components/reports/ExpenseTrendChart';
import { MonthlyComparisonChart } from '@/components/reports/MonthlyComparisonChart';

export function Reports() {
  const { transactions, isLoading } = useSupabaseTransactions();
  const { categories } = useSupabaseCategories();
  const [reportType, setReportType] = useState('Visão Geral');
  const [activeFilters, setActiveFilters] = useState<ReportFiltersType>({
    dateRange: {
      start: new Date(2025, 0, 1),
      end: new Date()
    },
    categories: [],
    transactionTypes: ['income', 'expense'],
    amountRange: { min: null, max: null },
    tags: [],
    paymentMethods: []
  });

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Date range filter
      const transactionDate = new Date(transaction.date);
      if (
        transactionDate < activeFilters.dateRange.start ||
        transactionDate > activeFilters.dateRange.end
      ) {
        return false;
      }

      // Transaction type filter
      if (!activeFilters.transactionTypes.includes(transaction.type)) {
        return false;
      }

      // Category filter
      if (
        activeFilters.categories.length > 0 &&
        transaction.category_id &&
        !activeFilters.categories.includes(transaction.category_id)
      ) {
        return false;
      }

      // Amount range filter
      if (activeFilters.amountRange.min !== null && transaction.amount < activeFilters.amountRange.min) {
        return false;
      }
      if (activeFilters.amountRange.max !== null && transaction.amount > activeFilters.amountRange.max) {
        return false;
      }

      // Tags filter (if transaction has tags property)
      if (
        activeFilters.tags.length > 0 &&
        transaction.tags &&
        !activeFilters.tags.some(tag => transaction.tags?.includes(tag))
      ) {
        return false;
      }

      // Payment method filter
      if (
        activeFilters.paymentMethods.length > 0 &&
        !activeFilters.paymentMethods.includes(transaction.payment_method)
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, activeFilters]);

  const { monthlyData, totalIncome, totalExpenses, balance, categoryBreakdown } = useMemo(() => {
    // Group transactions by month for chart
    const monthlyMap = new Map();
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    
    // Initialize all months with zero values
    monthNames.forEach(month => {
      monthlyMap.set(month, { month, receitas: 0, despesas: 0 });
    });

    filteredTransactions.forEach(t => {
      const month = new Date(t.date).getMonth();
      const monthName = monthNames[month];
      const monthData = monthlyMap.get(monthName);
      
      if (t.type === 'income') {
        monthData.receitas += t.amount;
      } else {
        monthData.despesas += Math.abs(t.amount);
      }
    });

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Category breakdown for table
    const categoryMap = new Map();
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryName = t.category || 'Sem categoria';
        const amount = Math.abs(t.amount);
        
        if (categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, categoryMap.get(categoryName) + amount);
        } else {
          categoryMap.set(categoryName, amount);
        }
      });

    const breakdown = Array.from(categoryMap.entries()).map(([category, spent]) => ({
      category,
      orcado: 0, // Would need budget data for this
      gasto: spent,
      percentual: 0,
      diferenca: -spent
    }));

    return {
      monthlyData: Array.from(monthlyMap.values()),
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      categoryBreakdown: breakdown
    };
  }, [filteredTransactions]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatórios Financeiros</h1>
          <p className="text-gray-600 dark:text-gray-400">Análise e visualização dos seus dados financeiros</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <FileDown className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-3/4">
          <ReportFilters 
            categories={categories}
            onFilterChange={setActiveFilters}
          />
        </div>
        
        <div className="w-full md:w-1/4 bg-white rounded-lg border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Visão Geral">Visão Geral</SelectItem>
              <SelectItem value="Receitas">Receitas</SelectItem>
              <SelectItem value="Despesas">Despesas</SelectItem>
              <SelectItem value="Orçamentos">Orçamentos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Comparativo Mensal</h3>
        </div>
        <MonthlyComparisonChart 
          data={monthlyData}
          height={400}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Total de Receitas</h4>
          <p className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Total de Despesas</h4>
          <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Saldo Acumulado</h4>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Trend Analysis */}
      <ExpenseTrendChart 
        transactions={filteredTransactions}
        title="Análise de Tendências"
        showControls={true}
        showExport={true}
        height={300}
        onExport={() => console.log('Exportando tendência de gastos')}
      />

      {/* Category Visualizations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Visualizações por Categoria</h3>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Button variant="outline" size="sm" className="h-8">
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Tabela</span>
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Barras</span>
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Pizza</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Heatmap</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="mt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Categoria</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Orçado</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Gasto</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">% do Orçamento</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Diferença</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {categoryBreakdown.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  ) : (
                    categoryBreakdown.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 px-4 font-medium">{item.category}</td>
                        <td className="py-3 px-4 text-right">R$ {item.orcado.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">R$ {item.gasto.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end">
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, item.percentual || 0)}%` }}
                              ></div>
                            </div>
                            {item.percentual}%
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">R$ {item.diferenca.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 dark:border-gray-700 font-medium">
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right">R$ {categoryBreakdown.reduce((sum, item) => sum + item.orcado, 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">R$ {categoryBreakdown.reduce((sum, item) => sum + item.gasto, 0).toFixed(2)}</td>
                    <td className="py-3 px-4 text-right"></td>
                    <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">
                      R$ {categoryBreakdown.reduce((sum, item) => sum + item.diferenca, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="bar" className="mt-0">
            <CategoryBarChart 
              transactions={filteredTransactions}
              title=""
              showExport={false}
              height={400}
            />
          </TabsContent>
          
          <TabsContent value="pie" className="mt-0">
            <CategoryPieChart 
              transactions={filteredTransactions}
              title=""
              showExport={false}
              height={400}
            />
          </TabsContent>
          
          <TabsContent value="heatmap" className="mt-0">
            <div className="h-[400px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p className="mb-1">Visualização de Heatmap</p>
                <p className="text-sm">Mostra a distribuição de gastos por dia da semana e hora</p>
                <p className="text-xs mt-2 text-gray-400">Em desenvolvimento</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
