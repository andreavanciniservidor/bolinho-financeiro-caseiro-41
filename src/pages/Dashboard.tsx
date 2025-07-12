
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { useSupabaseBudgets } from '@/hooks/useSupabaseBudgets';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { useMemo } from 'react';

export function Dashboard() {
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

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Group transactions by month for chart
    const monthlyMap = new Map();
    transactions.forEach(t => {
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
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const amount = Math.abs(t.amount);
        if (categoryMap.has(t.category)) {
          categoryMap.set(t.category, categoryMap.get(t.category) + amount);
        } else {
          categoryMap.set(t.category, amount);
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
    const totalPlanned = budgets.reduce((sum, b) => sum + b.plannedAmount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">julho de 2025</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparativo Mensal</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="mb-2">Nenhuma transação encontrada</p>
                <p className="text-sm">Adicione suas primeiras transações para ver os gráficos</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Receitas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Despesas</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de Receitas</p>
              <p className="text-lg font-semibold text-green-600">R$ {totalIncome.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de Despesas</p>
              <p className="text-lg font-semibold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Saldo Acumulado</p>
              <p className={`text-lg font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoria</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">R$ {item.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="mb-1">Nenhuma despesa encontrada</p>
                <p className="text-sm">Adicione despesas para ver a distribuição</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progresso dos Orçamentos</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Gerenciar orçamentos →
          </button>
        </div>
        <div className="space-y-4">
          {!budgets || budgets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Nenhum orçamento criado ainda.</p>
              <p className="text-sm text-gray-400">Crie seu primeiro orçamento para controlar seus gastos</p>
            </div>
          ) : (
            budgets.map((budget) => {
              const percentage = (budget.spentAmount / budget.plannedAmount) * 100;
              const isOverBudget = percentage > 100;
              const isNearLimit = percentage >= budget.alertPercentage;
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{budget.name}</span>
                    <span className="text-sm text-gray-500">
                      R$ {budget.spentAmount.toFixed(2)} / R$ {budget.plannedAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isOverBudget 
                          ? 'bg-red-500' 
                          : isNearLimit 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{budget.category}</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
