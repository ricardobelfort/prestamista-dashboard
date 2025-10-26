<div align="center">

# 💰 Prestamista Dashboard

**Sistema de Gestão de Empréstimos com Administração Completa**

[![Angular](https://img.shields.io/badge/Angular-20.3-DD0031?logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.76-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

[![Deploy](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![Version](https://img.shields.io/badge/Version-v1.10.3-blue)](./public/version.json)
[![Tests](https://img.shields.io/badge/Coverage-62.81%25-brightgreen)](./jest.config.js)
[![License](https://img.shields.io/badge/License-Private-red)]()

[Features](#-features) • [Quick Start](#-quick-start) • [Docs](#-documentação) • [Security](#-segurança)

</div>

---

## � Sobre o Projeto

Dashboard moderno e responsivo para gestão de empréstimos com:
- 🔐 Autenticação segura com Supabase
- 👥 Gestão completa de clientes e empréstimos
- 📊 Dashboard com métricas em tempo real
- 💵 Sistema de parcelas e pagamentos
- 🌍 Suporte multi-idioma (PT-BR, ES-PY, EN-US)
- 📱 Design responsivo (mobile-first)
- 🎨 UI moderna com Tailwind CSS e shadcn/ui

---

## ✨ Features

### 🏠 Dashboard
- Métricas em tempo real (empréstimos ativos, pagamentos, inadimplência)
- Gráficos interativos com Chart.js
- Visão geral financeira

### 👤 Gestão de Clientes
- CRUD completo de clientes
- Histórico financeiro detalhado
- Busca e filtros avançados

### 💳 Empréstimos
- Criação de empréstimos com cálculo automático de juros
- Sistema de parcelas flexível
- Controle de status (ativo, pago, atrasado)

### 💰 Pagamentos
- Registro de pagamentos
- Histórico completo
- Geração de recibos em PDF

### 🔧 Admin
- Convites de usuários por email
- Gestão de organizações
- Controle de permissões

---

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- npm 9+
- Conta no Supabase

### Instalação

```bash
# Clone o repositório
git clone https://github.com/ricardobelfort/prestamista-dashboard.git
cd prestamista-dashboard-ui

# Instale dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# Inicie o servidor de desenvolvimento
npm start
```

Acesse: `http://localhost:4200`

---

## 🏗️ Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia servidor dev (com auto-versioning)
npm run watch          # Build com watch mode

# Build
npm run build          # Build de produção (com env vars)

# Testes
npm test               # Executa testes Jest
npm run test:watch     # Modo watch
npm run test:coverage  # Com cobertura (62.81%)

# Versionamento Automático
npm run version:auto   # Auto-incrementa baseado em commits
npm run version:patch  # Incrementa patch (1.0.x)
npm run version:minor  # Incrementa minor (1.x.0)
npm run version:major  # Incrementa major (x.0.0)
npm run release        # Versiona + push com tags
```

### 🎯 Conventional Commits

```bash
feat: nova funcionalidade    → incrementa MINOR (1.x.0)
fix: correção de bug         → incrementa PATCH (1.0.x)
feat!: breaking change       → incrementa MAJOR (x.0.0)
```

---

## � Documentação

### Essencial
- **[🔒 Segurança](./docs/SECURITY.md)** - Guia completo de segurança e variáveis de ambiente
- **[⚙️ Setup](./docs/SETUP.md)** - Configuração inicial do projeto
- **[🚀 Deploy](./docs/DEPLOY.md)** - Guia de deploy no Vercel

### Features
- **[💱 Localização de Moedas](./docs/CURRENCY-LOCALIZATION.md)** - Sistema multi-moeda
- **[🔍 Troubleshooting](./docs/TROUBLESHOOTING.md)** - Problemas comuns e soluções

---

## 🔒 Segurança

### Variáveis de Ambiente

O projeto usa **placeholders substituídos em build time** para máxima segurança:

```typescript
// ❌ Antes (inseguro)
supabaseUrl: 'https://xxx.supabase.co'

// ✅ Agora (seguro)
supabaseUrl: '__SUPABASE_URL__'  // Substituído no build
```

**Setup Local:**
```bash
# 1. Crie arquivo .env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-anon

# 2. Build (substituição automática)
npm run build
```

**Deploy Vercel:**
1. Configure em: Settings → Environment Variables
2. Adicione: `VITE_SUPABASE_URL` e `VITE_SUPABASE_KEY`
3. Deploy: `git push`

📖 [Guia Completo de Segurança](./docs/SECURITY.md)

---

## 🧪 Testes

```bash
# Executar testes
npm test

# Com cobertura
npm run test:coverage
```

**Cobertura Atual: 62.81%** 🎯 (Meta: 60%)

Testes implementados:
- ✅ DataService (88.11% coverage)
- ✅ AdminService (100% coverage)
- ✅ Guards (100% coverage)
- ✅ Utility Services

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework:** Angular 20.3 (Standalone Components)
- **UI:** Tailwind CSS 4.1 + shadcn/ui
- **Ícones:** Lucide Angular
- **Charts:** Chart.js + ng2-charts
- **I18n:** @ngx-translate/core

### Backend/Services
- **BaaS:** Supabase (Auth + Database + Storage)
- **Deploy:** Vercel
- **PDF:** jsPDF
- **Excel:** xlsx

### DevTools
- **Testing:** Jest 30 + jest-preset-angular
- **Linting:** ESLint + Prettier
- **Version:** Conventional Commits + auto-versioning

---

## 📁 Estrutura do Projeto

```
prestamista-dashboard-ui/
├── src/
│   ├── app/
│   │   ├── auth/              # Autenticação (login, callback)
│   │   ├── core/              # Services principais
│   │   ├── dashboard/         # Módulos do dashboard
│   │   │   ├── admin/         # Gestão admin
│   │   │   ├── clients/       # Gestão de clientes
│   │   │   ├── loans/         # Gestão de empréstimos
│   │   │   ├── payments/      # Gestão de pagamentos
│   │   │   └── home/          # Dashboard principal
│   │   └── shared/            # Componentes compartilhados
│   ├── environments/          # Configs de ambiente
│   └── styles/                # Estilos globais
├── docs/                      # Documentação
├── public/                    # Assets estáticos
├── supabase/                  # Migrations e functions
└── scripts/                   # Scripts de build/deploy
```

---

## 🤝 Contribuindo

### Workflow

1. **Clone & Branch**
   ```bash
   git checkout -b feat/sua-feature
   ```

2. **Desenvolva com Commits Convencionais**
   ```bash
   git commit -m "feat: adiciona filtro de clientes"
   ```

3. **Testes**
   ```bash
   npm test
   npm run test:coverage  # Manter >60%
   ```

4. **Push & PR**
   ```bash
   git push origin feat/sua-feature
   ```

### Boas Práticas

- ✅ Use Conventional Commits
- ✅ Mantenha cobertura de testes >60%
- ✅ Teste localmente antes do PR
- ✅ Documente mudanças significativas
- ✅ Siga os padrões do ESLint/Prettier

---

## 📝 Licença

**Privado** - Todos os direitos reservados

---

## 👨‍💻 Autor

**Ricardo Belfort**
- GitHub: [@ricardobelfort](https://github.com/ricardobelfort)

---

<div align="center">

**[⬆ Voltar ao topo](#-prestamista-dashboard)**

Feito com ❤️ usando Angular e Supabase

</div>

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
