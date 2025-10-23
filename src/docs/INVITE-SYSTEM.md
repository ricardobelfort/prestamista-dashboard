# Sistema de Convites por Email - Supabase Auth

Este sistema usa a funcionalidade nativa do Supabase Auth para enviar convites por email aos usuários.

## 📋 Diferenças do Sistema Anterior

### Sistema Antigo (localStorage)
- ❌ Armazenava convites no navegador
- ❌ Não enviava emails automaticamente
- ❌ Usuário precisava criar senha manualmente
- ❌ Convites não registrados no banco
- ❌ Link de convite podia ser perdido

### Sistema Novo (Supabase Auth)
- ✅ Email enviado automaticamente
- ✅ Token seguro gerenciado pelo Supabase
- ✅ Usuário autenticado ao clicar no email
- ✅ Convites rastreados no Supabase Auth
- ✅ Integração nativa com RLS

## 🚀 Como Funciona

### 1. Admin Envia Convite
```typescript
// Frontend: admin.component.ts
await adminService.inviteUser(orgId, email, role, name);
```

### 2. Edge Function Processa
```typescript
// Edge Function: invite-user/index.ts
await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
  data: { org_id, role, name },
  redirectTo: `${siteUrl}/auth/callback?org_id=${org_id}&role=${role}`
});
```

### 3. Email Enviado ao Usuário
O Supabase envia automaticamente um email com link seguro.

### 4. Usuário Clica no Link
O link redireciona para `/auth/callback` com tokens de autenticação.

### 5. Callback Processa Convite
```typescript
// auth/callback/callback.component.ts
- Configura sessão do usuário
- Adiciona à tabela organization_members
- Redireciona para dashboard
```

## 📝 Configuração Necessária

### 1. Deploy da Edge Function

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Fazer link do projeto
supabase link --project-ref seu-project-ref

# Deploy da função
supabase functions deploy invite-user
```

### 2. Configurar Variáveis de Ambiente no Supabase

No Dashboard do Supabase → Edge Functions → Settings:

```
SITE_URL=https://seu-dominio.com
```

### 3. Configurar Template de Email

No Dashboard do Supabase → Authentication → Email Templates → Invite user:

**Subject:** `Você foi convidado para {{ .SiteURL }}`

**Body (HTML):**
```html
<h2>Você foi convidado!</h2>
<p>Olá!</p>
<p>Você foi convidado para participar da plataforma Prestamista.</p>
<p>Clique no botão abaixo para aceitar o convite:</p>
<p><a href="{{ .ConfirmationURL }}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Aceitar Convite</a></p>
<p>Ou copie e cole este link no seu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Este convite expira em 24 horas.</p>
```

### 4. Configurar URL de Redirect

No Dashboard do Supabase → Authentication → URL Configuration:

Adicionar em **Redirect URLs**:
```
http://localhost:4200/auth/callback
https://seu-dominio.com/auth/callback
https://seu-dominio.vercel.app/auth/callback
```

## 🔒 Segurança

### Políticas RLS para organization_members

As políticas já existentes devem permitir INSERT quando:
- O usuário é o owner/admin da organização (via Edge Function)
- O usuário está se auto-adicionando após aceitar convite

### Validação na Edge Function

A função valida:
- ✅ Autenticação do usuário que envia o convite
- ✅ Permissões (owner ou admin) do usuário
- ✅ Email não duplicado na organização
- ✅ Dados obrigatórios (org_id, email, role)

## 🧪 Testar o Sistema

### 1. Enviar Convite
```typescript
// No painel de admin
1. Selecionar organização
2. Clicar em "Ver Membros"
3. Clicar em "Convidar Usuário"
4. Preencher email, nome e permissão
5. Clicar em "Enviar Convite"
```

### 2. Verificar Email
- Checar caixa de entrada do email convidado
- Email deve vir de `noreply@mail.app.supabase.io` (ou seu domínio customizado)

### 3. Aceitar Convite
- Clicar no link do email
- Será redirecionado para `/auth/callback`
- Automaticamente autenticado e adicionado à organização
- Redirecionado para `/dashboard`

## 🐛 Troubleshooting

### Email não chega
1. Verificar spam/lixeira
2. Checar logs da Edge Function: `supabase functions logs invite-user`
3. Verificar configuração SMTP no Supabase (se usar SMTP customizado)

### Erro ao processar callback
1. Verificar se URL está nas Redirect URLs permitidas
2. Checar console do navegador para erros
3. Verificar políticas RLS da tabela organization_members

### Usuário já existe
- Edge Function detecta e apenas adiciona à organização
- Não envia novo email de convite
- Mostra mensagem: "Usuário adicionado à organização com sucesso!"

## 📚 Referências

- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-inviteUserByEmail)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
