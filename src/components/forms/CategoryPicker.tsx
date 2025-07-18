import { cn } from '@/lib/utils';
import { Check, ChevronDown } from 'lucide-react';
import { useState, forwardRef } from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface CategoryPickerProps {
  categories: Category[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export const CategoryPicker = forwardRef<HTMLButtonElement, CategoryPickerProps>(
  ({ categories, value, onChange, placeholder = "Selecione uma categoria", className, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedCategory = categories.find(cat => cat.id === value);

    return (
      <div className="relative">
        <button
          ref={ref}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg",
            "bg-white dark:bg-gray-800 text-left",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed",
            "transition-colors duration-200",
            className
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          {...props}
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="text-gray-900 dark:text-gray-100 truncate">
                {selectedCategory.name}
              </span>
            </div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          )}
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
            <ul role="listbox" className="py-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange?.(category.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700",
                      "focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none",
                      "flex items-center gap-2"
                    )}
                    role="option"
                    aria-selected={value === category.id}
                  >
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-gray-900 dark:text-gray-100 truncate">
                      {category.name}
                    </span>
                    {value === category.id && (
                      <Check className="h-4 w-4 text-blue-600 ml-auto" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);

CategoryPicker.displayName = 'CategoryPicker';