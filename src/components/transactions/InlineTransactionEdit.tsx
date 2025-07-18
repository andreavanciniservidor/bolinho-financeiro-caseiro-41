import { useState, useEffect, useCallback } from 'react';
import { Check, X, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NumberInput } from '@/components/forms/NumberInput';
import { CategoryPicker } from '@/components/forms/CategoryPicker';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category_id?: string;
  category?: {
    id: string;
    name: string;
    color: string;
    type: 'income' | 'expense';
  };
  payment_method: string;
  observations?: string;
  tags?: string[];
}

interface InlineTransactionEditProps {
  transaction: Transaction;
  onSave: (id: string, updates: Partial<Transaction>) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

const PAYMENT_METHODS = [
  { value: 'Dinheiro', label: 'Dinheiro' },
  { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
  { value: 'Cartão de Débito', label: 'Cartão de Débito' },
  { value: 'PIX', label: 'PIX' },
  { value: 'Transferência', label: 'Transferência' },
  { value: 'Boleto', label: 'Boleto' },
];

export function InlineTransactionEdit({
  transaction,
  onSave,
  onCancel,
  className
}: InlineTransactionEditProps) {
  const { categories } = useSupabaseCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    description: transaction.description,
    amount: Math.abs(transaction.amount),
    date: transaction.date,
    type: transaction.type,
    category_id: transaction.category_id || '',
    payment_method: transaction.payment_method,
    observations: transaction.observations || '',
    tags: transaction.tags || []
  });

  const [tagInput, setTagInput] = useState('');

  // Real-time validation
  const validateField = useCallback((field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'description':
        if (!value?.trim()) {
          newErrors.description = 'Descrição é obrigatória';
        } else if (value.length > 255) {
          newErrors.description = 'Descrição muito longa';
        } else {
          delete newErrors.description;
        }
        break;
      case 'amount':
        if (!value || value <= 0) {
          newErrors.amount = 'Valor deve ser maior que zero';
        } else if (value > 999999.99) {
          newErrors.amount = 'Valor muito alto';
        } else {
          delete newErrors.amount;
        }
        break;
      case 'date':
        if (!value) {
          newErrors.date = 'Data é obrigatória';
        } else {
          delete newErrors.date;
        }
        break;
      case 'category_id':
        if (!value) {
          newErrors.category_id = 'Categoria é obrigatória';
        } else {
          delete newErrors.category_id;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors]);

  // Validate on field changes
  useEffect(() => {
    if (formData.description) validateField('description', formData.description);
  }, [formData.description, validateField]);

  useEffect(() => {
    if (formData.amount > 0) validateField('amount', formData.amount);
  }, [formData.amount, validateField]);

  useEffect(() => {
    if (formData.date) validateField('date', formData.date);
  }, [formData.date, validateField]);

  useEffect(() => {
    if (formData.category_id) validateField('category_id', formData.category_id);
  }, [formData.category_id, validateField]);

  const handleSave = async () => {
    // Validate all fields
    const isValid = [
      validateField('description', formData.description),
      validateField('amount', formData.amount),
      validateField('date', formData.date),
      validateField('category_id', formData.category_id),
    ].every(Boolean);

    if (!isValid) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSave(transaction.id, {
        ...formData,
        amount: formData.amount, // Keep positive, type determines income/expense
      });
      
      toast({
        title: "Transação atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className={cn("bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Editando Transação
        </h4>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading || Object.keys(errors).length > 0}
            className="h-8 w-8 p-0"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Descrição *
          </label>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição da transação"
            className={cn(
              "h-8 text-sm",
              errors.description && "border-red-500 focus:border-red-500"
            )}
          />
          {errors.description && (
            <p className="text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Valor *
          </label>
          <NumberInput
            value={formData.amount}
            onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
            className={cn(
              "h-8 text-sm",
              errors.amount && "border-red-500 focus:border-red-500"
            )}
          />
          {errors.amount && (
            <p className="text-xs text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Data *
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className={cn(
              "h-8 text-sm",
              errors.date && "border-red-500 focus:border-red-500"
            )}
          />
          {errors.date && (
            <p className="text-xs text-red-600">{errors.date}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Tipo
          </label>
          <Select 
            value={formData.type} 
            onValueChange={(value: 'income' | 'expense') => 
              setFormData(prev => ({ ...prev, type: value, category_id: '' }))
            }
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Categoria *
          </label>
          <CategoryPicker
            categories={filteredCategories}
            value={formData.category_id}
            onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            className={cn(
              "h-8 text-sm",
              errors.category_id && "border-red-500 focus:border-red-500"
            )}
          />
          {errors.category_id && (
            <p className="text-xs text-red-600">{errors.category_id}</p>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Método de Pagamento
          </label>
          <Select 
            value={formData.payment_method} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map(method => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Tags
        </label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Adicionar tag"
            className="h-8 text-sm flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddTag}
            disabled={!tagInput.trim() || formData.tags.includes(tagInput.trim())}
            className="h-8 px-3"
          >
            <Tag className="h-3 w-3" />
          </Button>
        </div>
        
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Observations */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Observações
        </label>
        <Input
          value={formData.observations}
          onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
          placeholder="Observações adicionais..."
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}