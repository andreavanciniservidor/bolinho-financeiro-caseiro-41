
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockTransactions, mockBudgets } from '../data/mockData';

const monthlyData = [
  { month: 'Jan', receitas: 2500, despesas: 1800 },
  { month: 'Fev', receitas: 2800, despesas: 2200 },
  { month: 'Mar', receitas: 11500, despesas: 11800 },
  { month: 'Abr', receitas: 11800, despesas: 11500 },
  { month: 'Mai', receitas: 9500, despesas: 7200 },
  { month: 'Jun', receitas: 6000, despesas: 1200 },
  { month: 'Jul', receitas: 0, despesas: 1407.88 }
];

const categoryData = [
  { name: 'Alimentação', value: 550, color: '#ef4444' },
  { name: 'Transporte', value: 320, color: '#f97316' },
  { name: 'Moradia', value: 1200, color: '#eab308' },
  { name: 'Outros', value: 280, color: '#64748b' }
];

export function Dashboard() {
  const totalIncome = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const balance = totalIncome - totalExpenses;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orçamento Doméstico</h1>
        <p className="text-gray-600">julho de 2025</p>
        <div className="flex space-x-4 text-sm mt-2">
          <button className="text-blue-600 font-medium">Mês Anterior</button>
          <button className="text-blue-600 font-medium">Mês Atual</button>
          <button className="text-blue-600 font-medium">Próximo Mês</button>
        </div>
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
          value="0%"
          trend="neutral"
          icon={<Target className="h-6 w-6" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Comparison Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparativo Mensal</h3>
          <ResponsiveContainer width="100%" height={300}>
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
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de Receitas</p>
              <p className="text-lg font-semibold text-green-600">R$ 32003.29</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de Despesas</p>
              <p className="text-lg font-semibold text-red-600">R$ 41695.39</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Saldo Acumulado</p>
              <p className="text-lg font-semibold text-red-600">R$ -9692.10</p>
            </div>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gastos por Categoria</h3>
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
          {mockBudgets.map((budget) => {
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
          })}
        </div>
      </div>
    </div>
  );
}
