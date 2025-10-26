# 🔒 Guia de Segurança

> **Última atualização:** 25/10/2025  
> **Status:** ✅ Implementado e Testado

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Variáveis de Ambiente](#-variáveis-de-ambiente)
3. [Sistema de Auto-Login (Dev)](#-sistema-de-auto-login-desenvolvimento)
4. [Deploy Seguro](#-deploy-seguro-vercel)
5. [Checklist de Segurança](#-checklist-de-segurança)
6. [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

Este projeto implementa múltiplas camadas de segurança:

### ✅ Implementado
- **Variáveis de Ambiente** - Credenciais nunca hardcoded
- **Placeholders em Build Time** - Substituição automática segura
- **Feature Flags** - Controle de funcionalidades sensíveis
- **RLS Supabase** - Row Level Security no banco
- **Autenticação JWT** - Tokens seguros via Supabase
- **CORS Configurado** - Apenas domínios autorizados

### 🔐 Princípios
1. **Never Trust, Always Verify** - Validação em todas as camadas
2. **Least Privilege** - Usuários só acessam o necessário
3. **Defense in Depth** - Múltiplas camadas de proteção
4. **Secrets Never Committed** - Credenciais fora do Git

---

## 🔑 Variáveis de Ambiente

### Problema Resolvido

**❌ Antes (INSEGURO):**
```typescript
// environment.prod.ts
export const environment = {
  supabaseUrl: 'https://xxx.supabase.co',  // Exposto no Git!
  supabaseKey: 'eyJhbGci...',               // Credencial pública!
};
```

**✅ Agora (SEGURO):**
```typescript
// environment.prod.ts
export const environment = {
  supabaseUrl: '__SUPABASE_URL__',   // Placeholder
  supabaseKey: '__SUPABASE_KEY__',   // Substituído no build
};
```

### Como Funciona

1. **Desenvolvimento Local:**
   ```bash
   # Arquivo .env (gitignored)
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_KEY=sua-chave-anon
   ```

2. **Build Process:**
   ```bash
   npm run build
   # → generate-version.js  (gera versão)
   # → ng build             (compila Angular)
   # → replace-env.js       (substitui placeholders) ✨
   ```

3. **Deploy Vercel:**
   - Variáveis configuradas no dashboard
   - Build automático com substituição
   - Credenciais nunca expostas

### Setup Passo a Passo

#### 1️⃣ Desenvolvimento Local

```bash
# Copie o template
cp .env.example .env

# Edite suas credenciais
nano .env
```

Adicione:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=eyJhbGci...sua-chave-anon
```

#### 2️⃣ Onde Encontrar Credenciais Supabase

**Dashboard → Project Settings → API:**

1. **Supabase URL:**
   - Seção: "Project URL"
   - Formato: `https://[project-ref].supabase.co`

2. **Anon Key:**
   - Seção: "Project API keys"
   - Usar: `anon` / `public` (NÃO `service_role`)
   - ⚠️ A chave `anon` é segura para uso no frontend

#### 3️⃣ Deploy no Vercel

1. **Acesse:** Vercel Dashboard → Seu Projeto → Settings → Environment Variables

2. **Adicione:**
   ```
   Nome: VITE_SUPABASE_URL
   Valor: https://seu-projeto.supabase.co
   Environments: ✅ Production ✅ Preview ✅ Development
   
   Nome: VITE_SUPABASE_KEY  
   Valor: eyJhbGci...
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

3. **Deploy:**
   ```bash
   git push origin main
   ```

### Validação

```bash
# Após build, verificar se placeholders foram substituídos
grep -r "__SUPABASE" dist/
# ✅ Não deve retornar nada!

# Verificar se credenciais estão presentes
grep -r "supabase.co" dist/
# ✅ Deve encontrar a URL nos arquivos JS
```

---

## 🔓 Sistema de Auto-Login (Desenvolvimento)

### Problema Resolvido

**❌ Antes (INSEGURO):**
```typescript
// data.service.ts
const debugUser = localStorage.getItem('debug_user');
const email = debugUser || 'admin@demo.com';  // Hardcoded!
await signInWithPassword({ email, password: '123456' });  // Exposto!
```

**✅ Agora (SEGURO):**
```typescript
// data.service.ts
if (!user) {
  throw new Error('User not authenticated. Please login first.');
}
// Sem auto-login por padrão
```

### Feature Flags

```typescript
// environment.ts (dev)
features: {
  enableAutoLogin: false,  // ❌ Desabilitado por padrão
}

// environment.prod.ts (produção)
features: {
  enableAutoLogin: false,  // ❌ NUNCA habilitar em produção
}
```

### Desenvolvimento Local (Opcional)

Se você **realmente** precisa de auto-login para testes:

1. **Copie o template:**
   ```bash
   cp src/environments/environment.local.ts.example \
      src/environments/environment.local.ts
   ```

2. **Configure:**
   ```typescript
   export const environment = {
     production: false,
     features: {
       enableAutoLogin: true,  // ⚠️ Apenas para dev local
       debugEmail: 'dev@test.com',
       debugPassword: 'senha-teste',
     }
   };
   ```

3. **⚠️ IMPORTANTE:**
   - Este arquivo está no `.gitignore`
   - NUNCA commite credenciais
   - Use apenas em desenvolvimento local

---

## 🚀 Deploy Seguro (Vercel)

### Checklist Pré-Deploy

- [ ] Variáveis configuradas no Vercel Dashboard
- [ ] Feature flags de debug desabilitados
- [ ] RLS habilitado no Supabase
- [ ] CORS configurado corretamente
- [ ] Build local testado
- [ ] Placeholders verificados

### Configuração Vercel

1. **Environment Variables:**
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_KEY
   ```

2. **Build Settings:**
   ```
   Build Command: npm run build
   Output Directory: dist/prestamista-dashboard-ui/browser
   Install Command: npm install
   ```

3. **Domínios:**
   - Adicione domínios permitidos no Supabase
   - Configure CORS se necessário

### Processo de Deploy

```bash
# 1. Versão (opcional)
npm run version:auto

# 2. Commit
git add .
git commit -m "feat: nova funcionalidade"

# 3. Push (deploy automático)
git push origin main

# 4. Verificar no Vercel Dashboard
# Logs → Build → verificar se replace-env.js executou
```

---

## ✅ Checklist de Segurança

### Desenvolvimento
- [ ] Arquivo `.env` existe e está configurado
- [ ] `.env` está no `.gitignore`
- [ ] Usando chave `anon` (não `service_role`)
- [ ] Auto-login desabilitado por padrão
- [ ] Sem credenciais hardcoded no código

### Build
- [ ] `npm run build` executou sem erros
- [ ] `replace-env.js` substituiu placeholders
- [ ] Nenhum `__SUPABASE_*__` nos arquivos dist/
- [ ] Credenciais presentes nos JS compilados

### Deploy
- [ ] Variáveis configuradas no Vercel
- [ ] Deploy bem-sucedido
- [ ] Aplicação funciona em produção
- [ ] Autenticação funciona
- [ ] Logs sem erros

### Supabase
- [ ] RLS (Row Level Security) habilitado
- [ ] Políticas configuradas corretamente
- [ ] CORS configurado
- [ ] Domínios autorizados
- [ ] Backup configurado

---

## 🔧 Troubleshooting

### Erro: Environment variable VITE_SUPABASE_URL is not set

**Causa:** Arquivo `.env` ausente ou mal formatado.

**Solução:**
```bash
# Verificar
cat .env

# Recriar
cp .env.example .env
nano .env  # Adicione suas credenciais
```

### Build local funciona, Vercel falha

**Causa:** Variáveis não configuradas no Vercel.

**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_KEY`
3. Marque todos os environments
4. Redeploy

### Erro 401 Unauthorized do Supabase

**Causa:** Chave inválida ou expirada.

**Solução:**
```bash
# 1. Verificar chave no Supabase Dashboard
# 2. Copiar chave `anon` atualizada
# 3. Atualizar .env local
# 4. Atualizar Vercel Environment Variables
# 5. Redeploy
```

### Placeholders não substituídos

**Causa:** Script `replace-env.js` não executado.

**Solução:**
```bash
# Verificar package.json
cat package.json | grep "build"
# Deve conter: "... && node replace-env.js"

# Executar manualmente
npm run build
node replace-env.js
```

### Auto-login ainda ativo em produção

**Causa:** Feature flag incorreto.

**Solução:**
```typescript
// src/environments/environment.prod.ts
features: {
  enableAutoLogin: false,  // ✅ DEVE ser false
}
```

---

## 📚 Recursos Adicionais

### Documentação Oficial
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Melhores Práticas
1. **Rotação de Chaves** - Rotacione chaves a cada 90 dias
2. **Monitoramento** - Use Sentry ou similar para erros
3. **Backup** - Configure backup automático no Supabase
4. **Testes** - Teste autenticação em ambiente de staging
5. **Logs** - Monitore logs de acesso suspeitos

### Ferramentas
- [Git-secrets](https://github.com/awslabs/git-secrets) - Previne commits de secrets
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - Escaneia histórico Git
- [Snyk](https://snyk.io/) - Escaneia vulnerabilidades

---

## 🚨 Em Caso de Vazamento

Se credenciais foram expostas:

1. **Imediato:**
   ```bash
   # Rotacionar chaves no Supabase
   # Dashboard → Settings → API → Reset keys
   ```

2. **Atualizar:**
   ```bash
   # Local
   nano .env  # Nova chave
   
   # Vercel
   # Dashboard → Environment Variables → Atualizar
   ```

3. **Redeploy:**
   ```bash
   git commit --allow-empty -m "security: rotate keys"
   git push origin main
   ```

4. **Monitorar:**
   - Verificar logs de acesso suspeitos
   - Revisar usuários criados
   - Auditar mudanças no banco

---

<div align="center">

**[⬆ Voltar ao topo](#-guia-de-segurança)**

Mantenha suas credenciais seguras! 🔐

</div>
