
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/dashboard/ChartCard';
import { BudgetProgress } from '../components/dashboard/BudgetProgress';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { InteractiveCharts } from '../components/dashboard/InteractiveCharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { useSupabaseBudgets } from '@/hooks/useSupabaseBudgets';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { PageHeader, ContentSection, GridLayout, CardLayout, Stack } from '@/components/layout/Layout';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();
  const { transactions = [], isLoading: transactionsLoading, error: transactionsError } = useSupabaseTransactions();
  const { budgets = [], isLoading: budgetsLoading } = useSupabaseBudgets();
  const { categories = [] } = useSupabaseCategories();

  console.log('Dashboard - transactions:', transactions, 'loading:', transactionsLoading, 'error:', transactionsError);

  const { totalIncome, totalExpenses, balance, monthlyData, categoryData } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        monthlyData: [],
        categoryData: []
      };
    }

    // Cast transactions to proper types
    const typedTransactions = transactions.map(t => ({
      ...t,
      type: t.type as 'income' | 'expense'
    }));

    const income = typedTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = typedTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Group transactions by month for chart
    const monthlyMap = new Map();
    typedTransactions.forEach(t => {
      const month = new Date(t.date).getMonth();
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthName = monthNames[month];
      
      if (!monthlyMap.has(monthName)) {
        monthlyMap.set(monthName, { month: monthName, receitas: 0, despesas: 0 });
      }
      
      const monthData = monthlyMap.get(monthName);
      if (t.type === 'income') {
        monthData.receitas += t.amount;
      } else {
        monthData.despesas += Math.abs(t.amount);
      }
    });

    // Group expenses by category for pie chart
    const categoryMap = new Map();
    const categoryColors = new Map(categories.map(c => [c.name, c.color]));
    
    typedTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryName = t.category?.name || 'Sem categoria';
        const amount = Math.abs(t.amount);
        if (categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, categoryMap.get(categoryName) + amount);
        } else {
          categoryMap.set(categoryName, amount);
        }
      });

    const categoryChartData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: categoryColors.get(name) || '#64748b'
    }));

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      monthlyData: Array.from(monthlyMap.values()),
      categoryData: categoryChartData
    };
  }, [transactions, categories]);

  const budgetControlPercentage = useMemo(() => {
    if (!budgets || budgets.length === 0) return 0;
    const totalPlanned = budgets.reduce((sum, b) => sum + (b.planned_amount || 0), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
    return totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
  }, [budgets]);

  if (transactionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600">Verifique sua conexão e tente novamente.</p>
        </div>
      </div>
    );
  }

  if (transactionsLoading || budgetsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Cast transactions and budgets to expected types
  const typedTransactions = transactions.map(t => ({
    ...t,
    type: t.type as 'income' | 'expense'
  }));

  return (
    <Stack space="lg">
      {/* Header */}
      <PageHeader 
        title="Dashboard" 
        description="Visão geral das suas finanças em julho de 2025"
      />

      {/* Stats Cards */}
      <ContentSection>
        <GridLayout cols={4} gap="md">
          <StatCard
            title="Receitas"
            value={`R$ ${totalIncome.toFixed(2)}`}
            subtitle="No mês atual"
            trend="up"
            icon={<TrendingUp className="h-6 w-6" />}
          />
          <StatCard
            title="Despesas"
            value={`R$ ${totalExpenses.toFixed(2)}`}
            subtitle="No mês atual"
            trend="down"
            icon={<TrendingDown className="h-6 w-6" />}
          />
          <StatCard
            title="Saldo"
            value={`R$ ${balance.toFixed(2)}`}
            subtitle={balance >= 0 ? "Positivo" : "Negativo"}
            trend={balance >= 0 ? "up" : "down"}
            icon={<DollarSign className="h-6 w-6" />}
          />
          <StatCard
            title="Controle de Orçamentos"
            value={`${budgetControlPercentage.toFixed(0)}%`}
            trend="neutral"
            icon={<Target className="h-6 w-6" />}
          />
        </GridLayout>
      </ContentSection>

      {/* Interactive Charts Section */}
      <ContentSection>
        <InteractiveCharts 
          transactions={typedTransactions}
          className="w-full"
        />
      </ContentSection>

      {/* Budget Progress and Recent Transactions */}
      <GridLayout cols={2} gap="lg">
        <CardLayout padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 text-foreground">Progresso dos Orçamentos</h3>
            <button 
              onClick={() => navigate('/budgets')}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Gerenciar orçamentos →
            </button>
          </div>
          <BudgetProgress 
            budgets={budgets}
            loading={budgetsLoading}
            onManageBudgets={() => navigate('/budgets')}
          />
        </CardLayout>

        <CardLayout padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 text-foreground">Transações Recentes</h3>
            <button 
              onClick={() => navigate('/transactions')}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Ver todas →
            </button>
          </div>
          <RecentTransactions 
            transactions={typedTransactions}
            loading={transactionsLoading}
            limit={5}
            onViewAll={() => navigate('/transactions')}
          />
        </CardLayout>
      </GridLayout>
    </Stack>
  );
}
