import { useMemo } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Target, Calendar, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  period_start: string;
  period_end: string;
  alert_percentage: number;
  is_active: boolean;
}

interface BudgetProgressProps {
  budgets: Budget[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
  showAll?: boolean;
  onToggleShowAll?: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  onBudgetClick?: (budget: Budget) => void;
}

export function BudgetProgress({
  budgets,
  isLoading = false,
  className,
  maxItems = 5,
  showAll = false,
  onToggleShowAll,
  isVisible = true,
  onToggleVisibility,
  onBudgetClick
}: BudgetProgressProps) {
  const processedBudgets = useMemo(() => {
    const activeBudgets = budgets.filter(b => b.is_active);
    
    return activeBudgets.map(budget => {
      const spentAmount = Math.abs(budget.spent_amount);
      const plannedAmount = budget.planned_amount;
      const percentage = plannedAmount > 0 ? (spentAmount / plannedAmount) * 100 : 0;
      
      const today = new Date();
      const endDate = new Date(budget.period_end);
      const daysRemaining = Math.max(0, differenceInDays(endDate, today));
      
      const isOverBudget = spentAmount > plannedAmount;
      const isNearLimit = percentage >= budget.alert_percentage;
      const isExpired = daysRemaining === 0;
      
      let status: 'success' | 'warning' | 'danger' | 'expired' = 'success';
      if (isExpired) status = 'expired';
      else if (isOverBudget) status = 'danger';
      else if (isNearLimit) status = 'warning';
      
      return {
        ...budget,
        spentAmount,
        plannedAmount,
        percentage: Math.min(percentage, 100),
        daysRemaining,
        status,
        remainingAmount: plannedAmount - spentAmount
      };
    }).sort((a, b) => {
      // Sort by status priority: danger > warning > expired > success
      const statusPriority = { danger: 4, warning: 3, expired: 2, success: 1 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[b.status] - statusPriority[a.status];
      }
      // Then by percentage (highest first)
      return b.percentage - a.percentage;
    });
  }, [budgets]);

  const displayedBudgets = showAll ? processedBudgets : processedBudgets.slice(0, maxItems);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'danger':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'danger':
        return 'Excedido';
      case 'warning':
        return 'Atenção';
      case 'expired':
        return 'Expirado';
      default:
        return 'No prazo';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'danger':
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'expired':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (!isVisible) {
    return (
      <Card className={cn("opacity-50 border-dashed", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Progresso de Orçamentos (oculto)
            </div>
            {onToggleVisibility && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleVisibility}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Progresso de Orçamentos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {processedBudgets.length} {processedBudgets.length === 1 ? 'orçamento' : 'orçamentos'}
            </Badge>
            {onToggleVisibility && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleVisibility}
                className="h-8 w-8 p-0"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        ) : processedBudgets.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Nenhum orçamento ativo
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Crie orçamentos para acompanhar seus gastos
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedBudgets.map((budget) => (
              <div
                key={budget.id}
                className={cn(
                  "p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200",
                  onBudgetClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600"
                )}
                onClick={() => onBudgetClick?.(budget)}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {budget.name}
                        </h4>
                        <Badge 
                          className={cn(
                            "text-xs text-white",
                            getStatusColor(budget.status)
                          )}
                        >
                          {getStatusLabel(budget.status)}
                        </Badge>
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
                        <span>{budget.daysRemaining} {budget.daysRemaining === 1 ? 'dia restante' : 'dias restantes'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {getStatusIcon(budget.status)}
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {budget.percentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          utilizado
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress 
                      value={budget.percentage} 
                      className="h-2"
                      indicatorClassName={getStatusColor(budget.status)}
                    />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Gasto: {formatCurrency(budget.spentAmount)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Orçamento: {formatCurrency(budget.plannedAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Status Message */}
                  {budget.status !== 'success' && (
                    <div className={cn(
                      "flex items-center gap-2 p-2 rounded text-sm",
                      budget.status === 'danger' && "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200",
                      budget.status === 'warning' && "bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200",
                      budget.status === 'expired' && "bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200"
                    )}>
                      {budget.status === 'danger' && (
                        <>
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          <span>
                            Orçamento excedido em {formatCurrency(budget.spentAmount - budget.plannedAmount)}
                          </span>
                        </>
                      )}
                      {budget.status === 'warning' && (
                        <>
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          <span>
                            Atingiu {budget.percentage.toFixed(1)}% do orçamento
                          </span>
                        </>
                      )}
                      {budget.status === 'expired' && (
                        <>
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>
                            Período do orçamento expirado
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Remaining Amount */}
                  {budget.status === 'success' && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Restante: {formatCurrency(budget.remainingAmount)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Show More/Less Button */}
            {processedBudgets.length > maxItems && onToggleShowAll && (
              <Button
                variant="ghost"
                onClick={onToggleShowAll}
                className="w-full"
              >
                {showAll ? (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2 rotate-180" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-2 rotate-180" />
                    Mostrar todos ({processedBudgets.length - maxItems} mais)
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}