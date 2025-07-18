import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';

interface CategoryPieChartProps {
  transactions: Array<{
    id: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
    category_id?: string;
    category_color?: string;
  }>;
  title?: string;
  showLegend?: boolean;
  showExport?: boolean;
  height?: number;
  className?: string;
  onExport?: () => void;
}

export function CategoryPieChart({
  transactions,
  title = 'Distribuição por Categoria',
  showLegend = true,
  showExport = true,
  height = 300,
  className,
  onExport
}: CategoryPieChartProps) {
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
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalAmount = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

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
      const percentage = ((data.value / totalAmount) * 100).toFixed(1);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(data.value)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    if (percent < 0.05) return null; // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend layout="vertical" align="right" verticalAlign="middle" />}
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-2">
              {chartData.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.value)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({((item.value / totalAmount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
              
              {chartData.length > 5 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                  + {chartData.length - 5} outras categorias
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}