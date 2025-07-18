
import { useState, useMemo } from 'react';
import { FinancialInsights } from '@/components/dashboard/FinancialInsights';
import { InteractiveCharts } from '@/components/dashboard/InteractiveCharts';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { StatCard } from '@/components/dashboard/StatCard';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { useSupabaseBudgets } from '@/hooks/useSupabaseBudgets';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { transactions, isLoading: transactionsLoading } = useSupabaseTransactions({ limit: 10 });
  const { budgets, isLoading: budgetsLoading } = useSupabaseBudgets();
  const { categories } = useSupabaseCategories();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const currentDate = new Date();
    const startOfPeriod = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startOfPeriod.setDate(currentDate.getDate() - 7);
        break;
      case 'month':
        startOfPeriod.setMonth(currentDate.getMonth() - 1);
        break;
      case 'year':
        startOfPeriod.setFullYear(currentDate.getFullYear() - 1);
        break;
    }

    const periodTransactions = transactions.filter(t => 
      new Date(t.date) >= startOfPeriod
    );

    const totalIncome = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = periodTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Budget analysis
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.planned_amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
    const budgetUtilization = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      balance,
      totalBudgeted,
      totalSpent,
      budgetUtilization,
      transactionCount: periodTransactions.length
    };
  }, [transactions, budgets, selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (transactionsLoading || budgetsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visão geral das suas finanças
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors",
                  selectedPeriod === period
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                {period === 'week' ? '7 dias' : period === 'month' ? '30 dias' : '1 ano'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receitas"
          value={formatCurrency(metrics.totalIncome)}
          change={metrics.totalIncome > 0 ? '+5.2%' : '0%'}
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Despesas"
          value={formatCurrency(metrics.totalExpenses)}
          change={metrics.totalExpenses > 0 ? '+2.1%' : '0%'}
          icon={TrendingDown}
          trend="down"
        />
        <StatCard
          title="Saldo"
          value={formatCurrency(metrics.balance)}
          change={metrics.balance >= 0 ? 'Positivo' : 'Negativo'}
          icon={DollarSign}
          trend={metrics.balance >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Orçamento"
          value={formatPercentage(metrics.budgetUtilization)}
          change={`${formatCurrency(metrics.totalSpent)} de ${formatCurrency(metrics.totalBudgeted)}`}
          icon={Target}
          trend={metrics.budgetUtilization > 90 ? 'down' : 'up'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InteractiveCharts 
          transactions={transactions}
          period={selectedPeriod}
        />
        
        <FinancialInsights 
          transactions={transactions}
          budgets={budgets}
          categories={categories}
        />
      </div>

      {/* Budget Progress and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BudgetProgress 
          budgets={budgets}
          onViewAll={() => window.location.href = '/budgets'}
        />
        
        <RecentTransactions 
          transactions={transactions}
          isLoading={transactionsLoading}
          onViewAll={() => window.location.href = '/transactions'}
        />
      </div>
    </div>
  );
}
