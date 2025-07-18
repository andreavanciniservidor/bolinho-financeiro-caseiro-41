
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/layout/Header';
import { Layout, MainContent } from '@/components/layout/Layout';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { OrganizationProvider } from '@/hooks/useOrganization';
import { setupFocusIndicators } from '@/utils/focusManagement';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ErrorPage } from '@/components/common/ErrorPage';
import { LoadingFallback } from '@/components/common/LoadingFallback';
import { AuthDebug } from '@/components/common/AuthDebug';
import { logError } from '@/utils/errorUtils';
import { initMonitoring, setUser, clearUser } from '@/services/monitoringService';
import { initAnalytics } from '@/services/analyticsService';
import { initWebVitals } from '@/utils/webVitals';

// Import pages with named exports
import { Auth } from '@/pages/Auth';
import { Dashboard } from '@/pages/Dashboard';
import { Transactions } from '@/pages/Transactions';
import { Budgets } from '@/pages/Budgets';
import { Reports } from '@/pages/Reports';
import { Categories } from '@/pages/Categories';
import NotFound from '@/pages/NotFound';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Não tentar novamente para erros 404 ou 401
        if (
          error instanceof Error && 
          'status' in error && 
          (error.status === 404 || error.status === 401)
        ) {
          return false;
        }
        // Tentar novamente no máximo 2 vezes para outros erros
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (replaced cacheTime)
      refetchOnWindowFocus: false, // Não refetch automaticamente ao focar a janela
      refetchOnMount: true, // Refetch ao montar o componente
      refetchOnReconnect: true, // Refetch ao reconectar
    },
  },
});

function AppContent() {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Set user information for monitoring when user changes
  useEffect(() => {
    if (user) {
      setUser({
        id: user.id,
        email: user.email
      });
    } else {
      clearUser();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingFallback message="Carregando a aplicação..." size="lg" fullScreen={false} />
        {/* Componente de depuração para ajudar a identificar problemas de autenticação */}
        {import.meta.env.DEV && (
          <div className="mt-8">
            <p className="text-center mb-4 text-gray-600">
              Se o carregamento demorar muito, use as opções abaixo para diagnosticar:
            </p>
            <AuthDebug />
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout>
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)}
          showMenuButton={true}
        />
        
        <MainContent>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Transactions />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/budgets" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Budgets />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Reports />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Categories />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainContent>
      </div>
    </Layout>
  );
}

function App() {
  // Configurar indicadores de foco para navegação por teclado
  useEffect(() => {
    const cleanup = setupFocusIndicators();
    
    // Initialize monitoring service
    initMonitoring({
      environment: import.meta.env.MODE,
      release: '1.0.0',
      debug: import.meta.env.DEV,
      tracesSampleRate: 0.2
    });
    
    // Initialize analytics service
    initAnalytics({
      measurementId: 'G-XXXXXXXXXX', // Replace with actual measurement ID in production
      debug: import.meta.env.DEV
    });
    
    // Initialize Web Vitals tracking
    initWebVitals();
    
    return () => cleanup();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="financas-theme">
        <Router>
          <AuthProvider>
            <OrganizationProvider>
              <ErrorBoundary
                onError={(error, errorInfo) => logError(error, { errorInfo })}
                fallback={({ error, resetError }) => (
                  <ErrorPage 
                    error={error} 
                    onRefresh={resetError}
                  />
                )}
              >
                <AppContent />
              </ErrorBoundary>
              <Toaster />
            </OrganizationProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
