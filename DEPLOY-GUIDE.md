# ⚡ Guia Rápido de Deploy

## 🎯 Setup Mais Simples (Recomendado)

### 1. Conectar Vercel ao GitHub
1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em "Continue with GitHub"
3. Selecione o repositório `prestamista-dashboard`

### 2. Configurar Build Settings
```
Build Command: npm run version:generate && npm run build
Output Directory: dist/prestamista-dashboard-ui
Install Command: npm ci
```

### 3. Deploy
- ✅ Push para `main` = Deploy automático para produção
- ✅ Push para outras branches = Preview deploy
- ✅ Pull Requests = Preview deploy

## 🔄 O que Acontece Automaticamente

### GitHub Actions (sempre executa)
- ✅ Build e testes em todo push/PR
- ✅ Geração de versão com informações do Git
- ✅ Validação do código

### Vercel (deploy automático)
- ✅ Detecta mudanças no GitHub
- ✅ Executa build com geração de versão
- ✅ Deploy para produção ou preview

## 📋 Checklist de Configuração

- [ ] Repositório conectado na Vercel
- [ ] Build command configurado: `npm run version:generate && npm run build`
- [ ] Output directory: `dist/prestamista-dashboard-ui`
- [ ] Deploy automático ativado
- [ ] GitHub Actions funcionando (opcional)

## 🚀 Primeira Deploy

1. Faça um commit e push para `main`
2. Verifique o build no GitHub Actions
3. Verifique o deploy na Vercel
4. Acesse a URL fornecida pela Vercel
5. Confirme que a versão aparece na tela de login

## 📱 URLs de Exemplo

- **Produção**: `https://prestamista-dashboard.vercel.app`
- **Preview**: `https://prestamista-dashboard-git-branch.vercel.app`

## 🐛 Troubleshooting

### Build falha na Vercel
- Verificar se `npm run version:generate` está funcionando
- Verificar se todas as dependências estão no `package.json`

### Versão não aparece
- Verificar se o arquivo `src/assets/version.json` foi gerado
- Verificar se o build command inclui `npm run version:generate`

### GitHub Actions falha
- Verificar se o Node.js 20 está sendo usado
- Verificar se `npm ci` está funcionando

## 💡 Dicas

- **Desenvolvimento**: Use `npm start` - gera versão local
- **Produção**: Vercel gera versão automática com build number
- **Monitoramento**: Versão visível na interface e logs