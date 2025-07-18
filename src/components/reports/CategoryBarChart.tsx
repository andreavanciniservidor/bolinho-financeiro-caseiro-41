import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface CategoryBarChartProps {
  transactions: Array<{
    id: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
    category_id?: string;
    category_color?: string;
  }>;
  title?: string;
  showExport?: boolean;
  height?: number;
  className?: string;
  onExport?: () => void;
  maxItems?: number;
}

export function CategoryBarChart({
  transactions,
  title = 'Gastos por Categoria',
  showExport = true,
  height = 300,
  className,
  onExport,
  maxItems = 10
}: CategoryBarChartProps) {
  const chartData = useMemo(() => {
    const categoryMap = new Map();
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryName = transaction.category || 'Sem categoria';
        const amount = Math.abs(transaction.amount);
        const color = transaction.category_color || '#64748b';
        
        if (categoryMap.has(categoryName)) {
          categoryMap.get(categoryName).value += amount;
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            value: amount,
            color: color
          });
        }
      });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, maxItems);
  }, [transactions, maxItems]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {showExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <p className="mb-1">Nenhuma despesa encontrada</p>
              <p className="text-sm">Adicione despesas para ver a distribuição</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <YAxis 
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}