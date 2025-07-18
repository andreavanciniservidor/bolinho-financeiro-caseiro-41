import { useState } from 'react';
import { MoreHorizontal, Download, Maximize2, RefreshCw, Filter, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string;
  className?: string;
  
  // Chart controls
  showControls?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  onFullscreen?: () => void;
  
  // Filter options
  showFilters?: boolean;
  filterOptions?: Array<{ value: string; label: string }>;
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  
  // Period selection
  showPeriodSelector?: boolean;
  periodOptions?: Array<{ value: string; label: string }>;
  selectedPeriod?: string;
  onPeriodChange?: (value: string) => void;
  
  // Visibility
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  
  // Status indicators
  status?: 'success' | 'warning' | 'error' | 'info';
  statusMessage?: string;
  
  // Data info
  dataCount?: number;
  lastUpdated?: Date;
}

const statusColors = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
};

const defaultPeriodOptions = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 3 meses' },
  { value: '1y', label: 'Último ano' },
  { value: 'all', label: 'Todo período' }
];

export function ChartCard({
  title,
  subtitle,
  children,
  isLoading = false,
  error,
  className,
  showControls = true,
  onRefresh,
  onExport,
  onFullscreen,
  showFilters = false,
  filterOptions = [],
  selectedFilter,
  onFilterChange,
  showPeriodSelector = false,
  periodOptions = defaultPeriodOptions,
  selectedPeriod = '30d',
  onPeriodChange,
  isVisible = true,
  onToggleVisibility,
  status,
  statusMessage,
  dataCount,
  lastUpdated
}: ChartCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
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
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            {status && (
              <Badge className={statusColors[status]}>
                {statusMessage || status}
              </Badge>
            )}

            {/* Visibility Toggle */}
            {onToggleVisibility && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleVisibility}
                className="h-8 w-8 p-0"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            )}

            {/* Controls Menu */}
            {showControls && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onRefresh && (
                    <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
                      <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                      Atualizar
                    </DropdownMenuItem>
                  )}
                  
                  {onFullscreen && (
                    <DropdownMenuItem onClick={onFullscreen}>
                      <Maximize2 className="h-4 w-4 mr-2" />
                      Tela cheia
                    </DropdownMenuItem>
                  )}
                  
                  {onExport && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onExport('png')}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PNG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('svg')}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar SVG
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('pdf')}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        {(showFilters || showPeriodSelector) && (
          <div className="flex items-center gap-3 mt-4">
            {showFilters && filterOptions.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={selectedFilter} onValueChange={onFilterChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filtrar por..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {showPeriodSelector && (
              <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* Data Info */}
        {(dataCount !== undefined || lastUpdated) && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            {dataCount !== undefined && (
              <span>{dataCount} {dataCount === 1 ? 'registro' : 'registros'}</span>
            )}
            {lastUpdated && (
              <span>Atualizado {formatLastUpdated(lastUpdated)}</span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {error ? (
          <div className="flex items-center justify-center h-64 text-center">
            <div className="space-y-2">
              <div className="text-red-600 dark:text-red-400">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Erro ao carregar dados
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {error}
              </p>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="mt-2"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                  Tentar novamente
                </Button>
              )}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="space-y-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Carregando dados...
              </p>
            </div>
          </div>
        ) : (
          <div className="min-h-64">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}