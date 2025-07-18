import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Repeat, Tag, Calendar, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { DatePicker } from '@/components/forms/DatePicker';
import { CategoryPicker } from '@/components/forms/CategoryPicker';
import { NumberInput } from '@/components/forms/NumberInput';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date?: string;
  count?: number;
}

interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category_id: string;
  payment_method: string;
  is_recurring: boolean;
  recurrence_rule?: RecurrenceRule;
  installments: number;
  installment_number: number;
  observations: string;
  tags: string[];
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: any;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  { value: 'Dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'Cartão de Crédito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'Cartão de Débito', label: 'Cartão de Débito', icon: '💳' },
  { value: 'PIX', label: 'PIX', icon: '📱' },
  { value: 'Transferência', label: 'Transferência', icon: '🏦' },
  { value: 'Boleto', label: 'Boleto', icon: '📄' },
];

export function TransactionForm({ isOpen, onClose, transaction, onSuccess }: TransactionFormProps) {
  const { categories } = useSupabaseCategories();
  const { addTransaction, updateTransaction, isAdding, isUpdating } = useSupabaseTransactions();
  
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category_id: '',
    payment_method: 'Dinheiro',
    is_recurring: false,
    recurrence_rule: {
      frequency: 'monthly',
      interval: 1,
    },
    installments: 1,
    installment_number: 1,
    observations: '',
    tags: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  const [showInstallmentPreview, setShowInstallmentPreview] = useState(false);

  // Load transaction data for editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || '',
        amount: Math.abs(transaction.amount) || 0,
        date: transaction.date || new Date().toISOString().split('T')[0],
        type: transaction.type || 'expense',
        category_id: transaction.category_id || '',
        payment_method: transaction.payment_method || 'Dinheiro',
        is_recurring: transaction.is_recurring || false,
        recurrence_rule: transaction.recurrence_rule || {
          frequency: 'monthly',
          interval: 1,
        },
        installments: transaction.installments || 1,
        installment_number: transaction.installment_number || 1,
        observations: transaction.observations || '',
        tags: transaction.tags || []
      });
      setShowRecurrenceOptions(transaction.is_recurring || false);
      setShowInstallmentPreview(transaction.installments > 1);
    }
  }, [transaction]);

  // Real-time validation
  const validateField = useCallback((field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'description':
        if (!value?.trim()) {
          newErrors.description = 'Descrição é obrigatória';
        } else if (value.length > 255) {
          newErrors.description = 'Descrição deve ter no máximo 255 caracteres';
        } else {
          delete newErrors.description;
        }
        break;
      case 'amount':
        if (!value || value <= 0) {
          newErrors.amount = 'Valor deve ser maior que zero';
        } else if (value > 999999.99) {
          newErrors.amount = 'Valor deve ser menor que R$ 999.999,99';
        } else {
          delete newErrors.amount;
        }
        break;
      case 'date':
        if (!value) {
          newErrors.date = 'Data é obrigatória';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(today.getFullYear() + 1);
          
          if (selectedDate > oneYearFromNow) {
            newErrors.date = 'Data não pode ser superior a 1 ano no futuro';
          } else {
            delete newErrors.date;
          }
        }
        break;
      case 'category_id':
        if (!value) {
          newErrors.category_id = 'Categoria é obrigatória';
        } else {
          delete newErrors.category_id;
        }
        break;
      case 'installments':
        if (!value || value < 1) {
          newErrors.installments = 'Número de parcelas deve ser pelo menos 1';
        } else if (value > 60) {
          newErrors.installments = 'Número de parcelas não pode exceder 60';
        } else {
          delete newErrors.installments;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors]);

  // Real-time validation on field changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.description) validateField('description', formData.description);
    }, 500);
    return () => clearTimeout(timeoutId);
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

  useEffect(() => {
    if (formData.installments) validateField('installments', formData.installments);
  }, [formData.installments, validateField]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Categoria é obrigatória';
    }

    if (formData.installments < 1 || formData.installments > 60) {
      newErrors.installments = 'Parcelas devem estar entre 1 e 60';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      const transactionData = {
        ...formData,
        // Ensure amount is positive for storage, type determines income/expense
        amount: Math.abs(formData.amount),
        recurrence_rule: formData.is_recurring ? formData.recurrence_rule : undefined,
      };

      if (transaction) {
        const result = await updateTransaction(transaction.id, transactionData);
        if (result.error) {
          throw new Error(result.error);
        }
        toast({
          title: "Transação atualizada",
          description: "A transação foi atualizada com sucesso.",
        });
      } else {
        const result = await addTransaction(transactionData);
        if (result.error) {
          throw new Error(result.error);
        }
        toast({
          title: "Transação criada",
          description: formData.installments > 1 
            ? `${formData.installments} parcelas foram criadas com sucesso.`
            : "A transação foi criada com sucesso.",
        });
      }
      
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category_id: '',
      payment_method: 'Dinheiro',
      is_recurring: false,
      recurrence_rule: {
        frequency: 'monthly',
        interval: 1,
      },
      installments: 1,
      installment_number: 1,
      observations: '',
      tags: []
    });
    setErrors({});
    setTagInput('');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category_id: '' }))}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                formData.type === 'expense'
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income', category_id: '' }))}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                formData.type === 'income'
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              Receita
            </button>
          </div>

          {/* Description */}
          <FormField
            label="Descrição"
            required
            error={errors.description}
          >
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Almoço no restaurante"
            />
          </FormField>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Valor"
              required
              error={errors.amount}
            >
              <NumberInput
                value={formData.amount}
                onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                placeholder="0,00"
              />
            </FormField>

            <FormField
              label="Data"
              required
              error={errors.date}
            >
              <DatePicker
                value={formData.date}
                onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
              />
            </FormField>
          </div>

          {/* Category and Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Categoria"
              required
              error={errors.category_id}
            >
              <CategoryPicker
                categories={filteredCategories}
                value={formData.category_id}
                onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                placeholder="Selecione uma categoria"
              />
            </FormField>

            <FormField
              label="Método de Pagamento"
              required
            >
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.icon} {method.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Installments and Recurring */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Parcelas"
              error={errors.installments}
              description={formData.installments > 1 ? `Valor por parcela: R$ ${(formData.amount / formData.installments).toFixed(2).replace('.', ',')}` : undefined}
            >
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.installments}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setFormData(prev => ({ ...prev, installments: value }));
                    setShowInstallmentPreview(value > 1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.installments > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowInstallmentPreview(!showInstallmentPreview)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
                  >
                    <CreditCard className="h-4 w-4" />
                  </button>
                )}
              </div>
            </FormField>

            <FormField label="Opções">
              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({ ...prev, is_recurring: checked }));
                      setShowRecurrenceOptions(checked);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Recorrente</span>
                  <Repeat className="h-4 w-4 text-gray-400" />
                </label>
                
                {formData.is_recurring && (
                  <button
                    type="button"
                    onClick={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Calendar className="h-3 w-3" />
                    Configurar recorrência
                  </button>
                )}
              </div>
            </FormField>
          </div>

          {/* Recurrence Options */}
          {formData.is_recurring && showRecurrenceOptions && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Configurações de Recorrência
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Frequência">
                  <select
                    value={formData.recurrence_rule?.frequency || 'monthly'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence_rule: {
                        ...prev.recurrence_rule!,
                        frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                      }
                    }))}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </FormField>

                <FormField label="Intervalo">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.recurrence_rule?.interval || 1}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence_rule: {
                        ...prev.recurrence_rule!,
                        interval: parseInt(e.target.value) || 1
                      }
                    }))}
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormField>

                <FormField label="Repetições">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={formData.recurrence_rule?.count || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      recurrence_rule: {
                        ...prev.recurrence_rule!,
                        count: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    }))}
                    placeholder="Ilimitado"
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormField>
              </div>

              <div className="text-xs text-blue-700 dark:text-blue-300">
                {formData.recurrence_rule?.frequency === 'daily' && `Repetir a cada ${formData.recurrence_rule.interval} dia(s)`}
                {formData.recurrence_rule?.frequency === 'weekly' && `Repetir a cada ${formData.recurrence_rule.interval} semana(s)`}
                {formData.recurrence_rule?.frequency === 'monthly' && `Repetir a cada ${formData.recurrence_rule.interval} mês(es)`}
                {formData.recurrence_rule?.frequency === 'yearly' && `Repetir a cada ${formData.recurrence_rule.interval} ano(s)`}
                {formData.recurrence_rule?.count && ` por ${formData.recurrence_rule.count} vezes`}
              </div>
            </div>
          )}

          {/* Installment Preview */}
          {formData.installments > 1 && showInstallmentPreview && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Previsão de Parcelas
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700 dark:text-green-300">Valor total:</span>
                  <span className="font-medium ml-2">R$ {formData.amount.toFixed(2).replace('.', ',')}</span>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">Valor por parcela:</span>
                  <span className="font-medium ml-2">R$ {(formData.amount / formData.installments).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="text-xs text-green-700 dark:text-green-300">
                Serão criadas {formData.installments} transações mensais consecutivas a partir de {new Date(formData.date).toLocaleDateString('pt-BR')}
              </div>
            </div>
          )}

          {/* Enhanced Tags System */}
          <FormField 
            label="Tags" 
            description="Use tags para categorizar e organizar suas transações (ex: trabalho, pessoal, viagem)"
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      } else if (e.key === 'Escape') {
                        setTagInput('');
                      }
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite uma tag e pressione Enter"
                    maxLength={20}
                  />
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.includes(tagInput.trim())}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
              </div>
              
              {/* Tag suggestions */}
              {!tagInput && formData.tags.length === 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Sugestões:</span>
                  {['trabalho', 'pessoal', 'casa', 'saúde', 'educação', 'lazer'].map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(suggestion)) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, suggestion]
                          }));
                        }
                      }}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Active tags */}
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Tags ativas ({formData.tags.length}/10)
                    </span>
                    {formData.tags.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tags: [] }))}
                        className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Limpar todas
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-600 dark:hover:text-blue-400 ml-1 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          aria-label={`Remover tag ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FormField>

          {/* Observations */}
          <FormField label="Observações">
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observações adicionais..."
            />
          </FormField>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isAdding || isUpdating || isValidating}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isAdding || isUpdating || isValidating || Object.keys(errors).length > 0}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                Object.keys(errors).length > 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              )}
              aria-describedby={Object.keys(errors).length > 0 ? "form-errors" : undefined}
            >
              {(isAdding || isUpdating || isValidating) && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isValidating ? 'Validando...' : 
               isAdding || isUpdating ? 'Salvando...' :
               transaction ? 'Atualizar' : 'Criar'} Transação
              {Object.keys(errors).length === 0 && !isAdding && !isUpdating && !isValidating && (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {Object.keys(errors).length > 0 && (
                <AlertCircle className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Form validation summary */}
          {Object.keys(errors).length > 0 && (
            <div id="form-errors" className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Corrija os seguintes erros:</span>
              </div>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
