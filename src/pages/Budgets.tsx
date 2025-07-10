
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { BudgetForm } from '../components/BudgetForm';
import { mockBudgets } from '../data/mockData';
import { Budget } from '../types';
import { cn } from '@/lib/utils';

export function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddBudget = (newBudget: Omit<Budget, 'id' | 'spentAmount'>) => {
    const budget: Budget = {
      id: Math.random().toString(36).substr(2, 9),
      spentAmount: 0,
      ...newBudget
    };
    setBudgets([...budgets, budget]);
  };

  const handleEditBudget = (updatedBudget: Omit<Budget, 'id' | 'spentAmount'>) => {
    if (editingBudget) {
      setBudgets(budgets.map(b => 
        b.id === editingBudget.id 
          ? { ...updatedBudget, id: editingBudget.id, spentAmount: editingBudget.spentAmount }
          : b
      ));
      setEditingBudget(undefined);
    }
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPlanned = budgets.reduce((sum, b) => sum + b.plannedAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const progressPercentage = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">julho de 2025</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-600">Total Orçado</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            R$ {totalPlanned.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-600">Total Gasto</p>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">
            R$ {totalSpent.toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-600">Saldo</p>
          </div>
          <p className={cn(
            "text-2xl font-bold mt-2",
            (totalPlanned - totalSpent) >= 0 ? "text-green-600" : "text-red-600"
          )}>
            R$ {(totalPlanned - totalSpent).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <p className="text-sm font-medium text-gray-600">Controle de Orçamentos</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {progressPercentage.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar orçamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex space-x-2 text-sm">
            <button className="text-gray-500">Ativos (3)</button>
            <button className="text-gray-500">Excedidos (1)</button>
            <button className="text-gray-500">Dentro do Limite (23)</button>
            <button className="text-blue-600">Inativos (0)</button>
            <button className="bg-blue-600 text-white px-3 py-1 rounded">Em Todos Orçamentos</button>
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredBudgets.map((budget) => {
          const percentage = budget.plannedAmount > 0 ? (budget.spentAmount / budget.plannedAmount) * 100 : 0;
          const isOverBudget = percentage > 100;
          const isNearLimit = percentage >= budget.alertPercentage;
          
          return (
            <div key={budget.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                  <p className="text-sm text-gray-500">{budget.category}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingBudget(budget);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orçamento:</span>
                  <span className="font-medium">R$ {budget.plannedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gasto:</span>
                  <span className="font-medium">R$ {budget.spentAmount.toFixed(2)}</span>
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
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {percentage.toFixed(0)}% utilizado
                  </span>
                  {isOverBudget && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">Excedido</span>
                    </div>
                  )}
                  {isNearLimit && !isOverBudget && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">Próximo ao limite</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget Form */}
      <BudgetForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingBudget(undefined);
        }}
        onSubmit={editingBudget ? handleEditBudget : handleAddBudget}
        budget={editingBudget}
      />
    </div>
  );
}
