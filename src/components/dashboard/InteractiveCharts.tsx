import { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { ChartCard } from './ChartCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Activity, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, eachMonthOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: {
    id: string;
    name: string;
    color: string;
  };
  payment_method: string;
}

interface InteractiveChartsProps {
  transactions: Transaction[];
  className?: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const periodOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último ano' },
];

const chartTypes = [
  { value: 'line', label: 'Linha', icon: Activity },
  { value: 'bar', label: 'Barras', icon: BarChart3 },
  { value: 'area', label: 'Área', icon: TrendingUp },
];

export function InteractiveCharts({ transactions, className }: InteractiveChartsProps) {
  const [period, setPeriod] = useState('30d');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case '6m':
        startDate = subMonths(now, 6);
        break;
      case '1y':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subDays(now, 30);
    }

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const matchesPeriod = transactionDate >= startDate && transactionDate <= now;
      const matchesCategory = selectedCategory === 'all' || t.category?.id === selectedCategory;
      return matchesPeriod && matchesCategory;
    });
  }, [transactions, period, selectedCategory]);

  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    let intervals: Date[];
    let formatString: string;

    if (period === '7d' || period === '30d') {
      const startDate = period === '7d' ? subDays(now, 7) : subDays(now, 30);
      intervals = eachDayOfInterval({ start: startDate, end: now });
      formatString = 'dd/MM';
    } else {
      const startDate = period === '90d' ? subMonths(now, 3) : 
                      period === '6m' ? subMonths(now, 6) : subMonths(now, 12);
      intervals = eachMonthOfInterval({ start: startOfMonth(startDate), end: endOfMonth(now) });
      formatString = 'MMM/yy';
    }

    return intervals.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayTransactions = filteredTransactions.filter(t => {
        if (period === '7d' || period === '30d') {
          return t.date === dateStr;
        } else {
          const transactionMonth = format(new Date(t.date), 'yyyy-MM');
          const intervalMonth = format(date, 'yyyy-MM');
          return transactionMonth === intervalMonth;
        }
      });

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        date: format(date, formatString, { locale: ptBR }),
        fullDate: dateStr,
        receitas: income,
        despesas: expenses,
        saldo: income - expenses,
        transacoes: dayTransactions.length
      };
    });
  }, [filteredTransactions, period]);

  // Prepare category distribution data
  const categoryData = useMemo(() => {
    const categoryMap = new Map();
    
    filteredTransactions
      .filter(t => t.type === 'expense' && t.category)
      .forEach(transaction => {
        const categoryName = transaction.category!.name;
        const categoryColor = transaction.category!.color;
        const amount = Math.abs(transaction.amount);
        
        if (categoryMap.has(categoryName)) {
          categoryMap.get(categoryName).value += amount;
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            value: amount,
            color: categoryColor,
            count: 0
          });
        }
        categoryMap.get(categoryName).count += 1;
      });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [filteredTransactions]);

  // Prepare payment method data
  const paymentMethodData = useMemo(() => {
    const methodMap = new Map();
    
    filteredTransactions.forEach(transaction => {
      const method = transaction.payment_method;
      const amount = Math.abs(transaction.amount);
      
      if (methodMap.has(method)) {
        methodMap.get(method).value += amount;
        methodMap.get(method).count += 1;
      } else {
        methodMap.set(method, {
          name: method,
          value: amount,
          count: 1
        });
      }
    });

    return Array.from(methodMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    transactions.forEach(t => {
      if (t.category) {
        uniqueCategories.set(t.category.id, t.category);
      }
    });
    return Array.from(uniqueCategories.values());
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{entry.dataKey}:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(data.value)} ({data.count} transações)
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle click on chart point for drill-down
  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length) {
      const clickedDate = data.activePayload[0].payload.fullDate;
      setSelectedDate(clickedDate);
      setShowDetailModal(true);
    }
  };

  const renderChart = () => {
    const commonProps = {
      data: timeSeriesData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
      onClick: handleChartClick
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[2, 2, 0, 0]} />
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[2, 2, 0, 0]} />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="receitas" 
              stackId="1"
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.6}
              name="Receitas"
            />
            <Area 
              type="monotone" 
              dataKey="despesas" 
              stackId="2"
              stroke="#ef4444" 
              fill="#ef4444"
              fillOpacity={0.6}
              name="Despesas"
            />
          </AreaChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'currentColor' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="receitas" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              name="Receitas"
            />
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
              name="Despesas"
            />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              name="Saldo"
            />
          </LineChart>
        );
    }
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  // Get detailed transactions for selected date
  const detailedTransactions = useMemo(() => {
    if (!selectedDate) return [];
    
    return filteredTransactions.filter(t => {
      // For daily view, match exact date
      if (period === '7d' || period === '30d') {
        return t.date === selectedDate;
      } 
      // For monthly view, match month
      else {
        const transactionMonth = format(new Date(t.date), 'yyyy-MM');
        const selectedMonth = format(new Date(selectedDate), 'yyyy-MM');
        return transactionMonth === selectedMonth;
      }
    }).sort((a, b) => {
      // Sort by date (newest first) and then by amount (highest first)
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      return Math.abs(b.amount) - Math.abs(a.amount);
    });
  }, [selectedDate, filteredTransactions, period]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detalhes do período: {selectedDate ? format(new Date(selectedDate), 'dd/MM/yyyy', { locale: ptBR }) : ''}
            </DialogTitle>
            <DialogDescription>
              {detailedTransactions.length} transações encontradas
            </DialogDescription>
          </DialogHeader>
          
          {detailedTransactions.length > 0 ? (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receitas</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(detailedTransactions
                          .filter(t => t.type === 'income')
                          .reduce((sum, t) => sum + Math.abs(t.amount), 0))}
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Despesas</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatCurrency(detailedTransactions
                          .filter(t => t.type === 'expense')
                          .reduce((sum, t) => sum + Math.abs(t.amount), 0))}
                      </p>
                    </div>
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Saldo</p>
                      <p className={`text-lg font-semibold ${
                        detailedTransactions.reduce((sum, t) => 
                          sum + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(detailedTransactions.reduce((sum, t) => 
                          sum + (t.type === 'income' ? t.amount : -Math.abs(t.amount)), 0))}
                      </p>
                    </div>
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
              
              {/* Transactions Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedTransactions.map(transaction => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>
                          {transaction.category ? (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: transaction.category.color }}
                              />
                              {transaction.category.name}
                            </div>
                          ) : 'Sem categoria'}
                        </TableCell>
                        <TableCell>{format(new Date(transaction.date), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{transaction.payment_method}</TableCell>
                        <TableCell className="text-right">
                          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              Nenhuma transação encontrada para este período.
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Main Time Series Chart */}
      <div className="space-y-4">
        {/* Chart Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Fluxo Financeiro
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Análise de receitas e despesas - {periodOptions.find(p => p.value === period)?.label}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1">
              {chartTypes.map(type => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    variant={chartType === type.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType(type.value as any)}
                    className="h-8 px-3"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receitas</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Despesas</p>
                <p className="text-lg font-semibold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Saldo</p>
                <p className={`text-lg font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <TrendingUp className={`h-5 w-5 ${balance >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transações</p>
                <p className="text-lg font-semibold text-blue-600">{filteredTransactions.length}</p>
              </div>
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <ChartCard
          title=""
          showPeriodSelector={true}
          periodOptions={periodOptions}
          selectedPeriod={period}
          onPeriodChange={setPeriod}
          showControls={true}
          dataCount={filteredTransactions.length}
        >
          <ResponsiveContainer width="100%" height={400}>
            {renderChart()}
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Category and Payment Method Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <ChartCard
          title="Gastos por Categoria"
          subtitle="Distribuição das despesas por categoria"
          showPeriodSelector={false}
          onExport={(format) => console.log(`Exportando gráfico de categorias em ${format}`)}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Payment Methods */}
        <ChartCard
          title="Métodos de Pagamento"
          subtitle="Distribuição por forma de pagamento"
          showPeriodSelector={false}
          onExport={(format) => console.log(`Exportando gráfico de métodos de pagamento em ${format}`)}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentMethodData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number"
                fontSize={12}
                tick={{ fill: 'currentColor' }}
                tickFormatter={formatCurrency}
              />
              <YAxis 
                type="category"
                dataKey="name"
                fontSize={12}
                tick={{ fill: 'currentColor' }}
                width={100}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Valor']}
                labelFormatter={(label) => `Método: ${label}`}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}