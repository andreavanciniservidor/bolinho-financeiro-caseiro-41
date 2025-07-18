import { useState, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Edit, Trash2, Copy, Tag, Calendar, CreditCard, MoreHorizontal, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { InlineTransactionEdit } from './InlineTransactionEdit';
import { TransactionHistory } from './TransactionHistory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: {
    id: string;
    name: string;
    color: string;
    type: 'income' | 'expense';
  };
  payment_method: string;
  installments?: number;
  installment_number?: number;
  is_recurring?: boolean;
  observations?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Transaction>) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

interface TransactionItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Transaction>) => Promise<void>;
    editingId: string | null;
    onStartInlineEdit: (id: string) => void;
    onCancelInlineEdit: () => void;
  };
}

function TransactionItem({ index, style, data }: TransactionItemProps) {
  const { transactions, onEdit, onDelete, onDuplicate, onUpdate, editingId, onStartInlineEdit, onCancelInlineEdit } = data;
  const transaction = transactions[index];
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isEditing = editingId === transaction.id;

  const handleDelete = useCallback(() => {
    onDelete(transaction.id);
    setShowDeleteDialog(false);
    toast({
      title: "Transação excluída",
      description: "A transação foi excluída com sucesso.",
    });
  }, [transaction.id, onDelete]);

  const handleDuplicate = useCallback(() => {
    onDuplicate(transaction.id);
    toast({
      title: "Transação duplicada",
      description: "Uma nova transação foi criada baseada na selecionada.",
    });
  }, [transaction.id, onDuplicate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount));
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cartão de crédito':
      case 'cartão de débito':
        return <CreditCard className="h-3 w-3" />;
      case 'pix':
        return <span className="text-xs font-bold">PIX</span>;
      default:
        return null;
    }
  };

  if (isEditing) {
    return (
      <div style={style} className="px-6">
        <div className="py-4 border-b border-gray-100 dark:border-gray-700">
          <InlineTransactionEdit
            transaction={transaction}
            onSave={onUpdate}
            onCancel={onCancelInlineEdit}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={style} className="px-6">
      <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Type Indicator */}
          <div className={cn(
            "w-3 h-3 rounded-full flex-shrink-0",
            transaction.type === 'income' ? "bg-green-500" : "bg-red-500"
          )} />

          {/* Transaction Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {transaction.description}
              </p>
              {transaction.installments && transaction.installments > 1 && (
                <Badge variant="outline" className="text-xs">
                  {transaction.installment_number}/{transaction.installments}
                </Badge>
              )}
              {transaction.is_recurring && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Recorrente
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                {transaction.category && (
                  <>
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: transaction.category.color }}
                    />
                    {transaction.category.name}
                  </>
                )}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {getPaymentMethodIcon(transaction.payment_method)}
                {transaction.payment_method}
              </span>
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
            
            {transaction.observations && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                {transaction.observations}
              </p>
            )}
          </div>
        </div>

        {/* Amount and Date */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className={cn(
              "font-semibold",
              transaction.type === 'income' ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(transaction.amount)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onStartInlineEdit(transaction.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Inline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(transaction)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Modal
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <div>
                  <TransactionHistory 
                    transactionId={transaction.id}
                    transactionDescription={transaction.description}
                    className="w-full justify-start p-0 h-auto font-normal"
                  />
                </div>
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
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transação "{transaction.description}"? 
              Esta ação não pode ser desfeita.
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

export function TransactionList({ 
  transactions, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onUpdate,
  isLoading = false,
  className 
}: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleStartInlineEdit = useCallback((id: string) => {
    setEditingId(id);
  }, []);

  const handleCancelInlineEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleUpdate = useCallback(async (id: string, updates: Partial<Transaction>) => {
    await onUpdate(id, updates);
    setEditingId(null);
  }, [onUpdate]);

  const itemData = useMemo(() => ({
    transactions,
    onEdit,
    onDelete,
    onDuplicate,
    onUpdate: handleUpdate,
    editingId,
    onStartInlineEdit: handleStartInlineEdit,
    onCancelInlineEdit: handleCancelInlineEdit,
  }), [transactions, onEdit, onDelete, onDuplicate, handleUpdate, editingId, handleStartInlineEdit, handleCancelInlineEdit]);

  if (isLoading) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", className)}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lista de Transações</h3>
        </div>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Carregando transações...</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", className)}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lista de Transações</h3>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhuma transação encontrada</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Tente ajustar os filtros ou adicione uma nova transação
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", className)}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Lista de Transações
          </h3>
          <Badge variant="secondary">
            {transactions.length} {transactions.length === 1 ? 'transação' : 'transações'}
          </Badge>
        </div>
      </div>
      
      <div className="h-96">
        <List
          height={384} // 96 * 4 = 384px (h-96)
          itemCount={transactions.length}
          itemSize={80}
          itemData={itemData}
          className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        >
          {TransactionItem}
        </List>
      </div>
    </div>
  );
}