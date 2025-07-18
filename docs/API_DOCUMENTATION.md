# Documentação de APIs e Componentes - Finanças+

Este documento descreve as principais APIs, componentes e hooks disponíveis na aplicação Finanças+.

## Serviços de API

### transactionService

Serviço para gerenciar transações financeiras.

```typescript
// Obter todas as transações do usuário com filtros
async function getTransactions(filters?: TransactionFilters): Promise<Transaction[]>

// Obter uma transação específica
async function getTransaction(id: string): Promise<Transaction>

// Criar uma nova transação
async function createTransaction(data: TransactionInput): Promise<Transaction>

// Atualizar uma transação existente
async function updateTransaction(id: string, data: Partial<TransactionInput>): Promise<Transaction>

// Excluir uma transação
async function deleteTransaction(id: string): Promise<void>

// Criar transações recorrentes
async function createRecurringTransactions(data: RecurringTransactionInput): Promise<Transaction[]>
```

### budgetService

Serviço para gerenciar orçamentos.

```typescript
// Obter todos os orçamentos do usuário
async function getBudgets(filters?: BudgetFilters): Promise<Budget[]>

// Obter um orçamento específico
async function getBudget(id: string): Promise<Budget>

// Criar um novo orçamento
async function createBudget(data: BudgetInput): Promise<Budget>

// Atualizar um orçamento existente
async function updateBudget(id: string, data: Partial<BudgetInput>): Promise<Budget>

// Excluir um orçamento
async function deleteBudget(id: string): Promise<void>

// Calcular progresso do orçamento
async function calculateBudgetProgress(id: string): Promise<BudgetProgress>
```

### categoryService

Serviço para gerenciar categorias.

```typescript
// Obter todas as categorias do usuário
async function getCategories(type?: 'income' | 'expense'): Promise<Category[]>

// Obter uma categoria específica
async function getCategory(id: string): Promise<Category>

// Criar uma nova categoria
async function createCategory(data: CategoryInput): Promise<Category>

// Atualizar uma categoria existente
async function updateCategory(id: string, data: Partial<CategoryInput>): Promise<Category>

// Excluir uma categoria
async function deleteCategory(id: string): Promise<void>
```

### reportService

Serviço para gerar e exportar relatórios.

```typescript
// Gerar dados para relatório
async function generateReportData(filters: ReportFilters): Promise<ReportData>

// Exportar relatório para PDF
async function exportToPDF(options: ExportOptions): Promise<void>

// Exportar relatório para Excel
async function exportToExcel(options: ExportOptions): Promise<void>

// Agendar envio de relatório
async function scheduleReport(email: string, frequency: string, options: ExportOptions): Promise<void>

// Gerar link compartilhável para relatório
async function generateShareLink(reportId: string, expiryDays?: number): Promise<string>
```

### analyticsService

Serviço para análises e insights financeiros.

```typescript
// Calcular score de saúde financeira
async function calculateFinancialHealthScore(): Promise<number>

// Obter tendências de gastos
async function getSpendingTrends(period?: Period): Promise<SpendingTrend[]>

// Identificar gastos incomuns
async function identifyUnusualExpenses(): Promise<Transaction[]>

// Gerar dicas de economia
async function generateSavingsTips(): Promise<SavingTip[]>
```

### userSettingsService

Serviço para gerenciar configurações do usuário.

```typescript
// Obter configurações do usuário
async function getUserSettings(): Promise<UserSettings>

// Atualizar configurações do usuário
async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings>

// Atualizar preferências de notificação
async function updateNotificationPreferences(preferences: NotificationPreferences): Promise<void>

// Atualizar tema da aplicação
async function updateTheme(theme: 'light' | 'dark' | 'system'): Promise<void>
```

## Hooks Personalizados

### useSupabaseTransactions

Hook para gerenciar transações com filtros e paginação.

```typescript
const {
  transactions,
  isLoading,
  error,
  totalCount,
  page,
  setPage,
  filters,
  setFilters,
  refresh
} = useSupabaseTransactions(initialFilters?, pageSize?);
```

### useSupabaseBudgets

Hook para gerenciar orçamentos com cálculos em tempo real.

```typescript
const {
  budgets,
  isLoading,
  error,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetProgress
} = useSupabaseBudgets();
```

### useSupabaseCategories

Hook para gerenciar categorias com cache inteligente.

```typescript
const {
  categories,
  isLoading,
  error,
  createCategory,
  updateCategory,
  deleteCategory
} = useSupabaseCategories(type?);
```

### useUserSettings

Hook para gerenciar preferências do usuário.

```typescript
const {
  settings,
  isLoading,
  error,
  updateSettings,
  updateTheme,
  updateNotifications
} = useUserSettings();
```

### useScheduledReports

Hook para gerenciar relatórios agendados.

```typescript
const {
  scheduledReports,
  isLoading,
  error,
  scheduleReport,
  updateScheduledReport,
  deleteScheduledReport
} = useScheduledReports();
```

## Componentes Principais

### Dashboard

#### FinancialInsights

Componente que exibe análises e insights financeiros.

```typescript
interface FinancialInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
  className?: string;
}

<FinancialInsights 
  transactions={transactions} 
  budgets={budgets} 
  className="mt-4" 
/>
```

#### BudgetProgress

Componente que mostra o progresso dos orçamentos.

```typescript
interface BudgetProgressProps {
  budget: Budget;
  showDetails?: boolean;
  className?: string;
}

<BudgetProgress 
  budget={budget} 
  showDetails={true} 
  className="mb-4" 
/>
```

#### StatCard

Componente que exibe métricas financeiras.

```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

<StatCard 
  title="Receitas" 
  value={5000} 
  description="Total do mês" 
  icon={<DollarSign />} 
  trend={{ value: 10, isPositive: true }} 
/>
```

### Transações

#### TransactionForm

Formulário para adicionar/editar transações.

```typescript
interface TransactionFormProps {
  initialData?: Partial<Transaction>;
  onSubmit: (data: TransactionInput) => Promise<void>;
  onCancel?: () => void;
  isRecurring?: boolean;
}

<TransactionForm 
  initialData={transaction} 
  onSubmit={handleSubmit} 
  onCancel={handleCancel} 
/>
```

#### TransactionList

Lista de transações com virtualização.

```typescript
interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (transaction: Transaction) => void;
  isLoading?: boolean;
  className?: string;
}

<TransactionList 
  transactions={transactions} 
  onEdit={handleEdit} 
  onDelete={handleDelete} 
  isLoading={isLoading} 
/>
```

#### TransactionFilters

Filtros avançados para transações.

```typescript
interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilters) => void;
  categories: Category[];
  className?: string;
}

<TransactionFilters 
  onFilterChange={handleFilterChange} 
  categories={categories} 
/>
```

### Relatórios

#### ReportFilters

Filtros avançados para relatórios.

```typescript
interface ReportFiltersProps {
  onFilterChange: (filters: ReportFilters) => void;
  categories: Category[];
  className?: string;
}

<ReportFilters 
  onFilterChange={handleFilterChange} 
  categories={categories} 
/>
```

#### ReportExport

Exportação de relatórios em PDF/Excel.

```typescript
interface ReportExportProps {
  data: any[];
  filters: any;
  charts: React.ReactNode[];
  onSchedule?: (email: string, frequency: string) => Promise<void>;
}

<ReportExport 
  data={reportData} 
  filters={filters} 
  charts={charts} 
  onSchedule={handleSchedule} 
/>
```

#### CategoryBarChart

Gráfico de barras para gastos por categoria.

```typescript
interface CategoryBarChartProps {
  data: CategoryExpense[];
  height?: number;
  className?: string;
}

<CategoryBarChart 
  data={categoryExpenses} 
  height={300} 
/>
```

### Configurações

#### NotificationSettings

Componente para configurar notificações.

```typescript
interface NotificationSettingsProps {
  settings: NotificationSettings;
  onUpdate: (settings: NotificationSettings) => Promise<void>;
}

<NotificationSettings 
  settings={userSettings.notifications} 
  onUpdate={handleUpdateNotifications} 
/>
```

#### SecuritySettings

Componente para configurações de segurança.

```typescript
interface SecuritySettingsProps {
  onPasswordChange: (oldPassword: string, newPassword: string) => Promise<void>;
  onTwoFactorToggle: (enabled: boolean) => Promise<void>;
  twoFactorEnabled: boolean;
}

<SecuritySettings 
  onPasswordChange={handlePasswordChange} 
  onTwoFactorToggle={handleTwoFactorToggle} 
  twoFactorEnabled={twoFactorEnabled} 
/>
```

## Tipos Principais

```typescript
interface Transaction {
  id: string;
  user_id: string;
  category_id?: string;
  category?: Category;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  payment_method: string;
  installments?: number;
  installment_number?: number;
  parent_transaction_id?: string;
  is_recurring?: boolean;
  recurrence_rule?: RecurrenceRule;
  observations?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface Budget {
  id: string;
  user_id: string;
  category_id?: string;
  category?: Category;
  name: string;
  planned_amount: number;
  spent_amount: number;
  period_type: 'weekly' | 'monthly' | 'yearly';
  period_start: string;
  period_end: string;
  alert_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  id: string;
  user_id: string;
  currency: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  date_format: string;
  number_format: string;
  created_at: string;
  updated_at: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  budget_alerts: boolean;
}

interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date?: string;
  count?: number;
}
```