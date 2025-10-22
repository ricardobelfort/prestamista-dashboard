# 🔐 Guia das Funções RPC Seguras

## 📋 Visão Geral

As funções RPC (Remote Procedure Call) foram implementadas para fornecer acesso seguro aos dados do sistema de empréstimos, com filtragem automática por organização. Estas funções substituem as queries diretas às tabelas, eliminando a necessidade de políticas RLS complexas que causavam stack overflow.

## 🚀 Funções Implementadas

### 1. `fn_list_clients()`
**Propósito**: Lista todos os clientes da organização do usuário autenticado.

**Retorno**: SETOF clients (todos os campos da tabela clients)

**Uso no Angular**:
```typescript
const { data, error } = await this.supabase.client.rpc('fn_list_clients');
```

**Segurança**: Filtra automaticamente por `org_members` baseado em `auth.uid()`

---

### 2. `fn_list_loans()`
**Propósito**: Lista empréstimos com informações do cliente.

**Retorno**: 
```sql
TABLE (
  id uuid,
  client_name text,
  principal numeric,
  interest_rate numeric,
  installments_count int,
  start_date date,
  status loan_status,
  notes text
)
```

**Uso no Angular**:
```typescript
const { data, error } = await this.supabase.client.rpc('fn_list_loans');
```

**Vantagens**: 
- JOIN automático com clients
- Filtragem por organização
- Campos essenciais pré-selecionados

---

### 3. `fn_list_routes()`
**Propósito**: Lista rotas de cobrança com nome do usuário atribuído.

**Retorno**:
```sql
TABLE (
  id uuid,
  name text,
  assigned_to uuid,
  created_at timestamptz,
  assigned_user_name text
)
```

**Uso no Angular**:
```typescript
const { data, error } = await this.supabase.client.rpc('fn_list_routes');
```

**Características**:
- JOIN automático com profiles
- Nome do usuário atribuído incluído
- Ordenação por nome da rota

---

### 4. `fn_list_payments()`
**Propósito**: Lista pagamentos com informações do cliente.

**Retorno**:
```sql
TABLE (
  id uuid,
  client_name text,
  paid_on date,
  value numeric,
  method text,
  notes text
)
```

**Uso no Angular**:
```typescript
const { data, error } = await this.supabase.client.rpc('fn_list_payments');
```

**Complexidade**: Faz JOIN através de installments → loans → clients

---

### 5. `fn_dashboard_metrics()`
**Propósito**: Calcula métricas para o dashboard (substitui v_dashboard).

**Retorno**:
```sql
TABLE (
  total_principal numeric,
  total_recebido numeric,
  total_em_aberto numeric
)
```

**Uso no Angular**:
```typescript
const { data, error } = await this.supabase.client.rpc('fn_dashboard_metrics');
const metrics = data && data.length > 0 ? data[0] : defaultMetrics;
```

**Cálculos**:
- `total_principal`: Soma de loans ativos
- `total_recebido`: Soma de pagamentos efetuados
- `total_em_aberto`: Soma de valores pendentes

---

### 6. `fn_export_report(tipo text)`
**Propósito**: Exporta dados em formato JSON para relatórios.

**Parâmetros**: 
- `'clients'`: Exporta clientes
- `'loans'`: Exporta empréstimos  
- `'payments'`: Exporta pagamentos

**Retorno**: `jsonb`

**Uso no Angular**:
```typescript
const { data, error } = await this.supabase.client.rpc('fn_export_report', {
  tipo: 'clients'
});
```

**Exemplo de retorno**:
```json
[
  {
    "id": "uuid",
    "name": "Cliente Nome",
    "phone": "11999999999",
    "address": "Endereço completo"
  }
]
```

## 🧪 Funções de Teste

Para fins de desenvolvimento e teste, foram criadas versões que aceitam email como parâmetro:

- `fn_test_list_clients(user_email text)`
- `fn_test_dashboard_metrics(user_email text)` 
- `fn_test_list_routes(user_email text)`

**Uso em SQL**:
```sql
SELECT * FROM fn_test_list_clients('admin@demo.com');
SELECT * FROM fn_test_dashboard_metrics('cobrador@demo.com');
```

## ✅ Vantagens das Funções RPC

### 1. **Segurança Aprimorada**
- Filtragem automática por organização
- Uso de `SECURITY DEFINER` 
- Não depende de políticas RLS complexas
- Controle total sobre queries executadas

### 2. **Performance Otimizada**
- JOINs otimizados no banco de dados
- Redução do número de queries da aplicação
- Menos transferência de dados
- Cache no nível do PostgreSQL

### 3. **Manutenibilidade**
- Lógica de negócio centralizada no banco
- Facilita mudanças sem alterar frontend
- Versionamento controlado via migrations
- Testes isolados possíveis

### 4. **Compatibilidade RLS**
- Convive com políticas RLS existentes
- Não quebra funcionalidades atuais
- Migração gradual possível
- Fallback para queries diretas se necessário

## 🔄 Integração no DataService

O `DataService` foi atualizado para usar as funções RPC:

```typescript
// Antes (query direta)
const { data, error } = await this.supabase.client
  .from('clients')
  .select('*')
  .eq('status', 'active');

// Depois (função RPC)
const { data, error } = await this.supabase.client.rpc('fn_list_clients');
```

## 📊 Monitoramento e Logs

As funções RPC incluem logs detalhados:
- ✅ Sucesso na execução
- 🔄 Início de operação RPC
- ❌ Erros com contexto detalhado

**Exemplo de logs**:
```
🔄 Using RPC function fn_list_clients for secure data access
✅ RPC fn_list_clients returned 3 active clients
```

## 🚨 Considerações de Segurança

### Permissões
- Todas as funções têm `REVOKE ALL FROM PUBLIC`
- Apenas `authenticated` role tem acesso
- Execução via `SECURITY DEFINER`

### Validação
- Verificação automática de `auth.uid()`
- Filtragem por `org_members`
- Sanitização de parâmetros de entrada

### Auditoria
- Logs de execução no console
- Rastreamento via Supabase Dashboard
- Métricas de performance disponíveis

## 🔧 Manutenção e Updates

### Para adicionar nova função RPC:

1. **Criar migration**:
```sql
CREATE OR REPLACE FUNCTION public.fn_new_function()
RETURNS TABLE (...)
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Lógica da função
END;
$$ LANGUAGE plpgsql;
```

2. **Definir permissões**:
```sql
REVOKE ALL ON FUNCTION public.fn_new_function() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_new_function() TO authenticated;
```

3. **Atualizar DataService**:
```typescript
async newMethod() {
  const { data, error } = await this.supabase.client.rpc('fn_new_function');
  return data;
}
```

4. **Criar função de teste** (opcional):
```sql
CREATE OR REPLACE FUNCTION public.fn_test_new_function(user_email text)
```

## 📈 Próximos Passos

1. **Monitorar Performance**: Acompanhar tempos de resposta das funções RPC
2. **Implementar Cache**: Considerar cache no frontend para dados estáticos
3. **Adicionar Paginação**: Para listas grandes, implementar paginação nas funções RPC
4. **Auditoria Completa**: Adicionar logs de auditoria nas funções RPC
5. **Testes Automatizados**: Criar testes unitários para cada função RPC

## 🎯 Conclusão

As funções RPC fornecem uma camada segura e performática para acesso aos dados, resolvendo os problemas de stack overflow do RLS enquanto mantêm a segurança multi-tenant. A implementação permite evolução gradual do sistema sem quebrar funcionalidades existentes.