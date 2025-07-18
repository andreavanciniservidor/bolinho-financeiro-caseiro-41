import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock do Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com'
          }
        }
      })
    }
  }
}));

// Mock do hook de autenticação
vi.mock('@/hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn()
  })
}));

describe('Transaction Flow Integration', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock de resposta para select
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        order: () => ({
          data: [
            {
              id: 'transaction-1',
              description: 'Grocery shopping',
              amount: 150.75,
              date: '2025-07-15',
              type: 'expense',
              category_id: 'category-1',
              category: {
                id: 'category-1',
                name: 'Food',
                color: '#ff0000'
              }
            }
          ],
          error: null
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => ({
            data: {
              id: 'new-transaction',
              description: 'New transaction',
              amount: 200,
              date: '2025-07-17',
              type: 'expense'
            },
            error: null
          })
        })
      })
    }));
  });
  
  it('should create a new transaction and update the list', async () => {
    // Renderizar o formulário e a lista
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div>
            <TransactionForm onSuccess={() => {}} />
            <TransactionList />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    );
    
    // Verificar se a lista inicial contém a transação mockada
    await waitFor(() => {
      expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    });
    
    // Preencher o formulário
    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'New transaction' }
    });
    
    fireEvent.change(screen.getByLabelText(/valor/i), {
      target: { value: '200' }
    });
    
    fireEvent.change(screen.getByLabelText(/data/i), {
      target: { value: '2025-07-17' }
    });
    
    // Selecionar tipo de transação
    fireEvent.click(screen.getByLabelText(/despesa/i));
    
    // Enviar o formulário
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
    
    // Verificar se a API foi chamada corretamente
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('transactions');
      expect(supabase.insert).toHaveBeenCalled();
    });
    
    // Verificar se a lista foi atualizada
    await waitFor(() => {
      expect(screen.getByText('New transaction')).toBeInTheDocument();
    });
  });
  
  it('should handle transaction deletion', async () => {
    // Mock para delete
    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        order: () => ({
          data: [
            {
              id: 'transaction-1',
              description: 'Grocery shopping',
              amount: 150.75,
              date: '2025-07-15',
              type: 'expense',
              category_id: 'category-1',
              category: {
                id: 'category-1',
                name: 'Food',
                color: '#ff0000'
              }
            }
          ],
          error: null
        })
      }),
      delete: () => ({
        eq: () => ({
          data: { id: 'transaction-1' },
          error: null
        })
      })
    }));
    
    // Renderizar a lista
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TransactionList />
        </AuthProvider>
      </QueryClientProvider>
    );
    
    // Verificar se a lista inicial contém a transação
    await waitFor(() => {
      expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    });
    
    // Clicar no botão de excluir
    fireEvent.click(screen.getByRole('button', { name: /excluir/i }));
    
    // Confirmar a exclusão
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }));
    
    // Verificar se a API foi chamada corretamente
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('transactions');
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', 'transaction-1');
    });
    
    // Verificar se a transação foi removida da lista
    await waitFor(() => {
      expect(screen.queryByText('Grocery shopping')).not.toBeInTheDocument();
    });
  });
});