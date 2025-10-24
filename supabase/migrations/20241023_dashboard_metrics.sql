-- =============================================
-- FUNÇÕES RPC PARA DASHBOARD - MÉTRICAS FINANCEIRAS
-- =============================================

-- =============================================
-- FUNÇÃO: Obter métricas gerais do dashboard
-- =============================================

CREATE OR REPLACE FUNCTION fn_get_dashboard_metrics(p_org_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_loaned DECIMAL(10,2);
  v_total_received DECIMAL(10,2);
  v_total_expected DECIMAL(10,2);
  v_total_overdue DECIMAL(10,2);
  v_active_loans INTEGER;
  v_total_clients INTEGER;
  v_overdue_installments INTEGER;
BEGIN
  -- Total emprestado (principal de empréstimos ativos)
  SELECT COALESCE(SUM(principal), 0)
  INTO v_total_loaned
  FROM loans
  WHERE org_id = p_org_id
    AND status = 'active';

  -- Total recebido (soma de paid_amount de todas as parcelas)
  SELECT COALESCE(SUM(paid_amount), 0)
  INTO v_total_received
  FROM installments i
  INNER JOIN loans l ON i.loan_id = l.id
  WHERE l.org_id = p_org_id
    AND l.status = 'active';

  -- Total esperado (soma do amount de todas as parcelas de empréstimos ativos)
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_expected
  FROM installments i
  INNER JOIN loans l ON i.loan_id = l.id
  WHERE l.org_id = p_org_id
    AND l.status = 'active';

  -- Total vencido (soma do valor restante de parcelas vencidas)
  SELECT COALESCE(SUM(amount - COALESCE(paid_amount, 0)), 0)
  INTO v_total_overdue
  FROM installments i
  INNER JOIN loans l ON i.loan_id = l.id
  WHERE l.org_id = p_org_id
    AND l.status = 'active'
    AND i.due_date < CURRENT_DATE
    AND COALESCE(i.paid_amount, 0) < i.amount;

  -- Número de empréstimos ativos
  SELECT COUNT(*)
  INTO v_active_loans
  FROM loans
  WHERE org_id = p_org_id
    AND status = 'active';

  -- Número de clientes ativos
  SELECT COUNT(DISTINCT c.id)
  INTO v_total_clients
  FROM clients c
  WHERE c.org_id = p_org_id
    AND c.status = 'active';

  -- Número de parcelas vencidas
  SELECT COUNT(*)
  INTO v_overdue_installments
  FROM installments i
  INNER JOIN loans l ON i.loan_id = l.id
  WHERE l.org_id = p_org_id
    AND l.status = 'active'
    AND i.due_date < CURRENT_DATE
    AND COALESCE(i.paid_amount, 0) < i.amount;

  RETURN json_build_object(
    'total_loaned', v_total_loaned,
    'total_received', v_total_received,
    'total_expected', v_total_expected,
    'total_overdue', v_total_overdue,
    'profit', v_total_received - v_total_loaned,
    'expected_profit', v_total_expected - v_total_loaned,
    'active_loans', v_active_loans,
    'total_clients', v_total_clients,
    'overdue_installments', v_overdue_installments,
    'default_rate', CASE 
      WHEN v_total_expected > 0 
      THEN ROUND((v_total_overdue / v_total_expected * 100)::numeric, 2)
      ELSE 0 
    END
  );
END;
$$;

GRANT EXECUTE ON FUNCTION fn_get_dashboard_metrics(UUID) TO authenticated;

-- =============================================
-- FUNÇÃO: Obter evolução mensal de empréstimos e pagamentos
-- =============================================

CREATE OR REPLACE FUNCTION fn_get_monthly_evolution(p_org_id UUID, p_months INTEGER DEFAULT 6)
RETURNS TABLE(
  month_date DATE,
  month_label TEXT,
  total_loaned DECIMAL(10,2),
  total_received DECIMAL(10,2),
  net_profit DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT 
      DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month' * generate_series(0, p_months - 1))::DATE AS month_start
  ),
  loans_by_month AS (
    SELECT 
      DATE_TRUNC('month', l.start_date)::DATE AS month,
      SUM(l.principal) AS loaned
    FROM loans l
    WHERE l.org_id = p_org_id
      AND l.start_date >= CURRENT_DATE - INTERVAL '1 month' * p_months
    GROUP BY DATE_TRUNC('month', l.start_date)
  ),
  payments_by_month AS (
    SELECT 
      DATE_TRUNC('month', p.paid_on)::DATE AS month,
      SUM(p.value) AS received
    FROM payments p
    WHERE p.org_id = p_org_id
      AND p.paid_on >= CURRENT_DATE - INTERVAL '1 month' * p_months
    GROUP BY DATE_TRUNC('month', p.paid_on)
  )
  SELECT 
    m.month_start AS month_date,
    TO_CHAR(m.month_start, 'Mon/YY') AS month_label,
    COALESCE(l.loaned, 0) AS total_loaned,
    COALESCE(p.received, 0) AS total_received,
    COALESCE(p.received, 0) - COALESCE(l.loaned, 0) AS net_profit
  FROM months m
  LEFT JOIN loans_by_month l ON l.month = m.month_start
  LEFT JOIN payments_by_month p ON p.month = m.month_start
  ORDER BY m.month_start;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_get_monthly_evolution(UUID, INTEGER) TO authenticated;

-- =============================================
-- FUNÇÃO: Obter parcelas vencendo nos próximos dias
-- =============================================

CREATE OR REPLACE FUNCTION fn_get_upcoming_installments(p_org_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE(
  installment_id UUID,
  loan_id UUID,
  client_id UUID,
  client_name TEXT,
  index_no INTEGER,
  due_date DATE,
  amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  remaining_amount DECIMAL(10,2),
  days_until_due INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id AS installment_id,
    i.loan_id,
    c.id AS client_id,
    c.name AS client_name,
    i.index_no,
    i.due_date,
    i.amount,
    COALESCE(i.paid_amount, 0) AS paid_amount,
    i.amount - COALESCE(i.paid_amount, 0) AS remaining_amount,
    (i.due_date - CURRENT_DATE)::INTEGER AS days_until_due,
    CASE 
      WHEN i.paid_amount >= i.amount THEN 'paid'
      WHEN i.due_date < CURRENT_DATE THEN 'overdue'
      ELSE 'pending'
    END AS status
  FROM installments i
  INNER JOIN loans l ON i.loan_id = l.id
  INNER JOIN clients c ON l.client_id = c.id
  WHERE l.org_id = p_org_id
    AND l.status = 'active'
    AND i.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * p_days
    AND COALESCE(i.paid_amount, 0) < i.amount
  ORDER BY i.due_date ASC, c.name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_get_upcoming_installments(UUID, INTEGER) TO authenticated;

-- =============================================
-- FUNÇÃO: Obter top clientes por valor de empréstimo
-- =============================================

CREATE OR REPLACE FUNCTION fn_get_top_clients(p_org_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  client_id UUID,
  client_name TEXT,
  total_loans INTEGER,
  total_borrowed DECIMAL(10,2),
  total_paid DECIMAL(10,2),
  outstanding_balance DECIMAL(10,2),
  payment_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS client_id,
    c.name AS client_name,
    COUNT(DISTINCT l.id)::INTEGER AS total_loans,
    COALESCE(SUM(l.principal), 0) AS total_borrowed,
    COALESCE(SUM(
      (SELECT SUM(i.paid_amount) 
       FROM installments i 
       WHERE i.loan_id = l.id)
    ), 0) AS total_paid,
    COALESCE(SUM(
      (SELECT SUM(i.amount - COALESCE(i.paid_amount, 0)) 
       FROM installments i 
       WHERE i.loan_id = l.id)
    ), 0) AS outstanding_balance,
    CASE 
      WHEN SUM(l.principal) > 0 
      THEN ROUND((COALESCE(SUM(
        (SELECT SUM(i.paid_amount) 
         FROM installments i 
         WHERE i.loan_id = l.id)
      ), 0) / SUM(l.principal) * 100)::numeric, 2)
      ELSE 0 
    END AS payment_rate
  FROM clients c
  INNER JOIN loans l ON c.id = l.client_id
  WHERE c.org_id = p_org_id
    AND l.status = 'active'
  GROUP BY c.id, c.name
  ORDER BY total_borrowed DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_get_top_clients(UUID, INTEGER) TO authenticated;

-- =============================================
-- COMENTÁRIOS
-- =============================================

COMMENT ON FUNCTION fn_get_dashboard_metrics IS 'Retorna métricas gerais do dashboard: total emprestado, recebido, inadimplência, etc.';
COMMENT ON FUNCTION fn_get_monthly_evolution IS 'Retorna evolução mensal de empréstimos e pagamentos para gráficos';
COMMENT ON FUNCTION fn_get_upcoming_installments IS 'Retorna parcelas que vencem nos próximos N dias';
COMMENT ON FUNCTION fn_get_top_clients IS 'Retorna top clientes por valor de empréstimo';
