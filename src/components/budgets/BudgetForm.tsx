import { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Target, AlertTriangle, TrendingUp, Calculator, Bell, CheckCircle2 } from 'lucide-react';
import { FormField } from '@/components/forms/FormField';
import { DatePicker } from '@/components/forms/DatePicker';
import { CategoryPicker } from '@/components/forms/CategoryPicker';
import { NumberInput } from '@/components/forms/NumberInput';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { useSupabaseBudgets } from '@/hooks/useSupabaseBudgets';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { addMonths, addWeeks, addYears, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BudgetFormData {
  name: string;
  category_id: string;
  planned_amount: number;
  period_type: 'weekly' | 'monthly' | 'yearly';
  period_start: string;
  period_end: string;
  alert_percentage: number;
  is_active: boolean;
  auto_rollover: boolean;
  notification_settings: {
    email: boolean;
    push: boolean;
    daily_summary: boolean;
    weekly_summary: boolean;
  };
}

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: any;
  onSuccess?: () => void;
}

const PERIOD_TYPES = [
  { value: 'weekly', label: 'Semanal', icon: '📅' },
  { value: 'monthly', label: 'Mensal', icon: '🗓️' },
  { value: 'yearly', label: 'Anual', icon: '📆' },
];

const ALERT_PRESETS = [
  { value: 50, label: '50%', color: 'bg-green-500' },
  { value: 75, label: '75%', color: 'bg-yellow-500' },
  { value: 90, label: '90%', color: 'bg-orange-500' },
  { value: 100, label: '100%', color: 'bg-red-500' },
];

export function BudgetForm({ isOpen, onClose, budget, onSuccess }: BudgetFormProps) {
  const { categories } = useSupabaseCategories();
  const { addBudget, updateBudget, isAdding, isUpdating } = useSupabaseBudgets();
  
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    category_id: '',
    planned_amount: 0,
    period_type: 'monthly',
    period_start: startOfMonth(new Date()).toISOString().split('T')[0],
    period_end: endOfMonth(new Date()).toISOString().split('T')[0],
    alert_percentage: 80,
    is_active: true,
    auto_rollover: false,
    notification_settings: {
      email: true,
      push: true,
      daily_summary: false,
      weekly_summary: true,
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Load budget data for editing
  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name || '',
        category_id: budget.category_id || '',
        planned_amount: budget.planned_amount || 0,
        period_type: budget.period_type || 'monthly',
        period_start: budget.period_start || startOfMonth(new Date()).toISOString().split('T')[0],
        period_end: budget.period_end || endOfMonth(new Date()).toISOString().split('T')[0],
        alert_percentage: budget.alert_percentage || 80,
        is_active: budget.is_active ?? true,
        auto_rollover: budget.auto_rollover || false,
        notification_settings: budget.notification_settings || {
          email: true,
          push: true,
          daily_summary: false,
          weekly_summary: true,
        }
      });
      setShowAdvancedOptions(true);
    }
  }, [budget]);

  // Auto-calculate period dates when period type changes
  useEffect(() => {
    const today = new Date();
    let start: Date, end: Date;

    switch (formData.period_type) {
      case 'weekly':
        start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        end = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'yearly':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      default: // monthly
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
    }

    setFormData(prev => ({
      ...prev,
      period_start: start.toISOString().split('T')[0],
      period_end: end.toISOString().split('T')[0],
    }));
  }, [formData.period_type]);

  // Real-time validation
  const validateField = useCallback((field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'name':
        if (!value?.trim()) {
          newErrors.name = 'Nome é obrigatório';
        } else if (value.length > 100) {
          newErrors.name = 'Nome deve ter no máximo 100 caracteres';
        } else {
          delete newErrors.name;
        }
        break;
      case 'planned_amount':
        if (!value || value <= 0) {
          newErrors.planned_amount = 'Valor deve ser maior que zero';
        } else if (value > 999999.99) {
          newErrors.planned_amount = 'Valor deve ser menor que R$ 999.999,99';
        } else {
          delete newErrors.planned_amount;
        }
        break;
      case 'category_id':
        if (!value) {
          newErrors.category_id = 'Categoria é obrigatória';
        } else {
          delete newErrors.category_id;
        }
        break;
      case 'period_start':
        if (!value) {
          newErrors.period_start = 'Data inicial é obrigatória';
        } else {
          delete newErrors.period_start;
        }
        break;
      case 'period_end':
        if (!value) {
          newErrors.period_end = 'Data final é obrigatória';
        } else if (formData.period_start && new Date(value) <= new Date(formData.period_start)) {
          newErrors.period_end = 'Data final deve ser posterior à data inicial';
        } else {
          delete newErrors.period_end;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors, formData.period_start]);

  // Real-time validation on field changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.name) validateField('name', formData.name);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.name, validateField]);

  useEffect(() => {
    if (formData.planned_amount > 0) validateField('planned_amount', formData.planned_amount);
  }, [formData.planned_amount, validateField]);

  useEffect(() => {
    if (formData.category_id) validateField('category_id', formData.category_id);
  }, [formData.category_id, validateField]);

  useEffect(() => {
    if (formData.period_start) validateField('period_start', formData.period_start);
  }, [formData.period_start, validateField]);

  useEffect(() => {
    if (formData.period_end) validateField('period_end', formData.period_end);
  }, [formData.period_end, validateField]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (formData.planned_amount <= 0) {
      newErrors.planned_amount = 'Valor deve ser maior que zero';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Categoria é obrigatória';
    }

    if (!formData.period_start) {
      newErrors.period_start = 'Data inicial é obrigatória';
    }

    if (!formData.period_end) {
      newErrors.period_end = 'Data final é obrigatória';
    } else if (new Date(formData.period_end) <= new Date(formData.period_start)) {
      newErrors.period_end = 'Data final deve ser posterior à data inicial';
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
      const budgetData = {
        ...formData,
        spent_amount: 0, // Initialize with 0 for new budgets
      };

      if (budget) {
        const result = await updateBudget(budget.id, budgetData);
        if (result.error) {
          throw new Error(result.error);
        }
        toast({
          title: "Orçamento atualizado",
          description: "O orçamento foi atualizado com sucesso.",
        });
      } else {
        const result = await addBudget(budgetData);
        if (result.error) {
          throw new Error(result.error);
        }
        toast({
          title: "Orçamento criado",
          description: "O orçamento foi criado com sucesso.",
        });
      }
      
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving budget:', error);
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
      name: '',
      category_id: '',
      planned_amount: 0,
      period_type: 'monthly',
      period_start: startOfMonth(new Date()).toISOString().split('T')[0],
      period_end: endOfMonth(new Date()).toISOString().split('T')[0],
      alert_percentage: 80,
      is_active: true,
      auto_rollover: false,
      notification_settings: {
        email: true,
        push: true,
        daily_summary: false,
        weekly_summary: true,
      }
    });
    setErrors({});
    setShowAdvancedOptions(false);
  };

  const calculateDailyBudget = () => {
    const start = new Date(formData.period_start);
    const end = new Date(formData.period_end);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? formData.planned_amount / days : 0;
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure metas financeiras e alertas personalizados
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Informações Básicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Nome do Orçamento"
                required
                error={errors.name}
                description="Ex: Alimentação Janeiro, Transporte 2024"
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o nome do orçamento"
                />
              </FormField>

              <FormField
                label="Categoria"
                required
                error={errors.category_id}
                description="Categoria de despesa para este orçamento"
              >
                <CategoryPicker
                  categories={expenseCategories}
                  value={formData.category_id}
                  onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  placeholder="Selecione uma categoria"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Valor Planejado"
                required
                error={errors.planned_amount}
                description={`Orçamento diário: R$ ${calculateDailyBudget().toFixed(2).replace('.', ',')}`}
              >
                <NumberInput
                  value={formData.planned_amount}
                  onChange={(value) => setFormData(prev => ({ ...prev, planned_amount: value }))}
                  placeholder="0,00"
                />
              </FormField>

              <FormField
                label="Período"
                required
                description="Tipo de período do orçamento"
              >
                <Select 
                  value={formData.period_type} 
                  onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => 
                    setFormData(prev => ({ ...prev, period_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIOD_TYPES.map(period => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.icon} {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Status"
                description="Orçamento ativo ou inativo"
              >
                <div className="flex items-center space-x-3 pt-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <span className={cn(
                    "text-sm font-medium",
                    formData.is_active ? "text-green-600" : "text-gray-500"
                  )}>
                    {formData.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </FormField>
            </div>
          </div>

          <Separator />

          {/* Period Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Configuração do Período
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Data Inicial"
                required
                error={errors.period_start}
              >
                <DatePicker
                  value={formData.period_start}
                  onChange={(value) => setFormData(prev => ({ ...prev, period_start: value }))}
                />
              </FormField>

              <FormField
                label="Data Final"
                required
                error={errors.period_end}
              >
                <DatePicker
                  value={formData.period_end}
                  onChange={(value) => setFormData(prev => ({ ...prev, period_end: value }))}
                />
              </FormField>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Resumo do Período</span>
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p>Período: {format(new Date(formData.period_start), 'dd/MM/yyyy', { locale: ptBR })} até {format(new Date(formData.period_end), 'dd/MM/yyyy', { locale: ptBR })}</p>
                <p>Duração: {Math.ceil((new Date(formData.period_end).getTime() - new Date(formData.period_start).getTime()) / (1000 * 60 * 60 * 24))} dias</p>
                <p>Orçamento diário: R$ {calculateDailyBudget().toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Alert Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Configuração de Alertas
            </h3>

            <FormField
              label="Alerta de Limite"
              description={`Receber notificação quando atingir ${formData.alert_percentage}% do orçamento (R$ ${(formData.planned_amount * formData.alert_percentage / 100).toFixed(2).replace('.', ',')})`}
            >
              <div className="space-y-4">
                <div className="flex gap-2">
                  {ALERT_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, alert_percentage: preset.value }))}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        formData.alert_percentage === preset.value
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <Slider
                    value={[formData.alert_percentage]}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, alert_percentage: value[0] }))}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span className="font-medium text-blue-600">{formData.alert_percentage}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </FormField>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <TrendingUp className="h-4 w-4" />
              Opções Avançadas
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                {showAdvancedOptions ? 'Ocultar' : 'Mostrar'}
              </span>
            </button>

            {showAdvancedOptions && (
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Renovação Automática"
                    description="Criar automaticamente um novo orçamento quando este período terminar"
                  >
                    <div className="flex items-center space-x-3 pt-2">
                      <Switch
                        checked={formData.auto_rollover}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_rollover: checked }))}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formData.auto_rollover ? 'Habilitada' : 'Desabilitada'}
                      </span>
                    </div>
                  </FormField>

                  <FormField
                    label="Configurações de Notificação"
                    description="Personalize como e quando receber notificações"
                  >
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notification_settings.email}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notification_settings: {
                              ...prev.notification_settings,
                              email: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Email</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notification_settings.push}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notification_settings: {
                              ...prev.notification_settings,
                              push: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Push</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notification_settings.weekly_summary}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            notification_settings: {
                              ...prev.notification_settings,
                              weekly_summary: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Resumo semanal</span>
                      </label>
                    </div>
                  </FormField>
                </div>
              </div>
            )}
          </div>

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
            >
              {(isAdding || isUpdating || isValidating) && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {isValidating ? 'Validando...' : 
               isAdding || isUpdating ? 'Salvando...' :
               budget ? 'Atualizar' : 'Criar'} Orçamento
              {Object.keys(errors).length === 0 && !isAdding && !isUpdating && !isValidating && (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Form validation summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
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