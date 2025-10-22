# 🚨 Troubleshooting Build Vercel

## ❌ Erro: "ng: command not found"

### Problema
```
sh: line 1: ng: command not found
Error: Command "npm run version:generate && npm run build" exited with 127
```

### Causa
Angular CLI não está disponível no ambiente de build.

### ✅ Solução Aplicada
1. **Movido Angular CLI para dependencies**:
   ```json
   "dependencies": {
     "@angular/build": "^20.3.6",
     "@angular/cli": "^20.3.6",
     "@angular/compiler-cli": "^20.3.0"
   }
   ```

2. **Simplificado vercel.json**:
   ```json
   {
     "buildCommand": "npm run version:generate && npm run build",
     "outputDirectory": "dist/prestamista-dashboard-ui"
   }
   ```

## 🔧 Verificações de Build

### 1. Localmente
```bash
npm run build  # Deve funcionar sem erros
```

### 2. Simular Produção
```bash
NODE_ENV=production npm run version:generate
npm run build
```

### 3. Verificar Dependências
```bash
npm ls @angular/cli  # Deve estar em dependencies
npm ls @angular/build  # Deve estar em dependencies
```

## 📋 Checklist de Deploy

- [ ] Angular CLI em dependencies (não devDependencies)
- [ ] Build local funcionando
- [ ] vercel.json configurado corretamente
- [ ] version.json sendo gerado

## 🎯 Configuração Final

### package.json
```json
{
  "dependencies": {
    "@angular/build": "^20.3.6",
    "@angular/cli": "^20.3.6",
    "@angular/compiler-cli": "^20.3.0"
  }
}
```

### vercel.json
```json
{
  "buildCommand": "npm run version:generate && npm run build",
  "outputDirectory": "dist/prestamista-dashboard-ui"
}
```

## 🚀 Próximo Deploy

1. Commit das mudanças
2. Push para main
3. Verificar build na Vercel
4. Confirmar versão no site