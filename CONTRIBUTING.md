# Guia de Contribuição - Finanças+

Obrigado por considerar contribuir para o Finanças+! Este documento fornece diretrizes e instruções para contribuir com o projeto.

## Código de Conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso e inclusivo para todos os contribuidores.

## Como Contribuir

### Reportando Bugs

Se você encontrou um bug, por favor crie uma issue seguindo estas diretrizes:

1. Verifique se o bug já não foi reportado.
2. Use o template de bug report.
3. Inclua passos detalhados para reproduzir o problema.
4. Descreva o comportamento esperado e o comportamento atual.
5. Inclua screenshots se possível.
6. Mencione sua versão do navegador e sistema operacional.

### Sugerindo Melhorias

Para sugerir melhorias:

1. Use o template de feature request.
2. Descreva claramente a melhoria e seu caso de uso.
3. Explique por que essa melhoria seria útil para a maioria dos usuários.

### Pull Requests

1. Crie uma branch a partir de `main` com um nome descritivo.
2. Implemente suas mudanças com commits pequenos e frequentes.
3. Siga as convenções de código do projeto.
4. Escreva testes para suas mudanças.
5. Atualize a documentação se necessário.
6. Abra um Pull Request para `main`.
7. Aguarde a revisão e aprovação.

## Estilo de Código

### Convenções Gerais

- Use TypeScript para todos os arquivos JavaScript.
- Siga o estilo de código definido no ESLint e Prettier.
- Mantenha os componentes pequenos e focados em uma única responsabilidade.
- Use nomes descritivos para variáveis, funções e componentes.

### Commits

Usamos commits semânticos para facilitar a geração automática de changelogs:

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Formatação, ponto e vírgula faltando, etc; sem alteração de código
- `refactor`: Refatoração de código
- `test`: Adicionando testes, refatorando testes; sem alteração de código
- `chore`: Atualizações de tarefas de build, configurações, etc; sem alteração de código

Exemplo: `feat: adicionar filtro por data nos relatórios`

## Estrutura do Projeto

```
src/
├── components/       # Componentes React
├── hooks/           # Hooks personalizados
├── services/        # Serviços de API
├── utils/           # Utilitários
├── types/           # Definições de tipos
├── pages/           # Páginas da aplicação
└── styles/          # Estilos globais
```

## Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Configuração

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/financas-plus.git
   cd financas-plus
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
   Edite `.env.local` com suas credenciais do Supabase.

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

### Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a build de produção
- `npm run test`: Executa os testes
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código com Prettier

## Testes

Escrevemos testes para:

- Componentes (usando React Testing Library)
- Hooks personalizados
- Utilitários
- Fluxos de integração

Para executar os testes:

```bash
npm run test
# ou
npm run test:watch
```

## Acessibilidade

Todas as contribuições devem seguir as diretrizes WCAG 2.1:

- Todos os elementos interativos devem ser acessíveis via teclado
- Use ARIA labels quando necessário
- Mantenha contraste adequado para texto
- Forneça alternativas para conteúdo não textual

## Documentação

- Documente novas funcionalidades, APIs e componentes
- Atualize a documentação existente quando necessário
- Use JSDoc para documentar funções e componentes

## Licença

Ao contribuir para este projeto, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.

## Dúvidas?

Se você tiver dúvidas sobre como contribuir, sinta-se à vontade para abrir uma issue ou entrar em contato com os mantenedores do projeto.

Agradecemos sua contribuição!