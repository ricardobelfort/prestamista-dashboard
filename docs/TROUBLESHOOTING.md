# 🔍 Troubleshooting

> Soluções para problemas comuns

---

## 🚨 Problemas Comuns

### 🔐 Autenticação

#### Erro: "User not authenticated"

**Causa:** Sessão expirada ou usuário não logado.

**Solução:**
```bash
# Fazer logout e login novamente
# Limpar localStorage
localStorage.clear()
# Recarregar página
```

#### Erro: "Invalid login credentials"

**Causa:** Email/senha incorretos ou usuário não existe.

**Solução:**
1. Verificar credenciais
2. Resetar senha via Supabase
3. Verificar se usuário foi criado

---

### 💾 Banco de Dados

#### Erro: "permission denied for table"

**Causa:** RLS (Row Level Security) bloqueando acesso.

**Solução:**
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'sua_tabela';

-- Adicionar política
CREATE POLICY "Users can view own data"
  ON sua_tabela FOR SELECT
  USING (auth.uid() = user_id);
```

#### Erro: "relation does not exist"

**Causa:** Migration não executada.

**Solução:**
```bash
# Executar migrations
supabase db push

# Ou via SQL Editor
```

---

### 🌐 Variáveis de Ambiente

#### Erro: "VITE_SUPABASE_URL is not set"

**Causa:** Arquivo `.env` ausente.

**Solução:**
```bash
# Criar .env
cp .env.example .env

# Editar
nano .env

# Adicionar
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-anon
```

#### Placeholders não substituídos

**Causa:** Script replace-env.js não executado.

**Solução:**
```bash
# Verificar package.json
"build": "... && node replace-env.js"

# Executar manualmente
npm run build
node replace-env.js
```

---

### 🚀 Deploy Vercel

#### Build falha no Vercel

**Causa:** Variáveis não configuradas.

**Solução:**
```
Vercel Dashboard
→ Settings
→ Environment Variables
→ Add: VITE_SUPABASE_URL e VITE_SUPABASE_KEY
→ Redeploy
```

#### App carrega mas tela branca

**Causa:** Erro de runtime não capturado.

**Solução:**
```bash
# Verificar console do browser
F12 → Console

# Verificar logs Vercel
Deployments → [Deploy] → View Function Logs
```

---

### 📧 Sistema de Convites

#### Emails não chegam

**Causas possíveis:**
1. SMTP não configurado no Supabase
2. Email na pasta spam
3. Domínio não verificado

**Solução:**
```bash
# Verificar configuração SMTP
Supabase Dashboard → Authentication → Email Templates

# Testar envio manual
supabase functions invoke invite-user --data '{"email":"test@test.com"}'

# Verificar logs
Supabase → Edge Functions → invite-user → Logs
```

#### Convite usado mas usuário não aparece

**Causa:** Organização não associada.

**Solução:**
```sql
-- Verificar organizações do usuário
SELECT * FROM organization_members WHERE user_id = 'uuid-do-usuario';

-- Adicionar manualmente (se necessário)
INSERT INTO organization_members (organization_id, user_id, role)
VALUES ('uuid-org', 'uuid-user', 'member');
```

---

### 💱 Moedas e Localização

#### Valores monetários incorretos

**Causa:** Locale não configurado.

**Solução:**
```typescript
// Configurar locale correto
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt, 'pt-BR');
```

#### Conversão de moeda falha

**Causa:** Símbolo de moeda não reconhecido.

**Solução:**
```typescript
// Usar pipe customizado
{{ valor | localizedCurrency }}
```

---

### 🧪 Testes

#### Testes falham: "Cannot find module"

**Causa:** Mock ausente ou path incorreto.

**Solução:**
```typescript
// jest.config.js
moduleNameMapper: {
  '^@app/(.*)$': '<rootDir>/src/app/$1',
}
```

#### Coverage baixo

**Solução:**
```bash
# Gerar relatório detalhado
npm run test:coverage

# Abrir HTML
open coverage/lcov-report/index.html

# Focar em arquivos com baixa cobertura
```

---

### 🎨 UI/Styling

#### Tailwind classes não aplicam

**Causa:** Purge removeu classes não usadas.

**Solução:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,ts}',  // ✅ Incluir todos os templates
  ],
}
```

#### Ícones Lucide não aparecem

**Causa:** Ícone não importado.

**Solução:**
```typescript
// shared/icons.ts
import { Users, Home } from 'lucide-angular';

export const Icons = {
  Users,
  Home,
  // Adicionar novo ícone aqui
};
```

---

### 🔄 Versionamento

#### Version.json não atualiza

**Causa:** Script não executado.

**Solução:**
```bash
# Gerar manualmente
npm run version:generate

# Ou via auto-versioning
npm run version:auto
```

#### Tags Git não criadas

**Causa:** Comando release não executado.

**Solução:**
```bash
# Criar release completo
npm run release

# Ou manualmente
git tag v1.0.0
git push origin v1.0.0
```

---

## 🆘 Comandos Úteis

### Limpeza

```bash
# Limpar cache Angular
rm -rf .angular/cache

# Limpar node_modules
rm -rf node_modules package-lock.json
npm install

# Limpar build
rm -rf dist
npm run build
```

### Debug

```bash
# Modo debug Jest
npm run test:debug

# Logs verbosos Angular
ng serve --verbose

# Build com source maps
ng build --source-map
```

### Supabase

```bash
# Resetar banco local
supabase db reset

# Ver migrations
supabase migration list

# Criar nova migration
supabase migration new nome_da_migration
```

---

## 📞 Suporte

### Logs Importantes

```bash
# Browser Console
F12 → Console

# Vercel Logs
Dashboard → Deployments → [Deploy] → Logs

# Supabase Logs
Dashboard → Logs → [Selecionar serviço]

# Jest Output
npm test -- --verbose
```

### Informações para Reportar Bug

```markdown
## Bug Report

**Versão:** (verificar em /version.json ou package.json)
**Ambiente:** Local / Vercel / Staging
**Browser:** Chrome / Firefox / Safari + versão
**OS:** macOS / Windows / Linux

**Passos para Reproduzir:**
1. 
2. 
3. 

**Erro:**
```
[Cole o erro aqui]
```

**Logs:**
```
[Cole logs relevantes]
```

**Screenshots:**
[Anexe se possível]
```

---

## 🔗 Links Úteis

- [Documentação Angular](https://angular.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Jest](https://jestjs.io/docs/getting-started)

---

<div align="center">

**[⬆ Voltar ao topo](#-troubleshooting)**

Não achou sua dúvida? [Abra uma issue](https://github.com/ricardobelfort/prestamista-dashboard/issues)

</div>
