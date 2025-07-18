
import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';

// Criar um cliente de consulta para testes
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

// Provedor de contexto para testes
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

const AllProviders = ({ 
  children, 
  queryClient = createTestQueryClient() 
}: AllProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="test-theme">
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Função de renderização personalizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient },
) => {
  const { queryClient, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: (props) => (
      <AllProviders {...props} queryClient={queryClient} />
    ),
    ...renderOptions,
  });
};

// Re-exportar tudo
export * from '@testing-library/react';
export { customRender as render, screen, fireEvent, waitFor };
