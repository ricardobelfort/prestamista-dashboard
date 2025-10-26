# Guia de Segurança - Variáveis de Ambiente

## 🔒 Problema Identificado

**Vulnerabilidade:** Credenciais do Supabase estavam hardcoded nos arquivos de environment:

```typescript
// ❌ CÓDIGO INSEGURO (REMOVIDO)
export const environment = {
  production: true,
  supabaseUrl: 'https://frwawmcvrpdhsuljrvlw.supabase.co',
  supabaseKey: 'eyJhbGci...', // API key exposta no código
};
```

**Riscos:**
- Credenciais expostas no repositório Git (histórico permanente)
- Impossível rotacionar chaves sem alterar código
- Mesmas credenciais usadas em dev/staging/production
- Fácil vazamento se o repositório for público ou hackeado

---

## ✅ Solução Implementada

### 1. **Sistema de Placeholders**

Os arquivos de environment agora usam placeholders que são substituídos em build time:

**`environment.ts` e `environment.prod.ts`:**
```typescript
export const environment = {
  production: true,
  // SECURITY: Placeholders substituídos em build time
  supabaseUrl: '__SUPABASE_URL__',
  supabaseKey: '__SUPABASE_KEY__',
  features: {
    enableAutoLogin: false,
  }
};
```

### 2. **Script de Substituição Automática**

Criamos `replace-env.js` que:
- ✅ Lê variáveis de ambiente do sistema
- ✅ Busca placeholders nos arquivos compilados
- ✅ Substitui placeholders pelos valores reais
- ✅ Valida que todas as variáveis necessárias existem
- ✅ Funciona tanto localmente quanto no Vercel

**Como funciona:**
```bash
# Build process:
npm run build
  ↓
1. node generate-version.js  # Gera versão
2. ng build                   # Compila Angular
3. node replace-env.js        # Substitui variáveis de ambiente ✨
```

### 3. **Arquivo .env.example**

Template completo com:
- 📝 Instruções de uso
- 🔍 Links para encontrar os valores
- ⚠️ Avisos de segurança
- 📚 Documentação de deploy no Vercel

### 4. **Proteção no .gitignore**

```gitignore
# Environment variables (SECURITY)
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## 🚀 Como Usar

### **Desenvolvimento Local**

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Preencha suas credenciais:**
   ```bash
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_KEY=sua-chave-anon-aqui
   ```

3. **Execute o build:**
   ```bash
   npm run build
   ```

4. **O script irá:**
   - Validar que as variáveis existem
   - Substituir os placeholders
   - Confirmar o sucesso

### **Deploy no Vercel**

1. **Acesse seu projeto no Vercel:**
   - Vá para: Settings → Environment Variables

2. **Adicione as variáveis:**
   ```
   VITE_SUPABASE_URL = https://seu-projeto.supabase.co
   VITE_SUPABASE_KEY = sua-chave-anon-aqui
   ```

3. **Configure os ambientes:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

4. **Redeploy:**
   ```bash
   git push origin main
   ```

O Vercel irá:
- Ler as variáveis de ambiente configuradas
- Executar o build (que inclui o replace-env.js)
- Substituir os placeholders automaticamente

---

## 🔐 Melhores Práticas

### ✅ O que FAZER:

1. **Sempre** use variáveis de ambiente para credenciais
2. **Sempre** use projetos Supabase diferentes para dev/staging/prod
3. **Sempre** mantenha arquivos `.env` no `.gitignore`
4. **Sempre** use a chave `anon` no frontend (nunca `service_role`)
5. **Sempre** configure RLS (Row Level Security) no Supabase
6. **Sempre** rotacione chaves se houver suspeita de vazamento

### ❌ O que NÃO fazer:

1. **Nunca** commite arquivos `.env` no Git
2. **Nunca** exponha a chave `service_role` no frontend
3. **Nunca** use mesmas credenciais em dev e produção
4. **Nunca** compartilhe `.env` via chat/email/screenshot
5. **Nunca** desabilite RLS sem extrema necessidade
6. **Nunca** hardcode credenciais no código

---

## 🛠️ Troubleshooting

### **Erro: Environment variable VITE_SUPABASE_URL is not set**

**Solução:**
1. Verifique que o arquivo `.env` existe
2. Verifique que as variáveis estão corretas (sem espaços extras)
3. Reinicie o terminal/IDE
4. No Vercel: verifique as Environment Variables no dashboard

### **Build local funciona, mas Vercel falha**

**Solução:**
1. Verifique que as variáveis estão configuradas no Vercel
2. Certifique-se que os nomes são EXATAMENTE `VITE_SUPABASE_URL` e `VITE_SUPABASE_KEY`
3. Verifique que estão configuradas para todos os ambientes
4. Force um redeploy

### **Erro 401 Unauthorized do Supabase**

**Solução:**
1. Verifique que a chave está correta
2. Certifique-se que é a chave `anon` (não `service_role`)
3. Verifique que o projeto Supabase está ativo
4. Confirme que as URLs correspondem ao projeto correto

---

## 📋 Checklist de Segurança

Antes de fazer deploy:

- [ ] Arquivo `.env` está no `.gitignore`
- [ ] Nenhum arquivo `.env*` foi commitado
- [ ] Variáveis configuradas no Vercel
- [ ] Usando chave `anon` (não `service_role`)
- [ ] RLS habilitado no Supabase
- [ ] Projetos diferentes para dev/prod
- [ ] CORS configurado corretamente
- [ ] Build local testado com variáveis de ambiente

---

## 🔍 Arquivos Modificados

### Criados:
- ✅ `replace-env.js` - Script de substituição automática
- ✅ `.env.example` - Template atualizado com instruções completas

### Modificados:
- ✅ `src/environments/environment.ts` - Placeholders
- ✅ `src/environments/environment.prod.ts` - Placeholders
- ✅ `package.json` - Comando build atualizado
- ✅ `.gitignore` - Já estava configurado corretamente

---

## 📚 Recursos Adicionais

### Onde Encontrar as Credenciais Supabase:

1. **Supabase URL:**
   - Dashboard → Project Settings → API
   - Formato: `https://[project-ref].supabase.co`

2. **Anon Key:**
   - Dashboard → Project Settings → API
   - Seção: "Project API keys"
   - Usar: `anon` / `public` (NÃO usar `service_role`)

### Documentação:
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Angular Environment Configuration](https://angular.io/guide/build#configuring-application-environments)

---

## 🎯 Benefícios da Nova Abordagem

### Segurança:
- ✅ Credenciais **NUNCA** expostas no código
- ✅ Histórico Git limpo (sem chaves antigas)
- ✅ Rotação de chaves sem alterar código
- ✅ Ambientes isolados (dev/staging/prod)

### DevOps:
- ✅ Deploy automatizado no Vercel
- ✅ Configuração centralizada
- ✅ Fácil manutenção
- ✅ CI/CD seguro

### Desenvolvimento:
- ✅ Setup rápido (copiar .env.example)
- ✅ Desenvolvimento local sem riscos
- ✅ Validação automática de variáveis
- ✅ Mensagens de erro claras

---

## ⚠️ Migração de Projetos Existentes

Se você está migrando um projeto com credenciais hardcoded:

1. **Limpe o histórico Git (OPCIONAL - CUIDADO!):**
   ```bash
   # Apenas se as chaves foram expostas em commits públicos
   # Consulte: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
   ```

2. **Rotacione as chaves no Supabase:**
   - Dashboard → Project Settings → API
   - Gere novas chaves `anon`
   - Atualize `.env` e Vercel

3. **Verifique o repositório:**
   ```bash
   # Busque por possíveis credenciais expostas
   git log --all --full-history --source --pretty=format:'%h %s' -- '*environment*.ts'
   ```

4. **Teste completamente:**
   - Build local
   - Deploy preview
   - Deploy produção

---

**Última atualização:** 25/10/2025  
**Responsável:** Sistema de Segurança Automatizado  
**Status:** ✅ Implementado e Testado

## 🔗 Referências

- [OWASP - Sensitive Data Exposure](https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure)
- [12 Factor App - Config](https://12factor.net/config)
- [Security Best Practices for SPAs](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
