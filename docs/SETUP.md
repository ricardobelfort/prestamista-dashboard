# ⚙️ Setup do Projeto

> Guia completo de configuração inicial do Prestamista Dashboard

---

## 📋 Pré-requisitos

- **Node.js** 18.x ou superior
- **npm** 9.x ou superior
- **Git** instalado
- Conta no **Supabase** (gratuita)
- Conta no **Vercel** (opcional, para deploy)

---

## 🚀 Instalação

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/ricardobelfort/prestamista-dashboard.git
cd prestamista-dashboard-ui
```

### 2️⃣ Instale Dependências

```bash
npm install
```

### 3️⃣ Configure Supabase

#### Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Anote:
   - Project URL: `https://[project-ref].supabase.co`
   - Anon Key: `eyJhbGci...`

#### Execute Migrations

```bash
# Configure CLI do Supabase (se necessário)
npm install -g supabase

# Linke ao projeto
supabase link --project-ref [seu-project-ref]

# Execute migrations
supabase db push
```

Ou execute manualmente no SQL Editor do Supabase:
```bash
# Arquivos em: supabase/migrations/
```

### 4️⃣ Configure Variáveis de Ambiente

```bash
# Copie o template
cp .env.example .env

# Edite o arquivo
nano .env
```

Adicione suas credenciais:
```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua-chave-anon-aqui
```

### 5️⃣ Inicie o Servidor

```bash
npm start
```

Acesse: **http://localhost:4200**

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

```sql
-- Organizações
organizations
  ├── id (uuid)
  ├── name (text)
  ├── created_at (timestamp)
  └── owner_id (uuid)

-- Clientes
clients
  ├── id (uuid)
  ├── organization_id (uuid)
  ├── name (text)
  ├── email (text)
  ├── phone (text)
  ├── address (text)
  └── created_at (timestamp)

-- Empréstimos
loans
  ├── id (uuid)
  ├── client_id (uuid)
  ├── amount (numeric)
  ├── interest_rate (numeric)
  ├── installments (integer)
  ├── status (text)
  └── created_at (timestamp)

-- Pagamentos
payments
  ├── id (uuid)
  ├── loan_id (uuid)
  ├── amount (numeric)
  ├── payment_date (date)
  └── created_at (timestamp)
```

### Configurar RLS (Row Level Security)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (auth.uid() = owner_id);
```

---

## 🎨 Configuração de UI

### Tailwind CSS

Já configurado! Arquivo: `tailwind.config.js`

### shadcn/ui Components

Componentes instalados:
- Button, Card, Dialog
- Input, Select, Textarea
- Toast, Modal

Adicionar novos:
```bash
# Instalar shadcn CLI (se necessário)
npx shadcn@latest add [component-name]
```

---

## 🌍 Internacionalização (i18n)

### Idiomas Suportados

- Português (PT-BR) - Padrão
- Espanhol (ES-PY)
- Inglês (EN-US)

### Adicionar Traduções

Arquivos em: `public/assets/i18n/`

```json
// pt-BR.json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Bem-vindo"
  }
}
```

Uso no código:
```typescript
{{ 'dashboard.title' | translate }}
```

---

## 🧪 Testes

### Configuração Jest

Já configurado! Arquivo: `jest.config.js`

```bash
# Executar testes
npm test

# Com cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

### Criar Novos Testes

```typescript
// exemplo.service.spec.ts
describe('ExemploService', () => {
  let service: ExemploService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExemploService);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

## 📦 Build

### Desenvolvimento

```bash
npm run build
```

Saída: `dist/prestamista-dashboard-ui/browser/`

### Produção

```bash
# Build com otimizações
npm run build -- --configuration=production
```

---

## 🔧 Configurações Adicionais

### ESLint

```bash
# Lint
npm run lint

# Fix automático
npm run lint -- --fix
```

### Prettier

Configurado em `package.json`:
```json
{
  "prettier": {
    "printWidth": 100,
    "singleQuote": true
  }
}
```

---

## 🐛 Troubleshooting Comum

### Erro: Cannot find module '@angular/...'

```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro: Supabase connection failed

```bash
# Verificar .env
cat .env

# Testar URL
curl https://seu-projeto.supabase.co
```

### Erro: Port 4200 already in use

```bash
# Encontrar processo
lsof -i :4200

# Matar processo
kill -9 [PID]

# Ou usar porta diferente
ng serve --port 4201
```

---

## 📚 Próximos Passos

1. ✅ Projeto configurado localmente
2. 📖 Leia a [Documentação de Segurança](./SECURITY.md)
3. 🚀 Configure [Deploy no Vercel](./DEPLOY.md)
4. 🧪 Execute os testes: `npm test`
5. 💡 Explore os [exemplos de código](../src/app/)

---

<div align="center">

**[⬆ Voltar ao topo](#%EF%B8%8F-setup-do-projeto)**

Pronto para desenvolver! 🎉

</div>
