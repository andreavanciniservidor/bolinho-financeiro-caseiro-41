import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { forwardRef } from 'react';

interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ value, onChange, placeholder = "Selecione uma data", className, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          type="date"
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg",
            "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed",
            "transition-colors duration-200",
            className
          )}
          {...props}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';