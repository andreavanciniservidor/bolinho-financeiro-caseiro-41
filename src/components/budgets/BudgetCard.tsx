import { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Calendar, Target, MoreHorizontal, Edit, Trash2, Bell, BellOff, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface Budget {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  planned_amount: number;
  spent_amount: number;
  period_type: 'weekly' | 'monthly' | 'yearly';
  period_start: string;
  period_end: string;
  alert_percentage: number;
  is_active: boolean;
  auto_rollover?: boolean;
  created_at: string;
  updated_at: string;
}

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onToggleNotifications: (id: string, enabled: boolean) => void;
  className?: string;
  previousPeriodData?: {
    spent_amount: number;
    planned_amount: number;
  };
}

export function BudgetCard({
  budget,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleNotifications,
  className,
  previousPeriodData
}: BudgetCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Calculate progress and status
  const progressPercentage = budget.planned_amount > 0 
    ? Math.min((Math.abs(budget.spent_amount) / budget.planned_amount) * 100, 100)
    : 0;

  const remainingAmount = budget.planned_amount - Math.abs(budget.spent_amount);
  const isOverBudget = Math.abs(budget.spent_amount) > budget.planned_amount;
  const isNearLimit = progressPercentage >= budget.alert_percentage;
  
  // Calculate period info
  const today = new Date();
  const startDate = new Date(budget.period_start);
  const endDate = new Date(budget.period_end);
  const totalDays = differenceInDays(endDate, startDate);
  const daysElapsed = Math.max(0, differenceInDays(today, startDate));
  const daysRemaining = Math.max(0, differenceInDays(endDate, today));
  const isExpired = isAfter(today, endDate);
  const isUpcoming = isBefore(today, startDate);

  // Calculate daily spending rate
  const dailySpendingRate = daysElapsed > 0 ? Math.abs(budget.spent_amount) / daysElapsed : 0;
  const recommendedDailyRate = budget.planned_amount / totalDays;
  const projectedTotal = dailySpendingRate * totalDays;

  // Compare with previous period
  const previousSpentPercentage = previousPeriodData 
    ? (Math.abs(previousPeriodData.spent_amount) / previousPeriodData.planned_amount) * 100
    : null;
  const comparisonWithPrevious = previousSpentPercentage 
    ? progressPercentage - previousSpentPercentage
    : null;

  const getStatusColor = () => {
    if (!budget.is_active) return 'bg-gray-500';
    if (isExpired) return 'bg-gray-500';
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusLabel = () => {
    if (!budget.is_active) return 'Inativo';
    if (isExpired) return 'Expirado';
    if (isUpcoming) return 'Aguardando';
    if (isOverBudget) return 'Excedido';
    if (isNearLimit) return 'Atenção';
    return 'No prazo';
  };

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount));
  };

  const handleDelete = async () => {
    try {
      await onDelete(budget.id);
      setShowDeleteDialog(false);
      toast({
        title: "Orçamento excluído",
        description: "O orçamento foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o orçamento.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async () => {
    try {
      await onToggleActive(budget.id, !budget.is_active);
      toast({
        title: budget.is_active ? "Orçamento desativado" : "Orçamento ativado",
        description: `O orçamento foi ${budget.is_active ? 'desativado' : 'ativado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao alterar status",
        description: "Ocorreu um erro ao alterar o status do orçamento.",
        variant: "destructive",
      });
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const newState = !notificationsEnabled;
      await onToggleNotifications(budget.id, newState);
      setNotificationsEnabled(newState);
      toast({
        title: newState ? "Notificações ativadas" : "Notificações desativadas",
        description: `As notificações foram ${newState ? 'ativadas' : 'desativadas'} para este orçamento.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao alterar notificações",
        description: "Ocorreu um erro ao alterar as configurações de notificação.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4 transition-all duration-200",
      !budget.is_active && "opacity-60",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {budget.name}
            </h3>
            <Badge className={cn("text-xs", getStatusColor(), "text-white")}>
              {getStatusLabel()}
            </Badge>
            {budget.auto_rollover && (
              <Badge variant="outline" className="text-xs">
                Auto-renovação
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {budget.category && (
              <>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: budget.category.color }}
                />
                <span>{budget.category.name}</span>
                <span>•</span>
              </>
            )}
            <span className="capitalize">{budget.period_type}</span>
            <span>•</span>
            <span>{format(new Date(budget.period_start), 'dd/MM', { locale: ptBR })} - {format(new Date(budget.period_end), 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(budget)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleActive}>
              {budget.is_active ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {budget.is_active ? 'Desativar' : 'Ativar'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleNotifications}>
              {notificationsEnabled ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
              {notificationsEnabled ? 'Desativar alertas' : 'Ativar alertas'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progresso</span>
          <span className={cn(
            "font-medium",
            isOverBudget ? "text-red-600" : "text-gray-900 dark:text-gray-100"
          )}>
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2"
          indicatorClassName={getProgressColor()}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Gasto: </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(budget.spent_amount)}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600 dark:text-gray-400">Orçamento: </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(budget.planned_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className={cn(
            "text-lg font-bold",
            remainingAmount >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatCurrency(remainingAmount)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {remainingAmount >= 0 ? 'Restante' : 'Excedido'}
          </div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {daysRemaining}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {daysRemaining === 1 ? 'Dia restante' : 'Dias restantes'}
          </div>
        </div>
      </div>

      {/* Insights and Alerts */}
      <div className="space-y-2">
        {/* Over budget alert */}
        {isOverBudget && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <span className="font-medium">Orçamento excedido!</span>
              <span className="ml-1">Você gastou {formatCurrency(Math.abs(budget.spent_amount) - budget.planned_amount)} a mais que o planejado.</span>
            </div>
          </div>
        )}

        {/* Near limit alert */}
        {!isOverBudget && isNearLimit && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              <span className="font-medium">Atenção!</span>
              <span className="ml-1">Você atingiu {progressPercentage.toFixed(1)}% do seu orçamento.</span>
            </div>
          </div>
        )}

        {/* Spending rate insight */}
        {!isExpired && !isUpcoming && dailySpendingRate > recommendedDailyRate * 1.2 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Ritmo acelerado:</span>
              <span className="ml-1">
                Você está gastando {formatCurrency(dailySpendingRate)}/dia. 
                Recomendado: {formatCurrency(recommendedDailyRate)}/dia.
              </span>
            </div>
          </div>
        )}

        {/* Comparison with previous period */}
        {comparisonWithPrevious !== null && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {comparisonWithPrevious > 0 ? (
              <TrendingUp className="h-4 w-4 text-red-600 flex-shrink-0" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">
                {comparisonWithPrevious > 0 ? 'Aumento' : 'Redução'} de {Math.abs(comparisonWithPrevious).toFixed(1)}%
              </span>
              <span className="ml-1">em relação ao período anterior.</span>
            </div>
          </div>
        )}

        {/* Projection */}
        {!isExpired && !isUpcoming && daysElapsed > 3 && (
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Projeção para o final do período: {formatCurrency(projectedTotal)}
            {projectedTotal > budget.planned_amount && (
              <span className="text-red-600 ml-1">
                (excesso de {formatCurrency(projectedTotal - budget.planned_amount)})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento "{budget.name}"? 
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}