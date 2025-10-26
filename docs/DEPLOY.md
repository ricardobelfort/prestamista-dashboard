# 🚀 Guia de Deploy

> Deploy do Prestamista Dashboard no Vercel

---

## 📋 Pré-requisitos

- Projeto Supabase configurado
- Conta no Vercel (gratuita)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Código commitado e pushed

---

## ⚡ Deploy Rápido (5 minutos)

### 1️⃣ Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório `prestamista-dashboard`
5. Clique em **"Import"**

### 2️⃣ Configurar Build

Vercel detecta automaticamente Angular, mas confirme:

```
Framework Preset: Angular
Build Command: npm run build
Output Directory: dist/prestamista-dashboard-ui/browser
Install Command: npm install
Node Version: 18.x
```

### 3️⃣ Configurar Environment Variables

**Importante:** Configure ANTES de fazer deploy!

```
Settings → Environment Variables → Add New

Nome: VITE_SUPABASE_URL
Valor: https://seu-projeto.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development

Nome: VITE_SUPABASE_KEY
Valor: sua-chave-anon-aqui
Environments: ✅ Production ✅ Preview ✅ Development
```

### 4️⃣ Deploy!

Clique em **"Deploy"**

Aguarde 2-3 minutos. ✨

---

## 🔧 Configuração Avançada

### Domínio Customizado

1. **Adicionar Domínio:**
   ```
   Settings → Domains → Add Domain
   ```

2. **Configurar DNS:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **SSL Automático:**
   - Vercel configura HTTPS automaticamente
   - Certificado Let's Encrypt

### Ambientes

```
Production  → branch: main
Preview     → todos os PRs
Development → branches de feature
```

### Redirects

Criar `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 🔄 Deploy Automático

### Workflow

```bash
# 1. Desenvolva localmente
git checkout -b feat/nova-feature

# 2. Commit com Conventional Commits
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 3. Push para criar Preview
git push origin feat/nova-feature

# 4. Vercel cria deploy preview automaticamente
# URL: https://prestamista-dashboard-git-feat-nova-feature.vercel.app

# 5. Após aprovação, merge para main
git checkout main
git merge feat/nova-feature

# 6. Push para production
git push origin main

# 7. Deploy automático em produção! 🎉
```

### Triggers

Vercel faz deploy automático quando:
- ✅ Push para `main` → Production
- ✅ Push para outras branches → Preview
- ✅ Pull Request criado → Preview
- ✅ Pull Request atualizado → Preview atualizado

---

## 🏗️ Build Process

### O que acontece no deploy

```bash
1. Vercel clona o repositório
2. Instala dependências: npm install
3. Carrega Environment Variables
4. Executa build: npm run build
   ├── generate-version.js  (gera versão)
   ├── ng build            (compila Angular)
   └── replace-env.js      (substitui placeholders) ✨
5. Upload dos arquivos dist/
6. Configuração de rotas
7. Deploy! 🚀
```

### Logs de Build

```
Settings → Deployments → [Selecione Deploy] → View Build Logs
```

Verificar:
```
✓ Replacing environment variables in build files...
✓ Loaded environment variables from .env file
✓ Replaced __SUPABASE_URL__ in chunk-XXXXX.js
✓ Replaced __SUPABASE_KEY__ in chunk-XXXXX.js
✅ Successfully replaced environment variables
```

---

## 🔍 Monitoramento

### Analytics

```
Analytics → Overview
```

Métricas:
- Visitantes únicos
- Pageviews
- Top páginas
- Bounce rate

### Logs

```
Settings → Logs
```

Ver:
- Runtime logs
- Build logs  
- Error logs

### Alertas

Configure em: `Settings → Notifications`

- Deploy failed
- Build errors
- High response time
- Downtime

---

## 🐛 Troubleshooting

### Deploy falha: "Environment variable not set"

**Causa:** Variáveis não configuradas.

**Solução:**
```bash
Settings → Environment Variables
# Adicionar VITE_SUPABASE_URL e VITE_SUPABASE_KEY
# Redeploy: Deployments → [...] → Redeploy
```

### Build passa mas app não funciona

**Causa:** Placeholders não substituídos.

**Solução:**
```bash
# Verificar logs
View Build Logs → buscar "replace-env.js"

# Deve aparecer:
# "✓ Replaced __SUPABASE_URL__ in chunk-XXXXX.js"

# Se não aparecer, verificar package.json:
"build": "... && node replace-env.js"
```

### Erro 404 em rotas

**Causa:** SPA routing não configurado.

**Solução:**

Criar `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Erro CORS do Supabase

**Causa:** Domínio não autorizado.

**Solução:**
```bash
# Supabase Dashboard
Settings → API → CORS
# Adicionar: https://seu-dominio.vercel.app
```

---

## ⚡ Performance

### Edge Functions

```
Settings → Functions → Edge Functions
# Habilitar para melhor performance global
```

### Caching

Headers automáticos do Vercel:
- Static assets: 31536000s (1 ano)
- HTML: 0s (sempre fresh)
- API: customizável

### Image Optimization

```typescript
// Usar Next/Image (se migrar para Next.js)
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={100}
  alt="Logo"
/>
```

---

## 🔐 Segurança

### Headers de Segurança

Adicionar em `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Environment Variables Seguras

- ✅ Nunca commitar `.env`
- ✅ Usar variáveis diferentes por ambiente
- ✅ Rotacionar chaves regularmente
- ✅ Usar apenas `anon` key no frontend

---

## 📊 Checklist de Deploy

### Pré-Deploy
- [ ] Testes passando (`npm test`)
- [ ] Build local OK (`npm run build`)
- [ ] Variáveis configuradas no Vercel
- [ ] `.env` no `.gitignore`
- [ ] Commits seguem Conventional Commits

### Pós-Deploy
- [ ] Deploy bem-sucedido
- [ ] App carrega corretamente
- [ ] Autenticação funciona
- [ ] Rotas funcionam
- [ ] Sem erros no console
- [ ] Logs sem erros

### Produção
- [ ] Domínio customizado configurado
- [ ] SSL ativo
- [ ] Analytics configurado
- [ ] Alertas configurados
- [ ] Backup Supabase ativo

---

## 🔄 Rollback

Se algo der errado:

```bash
# Na Vercel Dashboard
Deployments → [Deploy Anterior] → [...] → Promote to Production

# Ou via CLI
vercel rollback
```

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Angular + Vercel](https://vercel.com/docs/frameworks/angular)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

<div align="center">

**[⬆ Voltar ao topo](#-guia-de-deploy)**

Deploy feito! Agora é só crescer! 🚀

</div>
