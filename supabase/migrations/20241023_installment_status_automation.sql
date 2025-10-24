-- =============================================
-- VIEW: Parcelas com status calculado dinamicamente
-- =============================================

-- Criar uma view que mostra parcelas com status atualizado em tempo real
CREATE OR REPLACE VIEW vw_installments_with_status AS
SELECT 
  i.*,
  CASE 
    WHEN i.paid_amount >= i.amount THEN 'paid'
    WHEN i.due_date < CURRENT_DATE AND (i.paid_amount IS NULL OR i.paid_amount < i.amount) THEN 'overdue'
    WHEN i.paid_amount > 0 AND i.paid_amount < i.amount THEN 'partial'
    ELSE 'pending'
  END AS current_status,
  i.due_date - CURRENT_DATE AS days_until_due,
  CASE 
    WHEN i.due_date < CURRENT_DATE AND (i.paid_amount IS NULL OR i.paid_amount < i.amount)
    THEN CURRENT_DATE - i.due_date 
    ELSE 0 
  END AS days_overdue,
  COALESCE(i.paid_amount, 0) AS total_paid,
  i.amount - COALESCE(i.paid_amount, 0) AS remaining_amount
FROM installments i;

-- Conceder permissões
GRANT SELECT ON vw_installments_with_status TO authenticated;

-- =============================================
-- TRIGGER: Atualizar paid_amount ao inserir pagamento
-- =============================================

-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION fn_update_installment_paid_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_paid DECIMAL(10,2);
BEGIN
  -- Calcular total pago
  SELECT COALESCE(SUM(value), 0)
  INTO v_total_paid
  FROM payments
  WHERE installment_id = NEW.installment_id;

  -- Atualizar paid_amount e paid_at da parcela
  UPDATE installments
  SET 
    paid_amount = v_total_paid,
    paid_at = CASE 
      WHEN v_total_paid >= amount THEN CURRENT_DATE
      ELSE NULL
    END
  WHERE id = NEW.installment_id;

  RETURN NEW;
END;
$$;

-- Criar trigger que dispara após inserir um pagamento
DROP TRIGGER IF EXISTS trigger_update_installment_paid_amount ON payments;
CREATE TRIGGER trigger_update_installment_paid_amount
  AFTER INSERT ON payments
  FOR EACH ROW
  WHEN (NEW.installment_id IS NOT NULL)
  EXECUTE FUNCTION fn_update_installment_paid_amount();

-- =============================================
-- TRIGGER: Atualizar paid_amount ao deletar pagamento
-- =============================================

CREATE OR REPLACE FUNCTION fn_update_installment_paid_amount_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_paid DECIMAL(10,2);
  v_installment_amount DECIMAL(10,2);
BEGIN
  -- Obter valor da parcela
  SELECT amount INTO v_installment_amount
  FROM installments
  WHERE id = OLD.installment_id;

  -- Calcular total pago (após exclusão)
  SELECT COALESCE(SUM(value), 0)
  INTO v_total_paid
  FROM payments
  WHERE installment_id = OLD.installment_id;

  -- Atualizar paid_amount e paid_at da parcela
  UPDATE installments
  SET 
    paid_amount = v_total_paid,
    paid_at = CASE 
      WHEN v_total_paid >= v_installment_amount THEN CURRENT_DATE
      ELSE NULL
    END
  WHERE id = OLD.installment_id;

  RETURN OLD;
END;
$$;

-- Criar trigger que dispara após deletar um pagamento
DROP TRIGGER IF EXISTS trigger_update_installment_paid_amount_on_delete ON payments;
CREATE TRIGGER trigger_update_installment_paid_amount_on_delete
  AFTER DELETE ON payments
  FOR EACH ROW
  WHEN (OLD.installment_id IS NOT NULL)
  EXECUTE FUNCTION fn_update_installment_paid_amount_on_delete();

-- =============================================
-- FUNÇÃO: Não há necessidade de batch update
-- O status é calculado dinamicamente pela view
-- =============================================

-- =============================================
-- COMENTÁRIOS
-- =============================================

COMMENT ON VIEW vw_installments_with_status IS 'View que mostra parcelas com status calculado em tempo real, incluindo dias de atraso e valor restante';
COMMENT ON FUNCTION fn_update_installment_paid_amount IS 'Trigger function que atualiza o paid_amount da parcela quando um pagamento é inserido';
COMMENT ON FUNCTION fn_update_installment_paid_amount_on_delete IS 'Trigger function que atualiza o paid_amount da parcela quando um pagamento é deletado';
