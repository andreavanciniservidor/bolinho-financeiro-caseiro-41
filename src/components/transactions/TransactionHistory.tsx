
import { useState, useEffect } from 'react';
import { History, Clock, User, Edit3, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TransactionHistoryEntry {
  id: string;
  transaction_id: string;
  action: 'created' | 'updated' | 'deleted' | 'duplicated';
  changes: Record<string, { old: any; new: any }>;
  user_id: string;
  user_name?: string;
  created_at: string;
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    source?: 'web' | 'mobile' | 'api';
  };
}

interface TransactionHistoryProps {
  transactionId: string;
  transactionDescription: string;
  className?: string;
}

export function TransactionHistory({ 
  transactionId, 
  transactionDescription,
  className 
}: TransactionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<TransactionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, transactionId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // Since transaction_history table doesn't exist in the database schema,
      // we'll simulate some dummy data for now
      const dummyHistory: TransactionHistoryEntry[] = [
        {
          id: '1',
          transaction_id: transactionId,
          action: 'created',
          changes: {},
          user_id: 'current-user',
          user_name: 'Usuário Atual',
          created_at: new Date().toISOString(),
          metadata: {
            source: 'web'
          }
        }
      ];
      
      setHistory(dummyHistory);
    } catch (error) {
      console.error('Error loading transaction history:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Edit3 className="h-4 w-4 text-green-600" />;
      case 'updated':
        return <Edit3 className="h-4 w-4 text-blue-600" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'duplicated':
        return <Copy className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'created':
        return 'Criada';
      case 'updated':
        return 'Atualizada';
      case 'deleted':
        return 'Excluída';
      case 'duplicated':
        return 'Duplicada';
      default:
        return 'Ação desconhecida';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'updated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'duplicated':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    return String(value || '-');
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      description: 'Descrição',
      amount: 'Valor',
      date: 'Data',
      type: 'Tipo',
      category: 'Categoria',
      payment_method: 'Método de Pagamento',
      observations: 'Observações',
      tags: 'Tags',
      is_recurring: 'Recorrente',
      installments: 'Parcelas'
    };
    return labels[field] || field;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("flex items-center gap-2", className)}>
          <History className="h-4 w-4" />
          Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico da Transação
          </DialogTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {transactionDescription}
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Carregando histórico...
              </span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum histórico encontrado para esta transação.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div key={entry.id} className="relative">
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Action icon */}
                    <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center">
                      {getActionIcon(entry.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionColor(entry.action)}>
                          {getActionLabel(entry.action)}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          por {entry.user_name || 'Usuário'}
                        </span>
                        {entry.metadata?.source && (
                          <Badge variant="outline" className="text-xs">
                            {entry.metadata.source}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        <span className="ml-2 text-xs">
                          ({formatDistanceToNow(new Date(entry.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })})
                        </span>
                      </div>

                      {/* Changes */}
                      {Object.keys(entry.changes).length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Alterações:
                          </h4>
                          {Object.entries(entry.changes).map(([field, change]) => (
                            <div key={field} className="text-sm">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {getFieldLabel(field)}:
                              </span>
                              <div className="ml-4 flex items-center gap-2">
                                <span className="text-red-600 dark:text-red-400 line-through">
                                  {formatValue(change.old)}
                                </span>
                                <span className="text-gray-400">→</span>
                                <span className="text-green-600 dark:text-green-400">
                                  {formatValue(change.new)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
