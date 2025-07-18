# Changelog - Finanças+

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2025-07-17

### Adicionado

#### Interface e Design
- Design system completo com tokens de design personalizados
- Tema escuro/claro com suporte a preferências do sistema
- Micro-interações e animações para melhor feedback visual
- Layout responsivo para mobile, tablet e desktop
- Componentes de UI modernos baseados em Radix UI

#### Funcionalidades
- Dashboard interativo com insights financeiros personalizados
- Sistema de orçamentos inteligente com alertas e sugestões
- Relatórios avançados com exportação para PDF e Excel
- Agendamento de relatórios por email
- Compartilhamento de relatórios via links seguros
- Transações recorrentes e parceladas
- Sistema de tags para transações
- Filtros avançados para transações e relatórios
- Configurações personalizáveis de idioma, moeda e formato de números
- Notificações push para alertas de orçamento

#### Infraestrutura
- Migração completa para Supabase (PostgreSQL + Auth + Real-time)
- Implementação de Row Level Security (RLS) para segurança
- Sistema de cache inteligente com React Query
- Funcionalidades PWA para uso offline
- CI/CD pipeline com GitHub Actions
- Monitoramento de erros com Sentry
- Métricas de performance com Web Vitals

#### Acessibilidade
- Conformidade com WCAG 2.1
- Navegação completa por teclado
- Suporte a screen readers com ARIA labels
- Contraste adequado para texto e elementos visuais
- Indicadores não dependentes apenas de cor
- Skip links para navegação rápida

### Alterado
- Refatoração completa da arquitetura da aplicação
- Migração de dados mockados para persistência real
- Atualização de todas as dependências para versões mais recentes
- Migração para React 18 e TypeScript
- Substituição de CSS modules por Tailwind CSS
- Migração de Create React App para Vite

### Corrigido
- Problemas de performance em listas grandes com virtualização
- Problemas de acessibilidade em formulários e componentes interativos
- Vazamentos de memória em componentes com useEffect
- Problemas de cache em dados compartilhados entre componentes
- Inconsistências visuais entre diferentes navegadores

## [1.5.0] - 2024-12-10

### Adicionado
- Suporte inicial a temas claro/escuro
- Visualizações básicas de gráficos para transações
- Filtros simples para transações
- Exportação básica de dados em CSV

### Alterado
- Melhorias na interface do usuário
- Otimização de performance para carregamento inicial
- Refatoração de componentes para melhor reusabilidade

### Corrigido
- Problemas de layout em telas pequenas
- Erros na validação de formulários
- Problemas de cálculo em resumos financeiros

## [1.0.0] - 2024-06-15

### Adicionado
- Versão inicial da aplicação
- Funcionalidades básicas de gerenciamento financeiro
- Cadastro de transações (receitas e despesas)
- Cadastro de categorias
- Dashboard simples com resumo financeiro
- Autenticação básica de usuários