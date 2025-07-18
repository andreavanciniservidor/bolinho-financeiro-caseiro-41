# Documentação Técnica - Finanças+

## Visão Geral

Finanças+ é uma aplicação web moderna para gerenciamento financeiro pessoal, desenvolvida com React, TypeScript e Supabase. A aplicação permite aos usuários gerenciar transações, orçamentos, categorias e gerar relatórios detalhados sobre sua situação financeira.

## Arquitetura

A aplicação segue uma arquitetura de camadas:

```
Frontend (React/TypeScript)
    ↓
React Query Cache
    ↓
Supabase Client
    ↓
Supabase (PostgreSQL + Auth + Real-time)
```

### Stack Tecnológico

- **Frontend:**
  - React 18 com TypeScript
  - Vite para build e desenvolvimento
  - Tailwind CSS para estilização
  - Radix UI para componentes acessíveis
  - React Query para gerenciamento de estado servidor
  - React Hook Form para formulários
  - Recharts para visualizações
  - React Router para navegação

- **Backend:**
  - Supabase (PostgreSQL + Auth + Real-time)
  - Row Level Security (RLS) para segurança

- **Ferramentas:**
  - ESLint para linting
  - TypeScript para tipagem
  - Date-fns para manipulação de datas

## Estrutura de Diretórios

```
src/
├── components/
│   ├── ui/                    # Componentes base (Radix UI)
│   ├── layout/                # Componentes de layout
│   ├── dashboard/             # Componentes específicos do dashboard
│   ├── transactions/          # Componentes de transações
│   ├── budgets/               # Componentes de orçamentos
│   ├── reports/               # Componentes de relatórios
│   ├── settings/              # Componentes de configurações
│   ├── accessibility/         # Componentes de acessibilidade
│   └── common/                # Componentes comuns
├── hooks/                     # Hooks personalizados
├── services/                  # Serviços de API
├── utils/                     # Utilitários
├── types/                     # Definições de tipos
├── pages/                     # Páginas da aplicação
├── styles/                    # Estilos globais
└── integrations/              # Integrações com serviços externos
```

## Componentes Principais

### Dashboard

- **FinancialInsights**: Exibe análises e insights financeiros baseados nos dados do usuário.
- **BudgetProgress**: Mostra o progresso dos orçamentos com indicadores visuais.
- **RecentTransactions**: Lista as transações mais recentes.
- **StatCard**: Exibe métricas financeiras importantes.

### Transações

- **TransactionForm**: Formulário para adicionar/editar transações.
- **TransactionList**: Lista de transações com virtualização para performance.
- **TransactionFilters**: Filtros avançados para transações.
- **InlineTransactionEdit**: Edição rápida de transações na lista.

### Orçamentos

- **BudgetForm**: Formulário para criar/editar orçamentos.
- **BudgetCard**: Card visual para exibir orçamentos e seu progresso.
- **BudgetAnalytics**: Análises detalhadas de orçamentos.

### Relatórios

- **ReportFilters**: Filtros avançados para relatórios.
- **ReportExport**: Exportação de relatórios em PDF/Excel.
- **CategoryBarChart**: Gráfico de barras para gastos por categoria.
- **ExpenseTrendChart**: Gráfico de tendência de gastos.

## Modelos de Dados

### Principais Entidades

- **User**: Informações do usuário e preferências.
- **Transaction**: Transações financeiras (receitas/despesas).
- **Budget**: Orçamentos por categoria ou globais.
- **Category**: Categorias para transações.
- **UserSettings**: Configurações personalizadas do usuário.

### Relacionamentos

- Um usuário pode ter múltiplas transações, orçamentos e categorias.
- Uma transação pertence a uma categoria (opcional).
- Um orçamento pode estar associado a uma categoria específica ou ser global.

## APIs e Serviços

### Serviços Principais

- **transactionService**: Gerencia operações CRUD para transações.
- **budgetService**: Gerencia operações CRUD para orçamentos.
- **categoryService**: Gerencia operações CRUD para categorias.
- **reportService**: Gera e exporta relatórios.
- **analyticsService**: Fornece análises e insights financeiros.
- **userSettingsService**: Gerencia configurações do usuário.

### Hooks Personalizados

- **useSupabaseTransactions**: Hook para gerenciar transações com filtros e paginação.
- **useSupabaseBudgets**: Hook para gerenciar orçamentos com cálculos em tempo real.
- **useSupabaseCategories**: Hook para gerenciar categorias com cache inteligente.
- **useUserSettings**: Hook para gerenciar preferências do usuário.
- **useScheduledReports**: Hook para gerenciar relatórios agendados.

## Acessibilidade (WCAG 2.1)

A aplicação segue as diretrizes WCAG 2.1 para garantir acessibilidade:

- **Navegação por Teclado**: Todos os elementos interativos são acessíveis via teclado.
- **Screen Readers**: Implementação de ARIA labels, roles e descrições.
- **Contraste e Cores**: Contraste mínimo de 4.5:1 para texto normal e 3:1 para texto grande.
- **Formulários**: Labels associados corretamente e mensagens de erro acessíveis.

## Performance

### Otimizações Implementadas

- **Code Splitting**: Carregamento sob demanda de componentes e páginas.
- **Memoização**: Componentes pesados são memoizados para evitar re-renderizações.
- **Virtualização**: Listas grandes utilizam virtualização para melhor performance.
- **Cache Inteligente**: Configurações otimizadas do React Query para caching.
- **PWA**: Suporte a Progressive Web App com cache offline.

### Métricas Alvo

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms

## Segurança

### Medidas Implementadas

- **Row Level Security (RLS)**: Políticas de segurança no nível do banco de dados.
- **Validação de Dados**: Validação rigorosa de inputs no cliente e servidor.
- **Autenticação Segura**: Autenticação via Supabase Auth com suporte a 2FA.
- **HTTPS**: Toda comunicação é feita via HTTPS.
- **Sanitização de Dados**: Todos os dados exibidos são sanitizados para prevenir XSS.

## Deployment

### Ambiente de Produção

- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoramento**: Sentry para tracking de erros
- **Analytics**: Google Analytics para métricas de uso
- **Performance**: Web Vitals para métricas de performance

## Guia de Contribuição

Para contribuir com o projeto, siga estas diretrizes:

1. **Código**: Siga o estilo de código existente e as convenções do projeto.
2. **Commits**: Use commits semânticos (feat, fix, docs, style, refactor, test, chore).
3. **Pull Requests**: Descreva claramente as mudanças e referencie issues relacionadas.
4. **Testes**: Adicione testes para novas funcionalidades e garanta que todos os testes passem.
5. **Documentação**: Atualize a documentação quando necessário.

### Processo de Desenvolvimento

1. Crie uma branch a partir de `main` com um nome descritivo.
2. Implemente suas mudanças com commits pequenos e frequentes.
3. Escreva testes para suas mudanças.
4. Atualize a documentação se necessário.
5. Abra um Pull Request para `main`.
6. Aguarde a revisão e aprovação.

## Changelog

### Versão 2.0.0 (Julho 2025) - Modernização Completa

- Redesign completo da interface com design system moderno
- Migração de dados mockados para persistência real no Supabase
- Implementação de dashboard interativo com insights financeiros
- Sistema avançado de relatórios com exportação e agendamento
- Implementação de acessibilidade completa (WCAG 2.1)
- Otimizações de performance e implementação de PWA
- Sistema de testes abrangente