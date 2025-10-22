# CI/CD e Versionamento Automático

## Configuração do Sistema

O sistema de versionamento é totalmente automatizado e integrado com GitHub Actions e Vercel.

## Como Funciona

### 1. Geração de Versão Inteligente

O script `generate-version.js` gera versões baseadas no contexto:

#### Produção (Vercel/CI)
- **Formato**: `1.0.0.123` (versão base + build number)
- **Exemplo**: `v1.0.0.45`

#### Branch Principal (Development)
- **Formato**: `1.0.0-dev.123456`
- **Exemplo**: `v1.0.0-dev.123456`

#### Feature Branches
- **Formato**: `1.0.0-feature-name.123456`
- **Exemplo**: `v1.0.0-auth-system.123456`

### 2. Variáveis de Ambiente Utilizadas

#### GitHub Actions
- `GITHUB_RUN_NUMBER`: Número do build
- `GITHUB_SHA`: Hash do commit
- `GITHUB_REF_NAME`: Nome do branch

#### Vercel
- `VERCEL_GIT_COMMIT_SHA`: Hash do commit
- `VERCEL_GIT_COMMIT_REF`: Branch do Git
- `VERCEL_BUILD_ID`: ID único do build
- `VERCEL_ENV`: Ambiente (production/preview/development)

### 3. Arquivos de Configuração

#### `.github/workflows/ci-cd.yml`
```yaml
- name: Generate version info
  run: npm run version:generate
  env:
    GITHUB_RUN_NUMBER: ${{ github.run_number }}
    GITHUB_SHA: ${{ github.sha }}
    GITHUB_REF_NAME: ${{ github.ref_name }}
    NODE_ENV: production
```

#### `vercel.json`
```json
{
  "buildCommand": "npm run version:generate && npm run build",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Configuração no GitHub

### Opção 1: Deploy Automático Nativo (Recomendado)
A Vercel pode ser conectada diretamente ao GitHub sem necessidade de secrets:

1. **Na Vercel:**
   - Vá em [vercel.com/new](https://vercel.com/new)
   - Conecte com GitHub
   - Selecione o repositório `prestamista-dashboard`
   - Configure:
     - **Build Command**: `npm run version:generate && npm run build`
     - **Output Directory**: `dist/prestamista-dashboard-ui`
   - Deploy automático será ativado

2. **No GitHub:**
   - Nenhum secret necessário
   - GitHub Actions apenas para build e testes
   - Vercel faz o deploy automaticamente

### Opção 2: Deploy via GitHub Actions (Avançado)

Apenas se quiser controle total via GitHub Actions:

#### 1. Obter IDs da Vercel:

**VERCEL_TOKEN:**
1. Acesse [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Clique em "Create Token"
3. Nome: "GitHub Actions"
4. Escopo: Full Access
5. Copie o token gerado

**ORG_ID:**
```bash
# Via CLI
npx vercel teams ls

# Via Dashboard: Settings → General → Team ID
```

**PROJECT_ID:**
```bash
# Via CLI (dentro do projeto)
npx vercel project ls

# Via Dashboard: Project Settings → General → Project ID
```

#### 2. Configurar Secrets no GitHub:
```
Repository → Settings → Secrets and variables → Actions

VERCEL_TOKEN=vercel_xxxxxxxxxxxxxxxxxxxx
ORG_ID=team_xxxxxxxxxxxx  
PROJECT_ID=prj_xxxxxxxxxxxx
```

#### 3. Ativar Deploy no GitHub Actions:
Descomente as linhas no arquivo `.github/workflows/ci-cd.yml`

## Configuração na Vercel

### 1. Build Settings
- **Build Command**: `npm run version:generate && npm run build`
- **Output Directory**: `dist/prestamista-dashboard-ui`
- **Install Command**: `npm ci`

### 2. Environment Variables
A Vercel automaticamente fornece:
- `VERCEL_GIT_COMMIT_SHA`
- `VERCEL_GIT_COMMIT_REF`
- `VERCEL_BUILD_ID`
- `VERCEL_ENV`

## Fluxo de Deploy

### Development
1. Push para branch → GitHub Actions
2. Gera versão com sufixo `-dev` ou `-branch-name`
3. Build e testes automáticos

### Production
1. Push/merge para `main` → GitHub Actions + Vercel
2. Gera versão de produção (`1.0.0.build`)
3. Deploy automático para produção

## Comandos Úteis

```bash
# Gerar versão manualmente
npm run version:generate

# Simular build de produção
NODE_ENV=production npm run version:generate

# Simular build com branch específico
GITHUB_REF_NAME=feature-auth npm run version:generate
```

## Exemplos de Versões

| Contexto | Versão Gerada | Exemplo |
|----------|---------------|---------|
| Produção | `1.0.0.45` | `v1.0.0.45` |
| Dev (main) | `1.0.0-dev.123456` | `v1.0.0-dev.123456` |
| Feature Branch | `1.0.0-auth.123456` | `v1.0.0-auth.123456` |
| Hotfix Branch | `1.0.0-hotfix.123456` | `v1.0.0-hotfix.123456` |

## Monitoramento

A versão é exibida em:
- **Login**: Rodapé do formulário
- **Dashboard**: Sidebar (quando expandida)
- **Console**: Logs de build com informações detalhadas

## Troubleshooting

### Problema: Versão não atualiza
- Verificar se `npm run version:generate` está sendo executado
- Verificar variáveis de ambiente no deploy

### Problema: Erro no build
- Verificar se o Git está inicializado
- Verificar se as dependências estão instaladas

### Problema: Versão incorreta
- Verificar o `package.json`
- Verificar as variáveis de ambiente do CI/CD