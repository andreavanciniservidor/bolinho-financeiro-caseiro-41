
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DownloadIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { useMemo } from 'react';

export function Reports() {
  const { transactions, isLoading } = useSupabaseTransactions();
  const { categories } = useSupabaseCategories();
  const [selectedPeriod, setSelectedPeriod] = useState('Ano Inteiro');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [reportType, setReportType] = useState('Visão Geral');

  const { monthlyData, totalIncome, totalExpenses, balance, categoryBreakdown } = useMemo(() => {
    // Group transactions by month for chart
    const monthlyMap = new Map();
    const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    
    // Initialize all months with zero values
    monthNames.forEach(month => {
      monthlyMap.set(month, { month, receitas: 0, despesas: 0 });
    });

    transactions.forEach(t => {
      const month = new Date(t.date).getMonth();
      const monthName = monthNames[month];
      const monthData = monthlyMap.get(monthName);
      
      if (t.type === 'income') {
        monthData.receitas += t.amount;
      } else {
        monthData.despesas += Math.abs(t.amount);
      }
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Category breakdown for table
    const categoryMap = new Map();
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
  }, [transactions]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
          <p className="text-gray-600">Análise e visualização dos seus dados financeiros</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <DownloadIcon className="h-4 w-4 mr-2" />
          Exportar Dados
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ano Inteiro">Ano Inteiro</SelectItem>
                <SelectItem value="Trimestre">Trimestre</SelectItem>
                <SelectItem value="Mês">Mês</SelectItem>
                <SelectItem value="Semana">Semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
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
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparativo Mensal</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
        
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise de Tendências</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Line 
              type="monotone" 
              dataKey="receitas" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Receitas"
            />
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Despesas"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detalhamento por Categoria</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Categoria</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Orçado</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Gasto</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">% do Orçamento</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Diferença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categoryBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                categoryBreakdown.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4 text-right">R$ {item.orcado.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">R$ {item.gasto.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">{item.percentual}%</td>
                    <td className="py-3 px-4 text-right text-red-600">R$ {item.diferenca.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
