# 🔒 Guia de Segurança - Prestamista Dashboard

## 📋 Sumário

Este documento descreve as medidas de segurança implementadas no Prestamista Dashboard para proteger contra invasões, ataques e vazamento de informações.

---

## ✅ Medidas Implementadas

### 1. **Content Security Policy (CSP)**

**Arquivo:** `src/index.html`

Implementamos uma política de segurança de conteúdo robusta que:
- ✅ Previne ataques XSS (Cross-Site Scripting)
- ✅ Bloqueia carregamento de recursos não autorizados
- ✅ Impede execução de scripts maliciosos inline
- ✅ Restringe conexões apenas a origens confiáveis (Supabase, Google Fonts)
- ✅ Força upgrade de requisições HTTP para HTTPS

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://frwawmcvrpdhsuljrvlw.supabase.co https://*.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
">
```

### 2. **Security Headers (Vercel)**

**Arquivo:** `vercel.json`

Configuramos headers HTTP de segurança:

| Header | Valor | Proteção |
|--------|-------|----------|
| `X-Content-Type-Options` | `nosniff` | Previne MIME type sniffing |
| `X-Frame-Options` | `DENY` | Previne clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Ativa proteção XSS do browser |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla informações de referência |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Desabilita APIs sensíveis |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Força HTTPS por 1 ano |

### 3. **Rate Limiting no Login**

**Arquivo:** `src/app/core/rate-limiter.service.ts`

Proteção contra brute force attacks:
- ✅ Máximo de **5 tentativas** de login por e-mail
- ✅ Janela de tempo de **15 minutos**
- ✅ Bloqueio temporário de **30 minutos** após exceder o limite
- ✅ Avisos progressivos ao usuário sobre tentativas restantes
- ✅ Reset automático após login bem-sucedido

**Exemplo de uso:**
```typescript
// Verifica rate limiting
if (this.rateLimiter.isRateLimited(rateLimitKey)) {
  this.toast.error('Muitas tentativas. Tente novamente mais tarde.');
  return;
}

// Registra tentativa
if (!this.rateLimiter.attempt(rateLimitKey)) {
  this.toast.error('Conta bloqueada temporariamente.');
  return;
}
```

### 4. **Sanitização de Inputs**

**Arquivo:** `src/app/shared/directives/sanitize.directive.ts`

Diretiva para limpar inputs do usuário:
- ✅ Remove tags HTML (previne XSS)
- ✅ Remove scripts inline (`<script>`, `javascript:`, `on*=`)
- ✅ Remove caracteres especiais perigosos (opcional)
- ✅ Atualiza FormControl automaticamente

**Como usar:**
```html
<!-- Input com sanitização básica -->
<input appSanitize formControlName="name">

<!-- Input permitindo HTML mas removendo scripts -->
<textarea appSanitize [allowHtml]="true" formControlName="description"></textarea>

<!-- Input sem caracteres especiais -->
<input appSanitize [allowSpecialChars]="false" formControlName="username">
```

### 5. **Guards de Autenticação e Autorização Aprimorados**

#### AuthGuard (`src/app/core/auth.guard.ts`)
- ✅ Verifica se usuário está autenticado
- ✅ Valida se a sessão não expirou
- ✅ Redireciona para login se necessário
- ✅ Mensagens de erro amigáveis

#### AdminGuard (`src/app/core/admin.guard.ts`)
- ✅ Verificação dupla: autenticação + role
- ✅ Apenas owners e admins acessam rotas administrativas
- ✅ Log de tentativas de acesso não autorizado (auditoria)
- ✅ Tratamento de erros robusto

### 6. **HTTPS Obrigatório**

**Arquivo:** `src/main.ts`

Força redirecionamento automático para HTTPS em produção:
```typescript
if (!isDevMode() && location.protocol !== 'https:') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

### 7. **Logger Service - Ocultação de Informações Sensíveis**

**Arquivo:** `src/app/core/logger.service.ts`

Sistema de logs controlado por ambiente:
- ✅ **Desenvolvimento:** Logs completos com detalhes
- ✅ **Produção:** Logs suprimidos ou genéricos
- ✅ Logs de segurança sempre registrados (sem detalhes sensíveis)

**Uso:**
```typescript
Logger.log('Debug info');           // Apenas em dev
Logger.error('Error details', err); // Genérico em prod
Logger.security('Acesso negado', { userId: 123 }); // Sempre registra
```

---

## 🔐 Boas Práticas Adicionais

### Supabase (Backend)

1. **Row Level Security (RLS)**: Todas as tabelas devem ter políticas RLS
2. **Service Role Key**: Nunca expor no frontend (usar Edge Functions)
3. **Anon Key**: Pode ser público mas combinado com RLS
4. **JWT Tokens**: Renovação automática de tokens

### Edge Functions

1. **Validação de JWT**: Sempre validar o token do usuário
2. **Variáveis de Ambiente**: SUPABASE_SERVICE_ROLE_KEY nunca em código
3. **CORS**: Configurar origins permitidas
4. **Rate Limiting**: Implementar no backend também

### Frontend

1. **Nunca armazenar segredos**: API keys, passwords em código
2. **Validação Client-Side**: Sempre complementar com server-side
3. **Formulários**: Usar FormBuilder do Angular com validadores
4. **Sanitização**: Sanitizar antes de exibir dados de usuários

---

## 🎯 Checklist de Segurança

Antes de fazer deploy em produção:

- [x] CSP configurado no `index.html`
- [x] Security headers no `vercel.json`
- [x] Rate limiting no login
- [x] Diretiva de sanitização criada
- [x] Guards com validação dupla
- [x] HTTPS forçado em produção
- [x] Logger service implementado
- [x] Console.logs removidos/controlados
- [x] RLS policies no Supabase (verificar periodicamente)
- [x] Edge Functions usando service_role
- [x] Variáveis de ambiente configuradas

### Próximos Passos Recomendados

- [ ] **Auditoria de Logs**: Implementar sistema de auditoria completo
- [ ] **2FA**: Autenticação de dois fatores
- [ ] **Monitoramento**: Alertas de atividades suspeitas
- [ ] **Backup**: Sistema de backup automatizado
- [ ] **Testes de Penetração**: Contratar empresa especializada
- [ ] **GDPR/LGPD**: Conformidade com leis de proteção de dados
- [ ] **WAF**: Web Application Firewall (Cloudflare, etc.)
- [ ] **DDoS Protection**: Proteção contra ataques distribuídos

---

## 📞 Contato de Segurança

Se você encontrar uma vulnerabilidade de segurança, por favor:
1. **NÃO** abra uma issue pública
2. Entre em contato diretamente com a equipe de desenvolvimento
3. Forneça detalhes sobre a vulnerabilidade
4. Aguarde a correção antes de divulgar publicamente

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Angular Security Guide](https://angular.dev/best-practices/security)
- [Vercel Security Headers](https://vercel.com/docs/edge-network/headers)
