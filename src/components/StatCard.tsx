
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend = 'neutral', 
  icon,
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-4 sm:p-6 w-full",
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <div className="flex items-baseline mb-1">
            <p className={cn(
              "text-xl sm:text-2xl font-semibold truncate",
              trend === 'up' && "text-green-600",
              trend === 'down' && "text-red-600",
              trend === 'neutral' && "text-gray-900"
            )}>
              {value}
            </p>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex-shrink-0",
            trend === 'up' && "bg-green-100 text-green-600",
            trend === 'down' && "bg-red-100 text-red-600",
            trend === 'neutral' && "bg-gray-100 text-gray-600"
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
