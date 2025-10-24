-- =============================================
-- FUNÇÃO RPC: Criar empréstimo e gerar parcelas automaticamente
-- Sistema: Tabela Price (parcelas fixas)
-- =============================================

-- Função para calcular e criar parcelas automaticamente
CREATE OR REPLACE FUNCTION create_loan_with_installments(
  p_org_id UUID,
  p_client_id UUID,
  p_principal DECIMAL(10,2),
  p_interest_rate DECIMAL(5,2),
  p_start_date DATE,
  p_installments_count INTEGER,
  p_notes TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_loan_id UUID;
  v_monthly_rate DECIMAL(10,6);
  v_installment_amount DECIMAL(10,2);
  v_due_date DATE;
  v_counter INTEGER;
BEGIN
  -- Validações
  IF p_principal <= 0 THEN
    RAISE EXCEPTION 'Principal amount must be greater than zero';
  END IF;
  
  IF p_interest_rate < 0 THEN
    RAISE EXCEPTION 'Interest rate cannot be negative';
  END IF;
  
  IF p_installments_count <= 0 THEN
    RAISE EXCEPTION 'Number of installments must be greater than zero';
  END IF;

  -- Criar o empréstimo
  INSERT INTO loans (
    org_id,
    client_id,
    principal,
    interest_rate,
    interest,
    start_date,
    installments_count,
    status,
    notes
  ) VALUES (
    p_org_id,
    p_client_id,
    p_principal,
    p_interest_rate,
    'simple',
    p_start_date,
    p_installments_count,
    'active',
    p_notes
  )
  RETURNING id INTO v_loan_id;

  -- Calcular taxa mensal (taxa anual / 12 / 100)
  v_monthly_rate := p_interest_rate / 12 / 100;

  -- Calcular valor da parcela usando fórmula da Tabela Price
  -- PMT = PV × [ i × (1 + i)^n ] / [ (1 + i)^n - 1 ]
  IF v_monthly_rate > 0 THEN
    v_installment_amount := p_principal * 
      (v_monthly_rate * POWER(1 + v_monthly_rate, p_installments_count)) /
      (POWER(1 + v_monthly_rate, p_installments_count) - 1);
  ELSE
    -- Se taxa for 0, divide igualmente
    v_installment_amount := p_principal / p_installments_count;
  END IF;

  -- Arredondar para 2 casas decimais
  v_installment_amount := ROUND(v_installment_amount, 2);

  -- Gerar as parcelas
  FOR v_counter IN 1..p_installments_count LOOP
    -- Calcular data de vencimento (primeiro vencimento 30 dias após o início)
    v_due_date := p_start_date + INTERVAL '1 month' * v_counter;

    -- Inserir parcela
    INSERT INTO installments (
      org_id,
      loan_id,
      index_no,
      due_date,
      amount,
      paid_amount,
      late_fee
    ) VALUES (
      p_org_id,
      v_loan_id,
      v_counter,
      v_due_date,
      v_installment_amount,
      0,
      0
    );
  END LOOP;

  -- Retornar informações do empréstimo criado
  RETURN json_build_object(
    'loan_id', v_loan_id,
    'installment_amount', v_installment_amount,
    'total_amount', v_installment_amount * p_installments_count,
    'success', true
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating loan: %', SQLERRM;
END;
$$;

-- Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION create_loan_with_installments(UUID, UUID, DECIMAL, DECIMAL, DATE, INTEGER, TEXT) TO authenticated;

-- =============================================
-- COMENTÁRIOS
-- =============================================

COMMENT ON FUNCTION create_loan_with_installments IS 'Cria um empréstimo e gera automaticamente todas as parcelas usando a Tabela Price';

