# Sistema de Versionamento

## 📋 Visão Geral

O sistema usa versionamento semântico (SemVer) com build numbers automáticos.

### 🔧 Componentes

### 1. `generate-version.js`
- Gera versão com build number baseado no timestamp
- Cria o arquivo `src/assets/version.json`

### 2. `bump-version.js` 
- Incrementa versão semântica no package.json
- Faz commit e cria tag automaticamente

### 3. `src/app/core/version.service.ts`
- Carrega e exibe versão na aplicação usando signals
- Atualização reativa da versão

## 🚀 Como Usar

### Incrementar Versão Semântica:

```bash
# Patch (bugfixes): 1.0.1 -> 1.0.2
npm run version:patch

# Minor (features): 1.0.1 -> 1.1.0  
npm run version:minor

# Major (breaking): 1.0.1 -> 2.0.0
npm run version:major
```

### Scripts Disponíveis:

```json
{
  "version:generate": "node generate-version.js",
  "version:patch": "node bump-version.js patch",
  "version:minor": "node bump-version.js minor", 
  "version:major": "node bump-version.js major"
}
```

## 📊 Formatos de Versão

### Desenvolvimento (Branch main):
- Formato: `1.0.1-dev.{buildNumber}`
- Exemplo: `v1.0.1-dev.798808`

### Produção:
- Formato: `1.0.1.{buildNumber}`
- Exemplo: `v1.0.1.45`

### Feature Branches:
- Formato: `1.0.1-{branch}.{buildNumber}`
- Exemplo: `v1.0.1-auth-system.123456`

## 🔄 Workflow Recomendado

1. **Desenvolvimento**: Build number incrementa automaticamente
2. **Novas Features**: `npm run version:minor` 
3. **Bugfixes**: `npm run version:patch`
4. **Breaking Changes**: `npm run version:major`
5. **Deploy**: Push tags para trigger do CI/CD

## 📱 Exibição na UI

A versão é exibida no formato: `v1.0.1-dev.798808`
- Tela de login (canto inferior)
- Carregamento reativo via VersionService

## Localização Visual

### Tela de Login
- **Posição**: Rodapé do formulário de login
- **Estilo**: Texto pequeno e discreto
- **Cor**: Cinza claro

### Dashboard (Sidebar)
- **Posição**: Final da sidebar expandida
- **Exibição**: Apenas quando a sidebar está expandida
- **Estilo**: Texto pequeno centralizado
- **Cor**: Cinza escuro

## Benefícios

- ✅ **Automático**: Versão sempre atualizada
- ✅ **Consistente**: Mesma versão em todos os locais
- ✅ **Simples**: Apenas a versão, sem informações extras
- ✅ **Limpo**: Baseado no package.json padrão
- ✅ **Visual**: Facilita identificação da versão em uso