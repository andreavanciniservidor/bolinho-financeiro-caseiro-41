
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend = 'neutral',
  trendValue,
  icon,
  className,
  loading = false
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full shadow-sm",
        className
      )}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate">
            {title}
          </p>
          
          <div className="flex items-baseline gap-2 mb-2">
            <motion.p 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={cn(
                "text-2xl sm:text-3xl font-bold truncate transition-colors duration-200",
                trend === 'up' && "text-green-600 dark:text-green-400",
                trend === 'down' && "text-red-600 dark:text-red-400",
                trend === 'neutral' && "text-gray-900 dark:text-gray-100"
              )}
            >
              {value}
            </motion.p>
            
            {trendValue && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  trend === 'up' && "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
                  trend === 'down' && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
                  trend === 'neutral' && "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                )}
              >
                {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {trendValue}
              </motion.div>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        {icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 transition-all duration-200 group-hover:scale-110",
              trend === 'up' && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
              trend === 'down' && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
              trend === 'neutral' && "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
