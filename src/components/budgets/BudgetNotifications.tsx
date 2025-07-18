import { useEffect, useState } from 'react';
import { Bell, X, AlertTriangle, TrendingUp, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BudgetNotification {
  id: string;
  budget_id: string;
  budget_name: string;
  type: 'limit_reached' | 'over_budget' | 'period_ending' | 'spending_rate_high';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  data: {
    current_amount?: number;
    planned_amount?: number;
    percentage?: number;
    days_remaining?: number;
    daily_rate?: number;
    recommended_rate?: number;
  };
  created_at: string;
  read: boolean;
}

interface BudgetNotificationsProps {
  budgets: any[];
  onMarkAsRead: (notificationId: string) => void;
  onDismissAll: () => void;
  className?: string;
}

export function BudgetNotifications({ 
  budgets, 
  onMarkAsRead, 
  onDismissAll,
  className 
}: BudgetNotificationsProps) {
  const [notifications, setNotifications] = useState<BudgetNotification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Generate notifications based on budget status
  useEffect(() => {
    const newNotifications: BudgetNotification[] = [];

    budgets.forEach(budget => {
      if (!budget.is_active) return;

      const spentAmount = Math.abs(budget.spent_amount);
      const plannedAmount = budget.planned_amount;
      const percentage = plannedAmount > 0 ? (spentAmount / plannedAmount) * 100 : 0;
      
      const today = new Date();
      const endDate = new Date(budget.period_end);
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

      // Over budget notification
      if (spentAmount > plannedAmount) {
        newNotifications.push({
          id: `over_budget_${budget.id}`,
          budget_id: budget.id,
          budget_name: budget.name,
          type: 'over_budget',
          severity: 'error',
          title: 'Orçamento Excedido',
          message: `O orçamento "${budget.name}" foi excedido em R$ ${(spentAmount - plannedAmount).toFixed(2).replace('.', ',')}`,
          data: {
            current_amount: spentAmount,
            planned_amount: plannedAmount,
            percentage: percentage
          },
          created_at: new Date().toISOString(),
          read: false
        });
      }
      // Limit reached notification
      else if (percentage >= budget.alert_percentage) {
        newNotifications.push({
          id: `limit_reached_${budget.id}`,
          budget_id: budget.id,
          budget_name: budget.name,
          type: 'limit_reached',
          severity: 'warning',
          title: 'Limite de Alerta Atingido',
          message: `O orçamento "${budget.name}" atingiu ${percentage.toFixed(1)}% do valor planejado`,
          data: {
            current_amount: spentAmount,
            planned_amount: plannedAmount,
            percentage: percentage
          },
          created_at: new Date().toISOString(),
          read: false
        });
      }

      // Period ending notification
      if (daysRemaining <= 3 && daysRemaining > 0) {
        newNotifications.push({
          id: `period_ending_${budget.id}`,
          budget_id: budget.id,
          budget_name: budget.name,
          type: 'period_ending',
          severity: 'info',
          title: 'Período Terminando',
          message: `O orçamento "${budget.name}" termina em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`,
          data: {
            days_remaining: daysRemaining,
            current_amount: spentAmount,
            planned_amount: plannedAmount
          },
          created_at: new Date().toISOString(),
          read: false
        });
      }

      // High spending rate notification
      const startDate = new Date(budget.period_start);
      const daysElapsed = Math.max(1, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const dailyRate = spentAmount / daysElapsed;
      const recommendedRate = plannedAmount / totalDays;

      if (daysElapsed > 3 && dailyRate > recommendedRate * 1.5) {
        newNotifications.push({
          id: `spending_rate_${budget.id}`,
          budget_id: budget.id,
          budget_name: budget.name,
          type: 'spending_rate_high',
          severity: 'warning',
          title: 'Ritmo de Gastos Elevado',
          message: `Você está gastando R$ ${dailyRate.toFixed(2).replace('.', ',')}/dia no orçamento "${budget.name}"`,
          data: {
            daily_rate: dailyRate,
            recommended_rate: recommendedRate,
            current_amount: spentAmount,
            planned_amount: plannedAmount
          },
          created_at: new Date().toISOString(),
          read: false
        });
      }
    });

    setNotifications(newNotifications);
    setIsVisible(newNotifications.length > 0);
  }, [budgets]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'over_budget':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'limit_reached':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'period_ending':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'spending_rate_high':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'warning':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50';
    }
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    onMarkAsRead(notificationId);
  };

  const handleDismissAll = () => {
    setNotifications([]);
    setIsVisible(false);
    onDismissAll();
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Alertas de Orçamento
          </h3>
          <Badge variant="secondary">
            {notifications.length}
          </Badge>
        </div>
        
        {notifications.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismissAll}
            className="text-gray-600 hover:text-gray-800"
          >
            Dispensar todos
          </Button>
        )}
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "border rounded-lg p-4 transition-all duration-200",
              getSeverityColor(notification.severity)
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getNotificationIcon(notification.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        notification.severity === 'error' && "border-red-300 text-red-700",
                        notification.severity === 'warning' && "border-orange-300 text-orange-700",
                        notification.severity === 'info' && "border-blue-300 text-blue-700"
                      )}
                    >
                      {notification.severity === 'error' && 'Crítico'}
                      {notification.severity === 'warning' && 'Atenção'}
                      {notification.severity === 'info' && 'Informação'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {notification.message}
                  </p>

                  {/* Additional data */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
                    {notification.data.current_amount && notification.data.planned_amount && (
                      <span>
                        Gasto: R$ {notification.data.current_amount.toFixed(2).replace('.', ',')} / 
                        R$ {notification.data.planned_amount.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                    {notification.data.percentage && (
                      <span>
                        {notification.data.percentage.toFixed(1)}% do orçamento
                      </span>
                    )}
                    {notification.data.days_remaining !== undefined && (
                      <span>
                        {notification.data.days_remaining} {notification.data.days_remaining === 1 ? 'dia restante' : 'dias restantes'}
                      </span>
                    )}
                    {notification.data.daily_rate && notification.data.recommended_rate && (
                      <span>
                        Taxa atual: R$ {notification.data.daily_rate.toFixed(2).replace('.', ',')}/dia 
                        (recomendado: R$ {notification.data.recommended_rate.toFixed(2).replace('.', ',')}/dia)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(notification.id)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}