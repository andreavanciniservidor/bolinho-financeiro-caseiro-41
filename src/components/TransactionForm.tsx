
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '../types';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  transaction?: Transaction;
}

export function TransactionForm({ open, onClose, onSubmit, transaction }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    amount: transaction?.amount?.toString() || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    type: transaction?.type || 'expense' as 'income' | 'expense',
    category_id: transaction?.category_id || '',
    payment_method: transaction?.payment_method || 'Dinheiro',
    is_recurring: transaction?.is_recurring || false,
    installments: transaction?.installments || 1,
    installment_number: transaction?.installment_number || 1,
    observations: transaction?.observations || '',
    tags: transaction?.tags || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      type: formData.type,
      category: typeof transaction?.category === 'object' ? transaction.category : undefined,
      category_id: formData.category_id,
      payment_method: formData.payment_method,
      installments: formData.installments,
      installment_number: formData.installment_number,
      is_recurring: formData.is_recurring,
      observations: formData.observations,
      tags: formData.tags,
      user_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Tipo</Label>
            <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => 
              setFormData({ ...formData, type: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Método de Pagamento</Label>
            <Select value={formData.payment_method} onValueChange={(value) => 
              setFormData({ ...formData, payment_method: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Input
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {transaction ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
