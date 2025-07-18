import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Search className="h-12 w-12 text-blue-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Página não encontrada
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          A página que você está procurando não existe ou foi movida para outro endereço.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Voltar para o início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}