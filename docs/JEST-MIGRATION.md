# Migração para Jest - Concluída ✅

## Resumo

Migração bem-sucedida do framework de testes de **Karma + Jasmine** para **Jest**, conforme solicitado pelo usuário.

## Status Atual

### ✅ Concluído
- **18 testes passando** (100% de sucesso)
- **2 suítes de teste** funcionando perfeitamente
- **Tempo de execução**: ~1.2s (muito rápido!)
- **Cobertura atual**: 3.47% (meta: 60%+)

### 📦 Pacotes Instalados
```json
{
  "jest": "^29.7.0",
  "@types/jest": "^29.5.14",
  "jest-preset-angular": "^15.0.3",
  "jest-environment-jsdom": "^29.7.0",
  "@angular/platform-browser-dynamic": "^20.3.6"
}
```

### 📁 Arquivos Criados/Modificados

1. **jest.config.js** - Configuração principal do Jest
   - Preset: `jest-preset-angular`
   - Coverage threshold: 60% (statements/functions/lines), 50% (branches)
   - Transform para TypeScript e HTML
   - Module name mappers para aliases (@app, @core, @shared)
   - Transform ignore patterns para módulos ESM

2. **setup-jest.ts** - Setup do ambiente de teste
   - Inicialização do Angular Testing Environment
   - Mocks globais: localStorage, sessionStorage, console
   - Mock do HTMLCanvasElement (para chart.js)
   - Mock do window.matchMedia (para testes responsivos)

3. **package.json** - Scripts de teste atualizados
   ```json
   {
     "test": "jest",
     "test:watch": "jest --watch",
     "test:coverage": "jest --coverage",
     "test:ci": "jest --ci --coverage --maxWorkers=2",
     "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
   }
   ```

4. **tsconfig.spec.json** - Configuração TypeScript para testes
   - Types: mudou de `["jasmine"]` para `["jest", "node"]`
   - Adicionado: `esModuleInterop: true`, `emitDecoratorMetadata: true`

5. **src/app/core/auth.service.spec.ts** - Testes completos do AuthService
   - **16 testes** cobrindo todos os métodos
   - signIn (sucesso, erro, limpeza de cache)
   - signOut (navegação, limpeza de cache)
   - getUser (cache válido, expirado, null)
   - getSession
   - onAuthStateChange (callbacks, cache)
   - **Cobertura**: 100% do AuthService

6. **src/app/app.spec.ts** - Testes do App component
   - **2 testes** básicos
   - Criação do componente
   - Renderização do toaster

## Desafios Resolvidos

### 1. Peer Dependency Conflicts (Angular 20)
**Problema**: jest-preset-angular v15 requer Angular <21, mas temos Angular 20.3.6

**Solução**: Usar `--legacy-peer-deps` em todas as instalações npm

### 2. Missing jest-environment-jsdom
**Problema**: "Test environment jest-environment-jsdom cannot be found"

**Solução**: Instalar `jest-environment-jsdom` e `@angular/platform-browser-dynamic`

### 3. Import Paths do jest-preset-angular
**Problema**: Path 'jest-preset-angular/setup-jest' não existe na v15

**Solução**: Criar setup manual com inicialização do Angular Testing Environment

### 4. ESM Modules (ngx-sonner, @angular/common/locales)
**Problema**: Jest não transformava módulos ESM por padrão

**Solução**: Adicionar ao `transformIgnorePatterns`:
```js
'node_modules/(?!(@angular|@ngx-translate|@supabase|rxjs|ngx-sonner)/)'
```

### 5. TranslateService Mock Incompleto
**Problema**: Mock não retornava Observable do método `use()`

**Solução**: Criar mock completo com RxJS:
```typescript
{
  setDefaultLang: jest.fn(),
  use: jest.fn().mockReturnValue(of({})),
  reloadLang: jest.fn().mockReturnValue(of({})),
  get: jest.fn().mockReturnValue(of({})),
  currentLang: 'pt-BR',
}
```

## Por Que Jest?

### Vantagens vs Karma + Jasmine
- ✅ **2-3x mais rápido** (execução paralela, cache inteligente)
- ✅ **Melhor DX** (watch mode, snapshot testing, --onlyChanged)
- ✅ **Mocking mais simples** (jest.fn(), jest.mock(), jest.spyOn())
- ✅ **CI/CD friendly** (executa em Node.js, não precisa de browser)
- ✅ **Relatórios melhores** (coverage detalhado, terminal colorido)
- ✅ **Comunidade maior** (mais plugins, mais recursos)

### Desvantagens (Minor)
- ⚠️ Não testa em browser real (mas temos E2E para isso)
- ⚠️ Requer configuração manual para Angular (jest-preset-angular)

## Cobertura Atual vs Meta

```
Atual:
- Statements: 3.47% → Meta: 60%
- Branches:   2.68% → Meta: 50%
- Functions:  4.38% → Meta: 60%
- Lines:      3.36% → Meta: 60%
```

### Serviços com 100% de Cobertura
- ✅ **AuthService** (64 linhas, 11 funções)

### Serviços com 0% de Cobertura (Prioridade)
1. **DataService** (721 linhas) - ⚠️ CRÍTICO
   - listClients, listLoans, createLoan, createPayment, etc.
2. **AdminService** (400 linhas) - ⚠️ CRÍTICO
   - Organization management, user invites
3. **Guards** (auth.guard.ts, admin.guard.ts) - ⚠️ CRÍTICO
4. **ReceiptService** (309 linhas) - 🔸 ALTO
5. **ExportService** (244 linhas) - 🔸 ALTO
6. **LanguageService** (81.81%) - 🟢 MÉDIO (quase completo)
7. **RateLimiterService** (122 linhas) - 🟢 MÉDIO
8. **VersionService** (78 linhas) - 🟡 BAIXO
9. **LoggerService** (49 linhas) - 🟡 BAIXO

## Próximos Passos

### Fase 1: Serviços Core (40 horas)
1. **DataService** (10h) - Testes para CRUD de clientes, empréstimos, pagamentos
2. **AdminService** (8h) - Testes para organizações, convites, usuários
3. **Guards** (6h) - Testes para authGuard, adminGuard, redirects
4. **ReceiptService** (6h) - Testes para geração de recibos em PDF/HTML
5. **ExportService** (6h) - Testes para exportação CSV/Excel
6. **RateLimiterService** (4h) - Testes para throttling e rate limiting

### Fase 2: Shared & Pipes (16 horas)
7. **LocalizedCurrencyPipe** (3h) - Testes para formatação de moeda (pt-BR, es-PY)
8. **Directives** (6h) - Testes para mask.directive, sanitize.directive
9. **LanguageService** (3h) - Completar testes faltantes (switch language, storage)
10. **ToastService** (2h) - Testes para notificações
11. **VersionService** (2h) - Testes para verificação de versão

### Fase 3: Components Críticos (24 horas)
12. **LoginComponent** (6h) - Testes para formulário, validação, auth
13. **CallbackComponent** (4h) - Testes para OAuth callback
14. **ClientsComponent** (8h) - Testes para CRUD de clientes
15. **LoansComponent** (6h) - Testes para CRUD de empréstimos

### Fase 4: Components Secundários (Opcional)
- HomeComponent, PaymentsComponent, CollectionComponent, etc.
- Pode ser adiado para depois do beta release

## Comandos Disponíveis

```bash
# Executar todos os testes (watch mode por padrão)
npm test

# Executar testes em watch mode explicitamente
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes no modo CI (sem watch, com coverage)
npm run test:ci

# Debug de testes
npm run test:debug
```

## Relatório de Cobertura

Após executar `npm run test:coverage`, você pode abrir o relatório HTML em:
```
coverage/index.html
```

## Checklist de Verificação

- [x] Jest instalado e configurado
- [x] Setup do Angular Testing Environment funcionando
- [x] Testes do AuthService completos (16 testes, 100% coverage)
- [x] Testes do App component funcionando (2 testes)
- [x] Scripts npm configurados
- [x] Coverage threshold configurado (60%)
- [x] Transform ignore patterns para ESM modules
- [x] Mocks globais (localStorage, sessionStorage, etc.)
- [ ] Remover pacotes Karma/Jasmine (opcional)
- [ ] Criar testes para DataService
- [ ] Criar testes para AdminService
- [ ] Criar testes para Guards
- [ ] Atingir 60%+ de cobertura global

## Notas Importantes

### Flags npm
Devido aos conflitos de peer dependency com Angular 20, sempre use:
```bash
npm install --save-dev <package> --legacy-peer-deps
```

### TypeScript Warnings
Os avisos `ts-jest[ts-compiler]` sobre `isolatedModules` e `emitDecoratorMetadata` são inofensivos e podem ser ignorados. Eles não afetam a execução dos testes.

### ESM Modules
Se você adicionar novos pacotes que usam ESM (extensão .mjs), adicione-os ao `transformIgnorePatterns` no `jest.config.js`:
```js
transformIgnorePatterns: [
  'node_modules/(?!(@angular|@ngx-translate|@supabase|rxjs|ngx-sonner|SEU-PACOTE)/)',
]
```

## Conclusão

✅ **Migração para Jest concluída com sucesso!**

O sistema agora tem:
- Framework de testes moderno e rápido (Jest)
- 18 testes passando (100% de sucesso)
- AuthService com 100% de cobertura
- Infraestrutura pronta para adicionar mais testes

**Próximo passo crítico**: Criar testes para DataService e AdminService para atingir a meta de 60% de cobertura antes do beta release.
