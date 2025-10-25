# Guia Rápido - Verificar Logs do Sistema de Convites

## 🔍 Onde Verificar os Problemas

### 1. Logs da Edge Function (MAIS IMPORTANTE)

**Acesse**: https://supabase.com/dashboard/project/frwawmcvrpdhsuljrvlw/functions/invite-user/logs

**O que procurar**:
```
✅ Bom sinal:
- "=== INVITE USER FUNCTION START ==="
- "Authenticated user: ..."
- "Invite sent successfully"

❌ Problemas:
- "Missing authorization header"
- "Unauthorized"
- "User is not a member of this organization"
- "Insufficient permissions"
- "Error sending invite email"
```

### 2. Console do Navegador

**Como acessar**:
1. F12 ou Ctrl+Shift+I
2. Aba "Console"
3. Aba "Network"

**O que procurar na aba Network**:
- Filtrar por "invite-user"
- Verificar Status Code (deve ser 200)
- Ver Response (deve ter "success: true")
- Ver Request Payload (verificar org_id, email, role)

### 3. Logs de Autenticação do Supabase

**Acesse**: https://supabase.com/dashboard/project/frwawmcvrpdhsuljrvlw/auth/users

**O que verificar**:
- Usuário foi criado?
- Status: "waiting for email confirmation"?
- Metadata contém: org_id, role, invited_by?

### 4. Configurações de Email

**Acesse**: https://supabase.com/dashboard/project/frwawmcvrpdhsuljrvlw/auth/templates

**Verificar**:
- Template "Invite user" está configurado?
- Contém `{{ .ConfirmationURL }}`?
- Template está ativo?

## 🚀 Como Testar Agora

### Opção 1: Via Interface Web
1. Acesse: https://prestamista-dashboard-ui.vercel.app
2. Login como admin
3. Vá em "Administração"
4. Clique em "Convidar Usuário"
5. Preencha os dados
6. **IMPORTANTE**: Abra F12 antes de clicar em "Enviar"
7. Veja os logs no Console e Network

### Opção 2: Via Script (Recomendado para Debug)
```bash
cd /Users/ricardobelfort/Development/emprestimos/prestamista-dashboard-ui
./test-invite.sh
```

Siga as instruções do script.

### Opção 3: Via Console do Navegador
1. Acesse: https://prestamista-dashboard-ui.vercel.app
2. Login
3. F12 → Console
4. Cole e execute:

```javascript
// Substitua os valores
const result = await supabase.functions.invoke('invite-user', {
  body: {
    org_id: 'SEU_ORG_ID_AQUI',
    email: 'email@teste.com',
    role: 'viewer',
    name: 'Nome Teste'
  }
});

console.log('Result:', result);
```

## 📋 Checklist Rápido

Verifique na ordem:

1. [ ] **Edge Function deployed?**
   - Acesse: https://supabase.com/dashboard/project/frwawmcvrpdhsuljrvlw/functions
   - Deve aparecer "invite-user" na lista

2. [ ] **Email provider ativo?**
   - Acesse: https://supabase.com/dashboard/project/frwawmcvrpdhsuljrvlw/auth/providers
   - "Email" deve estar "Enabled"

3. [ ] **Template configurado?**
   - Acesse: https://supabase.com/dashboard/project/frwawmcvrpdhsuljrvlw/auth/templates
   - "Invite user" deve ter conteúdo

4. [ ] **Site URL correto?**
   - Acesse: https://supabase.com/dashboard/project/frwawmcvrpdhsuljrvlw/auth/url-configuration
   - Site URL: `https://prestamista-dashboard-ui.vercel.app`
   - Redirect URLs deve incluir: `https://prestamista-dashboard-ui.vercel.app/auth/callback`

5. [ ] **Você é admin/owner?**
   - No app, vá em Administração
   - Verifique se aparece "Convidar Usuário"
   - Se não aparecer, você não tem permissão

## 🐛 Erros Comuns

### "Missing authorization header"
**Causa**: Token não está sendo enviado
**Solução**: Fazer logout e login novamente

### "Unauthorized"
**Causa**: Token expirado ou inválido
**Solução**: Fazer logout e login novamente

### "User is not a member of this organization"
**Causa**: Você não pertence à organização ou org_id está errado
**Solução**: Verifique o org_id no banco de dados

### "Insufficient permissions"
**Causa**: Você não é owner nem admin
**Solução**: Pedir a um owner para te promover

### "User is already a member"
**Causa**: Email já está cadastrado e é membro
**Solução**: Normal, usuário já tem acesso

### Email não chega
**Causa**: Pode estar em SPAM ou email provider não configurado
**Solução**: 
1. Verificar pasta de SPAM
2. Aguardar alguns minutos
3. Configurar SMTP customizado no Supabase

## 📱 Informações para Suporte

Se o problema persistir, colete estas informações:

```
1. Status Code da requisição: ___
2. Response body: ___
3. Erro no console: ___
4. Logs da Edge Function (copie da tela)
5. Seu role na organização: ___
6. Email que tentou convidar: ___
7. Timestamp do teste: ___
```

## 🔧 Comandos Úteis

### Ver logs em tempo real
```bash
# Instalar Supabase CLI se não tiver
npm install -g supabase

# Login
supabase login

# Ver logs
supabase functions logs invite-user --follow
```

### Redeploy da função (se necessário)
```bash
cd supabase/functions
supabase functions deploy invite-user
```

### Testar localmente
```bash
supabase start
supabase functions serve invite-user
# Em outro terminal
curl -i --location --request POST 'http://localhost:54321/functions/v1/invite-user' \
  --header 'Authorization: Bearer YOUR_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"org_id":"test","email":"test@example.com","role":"viewer"}'
```

## ✅ Próximos Passos

1. Execute o script de teste: `./test-invite.sh`
2. Veja os logs da Edge Function
3. Verifique o console do navegador
4. Se ainda não funcionar, colete as informações acima
5. Compartilhe os logs para análise mais detalhada
