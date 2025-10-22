-- =============================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA DESENVOLVIMENTO
-- =============================================

-- OPÇÃO 1: Manter RLS desabilitado para desenvolvimento
-- (RLS já foi desabilitado via MCP - não é necessário executar novamente)

-- OPÇÃO 2: Reabilitar RLS com políticas menos restritivas
-- (Execute apenas se quiser usar RLS em desenvolvimento)

/*
-- Reabilitar RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para desenvolvimento
-- ATENÇÃO: Estas políticas permitem acesso total - apenas para desenvolvimento!

-- Políticas para clientes
DROP POLICY IF EXISTS "dev_clients_select" ON clients;
CREATE POLICY "dev_clients_select" ON clients FOR SELECT USING (true);

-- Políticas para empréstimos  
DROP POLICY IF EXISTS "dev_loans_select" ON loans;
CREATE POLICY "dev_loans_select" ON loans FOR SELECT USING (true);

-- Políticas para pagamentos
DROP POLICY IF EXISTS "dev_payments_select" ON payments;
CREATE POLICY "dev_payments_select" ON payments FOR SELECT USING (true);

-- Políticas para parcelas
DROP POLICY IF EXISTS "dev_installments_select" ON installments;
CREATE POLICY "dev_installments_select" ON installments FOR SELECT USING (true);

-- Políticas para rotas
DROP POLICY IF EXISTS "dev_routes_select" ON routes;
CREATE POLICY "dev_routes_select" ON routes FOR SELECT USING (true);
*/

-- =============================================
-- STATUS ATUAL: RLS DESABILITADO
-- =============================================
-- ✅ RLS desabilitado em todas as tabelas principais
-- ✅ Aplicação pode acessar dados sem autenticação
-- ✅ Ideal para desenvolvimento e testes
-- ⚠️  IMPORTANTE: Reabilitar RLS em produção!

-- =============================================
-- PARA PRODUÇÃO: REABILITAR RLS
-- =============================================
-- 1. Implementar autenticação na aplicação
-- 2. Reabilitar RLS nas tabelas
-- 3. Configurar políticas adequadas por organização
-- 4. Testar com usuários reais autenticados