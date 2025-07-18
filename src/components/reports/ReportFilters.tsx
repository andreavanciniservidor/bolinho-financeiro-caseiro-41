
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Filter } from 'lucide-react';

export interface ReportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  categories: string[];
  transactionTypes: ('income' | 'expense')[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
  tags: string[];
  paymentMethods: string[];
}

interface ReportFiltersProps {
  categories: Array<{ id: string; name: string; type: 'income' | 'expense' }>;
  onFilterChange: (filters: ReportFilters) => void;
}

export function ReportFilters({ categories, onFilterChange }: ReportFiltersProps) {
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: {
      start: new Date(2025, 0, 1),
      end: new Date()
    },
    categories: [],
    transactionTypes: ['income', 'expense'],
    amountRange: { min: null, max: null },
    tags: [],
    paymentMethods: []
  });

  const handleFilterChange = (newFilters: Partial<ReportFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros de Relatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Transação</label>
            <Select
              value={filters.transactionTypes.join(',')}
              onValueChange={(value) => {
                const types = value.split(',') as ('income' | 'expense')[];
                handleFilterChange({ transactionTypes: types });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income,expense">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
            <Select
              value={filters.categories[0] || ''}
              onValueChange={(value) => {
                handleFilterChange({ categories: value ? [value] : [] });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <Select defaultValue="current-month">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Mês Atual</SelectItem>
                <SelectItem value="last-month">Mês Passado</SelectItem>
                <SelectItem value="current-year">Ano Atual</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
