
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useCategories } from '@/hooks/useCategories';
import { Transaction } from '../types';
import { cn } from '@/lib/utils';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  transaction?: Transaction;
}

const paymentMethods = [
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'PIX',
  'Transferência',
  'Outro'
];

export function TransactionForm({ open, onClose, onSubmit, transaction }: TransactionFormProps) {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    amount: transaction ? Math.abs(transaction.amount).toString() : '',
    date: transaction ? new Date(transaction.date) : new Date(),
    type: transaction?.type || 'expense' as 'income' | 'expense',
    category: transaction?.category || '',
    paymentMethod: transaction?.paymentMethod || 'Dinheiro',
    isRecurring: transaction?.isRecurring || false,
    installments: transaction?.installments || 1,
    observations: transaction?.observations || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === 'expense' ? -amount : amount;
    
    onSubmit({
      description: formData.description,
      amount: finalAmount,
      date: format(formData.date, 'yyyy-MM-dd'),
      type: formData.type,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      isRecurring: formData.isRecurring,
      installments: formData.installments,
      observations: formData.observations
    });
    
    onClose();
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Compra de supermercado"
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
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData({ ...formData, date })}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => 
                setFormData({ ...formData, type: value, category: '' })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
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
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Método de Pagamento</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => 
              setFormData({ ...formData, paymentMethod: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
            />
            <Label htmlFor="recurring">Transação Recorrente</Label>
          </div>

          {formData.type === 'expense' && formData.paymentMethod === 'Cartão de Crédito' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                Nota: Em compras com cartão de crédito, o lançamento é feito para o mês seguinte.
              </p>
              <Button type="button" className="w-full bg-purple-600 hover:bg-purple-700 text-white mb-3">
                Compra Parcelada
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número de Parcelas</Label>
                  <Select value={formData.installments.toString()} onValueChange={(value) => 
                    setFormData({ ...formData, installments: parseInt(value) })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(24)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Valor Total</Label>
                  <Input
                    value={formData.amount ? `R$ ${(parseFloat(formData.amount) * formData.installments).toFixed(2)}` : 'R$ 0,00'}
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <p>• Serão geradas {formData.installments} parcelas de R$ {formData.amount || '0,00'}</p>
                <p>• Primeira parcela em {format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'dd/MM/yyyy', { locale: ptBR })}</p>
                <p>• Última parcela em {format(new Date(new Date().setMonth(new Date().getMonth() + formData.installments)), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="observations">Observações (opcional)</Label>
            <Textarea
              id="observations"
              placeholder="Informações adicionais sobre a transação"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
