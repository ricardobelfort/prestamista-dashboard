-- =============================================
-- SEED DATA - Dados fictícios para demonstração
-- =============================================
-- Este script popula o banco com dados realistas para testes e demonstração
-- Execute apenas em ambiente de desenvolvimento!

-- Limpar dados existentes (cuidado em produção!)
-- DELETE FROM payments;
-- DELETE FROM installments;
-- DELETE FROM loans;
-- DELETE FROM clients;
-- DELETE FROM routes;

DO $$
DECLARE
  v_org_id UUID := '11111111-1111-1111-1111-111111111111'; -- Organização padrão
  v_admin_id UUID;
  v_cobrador_id UUID;
  
  -- IDs de rotas
  v_route_centro_id UUID;
  v_route_norte_id UUID;
  v_route_sul_id UUID;
  
  -- IDs de clientes
  v_client_ids UUID[] := ARRAY[]::UUID[];
  v_client_id UUID;
  
  -- IDs de empréstimos
  v_loan_id UUID;
  v_installment_id UUID;
  
  -- Variáveis auxiliares
  v_start_date DATE;
  v_due_date DATE;
  v_paid_on DATE;
  v_amount DECIMAL(10,2);
  i INTEGER;
  j INTEGER;
  
BEGIN
  -- Buscar IDs dos usuários existentes
  SELECT user_id INTO v_admin_id 
  FROM profiles 
  WHERE default_org = v_org_id 
  ORDER BY created_at 
  LIMIT 1;
  
  -- Se não houver usuário, usar um ID fixo
  IF v_admin_id IS NULL THEN
    v_admin_id := '90b5d1aa-6e89-4286-8ad6-94232395e5ce';
  END IF;
  
  v_cobrador_id := v_admin_id;
  
  RAISE NOTICE 'Usando org_id: %, admin_id: %', v_org_id, v_admin_id;
  
  -- =============================================
  -- 1. CRIAR ROTAS
  -- =============================================
  
  INSERT INTO routes (id, org_id, name, assigned_to, status, created_at)
  VALUES 
    (gen_random_uuid(), v_org_id, 'Rota Centro', v_cobrador_id, 'active', NOW() - INTERVAL '60 days'),
    (gen_random_uuid(), v_org_id, 'Rota Zona Norte', v_cobrador_id, 'active', NOW() - INTERVAL '45 days'),
    (gen_random_uuid(), v_org_id, 'Rota Zona Sul', v_cobrador_id, 'active', NOW() - INTERVAL '30 days')
  RETURNING id INTO v_route_centro_id;
  
  SELECT id INTO v_route_norte_id FROM routes WHERE name = 'Rota Zona Norte' AND org_id = v_org_id;
  SELECT id INTO v_route_sul_id FROM routes WHERE name = 'Rota Zona Sul' AND org_id = v_org_id;
  
  RAISE NOTICE 'Rotas criadas';
  
  -- =============================================
  -- 2. CRIAR CLIENTES (15 clientes)
  -- =============================================
  
  -- Cliente 1 - Bom pagador, sem atrasos
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'Maria Silva Santos', '92991234567', '123.456.789-01', 'Rua das Flores, 123 - Centro', v_route_centro_id, 'active', NOW() - INTERVAL '180 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Cliente 2 - Bom pagador, poucos atrasos
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'João Pedro Oliveira', '92992345678', '234.567.890-12', 'Av. Brasil, 456 - Centro', v_route_centro_id, 'active', NOW() - INTERVAL '150 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Cliente 3 - Pagador regular
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'Ana Carolina Ferreira', '92993456789', '345.678.901-23', 'Rua São José, 789 - Norte', v_route_norte_id, 'active', NOW() - INTERVAL '120 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Cliente 4 - Com alguns atrasos
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'Carlos Eduardo Costa', '92994567890', '456.789.012-34', 'Rua das Acácias, 321 - Norte', v_route_norte_id, 'active', NOW() - INTERVAL '90 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Cliente 5 - Inadimplente
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'Fernanda Souza Lima', '92995678901', '567.890.123-45', 'Av. Principal, 654 - Sul', v_route_sul_id, 'active', NOW() - INTERVAL '60 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Cliente 6 - Novo cliente, primeiro empréstimo
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'Roberto Alves Pereira', '92996789012', '678.901.234-56', 'Rua Nova, 111 - Sul', v_route_sul_id, 'active', NOW() - INTERVAL '30 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Cliente 7 - Cliente com empréstimo quitado
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'Patricia Mendes Rocha', '92997890123', '789.012.345-67', 'Rua do Comércio, 222 - Centro', v_route_centro_id, 'active', NOW() - INTERVAL '200 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Cliente 8 - Múltiplos empréstimos
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'Lucas Martins Dias', '92998901234', '890.123.456-78', 'Av. Secundária, 333 - Norte', v_route_norte_id, 'active', NOW() - INTERVAL '160 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Cliente 9 - Bom histórico
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'Juliana Castro Nunes', '92999012345', '901.234.567-89', 'Rua das Palmeiras, 444 - Sul', v_route_sul_id, 'active', NOW() - INTERVAL '140 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Cliente 10 - Parcialmente inadimplente
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES (gen_random_uuid(), v_org_id, 'Ricardo Barbosa Silva', '92990123456', '012.345.678-90', 'Rua São Pedro, 555 - Centro', v_route_centro_id, 'active', NOW() - INTERVAL '100 days')
  RETURNING id INTO v_client_id;
  v_client_ids := array_append(v_client_ids, v_client_id);
  
  -- Clientes 11-15 - Variados
  INSERT INTO clients (id, org_id, name, phone, document, address, route_id, status, created_at)
  VALUES 
    (gen_random_uuid(), v_org_id, 'Mariana Gomes Souza', '92991111111', '111.222.333-44', 'Rua A, 100', v_route_norte_id, 'active', NOW() - INTERVAL '70 days'),
    (gen_random_uuid(), v_org_id, 'Paulo Henrique Lima', '92992222222', '222.333.444-55', 'Rua B, 200', v_route_sul_id, 'active', NOW() - INTERVAL '50 days'),
    (gen_random_uuid(), v_org_id, 'Camila Rodrigues Paz', '92993333333', '333.444.555-66', 'Rua C, 300', v_route_centro_id, 'active', NOW() - INTERVAL '40 days'),
    (gen_random_uuid(), v_org_id, 'Bruno Santos Costa', '92994444444', '444.555.666-77', 'Rua D, 400', v_route_norte_id, 'active', NOW() - INTERVAL '25 days'),
    (gen_random_uuid(), v_org_id, 'Gabriela Oliveira Melo', '92995555555', '555.666.777-88', 'Rua E, 500', v_route_sul_id, 'active', NOW() - INTERVAL '15 days');
  
  RAISE NOTICE 'Clientes criados: %', array_length(v_client_ids, 1) + 5;
  
  -- =============================================
  -- 3. CRIAR EMPRÉSTIMOS E PARCELAS
  -- =============================================
  
  -- EMPRÉSTIMO 1: Cliente 1 - R$ 2.000, 10 parcelas, 10% juros, totalmente pago
  v_start_date := CURRENT_DATE - INTERVAL '150 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[1],
    2000.00,
    10.0,
    10,
    v_start_date,
    'monthly',
    'Empréstimo para reformas'
  ) INTO v_loan_id;
  
  -- Pagar todas as parcelas (cliente excelente)
  FOR i IN 1..10 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    -- Pagar sempre 2-3 dias antes do vencimento
    v_paid_on := v_due_date - INTERVAL '2 days' - (random() * INTERVAL '1 day');
    
    INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
    VALUES (v_org_id, v_installment_id, v_paid_on, v_amount, 'dinheiro', 'Pagamento em dia');
    
    UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  END LOOP;
  
  RAISE NOTICE 'Empréstimo 1 criado e pago';
  
  -- EMPRÉSTIMO 2: Cliente 1 - R$ 3.500, 8 parcelas, 12% juros, em andamento
  v_start_date := CURRENT_DATE - INTERVAL '60 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[1],
    3500.00,
    12.0,
    8,
    v_start_date,
    'monthly',
    'Empréstimo para investimento'
  ) INTO v_loan_id;
  
  -- Pagar primeiras 4 parcelas
  FOR i IN 1..4 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    v_paid_on := v_due_date - INTERVAL '1 day';
    
    INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
    VALUES (v_org_id, v_installment_id, v_paid_on, v_amount, 'pix', 'Pagamento pontual');
    
    UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  END LOOP;
  
  -- EMPRÉSTIMO 3: Cliente 2 - R$ 1.500, 6 parcelas, 8% juros, com 1 atraso
  v_start_date := CURRENT_DATE - INTERVAL '90 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[2],
    1500.00,
    8.0,
    6,
    v_start_date,
    'monthly',
    'Capital de giro'
  ) INTO v_loan_id;
  
  -- Pagar parcelas com 1 atrasada
  FOR i IN 1..5 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    IF i = 3 THEN
      -- Parcela 3 paga com 5 dias de atraso
      v_paid_on := v_due_date + INTERVAL '5 days';
    ELSE
      v_paid_on := v_due_date - INTERVAL '1 day';
    END IF;
    
    INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
    VALUES (v_org_id, v_installment_id, v_paid_on, v_amount, 'dinheiro', 
            CASE WHEN i = 3 THEN 'Pagamento atrasado' ELSE 'Pagamento normal' END);
    
    UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  END LOOP;
  
  -- EMPRÉSTIMO 4: Cliente 3 - R$ 5.000, 12 parcelas, 15% juros, metade paga
  v_start_date := CURRENT_DATE - INTERVAL '100 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[3],
    5000.00,
    15.0,
    12,
    v_start_date,
    'monthly',
    'Expansão negócio'
  ) INTO v_loan_id;
  
  FOR i IN 1..6 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    -- Alguns pagamentos no prazo, outros atrasados
    IF i % 3 = 0 THEN
      v_paid_on := v_due_date + INTERVAL '3 days';
    ELSE
      v_paid_on := v_due_date;
    END IF;
    
    INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
    VALUES (v_org_id, v_installment_id, v_paid_on, v_amount, 
            CASE WHEN i % 2 = 0 THEN 'pix' ELSE 'dinheiro' END, 'Pagamento');
    
    UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  END LOOP;
  
  -- EMPRÉSTIMO 5: Cliente 4 - R$ 1.000, 5 parcelas, 10% juros, inadimplente
  v_start_date := CURRENT_DATE - INTERVAL '75 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[4],
    1000.00,
    10.0,
    5,
    v_start_date,
    'monthly',
    'Pessoal'
  ) INTO v_loan_id;
  
  -- Pagar apenas primeiras 2 parcelas
  FOR i IN 1..2 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    v_paid_on := v_due_date + INTERVAL '7 days';
    
    INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
    VALUES (v_org_id, v_installment_id, v_paid_on, v_amount, 'dinheiro', 'Pagamento com atraso');
    
    UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  END LOOP;
  
  -- EMPRÉSTIMO 6: Cliente 5 - R$ 2.500, 8 parcelas, 12% juros, muito inadimplente
  v_start_date := CURRENT_DATE - INTERVAL '120 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[5],
    2500.00,
    12.0,
    8,
    v_start_date,
    'monthly',
    'Emergência'
  ) INTO v_loan_id;
  
  -- Pagar apenas primeira parcela
  SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
  FROM installments 
  WHERE loan_id = v_loan_id AND index_no = 1;
  
  INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
  VALUES (v_org_id, v_installment_id, v_due_date + INTERVAL '10 days', v_amount, 'dinheiro', 'Primeiro pagamento');
  
  UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  
  -- EMPRÉSTIMO 7: Cliente 6 - R$ 800, 4 parcelas, 8% juros, novo
  v_start_date := CURRENT_DATE - INTERVAL '20 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[6],
    800.00,
    8.0,
    4,
    v_start_date,
    'monthly',
    'Primeiro empréstimo'
  ) INTO v_loan_id;
  
  -- Sem pagamentos ainda
  
  -- EMPRÉSTIMO 8: Cliente 7 - R$ 1.800, 6 parcelas, 10% juros, quitado
  v_start_date := CURRENT_DATE - INTERVAL '180 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[7],
    1800.00,
    10.0,
    6,
    v_start_date,
    'monthly',
    'Quitação antecipada'
  ) INTO v_loan_id;
  
  -- Pagar todas as parcelas no prazo
  FOR i IN 1..6 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    v_paid_on := v_due_date;
    
    INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
    VALUES (v_org_id, v_installment_id, v_paid_on, v_amount, 'pix', 'Pagamento exato');
    
    UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  END LOOP;
  
  -- EMPRÉSTIMO 9: Cliente 8 - R$ 4.000, 10 parcelas, 12% juros
  v_start_date := CURRENT_DATE - INTERVAL '130 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[8],
    4000.00,
    12.0,
    10,
    v_start_date,
    'monthly',
    'Grande projeto'
  ) INTO v_loan_id;
  
  FOR i IN 1..7 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    v_paid_on := v_due_date - INTERVAL '1 day' + (random() * INTERVAL '4 days');
    
    INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
    VALUES (v_org_id, v_installment_id, v_paid_on, v_amount, 
            CASE WHEN random() > 0.5 THEN 'pix' ELSE 'dinheiro' END, 'Pagamento');
    
    UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  END LOOP;
  
  -- EMPRÉSTIMO 10: Cliente 8 (segundo empréstimo) - R$ 2.000, 8 parcelas
  v_start_date := CURRENT_DATE - INTERVAL '50 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[8],
    2000.00,
    10.0,
    8,
    v_start_date,
    'monthly',
    'Segundo empréstimo'
  ) INTO v_loan_id;
  
  FOR i IN 1..3 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    v_paid_on := v_due_date;
    
    INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
    VALUES (v_org_id, v_installment_id, v_paid_on, v_amount, 'pix', 'Pagamento');
    
    UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  END LOOP;
  
  -- EMPRÉSTIMO 11: Cliente 9 - R$ 3.000, 12 parcelas, 15% juros
  v_start_date := CURRENT_DATE - INTERVAL '110 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[9],
    3000.00,
    15.0,
    12,
    v_start_date,
    'monthly',
    'Investimento'
  ) INTO v_loan_id;
  
  FOR i IN 1..8 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    -- Pagamentos sempre no prazo ou antes
    v_paid_on := v_due_date - INTERVAL '1 day';
    
    INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
    VALUES (v_org_id, v_installment_id, v_paid_on, v_amount, 'pix', 'Cliente pontual');
    
    UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
  END LOOP;
  
  -- EMPRÉSTIMO 12: Cliente 10 - R$ 1.200, 6 parcelas, parcialmente pago
  v_start_date := CURRENT_DATE - INTERVAL '80 days';
  SELECT * FROM create_loan_with_installments(
    v_org_id,
    v_client_ids[10],
    1200.00,
    10.0,
    6,
    v_start_date,
    'monthly',
    'Compras'
  ) INTO v_loan_id;
  
  -- Pagar parcelas com pagamentos parciais em algumas
  FOR i IN 1..4 LOOP
    SELECT id, due_date, amount INTO v_installment_id, v_due_date, v_amount
    FROM installments 
    WHERE loan_id = v_loan_id AND index_no = i;
    
    IF i = 2 OR i = 4 THEN
      -- Pagamentos parciais
      INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
      VALUES (v_org_id, v_installment_id, v_due_date, v_amount * 0.6, 'dinheiro', 'Pagamento parcial');
      
      UPDATE installments SET paid_amount = v_amount * 0.6 WHERE id = v_installment_id;
    ELSE
      -- Pagamento completo
      INSERT INTO payments (org_id, installment_id, paid_on, value, method, notes)
      VALUES (v_org_id, v_installment_id, v_due_date + INTERVAL '2 days', v_amount, 'dinheiro', 'Pagamento');
      
      UPDATE installments SET paid_amount = v_amount WHERE id = v_installment_id;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Empréstimos e pagamentos criados com sucesso!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'RESUMO:';
  RAISE NOTICE '- Rotas: 3';
  RAISE NOTICE '- Clientes: 15';
  RAISE NOTICE '- Empréstimos: 12';
  RAISE NOTICE '- Vários cenários: quitados, em dia, atrasados, inadimplentes';
  RAISE NOTICE '==============================================';
  
END $$;
