# Email Template para Convites - Trilíngue (PT/ES/EN)

Use este template no Supabase Dashboard → Authentication → Email Templates → Invite user

## Subject:
```
Convite / Invitación / Invitation - Prestamista
```

## Body (HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .logo {
      width: 48px;
      height: 48px;
      background: linear-gradient(to bottom right, #4F46E5, #3730A3);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 24px;
      margin-bottom: 24px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin-bottom: 24px;
      margin-top: 0;
    }
    .section {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e5e5;
    }
    .section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .lang-label {
      display: inline-block;
      background-color: #f3f4f6;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: white !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .button:hover {
      background-color: #4338CA;
    }
    .link-box {
      background-color: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      color: #6b7280;
      word-break: break-all;
      margin-top: 16px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">P</div>
    <h1>🎉 Você foi convidado! / ¡Has sido invitado! / You've been invited!</h1>
    
    <!-- PORTUGUÊS -->
    <div class="section">
      <span class="lang-label">🇧🇷 PORTUGUÊS</span>
      <p>Olá!</p>
      <p>Você foi convidado para participar da plataforma <strong>Prestamista</strong> - uma solução completa para gestão de empréstimos e cobranças.</p>
      <p>Clique no botão abaixo para aceitar o convite e começar a usar a plataforma:</p>
    </div>
    
    <!-- ESPAÑOL -->
    <div class="section">
      <span class="lang-label">🇵🇾 ESPAÑOL</span>
      <p>¡Hola!</p>
      <p>Has sido invitado a participar en la plataforma <strong>Prestamista</strong> - una solución completa para la gestión de préstamos y cobros.</p>
      <p>Haz clic en el botón a continuación para aceptar la invitación y comenzar a usar la plataforma:</p>
    </div>
    
    <!-- ENGLISH -->
    <div class="section">
      <span class="lang-label">🇺🇸 ENGLISH</span>
      <p>Hello!</p>
      <p>You've been invited to join the <strong>Prestamista</strong> platform - a complete solution for loan and collection management.</p>
      <p>Click the button below to accept the invitation and start using the platform:</p>
    </div>
    
    <!-- BUTTON -->
    <div style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">
        Aceitar Convite / Aceptar Invitación / Accept Invitation
      </a>
    </div>
    
    <!-- ALTERNATIVE LINK -->
    <div style="margin-top: 24px;">
      <p style="font-size: 13px; color: #6b7280;">
        <strong>🇧🇷</strong> Ou copie e cole este link no seu navegador:<br>
        <strong>🇵🇾</strong> O copia y pega este enlace en tu navegador:<br>
        <strong>🇺🇸</strong> Or copy and paste this link in your browser:
      </p>
      <div class="link-box">
        {{ .ConfirmationURL }}
      </div>
    </div>
    
    <!-- FOOTER -->
    <div class="footer">
      <p>
        🇧🇷 Este convite expira em 24 horas.<br>
        🇵🇾 Esta invitación expira en 24 horas.<br>
        🇺🇸 This invitation expires in 24 hours.
      </p>
      <p style="margin-top: 16px;">
        © {{ .Year }} Prestamista. 
        🇧🇷 Todos os direitos reservados. / 
        🇵🇾 Todos los derechos reservados. / 
        🇺🇸 All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
```

## Como aplicar:

1. Acesse: https://supabase.com/dashboard/project/frwawmcvrpdhsuljrvlw/auth/templates
2. Selecione "Invite user"
3. Cole o Subject no campo de assunto
4. Cole o HTML no campo de Body
5. Clique em "Save"

## Preview:
O email mostrará:
- Logo do Prestamista
- Título trilíngue
- Três seções separadas por idioma (PT, ES, EN)
- Botão centralizado para aceitar
- Link alternativo caso o botão não funcione
- Footer com informações de expiração

## Variáveis disponíveis:
- `{{ .ConfirmationURL }}` - URL de confirmação do convite
- `{{ .SiteURL }}` - URL do site
- `{{ .Year }}` - Ano atual
