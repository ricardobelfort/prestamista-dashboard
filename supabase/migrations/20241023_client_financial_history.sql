-- Migration: Client Financial History
-- Creates RPC function to get comprehensive financial history of a client

-- Function to get client financial history with score
CREATE OR REPLACE FUNCTION fn_get_client_financial_history(
  p_org_id UUID,
  p_client_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_total_loaned DECIMAL(10,2);
  v_total_paid DECIMAL(10,2);
  v_total_outstanding DECIMAL(10,2);
  v_total_overdue DECIMAL(10,2);
  v_on_time_payments INTEGER;
  v_late_payments INTEGER;
  v_total_payments INTEGER;
  v_payment_score DECIMAL(5,2);
  v_loans JSON;
BEGIN
  -- Calculate totals
  SELECT 
    COALESCE(SUM(l.principal), 0),
    COALESCE(SUM(
      (SELECT COALESCE(SUM(i.paid_amount), 0) 
       FROM installments i 
       WHERE i.loan_id = l.id AND i.org_id = p_org_id)
    ), 0)
  INTO v_total_loaned, v_total_paid
  FROM loans l
  WHERE l.org_id = p_org_id AND l.client_id = p_client_id;

  -- Calculate outstanding amount (total expected - total paid)
  SELECT COALESCE(SUM(i.amount), 0) - v_total_paid
  INTO v_total_outstanding
  FROM installments i
  JOIN loans l ON l.id = i.loan_id
  WHERE l.org_id = p_org_id AND l.client_id = p_client_id;

  -- Calculate overdue amount
  SELECT COALESCE(SUM(i.amount - COALESCE(i.paid_amount, 0)), 0)
  INTO v_total_overdue
  FROM installments i
  JOIN loans l ON l.id = i.loan_id
  WHERE l.org_id = p_org_id 
    AND l.client_id = p_client_id
    AND i.due_date < CURRENT_DATE
    AND i.paid_amount < i.amount;

  -- Calculate payment behavior (on-time vs late)
  SELECT 
    COUNT(*) FILTER (WHERE p.paid_on <= i.due_date),
    COUNT(*) FILTER (WHERE p.paid_on > i.due_date),
    COUNT(*)
  INTO v_on_time_payments, v_late_payments, v_total_payments
  FROM payments p
  JOIN installments i ON i.id = p.installment_id
  JOIN loans l ON l.id = i.loan_id
  WHERE l.org_id = p_org_id AND l.client_id = p_client_id;

  -- Calculate payment score (0-100)
  -- Score based on: payment completion rate (60%) + on-time rate (40%)
  IF v_total_loaned > 0 THEN
    DECLARE
      v_completion_rate DECIMAL(5,2);
      v_on_time_rate DECIMAL(5,2);
    BEGIN
      v_completion_rate := (v_total_paid / (v_total_loaned + (v_total_loaned * 0.1))) * 60; -- Assuming 10% interest
      
      IF v_total_payments > 0 THEN
        v_on_time_rate := (v_on_time_payments::DECIMAL / v_total_payments) * 40;
      ELSE
        v_on_time_rate := 0;
      END IF;
      
      v_payment_score := LEAST(100, v_completion_rate + v_on_time_rate);
    END;
  ELSE
    v_payment_score := 0;
  END IF;

  -- Get all loans with their installments
  SELECT json_agg(
    json_build_object(
      'loan_id', l.id,
      'principal', l.principal,
      'interest_rate', l.interest_rate,
      'start_date', l.start_date,
      'created_at', l.created_at,
      'notes', l.notes,
      'total_installments', (
        SELECT COUNT(*) 
        FROM installments i 
        WHERE i.loan_id = l.id AND i.org_id = p_org_id
      ),
      'paid_installments', (
        SELECT COUNT(*) 
        FROM installments i 
        WHERE i.loan_id = l.id 
          AND i.org_id = p_org_id 
          AND i.paid_amount >= i.amount
      ),
      'total_expected', (
        SELECT COALESCE(SUM(i.amount), 0)
        FROM installments i
        WHERE i.loan_id = l.id AND i.org_id = p_org_id
      ),
      'total_paid', (
        SELECT COALESCE(SUM(i.paid_amount), 0)
        FROM installments i
        WHERE i.loan_id = l.id AND i.org_id = p_org_id
      ),
      'status', CASE
        WHEN (SELECT COUNT(*) FROM installments i WHERE i.loan_id = l.id AND i.org_id = p_org_id AND i.paid_amount >= i.amount) = 
             (SELECT COUNT(*) FROM installments i WHERE i.loan_id = l.id AND i.org_id = p_org_id)
        THEN 'paid'
        WHEN EXISTS (
          SELECT 1 FROM installments i 
          WHERE i.loan_id = l.id 
            AND i.org_id = p_org_id 
            AND i.due_date < CURRENT_DATE 
            AND i.paid_amount < i.amount
        )
        THEN 'overdue'
        ELSE 'active'
      END,
      'installments', (
        SELECT json_agg(
          json_build_object(
            'id', i.id,
            'index_no', i.index_no,
            'amount', i.amount,
            'paid_amount', COALESCE(i.paid_amount, 0),
            'due_date', i.due_date,
            'status', CASE 
              WHEN i.paid_amount >= i.amount THEN 'paid'
              WHEN i.due_date < CURRENT_DATE AND (i.paid_amount IS NULL OR i.paid_amount < i.amount) THEN 'overdue'
              WHEN i.paid_amount > 0 AND i.paid_amount < i.amount THEN 'partial'
              ELSE 'pending'
            END,
            'days_overdue', CASE
              WHEN i.due_date < CURRENT_DATE AND i.paid_amount < i.amount 
              THEN CURRENT_DATE - i.due_date
              ELSE 0
            END,
            'payments', (
              SELECT json_agg(
                json_build_object(
                  'id', p.id,
                  'amount', p.value,
                  'payment_date', p.paid_on,
                  'notes', p.notes
                )
                ORDER BY p.paid_on DESC
              )
              FROM payments p
              WHERE p.installment_id = i.id
            )
          )
          ORDER BY i.index_no
        )
        FROM installments i
        WHERE i.loan_id = l.id AND i.org_id = p_org_id
      )
    )
    ORDER BY l.created_at DESC
  )
  INTO v_loans
  FROM loans l
  WHERE l.org_id = p_org_id AND l.client_id = p_client_id;

  -- Build final result
  v_result := json_build_object(
    'client_id', p_client_id,
    'summary', json_build_object(
      'total_loaned', v_total_loaned,
      'total_paid', v_total_paid,
      'total_outstanding', v_total_outstanding,
      'total_overdue', v_total_overdue,
      'on_time_payments', v_on_time_payments,
      'late_payments', v_late_payments,
      'total_payments', v_total_payments,
      'payment_score', ROUND(v_payment_score, 2)
    ),
    'loans', COALESCE(v_loans, '[]'::json)
  );

  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION fn_get_client_financial_history(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION fn_get_client_financial_history IS 'Get comprehensive financial history of a client including all loans, installments, payments, and payment score';
