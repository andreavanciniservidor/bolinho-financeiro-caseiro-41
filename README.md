# Finanças+ - Aplicativo de Gerenciamento Financeiro Pessoal

![Finanças+ Logo](public/pwa-192x192.png)

Finanças+ é uma aplicação web moderna para gerenciamento financeiro pessoal, desenvolvida com React, TypeScript, Vite e Supabase. A aplicação permite aos usuários gerenciar transações, orçamentos, categorias e gerar relatórios detalhados sobre suas finanças.

## 🌟 Funcionalidades

- **Dashboard Interativo**: Visualize sua situação financeira com gráficos e estatísticas em tempo real
- **Gestão de Transações**: Adicione, edite e categorize suas receitas e despesas
- **Orçamentos Inteligentes**: Crie e monitore orçamentos por categoria com alertas automáticos
- **Relatórios Detalhados**: Gere relatórios personalizados com filtros avançados
- **Exportação de Dados**: Exporte seus dados em formatos PDF e Excel
- **Modo Offline**: Acesse suas informações mesmo sem conexão com a internet
- **Tema Claro/Escuro**: Escolha o tema que mais combina com você
- **Totalmente Responsivo**: Funciona perfeitamente em dispositivos móveis e desktop
- **Acessibilidade**: Conformidade com WCAG 2.1 para garantir que todos possam usar a aplicação

## 🚀 Tecnologias

- **Frontend**:
  - React 18 com TypeScript
  - Vite para build e desenvolvimento
  - Tailwind CSS para estilização
  - Radix UI para componentes acessíveis
  - React Query para gerenciamento de estado servidor
  - React Hook Form para formulários
  - Recharts para visualizações
  - React Router para navegação

- **Backend**:
  - Supabase (PostgreSQL + Auth + Real-time)
  - Row Level Security (RLS) para segurança

- **Ferramentas**:
  - ESLint para linting
  - TypeScript para tipagem
  - Date-fns para manipulação de datas
  - Vitest para testes

## 📋 Pré-requisitos

- Node.js 18 ou superior
- NPM 8 ou superior
- Conta no Supabase (para o backend)

## 🛠️ Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/financas-plus.git
   cd financas-plus
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas credenciais do Supabase.

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse a aplicação em `http://localhost:8080`

## 🏗️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run build:dev` - Cria a build de desenvolvimento
- `npm run preview` - Visualiza a build localmente
- `npm run lint` - Executa o linter
- `npm run test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Executa os testes com cobertura

## 📱 PWA (Progressive Web App)

Finanças+ é uma Progressive Web App, o que significa que você pode instalá-la em seu dispositivo e usá-la como um aplicativo nativo. Para instalar:

1. Acesse a aplicação em seu navegador
2. No Chrome/Edge: Clique no ícone de instalação na barra de endereço
3. No Safari (iOS): Toque em "Compartilhar" e depois em "Adicionar à Tela de Início"

## 🧪 Testes

O projeto utiliza Vitest para testes unitários e de integração. Para executar os testes:

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

## 🚢 Deploy

O projeto está configurado para deploy automático via GitHub Actions e Vercel. Cada push para a branch `main` aciona o pipeline de CI/CD que:

1. Executa o linter
2. Executa os testes
3. Cria a build de produção
4. Faz o deploy para o ambiente de staging
5. Faz o deploy para o ambiente de produção (após aprovação manual)

## 📚 Estrutura do Projeto

```
src/
├── components/         # Componentes React
│   ├── ui/             # Componentes base (Radix UI)
│   ├── layout/         # Componentes de layout
│   ├── dashboard/      # Componentes do dashboard
│   ├── transactions/   # Componentes de transações
│   ├── budgets/        # Componentes de orçamentos
│   ├── reports/        # Componentes de relatórios
│   ├── accessibility/  # Componentes de acessibilidade
│   └── common/         # Componentes comuns
├── hooks/              # Hooks personalizados
├── pages/              # Páginas da aplicação
├── services/           # Serviços de API
├── utils/              # Utilitários
├── types/              # Tipos TypeScript
├── styles/             # Estilos globais
└── __tests__/          # Testes
```

## 🌐 Acessibilidade

Finanças+ foi desenvolvido com foco em acessibilidade, seguindo as diretrizes WCAG 2.1. Alguns recursos de acessibilidade incluem:

- Navegação completa por teclado
- Suporte a leitores de tela
- Contraste de cores adequado
- Textos alternativos para imagens
- Skip links para navegação rápida
- Live regions para atualizações dinâmicas
- Formulários acessíveis com labels e mensagens de erro claras

## 🔒 Segurança

- Autenticação segura via Supabase Auth
- Row Level Security (RLS) para proteção de dados
- Validação de dados no cliente e no servidor
- Headers de segurança configurados no Vercel
- HTTPS forçado em todos os ambientes

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e o processo para enviar pull requests.

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE.md](LICENSE.md) para detalhes.

## 📞 Contato

Para questões ou sugestões, por favor abra uma issue no GitHub ou entre em contato pelo email: contato@financas-plus.app