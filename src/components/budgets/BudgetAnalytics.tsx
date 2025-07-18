import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, Calendar, BarChart3, PieChart, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Budget {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  planned_amount: number;
  spent_amount: number;
  period_type: 'weekly' | 'monthly' | 'yearly';
  period_start: string;
  period_end: string;
  alert_percentage: number;
  is_active: boolean;
  created_at: string;
}

interface BudgetAnalyticsProps {
  budgets: Budget[];
  historicalData?: Array<{
    period: string;
    budget_id: string;
    planned_amount: number;
    spent_amount: number;
  }>;
  className?: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export function BudgetAnalytics({ budgets, historicalData = [], className }: BudgetAnalyticsProps) {
  // Calculate overall statistics
  const analytics = useMemo(() => {
    const activeBudgets = budgets.filter(b => b.is_active);
    const totalPlanned = activeBudgets.reduce((sum, b) => sum + b.planned_amount, 0);
    const totalSpent = activeBudgets.reduce((sum, b) => sum + Math.abs(b.spent_amount), 0);
    const overBudgetCount = activeBudgets.filter(b => Math.abs(b.spent_amount) > b.planned_amount).length;
    const onTrackCount = activeBudgets.filter(b => {
      const percentage = b.planned_amount > 0 ? (Math.abs(b.spent_amount) / b.planned_amount) * 100 : 0;
      return percentage <= b.alert_percentage && Math.abs(b.spent_amount) <= b.planned_amount;
    }).length;
    const nearLimitCount = activeBudgets.filter(b => {
      const percentage = b.planned_amount > 0 ? (Math.abs(b.spent_amount) / b.planned_amount) * 100 : 0;
      return percentage > b.alert_percentage && Math.abs(b.spent_amount) <= b.planned_amount;
    }).length;

    return {
      totalBudgets: activeBudgets.length,
      totalPlanned,
      totalSpent,
      overallPercentage: totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0,
      overBudgetCount,
      onTrackCount,
      nearLimitCount,
      averageUtilization: activeBudgets.length > 0 
        ? activeBudgets.reduce((sum, b) => {
            const percentage = b.planned_amount > 0 ? (Math.abs(b.spent_amount) / b.planned_amount) * 100 : 0;
            return sum + percentage;
          }, 0) / activeBudgets.length 
        : 0
    };
  }, [budgets]);

  // Prepare data for charts
  const budgetPerformanceData = useMemo(() => {
    return budgets
      .filter(b => b.is_active)
      .map(budget => ({
        name: budget.name.length > 15 ? budget.name.substring(0, 15) + '...' : budget.name,
        planned: budget.planned_amount,
        spent: Math.abs(budget.spent_amount),
        percentage: budget.planned_amount > 0 ? (Math.abs(budget.spent_amount) / budget.planned_amount) * 100 : 0,
        status: Math.abs(budget.spent_amount) > budget.planned_amount ? 'over' : 
                Math.abs(budget.spent_amount) / budget.planned_amount > budget.alert_percentage / 100 ? 'warning' : 'good'
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [budgets]);

  const categoryDistributionData = useMemo(() => {
    const categoryMap = new Map();
    
    budgets.filter(b => b.is_active && b.category).forEach(budget => {
      const categoryName = budget.category!.name;
      const existing = categoryMap.get(categoryName) || { 
        name: categoryName, 
        value: 0, 
        planned: 0,
        color: budget.category!.color 
      };
      
      existing.value += Math.abs(budget.spent_amount);
      existing.planned += budget.planned_amount;
      categoryMap.set(categoryName, existing);
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [budgets]);

  const trendData = useMemo(() => {
    if (historicalData.length === 0) {
      // Return empty array if no historical data is available
      return [];
    }

    // Process historical data
    const monthlyData = new Map();
    historicalData.forEach(item => {
      const month = format(new Date(item.period), 'MMM/yy', { locale: ptBR });
      const existing = monthlyData.get(month) || { month, planned: 0, spent: 0 };
      existing.planned += item.planned_amount;
      existing.spent += Math.abs(item.spent_amount);
      monthlyData.set(month, existing);
    });

    return Array.from(monthlyData.values()).map(item => ({
      ...item,
      efficiency: item.planned > 0 ? ((item.planned - item.spent) / item.planned) * 100 : 0
    }));
  }, [historicalData, budgets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'good': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return null;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Planejado</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalPlanned)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {analytics.totalBudgets} orçamentos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalSpent)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {analytics.overallPercentage.toFixed(1)}% do planejado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilização Média</CardTitle>
            <PieChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageUtilization.toFixed(1)}%</div>
            <Progress value={analytics.averageUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">No prazo</span>
                <span className="font-medium">{analytics.onTrackCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600">Atenção</span>
                <span className="font-medium">{analytics.nearLimitCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600">Excedido</span>
                <span className="font-medium">{analytics.overBudgetCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Performance por Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    formatCurrency(Number(value)), 
                    name === 'planned' ? 'Planejado' : 'Gasto'
                  ]}
                  labelFormatter={(label) => `Orçamento: ${label}`}
                />
                <Legend />
                <Bar dataKey="planned" fill="#3b82f6" name="Planejado" />
                <Bar dataKey="spent" fill="#10b981" name="Gasto" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Tendência de Gastos (Últimos 6 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'efficiency' ? `${Number(value).toFixed(1)}%` : formatCurrency(Number(value)),
                  name === 'planned' ? 'Planejado' : name === 'spent' ? 'Gasto' : 'Eficiência'
                ]}
              />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke="#3b82f6" name="Planejado" strokeWidth={2} />
              <Line type="monotone" dataKey="spent" stroke="#10b981" name="Gasto" strokeWidth={2} />
              <Line type="monotone" dataKey="efficiency" stroke="#f59e0b" name="Eficiência %" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Budget List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Análise Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetPerformanceData.map((budget, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(budget.status)}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {budget.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(budget.spent)} de {formatCurrency(budget.planned)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={cn("font-medium", getStatusColor(budget.status))}>
                      {budget.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {budget.status === 'over' && 'Excedido'}
                      {budget.status === 'warning' && 'Atenção'}
                      {budget.status === 'good' && 'No prazo'}
                    </div>
                  </div>
                  
                  <div className="w-24">
                    <Progress 
                      value={Math.min(budget.percentage, 100)} 
                      className="h-2"
                      indicatorClassName={
                        budget.status === 'over' ? 'bg-red-500' :
                        budget.status === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.overBudgetCount > 0 && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">
                    Orçamentos Excedidos
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {analytics.overBudgetCount} orçamento(s) excederam o limite planejado. 
                    Considere revisar os gastos ou ajustar os valores planejados.
                  </p>
                </div>
              </div>
            )}

            {analytics.averageUtilization < 50 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <TrendingDown className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Baixa Utilização
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    A utilização média dos orçamentos está em {analytics.averageUtilization.toFixed(1)}%. 
                    Você pode estar sendo muito conservador nos seus gastos ou os orçamentos estão superestimados.
                  </p>
                </div>
              </div>
            )}

            {analytics.averageUtilization > 90 && analytics.overBudgetCount === 0 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Excelente Controle
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Você está utilizando {analytics.averageUtilization.toFixed(1)}% dos seus orçamentos sem exceder os limites. 
                    Parabéns pelo excelente controle financeiro!
                  </p>
                </div>
              </div>
            )}

            {categoryDistributionData.length > 0 && (
              <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <PieChart className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 dark:text-purple-100">
                    Categoria com Maior Gasto
                  </h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    A categoria "{categoryDistributionData[0].name}" representa o maior gasto com {formatCurrency(categoryDistributionData[0].value)}. 
                    Considere analisar se este valor está alinhado com suas prioridades.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}