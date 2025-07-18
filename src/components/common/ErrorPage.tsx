import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorPageProps {
  title?: string;
  message?: string;
  error?: Error;
  showHome?: boolean;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

/**
 * A full-page error component to display when a critical error occurs
 */
export function ErrorPage({
  title = 'Algo deu errado',
  message = 'Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.',
  error,
  showHome = true,
  showRefresh = true,
  onRefresh
}: ErrorPageProps) {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        
        {error && (
          <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-md overflow-auto text-left">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Detalhes do erro:</p>
            <code className="text-xs text-red-600 dark:text-red-400 break-all">
              {error.message || 'Erro desconhecido'}
            </code>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showRefresh && (
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          )}
          
          {showHome && (
            <Button variant="outline" asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Voltar para o início
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}