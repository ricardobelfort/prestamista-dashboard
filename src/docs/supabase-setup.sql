-- =============================================
-- SCRIPT SQL PARA CONFIGURAÇÃO DO SUPABASE
-- SISTEMA DE GESTÃO DE EMPRÉSTIMOS
-- =============================================

-- 1. Criar tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- 2. Criar tabela de rotas de cobrança
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Criar tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  route_id INTEGER REFERENCES routes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 4. Criar tabela de empréstimos
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  principal DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  start_date DATE NOT NULL,
  installments_count INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 5. Criar tabela de parcelas
CREATE TABLE IF NOT EXISTS installments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, paid, overdue
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  installment_id INTEGER REFERENCES installments(id) ON DELETE CASCADE,
  value DECIMAL(10,2) NOT NULL,
  method TEXT NOT NULL, -- cash, pix, card, transfer
  paid_on DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- =============================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para routes
CREATE POLICY "Users can view own routes" ON routes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routes" ON routes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routes" ON routes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes" ON routes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para clients
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para loans
CREATE POLICY "Users can view own loans" ON loans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans" ON loans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans" ON loans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loans" ON loans
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para installments (baseadas no loan)
CREATE POLICY "Users can view own installments" ON installments
  FOR SELECT USING (
    loan_id IN (
      SELECT id FROM loans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own installments" ON installments
  FOR INSERT WITH CHECK (
    loan_id IN (
      SELECT id FROM loans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own installments" ON installments
  FOR UPDATE USING (
    loan_id IN (
      SELECT id FROM loans WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own installments" ON installments
  FOR DELETE USING (
    loan_id IN (
      SELECT id FROM loans WHERE user_id = auth.uid()
    )
  );

-- Políticas para payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =============================================

-- Inserir rotas de exemplo (será executado apenas se houver usuários)
-- INSERT INTO routes (name, assigned_to, user_id) VALUES
-- ('Rota Centro', 'Carlos Oliveira', auth.uid()),
-- ('Rota Norte', 'Ana Paula', auth.uid()),
-- ('Rota Sul', NULL, auth.uid());

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View para empréstimos com informações do cliente
CREATE OR REPLACE VIEW loans_with_clients AS
SELECT 
  l.*,
  c.name as client_name,
  c.phone as client_phone,
  c.address as client_address,
  r.name as route_name
FROM loans l
LEFT JOIN clients c ON l.client_id = c.id
LEFT JOIN routes r ON c.route_id = r.id;

-- View para pagamentos com informações completas
CREATE OR REPLACE VIEW payments_with_details AS
SELECT 
  p.*,
  i.installment_number,
  i.due_date,
  l.principal as loan_principal,
  c.name as client_name
FROM payments p
LEFT JOIN installments i ON p.installment_id = i.id
LEFT JOIN loans l ON i.loan_id = l.id
LEFT JOIN clients c ON l.client_id = c.id;

-- =============================================
-- COMENTÁRIOS FINAIS
-- =============================================

-- Para usar este script:
-- 1. Acesse o painel do Supabase (https://supabase.com)
-- 2. Vá em "SQL Editor"
-- 3. Cole este script e execute
-- 4. As tabelas e políticas serão criadas automaticamente
-- 5. A aplicação Angular funcionará com o banco real