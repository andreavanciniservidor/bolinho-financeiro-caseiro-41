
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Bell } from 'lucide-react';
import { categories } from '../data/mockData';
import { Budget } from '../types';

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (budget: Omit<Budget, 'id' | 'spentAmount'>) => void;
  budget?: Budget;
}

export function BudgetForm({ open, onClose, onSubmit, budget }: BudgetFormProps) {
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    category: budget?.category || '',
    plannedAmount: budget?.plannedAmount?.toString() || '',
    alertPercentage: budget?.alertPercentage || 80,
    isActive: budget?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      name: formData.name,
      category: formData.category,
      plannedAmount: parseFloat(formData.plannedAmount),
      alertPercentage: formData.alertPercentage,
      isActive: formData.isActive
    });
    
    onClose();
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Nome do Orçamento</Label>
            <Input
              id="name"
              placeholder="Ex: Alimentação Mensal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => 
              setFormData({ ...formData, category: value })
            }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Selecione uma categoria de despesa para o orçamento.
            </p>
          </div>

          <div>
            <Label htmlFor="amount">Valor Mensal Planejado (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.plannedAmount}
              onChange={(e) => setFormData({ ...formData, plannedAmount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <Label className="text-base font-medium">Notificações de Limite</Label>
            </div>
            
            <div>
              <Label className="text-sm">Alerta quando atingir:</Label>
              <div className="mt-3 mb-2">
                <Slider
                  value={[formData.alertPercentage]}
                  onValueChange={(value) => setFormData({ ...formData, alertPercentage: value[0] })}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>10%</span>
                <span className="font-medium text-blue-600">{formData.alertPercentage}%</span>
                <span>100%</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              Você receberá uma notificação quando o gasto atingir esta porcentagem do orçamento.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="active" className="text-base">Orçamento Ativo</Label>
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
