import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface NumberInputProps {
  value?: number | string;
  onChange?: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  currency?: string;
  min?: number;
  max?: number;
  step?: number;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ 
    value, 
    onChange, 
    placeholder = "0,00", 
    className, 
    disabled, 
    currency = "R$",
    min,
    max,
    step = 0.01,
    ...props 
  }, ref) => {
    const formatCurrency = (val: string) => {
      // Remove tudo que não é número ou vírgula/ponto
      const numbers = val.replace(/[^\d.,]/g, '');
      
      // Converte vírgula para ponto para cálculos
      const normalized = numbers.replace(',', '.');
      
      // Converte para número
      const numValue = parseFloat(normalized);
      
      if (!isNaN(numValue)) {
        onChange?.(numValue);
      }
    };

    const displayValue = typeof value === 'number' 
      ? value.toFixed(2).replace('.', ',')
      : value || '';

    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
          {currency}
        </div>
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={(e) => formatCurrency(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-12 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed",
            "transition-colors duration-200",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';