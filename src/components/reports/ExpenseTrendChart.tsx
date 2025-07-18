import { useMemo, useState } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, BarChart2, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExpenseTrendChartProps {
  transactions: Array<{
    id: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category?: string;
    category_id?: string;
    category_color?: string;
  }>;
  title?: string;
  showControls?: boolean;
  showExport?: boolean;
  height?: number;
  className?: string;
  onExport?: () => void;
  period?: number; // Number of months to show
}

type ChartType = 'line' | 'bar' | 'area';

export function ExpenseTrendChart({
  transactions,
  title = 'Tendência de Gastos',
  showControls = true,
  showExport = true,
  height = 300,
  className,
  onExport,
  period = 12
}: ExpenseTrendChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(period);

  const chartData = useMemo(() => {
    // Get date range for the selected period
    const now = new Date();
    const startDate = subMonths(now, selectedPeriod);
    const months = eachMonthOfInterval({
      start: startOfMonth(startDate),
      end: endOfMonth(now)
    });

    // Initialize data for each month
    const monthlyData = months.map(month => {
      const monthStr = format(month, 'yyyy-MM');
      const monthName = format(month, 'MMM/yy', { locale: ptBR });
      
      return {
        month: monthName,
        monthKey: monthStr,
        expenses: 0,
        income: 0,
        balance: 0,
        categories: {}
      };
    });

    // Group transactions by month
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthStr = format(transactionDate, 'yyyy-MM');
      
      const monthData = monthlyData.find(m => m.monthKey === monthStr);
      if (!monthData) return;

      if (transaction.type === 'expense') {
        const amount = Math.abs(transaction.amount);
        monthData.expenses += amount;
        
        // Track by category
        const category = transaction.category || 'Sem categoria';
        if (!monthData.categories[category]) {
          monthData.categories[category] = 0;
        }
        monthData.categories[category] += amount;
      } else {
        monthData.income += transaction.amount;
      }
    });

    // Calculate balance
    monthlyData.forEach(month => {
      month.balance = month.income - month.expenses;
    });

    return monthlyData;
  }, [transactions, selectedPeriod]);

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
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
          {payload.length > 1 && payload[0].payload.balance !== undefined && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Saldo:</span>
                <span className={`font-medium ${payload[0].payload.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(payload[0].payload.balance)}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              name="Despesas" 
              stroke="#ef4444" 
              fill="#ef4444" 
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              name="Receitas" 
              stroke="#22c55e" 
              fill="#22c55e" 
              fillOpacity={0.6}
            />
          </AreaChart>
        );
      
      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              name="Despesas" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              name="Receitas" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              name="Saldo" 
              stroke="#3b82f6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {showControls && (
              <>
                <Select value={selectedPeriod.toString()} onValueChange={(value) => setSelectedPeriod(parseInt(value))}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Últimos 3 meses</SelectItem>
                    <SelectItem value="6">Últimos 6 meses</SelectItem>
                    <SelectItem value="12">Último ano</SelectItem>
                    <SelectItem value="24">Últimos 2 anos</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                  <Button
                    variant={chartType === 'line' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType('line')}
                    className="h-8 w-8 p-0"
                  >
                    <LineChartIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === 'bar' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType('bar')}
                    className="h-8 w-8 p-0"
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={chartType === 'area' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType('area')}
                    className="h-8 w-8 p-0"
                  >
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
            
            {showExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="h-8">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="mb-1">Nenhuma transação encontrada</p>
              <p className="text-sm">Adicione transações para ver a tendência</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}