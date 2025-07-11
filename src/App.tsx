
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { OrganizationProvider } from '@/hooks/useOrganization';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Auth } from '@/pages/Auth';
import { Dashboard } from '@/pages/Dashboard';
import { Transactions } from '@/pages/Transactions';
import { Budgets } from '@/pages/Budgets';
import { Reports } from '@/pages/Reports';
import { Sidebar } from '@/components/Sidebar';
import { OrganizationSwitcher } from '@/components/OrganizationSwitcher';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <OrganizationProvider>
            <div className="flex min-h-screen w-full bg-gray-100">
              <Sidebar />
              <main className="flex-1 w-full min-w-0 overflow-auto">
                <div className="h-full w-full">
                  <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
                      <OrganizationSwitcher />
                    </div>
                  </div>
                  <div className="p-6">
                    <Dashboard />
                  </div>
                </div>
              </main>
            </div>
          </OrganizationProvider>
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <OrganizationProvider>
            <div className="flex min-h-screen w-full bg-gray-100">
              <Sidebar />
              <main className="flex-1 w-full min-w-0 overflow-auto">
                <div className="h-full w-full">
                  <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h1 className="text-lg font-semibold text-gray-900">Transações</h1>
                      <OrganizationSwitcher />
                    </div>
                  </div>
                  <div className="p-6">
                    <Transactions />
                  </div>
                </div>
              </main>
            </div>
          </OrganizationProvider>
        </ProtectedRoute>
      } />
      <Route path="/budgets" element={
        <ProtectedRoute>
          <OrganizationProvider>
            <div className="flex min-h-screen w-full bg-gray-100">
              <Sidebar />
              <main className="flex-1 w-full min-w-0 overflow-auto">
                <div className="h-full w-full">
                  <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h1 className="text-lg font-semibold text-gray-900">Orçamentos</h1>
                      <OrganizationSwitcher />
                    </div>
                  </div>
                  <div className="p-6">
                    <Budgets />
                  </div>
                </div>
              </main>
            </div>
          </OrganizationProvider>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <OrganizationProvider>
            <div className="flex min-h-screen w-full bg-gray-100">
              <Sidebar />
              <main className="flex-1 w-full min-w-0 overflow-auto">
                <div className="h-full w-full">
                  <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h1 className="text-lg font-semibold text-gray-900">Relatórios</h1>
                      <OrganizationSwitcher />
                    </div>
                  </div>
                  <div className="p-6">
                    <Reports />
                  </div>
                </div>
              </main>
            </div>
          </OrganizationProvider>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
