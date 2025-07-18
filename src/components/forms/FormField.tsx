import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  description?: string;
}

export function FormField({ 
  label, 
  error, 
  required, 
  children, 
  className,
  description 
}: FormFieldProps) {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${fieldId}-error` : undefined;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="obrigatório">*</span>}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}