import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { BarChart2, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';

interface MonthlyComparisonChartProps {
  data: Array<{
    month: string;
    receitas: number;
    despesas: number;
    [key: string]: any;
  }>;
  height?: number;
  className?: string;
}

type ChartType = 'line' | 'bar' | 'area';

export function MonthlyComparisonChart({
  data,
  height = 400,
  className
}: MonthlyComparisonChartProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');

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
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
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
            <Bar dataKey="receitas" fill="#22c55e" name="Receitas" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
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
              dataKey="receitas" 
              stackId="1"
              stroke="#22c55e" 
              fill="#22c55e"
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
              dataKey="receitas" 
              stroke="#22c55e" 
              strokeWidth={3}
              dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
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
          </LineChart>
        );
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col space-y-4">
        <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1 self-end">
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
        
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}