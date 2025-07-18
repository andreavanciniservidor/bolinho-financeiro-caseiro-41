import { useMemo } from 'react';
import { ArrowUpRight, ArrowDownLeft, Calendar, Tag, MoreHorizontal, Eye, EyeOff, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: {
    id: string;
    name: string;
    color: string;
  };
  payment_method: string;
  tags?: string[];
  installments?: number;
  installment_number?: number;
  is_recurring?: boolean;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
  showAll?: boolean;
  onToggleShowAll?: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  onTransactionClick?: (transaction: Transaction) => void;
  onAddTransaction?: () => void;
  onViewAll?: () => void;
}

export function RecentTransactions({
  transactions,
  isLoading = false,
  className,
  maxItems = 5,
  showAll = false,
  onToggleShowAll,
  isVisible = true,
  onToggleVisibility,
  onTransactionClick,
  onAddTransaction,
  onViewAll
}: RecentTransactionsProps) {
  const processedTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, showAll ? undefined : maxItems);
  }, [transactions, maxItems, showAll]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Hoje';
    } else if (isYesterday(date)) {
      return 'Ontem';
    } else {
      return format(date, 'dd/MM', { locale: ptBR });
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  if (!isVisible) {
    return (
      <Card className={cn("opacity-50 border-dashed", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Transações Recentes (oculto)
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
            Transações Recentes
          </CardTitle>
          <div className="flex items-center gap-2">
            {onAddTransaction && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddTransaction}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            )}
            
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

            {onViewAll && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onViewAll}>
                    Ver todas as transações
                  </DropdownMenuItem>
                  {onToggleShowAll && (
                    <DropdownMenuItem onClick={onToggleShowAll}>
                      {showAll ? 'Mostrar menos' : 'Mostrar mais'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              </div>
            ))}
          </div>
        ) : processedTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Nenhuma transação recente
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Suas transações aparecerão aqui
            </p>
            {onAddTransaction && (
              <Button onClick={onAddTransaction} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeira transação
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {processedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center space-x-4 p-3 rounded-lg transition-all duration-200",
                  onTransactionClick && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
                onClick={() => onTransactionClick?.(transaction)}
              >
                {/* Transaction Type Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  transaction.type === 'income' 
                    ? "bg-green-100 dark:bg-green-900/30" 
                    : "bg-red-100 dark:bg-red-900/30"
                )}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5 text-red-600" />
                  )}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {transaction.description}
                    </p>
                    
                    {/* Badges */}
                    <div className="flex items-center gap-1">
                      {transaction.installments && transaction.installments > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {transaction.installment_number}/{transaction.installments}
                        </Badge>
                      )}
                      
                      {transaction.is_recurring && (
                        <Badge variant="outline" className="text-xs">
                          Recorrente
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {/* Category */}
                    {transaction.category && (
                      <>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: transaction.category.color }}
                        />
                        <span>{transaction.category.name}</span>
                        <span>•</span>
                      </>
                    )}
                    
                    {/* Payment Method */}
                    <span>{transaction.payment_method}</span>
                    
                    {/* Tags */}
                    {transaction.tags && transaction.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          <span className="truncate">
                            {transaction.tags.slice(0, 2).join(', ')}
                            {transaction.tags.length > 2 && ` +${transaction.tags.length - 2}`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Amount and Date */}
                <div className="text-right">
                  <div className={cn(
                    "font-semibold",
                    transaction.type === 'income' ? "text-green-600" : "text-red-600"
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </div>
            ))}

            {/* Show More Button */}
            {transactions.length > maxItems && onToggleShowAll && (
              <Button
                variant="ghost"
                onClick={onToggleShowAll}
                className="w-full mt-4"
              >
                {showAll ? (
                  <>Mostrar menos</>
                ) : (
                  <>Ver mais ({transactions.length - maxItems} transações)</>
                )}
              </Button>
            )}

            {/* View All Button */}
            {onViewAll && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={onViewAll}
                  className="w-full"
                >
                  Ver todas as transações
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}