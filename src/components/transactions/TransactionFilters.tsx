import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, X, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface TransactionFiltersData {
  search: string;
  type: 'all' | 'income' | 'expense';
  categoryId: string;
  paymentMethod: string;
  startDate?: Date;
  endDate?: Date;
  tags: string[];
  amountMin?: number;
  amountMax?: number;
}

interface TransactionFiltersProps {
  filters: TransactionFiltersData;
  onFiltersChange: (filters: TransactionFiltersData) => void;
  categories: Array<{ id: string; name: string; type: 'income' | 'expense'; color: string }>;
  availableTags: string[];
  onExport: (format: 'csv' | 'pdf') => void;
  isExporting?: boolean;
  className?: string;
}

const PAYMENT_METHODS = [
  'Dinheiro',
  'Cartão de Crédito', 
  'Cartão de Débito',
  'PIX',
  'Transferência',
  'Boleto'
];

export function TransactionFilters({
  filters,
  onFiltersChange,
  categories,
  availableTags,
  onExport,
  isExporting = false,
  className
}: TransactionFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDebounce !== filters.search) {
        onFiltersChange({ ...filters, search: searchDebounce });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchDebounce, filters, onFiltersChange]);

  const updateFilter = (key: keyof TransactionFiltersData, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      categoryId: '',
      paymentMethod: '',
      startDate: undefined,
      endDate: undefined,
      tags: [],
      amountMin: undefined,
      amountMax: undefined,
    });
    setSearchDebounce('');
  };

  const removeTag = (tagToRemove: string) => {
    updateFilter('tags', filters.tags.filter(tag => tag !== tagToRemove));
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== 'all') count++;
    if (filters.categoryId) count++;
    if (filters.paymentMethod) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.tags.length > 0) count++;
    if (filters.amountMin !== undefined) count++;
    if (filters.amountMax !== undefined) count++;
    return count;
  };

  const filteredCategories = categories.filter(cat => 
    filters.type === 'all' || cat.type === filters.type
  );

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", className)}>
      {/* Main Filter Bar */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por descrição, categoria ou observações..."
              value={searchDebounce}
              onChange={(e) => setSearchDebounce(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <Select value={filters.type} onValueChange={(value: any) => updateFilter('type', value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Exportar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48" align="end">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => onExport('csv')}
                    disabled={isExporting}
                  >
                    Exportar CSV
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => onExport('pdf')}
                    disabled={isExporting}
                  >
                    Exportar PDF
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Busca: "{filters.search}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => {
                    updateFilter('search', '');
                    setSearchDebounce('');
                  }}
                />
              </Badge>
            )}
            {filters.type !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.type === 'income' ? 'Receitas' : 'Despesas'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('type', 'all')}
                />
              </Badge>
            )}
            {filters.categoryId && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {categories.find(c => c.id === filters.categoryId)?.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('categoryId', '')}
                />
              </Badge>
            )}
            {filters.paymentMethod && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.paymentMethod}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('paymentMethod', '')}
                />
              </Badge>
            )}
            {filters.startDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Desde: {format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR })}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('startDate', undefined)}
                />
              </Badge>
            )}
            {filters.endDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Até: {format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR })}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('endDate', undefined)}
                />
              </Badge>
            )}
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                #{tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
            >
              Limpar todos
            </Button>
          </div>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <>
          <Separator />
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <Select value={filters.categoryId} onValueChange={(value) => updateFilter('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {filteredCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Método de Pagamento
                </label>
                <Select value={filters.paymentMethod} onValueChange={(value) => updateFilter('paymentMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os métodos</SelectItem>
                    {PAYMENT_METHODS.map(method => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Inicial
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.startDate}
                      onSelect={(date) => updateFilter('startDate', date)}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data Final
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.endDate}
                      onSelect={(date) => updateFilter('endDate', date)}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Amount Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor Mínimo (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={filters.amountMin || ''}
                  onChange={(e) => updateFilter('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor Máximo (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="999.999,99"
                  value={filters.amountMax || ''}
                  onChange={(e) => updateFilter('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                {availableTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <Button
                        key={tag}
                        variant={filters.tags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (filters.tags.includes(tag)) {
                            removeTag(tag);
                          } else {
                            addTag(tag);
                          }
                        }}
                        className="h-7 text-xs"
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                )}
                {availableTags.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Nenhuma tag disponível. Adicione tags às suas transações para filtrar por elas.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}