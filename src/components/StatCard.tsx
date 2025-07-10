
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
      "bg-white rounded-lg border border-gray-200 p-6",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline mt-2">
            <p className={cn(
              "text-2xl font-semibold",
              trend === 'up' && "text-green-600",
              trend === 'down' && "text-red-600",
              trend === 'neutral' && "text-gray-900"
            )}>
              {value}
            </p>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg",
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
