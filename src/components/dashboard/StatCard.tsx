import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  format?: 'currency' | 'number' | 'percentage';
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  isLoading?: boolean;
  className?: string;
  showComparison?: boolean;
  comparisonPeriod?: string;
  customTrendLabel?: string;
  onClick?: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600',
    trend: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600',
    trend: 'text-green-600',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600',
    trend: 'text-red-600',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600',
    trend: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600',
    trend: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-800/50',
    border: 'border-gray-200 dark:border-gray-700',
    icon: 'text-gray-600',
    trend: 'text-gray-600',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
};

export function StatCard({
  title,
  value,
  previousValue,
  icon,
  format = 'currency',
  color = 'blue',
  description,
  trend,
  trendValue,
  isLoading = false,
  className,
  showComparison = true,
  comparisonPeriod = 'mês anterior',
  customTrendLabel,
  onClick,
  isVisible = true,
  onToggleVisibility
}: StatCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const colors = colorVariants[color];

  // Animate value changes
  useEffect(() => {
    if (isLoading) return;
    
    setIsAnimating(true);
    const duration = 1000; // 1 second
    const steps = 60;
    const stepValue = (value - animatedValue) / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedValue(value);
        setIsAnimating(false);
        clearInterval(timer);
      } else {
        setAnimatedValue(prev => prev + stepValue);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  // Calculate trend
  const calculatedTrend = trend || (previousValue !== undefined ? 
    (value > previousValue ? 'up' : value < previousValue ? 'down' : 'neutral') : 
    'neutral'
  );

  const calculatedTrendValue = trendValue !== undefined ? trendValue : 
    (previousValue !== undefined && previousValue !== 0 ? 
      ((value - previousValue) / Math.abs(previousValue)) * 100 : 0
    );

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('pt-BR').format(val);
      default:
        return val.toString();
    }
  };

  const getTrendIcon = () => {
    switch (calculatedTrend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (calculatedTrend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  if (!isVisible) {
    return (
      <Card className={cn("opacity-50 border-dashed", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {title} (oculto)
            </div>
            {onToggleVisibility && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleVisibility}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "transition-all duration-200 hover:shadow-md",
          colors.bg,
          colors.border,
          onClick && "cursor-pointer hover:scale-105",
          isAnimating && "animate-pulse",
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <div className={cn("p-2 rounded-lg", colors.bg)}>
              <div className={colors.icon}>
                {icon}
              </div>
            </div>
            {onToggleVisibility && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility();
                }}
                className="h-8 w-8 p-0"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Main Value */}
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isLoading ? (
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : (
                <span className="tabular-nums">
                  {formatValue(animatedValue)}
                </span>
              )}
            </div>

            {/* Trend and Comparison */}
            {showComparison && !isLoading && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("flex items-center gap-1", getTrendColor())}>
                    {getTrendIcon()}
                    <span className="text-sm font-medium">
                      {Math.abs(calculatedTrendValue).toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {customTrendLabel || `vs ${comparisonPeriod}`}
                  </span>
                </div>

                {calculatedTrend !== 'neutral' && (
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", colors.badge)}
                  >
                    {calculatedTrend === 'up' ? 'Crescimento' : 'Redução'}
                  </Badge>
                )}
              </div>
            )}

            {/* Previous Value Comparison */}
            {previousValue !== undefined && !isLoading && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Anterior: {formatValue(previousValue)}
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}