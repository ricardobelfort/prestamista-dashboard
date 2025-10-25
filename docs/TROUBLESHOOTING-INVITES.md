# Troubleshooting - Sistema de Convites

## Problema Reportado
Problemas ao enviar convites para novos usuários através do sistema de administração.

## Possíveis Causas e Soluções

### 1. Edge Function não Deployed
**Sintoma**: Erro ao invocar função `invite-user`

**Verificação**:
```bash
# Verificar se a função está deployed no Supabase
# Acesse: https://supabase.com/dashboard/project/frwawmcvrpdhsuljrvlw/functions
```

**Solução**:
```bash
# Deploy da Edge Function
cd supabase/functions
supabase functions deploy invite-user
```

### 2. Configuração de Email não está habilitada

**Verificação no Supabase Dashboard**:
1. Acesse: Authentication → Providers → Email
2. Verifique se "Enable Email Provider" está ativado
3. Verifique se "Enable Email Confirmations" está ativado
4. Verifique se "Enable Secure Email Change" está configurado

**Verificação de SMTP**:
1. Acesse: Project Settings → Auth → SMTP Settings
2. Verifique se o SMTP está configurado corretamente
3. Se não estiver configurado, o Supabase usa o provedor padrão (limitado)

### 3. Template de Email não configurado

**Verificação**:
1. Acesse: Authentication → Email Templates → Invite User
2. Verifique se o template está configurado
3. Template deve conter `{{ .ConfirmationURL }}`

**Solução**:
Copie o template de `src/docs/EMAIL-TEMPLATE-TRILINGUAL.md` para o Supabase Dashboard

### 4. URL de Callback incorreta

**Verificação**:
1. Acesse: Authentication → URL Configuration
2. Verifique "Site URL": deve ser `https://prestamista-dashboard-ui.vercel.app`
3. Verifique "Redirect URLs": deve incluir `https://prestamista-dashboard-ui.vercel.app/auth/callback`

**Solução**:
Adicionar URLs corretas nas configurações do Supabase Auth

### 5. Variáveis de Ambiente da Edge Function

**Verificação no Supabase Dashboard**:
1. Acesse: Edge Functions → invite-user → Settings
2. Verifique se as seguintes variáveis estão definidas:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SITE_URL` (deve ser `https://prestamista-dashboard-ui.vercel.app`)

**Solução**:
```bash
# Definir variáveis de ambiente
supabase secrets set SITE_URL=https://prestamista-dashboard-ui.vercel.app
```

### 6. Permissões RLS

**Verificação**:
O usuário que está convidando precisa ter role `owner` ou `admin` na organização.

**SQL para verificar**:
```sql
SELECT om.role 
FROM organization_members om
WHERE om.org_id = 'ORG_ID' 
  AND om.user_id = auth.uid();
```

### 7. Rate Limiting do Email

**Sintoma**: Emails não chegam após vários testes

**Solução**:
- Aguarde alguns minutos entre testes
- Verifique a pasta de SPAM do email
- Use o SMTP customizado para evitar rate limits do Supabase

## Como Testar

### 1. Teste via Console do Navegador
```javascript
// Abra o console do navegador (F12)
const { data, error } = await supabase.functions.invoke('invite-user', {
  body: {
    org_id: 'SEU_ORG_ID',
    email: 'teste@exemplo.com',
    role: 'viewer',
    name: 'Teste'
  }
});

console.log('Result:', { data, error });
```

### 2. Verificar Logs da Edge Function
1. Acesse: Supabase Dashboard → Edge Functions → invite-user → Logs
2. Procure por erros recentes
3. Verifique o timestamp dos logs

### 3. Verificar Emails Enviados
1. Acesse: Supabase Dashboard → Authentication → Users
2. Verifique se o usuário foi criado com status "waiting for email confirmation"
3. Se sim, o convite foi enviado (verifique SPAM)

### 4. Testar Localmente
```bash
# Iniciar Supabase localmente
supabase start

# Testar função localmente
supabase functions serve invite-user

# Em outro terminal
curl -i --location --request POST 'http://localhost:54321/functions/v1/invite-user' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"org_id":"test","email":"test@example.com","role":"viewer"}'
```

## Checklist de Verificação

- [ ] Edge Function `invite-user` está deployed
- [ ] Email Provider está habilitado no Supabase Auth
- [ ] Template de Email está configurado
- [ ] Site URL está correto (`https://prestamista-dashboard-ui.vercel.app`)
- [ ] Redirect URLs incluem `/auth/callback`
- [ ] SMTP está configurado (ou usando default)
- [ ] Variáveis de ambiente da função estão definidas
- [ ] Usuário tem permissão (owner/admin)
- [ ] RLS policies estão ativas
- [ ] Não há rate limiting ativo

## Logs Importantes para Verificar

### No Navegador (Console)
```
Network tab → Filter by "invite-user"
Verificar:
- Status Code (deve ser 200)
- Response body (verificar error ou success)
- Request payload (verificar dados enviados)
```

### No Supabase Dashboard
```
Edge Functions → invite-user → Logs
Procurar por:
- "Invite sent successfully"
- Errors de autenticação
- Errors de permissão
```

### No Supabase Auth
```
Authentication → Users
Verificar:
- Novo usuário criado?
- Status: "waiting for email confirmation"?
- Metadata contém org_id e role?
```

## Solução Rápida

Se nada funcionar, tente esta sequência:

1. **Redeploy da função**:
```bash
supabase functions deploy invite-user --no-verify-jwt
```

2. **Limpar cache**:
- Ctrl+Shift+Delete no navegador
- Limpar cache do Vercel (redeploy)

3. **Verificar CORS**:
A função tem CORS habilitado, mas verifique se o domínio está correto

4. **Testar com Postman/Insomnia**:
Use ferramentas de API para isolar o problema (frontend vs backend)

## Contato para Suporte

Se o problema persistir:
1. Coletar logs do navegador (Network + Console)
2. Coletar logs da Edge Function
3. Verificar se o email está na blacklist do provedor
4. Considerar usar SMTP customizado (SendGrid, Resend, etc.)
