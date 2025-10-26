# 📚 Documentação - Prestamista Dashboard

> Índice completo da documentação do projeto

---

## 🚀 Início Rápido

### Essenciais (Leia primeiro!)

1. **[README.md](../README.md)** - Visão geral do projeto
2. **[SETUP.md](./SETUP.md)** - Configuração inicial
3. **[SECURITY.md](./SECURITY.md)** - Guia de segurança e env vars
4. **[DEPLOY.md](./DEPLOY.md)** - Deploy no Vercel

---

## 📖 Documentação Principal

### 🔧 Configuração e Deploy
- **[Setup](./SETUP.md)** - Instalação e configuração inicial
- **[Deploy](./DEPLOY.md)** - Deploy no Vercel
- **[Security](./SECURITY.md)** - Segurança, env vars e RLS

### 🔍 Suporte
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Problemas comuns e soluções

### 🌍 Features e Integrações
- **[Currency Localization](./CURRENCY-LOCALIZATION.md)** - Sistema multi-moeda
- **[Lucide Icon Migration](./LUCIDE-ICON-MIGRATION.md)** - Migração de ícones

---

## 📂 Documentação Técnica

> Docs técnicas detalhadas em `src/docs/`

### 🔄 Versionamento e CI/CD
- **[Auto-Versioning](../src/docs/AUTO-VERSIONING.md)** - Sistema de versionamento automático
- **[Version System](../src/docs/VERSION-SYSTEM.md)** - Detalhes do sistema de versões
- **[CI/CD Setup](../src/docs/CI-CD-SETUP.md)** - Configuração de CI/CD

### 🎨 UI e Frontend
- **[shadcn/ui Implementation](../src/docs/SHADCN-UI-IMPLEMENTATION.md)** - Componentes shadcn/ui
- **[Performance Optimizations](../src/docs/PERFORMANCE-OPTIMIZATIONS.md)** - Otimizações

### 📧 Funcionalidades
- **[Invite System](../src/docs/INVITE-SYSTEM.md)** - Sistema de convites por email
- **[Email Templates](../src/docs/EMAIL-TEMPLATE-TRILINGUAL.md)** - Templates tri-língue

### 🗄️ Banco de Dados
- **[Supabase Setup SQL](../src/docs/supabase-setup.sql)** - Schema e migrations

---

## 🎯 Guias por Tarefa

### "Quero configurar o projeto pela primeira vez"
1. [Setup](./SETUP.md)
2. [Security](./SECURITY.md) (configurar .env)
3. [Supabase Setup SQL](../src/docs/supabase-setup.sql)

### "Quero fazer deploy"
1. [Security](./SECURITY.md) (configurar env vars Vercel)
2. [Deploy](./DEPLOY.md)

### "Estou com problemas"
1. [Troubleshooting](./TROUBLESHOOTING.md)
2. [Security](./SECURITY.md#troubleshooting)

### "Quero adicionar features"
1. [Auto-Versioning](../src/docs/AUTO-VERSIONING.md) (commits convencionais)
2. [shadcn/ui](../src/docs/SHADCN-UI-IMPLEMENTATION.md) (componentes)
3. [Performance](../src/docs/PERFORMANCE-OPTIMIZATIONS.md) (otimizações)

### "Quero configurar emails/convites"
1. [Invite System](../src/docs/INVITE-SYSTEM.md)
2. [Email Templates](../src/docs/EMAIL-TEMPLATE-TRILINGUAL.md)

---

## 📝 Convenções e Padrões

### Commits
```bash
feat: nova funcionalidade     → minor (1.x.0)
fix: correção                 → patch (1.0.x)
feat!: breaking change        → major (x.0.0)
```

### Estrutura de Branches
```
main            → produção
develop         → desenvolvimento
feat/xxx        → novas features
fix/xxx         → correções
hotfix/xxx      → correções urgentes
```

### Testes
```bash
npm test                # executar testes
npm run test:coverage   # com cobertura (meta: >60%)
```

---

## 🔗 Links Externos

### Documentação Oficial
- [Angular Docs](https://angular.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Ferramentas
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Jest](https://jestjs.io/)

---

## 🤝 Contribuindo

### Antes de Contribuir
1. Leia o [README.md](../README.md)
2. Configure o projeto: [Setup](./SETUP.md)
3. Entenda segurança: [Security](./SECURITY.md)
4. Siga convenções de commits

### Adicionar Documentação
1. Crie em `docs/` (docs principais) ou `src/docs/` (técnicas)
2. Use Markdown com boa formatação
3. Adicione ao índice (este arquivo)
4. Commit: `docs: adiciona guia de xxx`

---

## 📊 Status da Documentação

| Documento | Status | Última Atualização |
|-----------|--------|-------------------|
| README.md | ✅ Completo | 25/10/2025 |
| SETUP.md | ✅ Completo | 25/10/2025 |
| SECURITY.md | ✅ Completo | 25/10/2025 |
| DEPLOY.md | ✅ Completo | 25/10/2025 |
| TROUBLESHOOTING.md | ✅ Completo | 25/10/2025 |
| CURRENCY-LOCALIZATION.md | ✅ Atualizado | 24/10/2025 |

---

<div align="center">

**[⬆ Voltar ao topo](#-documentação---prestamista-dashboard)**

Documentação em constante evolução 📚

</div>
