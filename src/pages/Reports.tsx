
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DownloadIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyData = [
  { month: 'ago', receitas: 0, despesas: 0 },
  { month: 'set', receitas: 0, despesas: 0 },
  { month: 'out', receitas: 0, despesas: 0 },
  { month: 'nov', receitas: 0, despesas: 0 },
  { month: 'dez', receitas: 0, despesas: 0 },
  { month: 'jan', receitas: 0, despesas: 2500 },
  { month: 'fev', receitas: 0, despesas: 2800 },
  { month: 'mar', receitas: 11500, despesas: 11800 },
  { month: 'abr', receitas: 11800, despesas: 11500 },
  { month: 'mai', receitas: 9500, despesas: 7200 },
  { month: 'jun', receitas: 6000, despesas: 1200 },
  { month: 'jul', receitas: 0, despesas: 1407.88 }
];

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('Ano Inteiro');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [reportType, setReportType] = useState('Visão Geral');

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
          <p className="text-2xl font-bold text-green-600">R$ 32003.29</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Total de Despesas</h4>
          <p className="text-2xl font-bold text-red-600">R$ 41695.39</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Saldo Acumulado</h4>
          <p className="text-2xl font-bold text-red-600">R$ -9692.10</p>
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
              <tr>
                <td className="py-3 px-4">Alimentação</td>
                <td className="py-3 px-4 text-right">R$ 800,00</td>
                <td className="py-3 px-4 text-right">R$ 550,00</td>
                <td className="py-3 px-4 text-right">69%</td>
                <td className="py-3 px-4 text-right text-green-600">R$ 250,00</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Transporte</td>
                <td className="py-3 px-4 text-right">R$ 400,00</td>
                <td className="py-3 px-4 text-right">R$ 320,00</td>
                <td className="py-3 px-4 text-right">80%</td>
                <td className="py-3 px-4 text-right text-green-600">R$ 80,00</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Moradia</td>
                <td className="py-3 px-4 text-right">R$ 1.500,00</td>
                <td className="py-3 px-4 text-right">R$ 1.200,00</td>
                <td className="py-3 px-4 text-right">80%</td>
                <td className="py-3 px-4 text-right text-green-600">R$ 300,00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
