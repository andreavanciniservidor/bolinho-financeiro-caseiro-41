
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { CategoryForm } from '@/components/CategoryForm';
import { useSupabaseCategories, Category } from '@/hooks/useSupabaseCategories';
import { cn } from '@/lib/utils';

export function Categories() {
  const { categories, isLoading, addCategory, refetch } = useSupabaseCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const handleAddCategory = async (newCategory: Omit<Category, 'id'>) => {
    const result = await addCategory(newCategory);
    if (result.error) {
      console.error('Erro ao adicionar categoria:', result.error);
    } else {
      console.log('Categoria adicionada com sucesso');
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || category.type === filterType;
    return matchesSearch && matchesType;
  });

  const incomeCategories = filteredCategories.filter(cat => cat.type === 'income');
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'expense');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600">Gerencie suas categorias de receitas e despesas</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              size="sm"
            >
              Todas
            </Button>
            <Button
              variant={filterType === 'income' ? 'default' : 'outline'}
              onClick={() => setFilterType('income')}
              size="sm"
            >
              Receitas
            </Button>
            <Button
              variant={filterType === 'expense' ? 'default' : 'outline'}
              onClick={() => setFilterType('expense')}
              size="sm"
            >
              Despesas
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Categorias de Receita</h3>
              <span className="text-sm text-gray-500">({incomeCategories.length})</span>
            </div>
          </div>
          
          <div className="p-6">
            {incomeCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma categoria de receita encontrada.</p>
            ) : (
              <div className="space-y-3">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory({
                            ...category,
                            type: category.type as 'income' | 'expense'
                          });
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">Categorias de Despesa</h3>
              <span className="text-sm text-gray-500">({expenseCategories.length})</span>
            </div>
          </div>
          
          <div className="p-6">
            {expenseCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma categoria de despesa encontrada.</p>
            ) : (
              <div className="space-y-3">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory({
                            ...category,
                            type: category.type as 'income' | 'expense'
                          });
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Form */}
      <CategoryForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCategory(undefined);
        }}
        onSubmit={handleAddCategory}
        category={editingCategory}
      />
    </div>
  );
}
