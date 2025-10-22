# Sistema de Versão Automática

## Como Funciona

O sistema de versão é automaticamente gerado e exibido em duas localizações:

1. **Tela de Login**: No rodapé do formulário de login
2. **Sidebar do Dashboard**: No final da sidebar quando expandida

## Arquivos Envolvidos

### 1. `generate-version.js`
Script que gera automaticamente as informações de versão:
- Lê a versão do `package.json`
- Cria o arquivo `src/assets/version.json`

### 2. `src/app/core/version.service.ts`
Serviço Angular que fornece as informações de versão para os componentes.

### 3. Componentes que exibem a versão:
- `src/app/auth/login/login.component.ts` - Tela de login
- `src/app/shared/sidebar/sidebar.component.ts` - Sidebar do dashboard

## Scripts Automatizados

No `package.json`, os seguintes scripts foram configurados para gerar a versão automaticamente:

```json
{
  "scripts": {
    "start": "node generate-version.js && ng serve",
    "build": "node generate-version.js && ng build",
    "version:generate": "node generate-version.js"
  }
}
```

## Como Atualizar a Versão

1. **Manualmente**: Edite a versão no `package.json`
2. **Via npm**: Use `npm version patch|minor|major`

Exemplo:
```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## Formato de Exibição

A versão é exibida no formato: `v1.0.0`

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