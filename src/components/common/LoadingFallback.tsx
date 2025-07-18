import React from 'react';

interface LoadingFallbackProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

/**
 * A reusable loading fallback component
 */
export function LoadingFallback({
  message = 'Carregando...',
  size = 'md',
  fullScreen = false
}: LoadingFallbackProps) {
  const spinnerSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center' 
    : 'h-full flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4" role="status" aria-live="polite">
        <div 
          className={`animate-spin rounded-full border-b-2 border-primary ${spinnerSizes[size]}`}
          aria-hidden="true"
        ></div>
        <p className={`text-muted-foreground ${textSizes[size]}`}>{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    </div>
  );
}