
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Auth } from '@/pages/Auth';
import { Dashboard } from '@/pages/Dashboard';
import { Transactions } from '@/pages/Transactions';
import { Budgets } from '@/pages/Budgets';
import { Reports } from '@/pages/Reports';
import { Sidebar } from '@/components/Sidebar';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={
        <ProtectedRoute>
          <div className="flex min-h-screen w-full bg-gray-100">
            <Sidebar />
            <main className="flex-1 w-full min-w-0 overflow-auto">
              <div className="h-full w-full">
                <Dashboard />
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <div className="flex min-h-screen w-full bg-gray-100">
            <Sidebar />
            <main className="flex-1 w-full min-w-0 overflow-auto">
              <div className="h-full w-full">
                <Transactions />
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/budgets" element={
        <ProtectedRoute>
          <div className="flex min-h-screen w-full bg-gray-100">
            <Sidebar />
            <main className="flex-1 w-full min-w-0 overflow-auto">
              <div className="h-full w-full">
                <Budgets />
              </div>
            </main>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <div className="flex min-h-screen w-full bg-gray-100">
            <Sidebar />
            <main className="flex-1 w-full min-w-0 overflow-auto">
              <div className="h-full w-full">
                <Reports />
              </div>
            </main>
          </div>
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
