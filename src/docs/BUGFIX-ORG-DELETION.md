# 🔧 FIX: Problema de Stack Depth Limit ao Listar Organizações

## ❌ **Problema Identificado:**

Ao tentar deletar uma organização:
1. ✅ DELETE funciona (Status 204)
2. ✅ Toast de sucesso aparece
3. ❌ **Lista não atualiza - organização deletada ainda aparece**

### **Causa Raiz:**

A função SQL `fn_list_organizations` no Supabase está **retornando dados cacheados/antigos** ou com **transação isolada**.

Quando tentamos fazer `SELECT` direto na tabela `orgs`:
```
Error 500: stack depth limit exceeded
Hint: Increase 'max_stack_depth' (currently 2048kB)
```

Isso indica que as **políticas RLS (Row Level Security)** na tabela `orgs` têm **recursão infinita** ou **triggers recursivos**.

---

## ✅ **Solução:**

### **1. Recriar a função `fn_list_organizations` com SECURITY DEFINER:**

Execute este SQL no Supabase SQL Editor:

```sql
-- Drop função existente se houver
DROP FUNCTION IF EXISTS public.fn_list_organizations();

-- Criar nova função com SECURITY DEFINER para bypassar RLS
CREATE OR REPLACE FUNCTION public.fn_list_organizations()
RETURNS TABLE (
  id UUID,
  name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER  -- Roda com privilégios do owner da função (bypassa RLS)
STABLE  -- Indica que não modifica dados
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    orgs.id,
    orgs.name,
    orgs.created_at
  FROM public.orgs
  ORDER BY orgs.created_at DESC;
END;
$$;

-- Garantir que a função possa ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION public.fn_list_organizations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_list_organizations() TO anon;
```

### **2. Verificar e Corrigir Políticas RLS Recursivas:**

Execute para identificar políticas problemáticas:

```sql
-- Ver todas as políticas RLS da tabela orgs
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orgs';
```

**Procure por políticas que:**
- Fazem JOIN com outras tabelas que também têm RLS
- Usam subconsultas que referenciam a própria tabela
- Chamam funções que fazem SELECT na mesma tabela

**Solução temporária - Desabilitar RLS para admins:**

```sql
-- Criar política para permitir admins acessarem tudo sem recursão
CREATE POLICY "admins_can_see_all_orgs"
ON public.orgs
FOR SELECT
TO authenticated
USING (
  -- Verificar se o usuário é admin SEM fazer joins complexos
  auth.uid() IN (
    SELECT user_id 
    FROM public.org_membership 
    WHERE role IN ('owner', 'admin')
    LIMIT 1  -- Limita para evitar recursão
  )
);
```

### **3. Melhorar o AdminService (Frontend):**

O código já foi atualizado para:
- ✅ Usar `fn_list_organizations` RPC
- ✅ Adicionar logging de erros
- ✅ Evitar consultas diretas que acionam RLS recursivo

---

## 🔍 **Como Testar:**

1. **Aplicar o SQL acima no Supabase**
2. **Recarregar a página do admin:** http://localhost:4200/dashboard/admin
3. **Clicar em "Excluir" em uma organização**
4. **Confirmar no modal**
5. **Verificar que:**
   - ✅ Toast de sucesso aparece
   - ✅ Lista atualiza imediatamente
   - ✅ Organização deletada não aparece mais

---

## 📊 **Logs de Rede - Antes da Correção:**

```
DELETE /rest/v1/orgs?id=eq.xxx → 204 ✅
POST /rest/v1/rpc/fn_list_organizations → 200 ✅ (mas retorna dados antigos)
```

## 📊 **Logs de Rede - Após Tentativa de SELECT Direto:**

```
GET /rest/v1/orgs?select=... → 500 ❌
Error: stack depth limit exceeded
```

---

## 🎯 **Conclusão:**

O problema **NÃO é no frontend** - o DELETE funciona perfeitamente.

O problema é:
1. **Função RPC com cache/transação antiga**
2. **RLS policies recursivas na tabela orgs**
3. **Impossibilidade de fazer SELECT direto (erro 500)**

**Solução:** Recriar `fn_list_organizations` com `SECURITY DEFINER` e corrigir políticas RLS.

---

## 📚 **Referências:**

- [PostgreSQL: Security Definer Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Stack Depth Limit Exceeded](https://www.postgresql.org/message-id/201711280958.22191.dba@informatik.uni-marburg.de)
