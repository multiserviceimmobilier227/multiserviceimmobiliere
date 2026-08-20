
-- Migration : Phase A-04 - Certification et Rapports
-- Création d'une fonction de vérification de l'intégrité financière (Health Check)

CREATE OR REPLACE FUNCTION public.check_financial_integrity()
RETURNS TABLE (
    total_payments numeric,
    total_refunds numeric,
    audit_sum numeric,
    is_consistent boolean,
    mismatch_amount numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_payments numeric;
    v_refunds numeric;
    v_audit numeric;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO v_payments FROM public.payments;
    SELECT COALESCE(SUM(amount), 0) INTO v_refunds FROM public.refunds;
    -- Note: audit_finance stocke les montants signés ou catégorisés.
    -- On somme les types financiers impactant le cash.
    SELECT COALESCE(SUM(
        CASE 
            WHEN operation_type IN ('PAIEMENT', 'PAYMENT') THEN amount 
            WHEN operation_type IN ('REMBOURSEMENT', 'REFUND') THEN -amount
            ELSE 0 
        END
    ), 0) INTO v_audit FROM public.audit_finance;

    total_payments := v_payments;
    total_refunds := v_refunds;
    audit_sum := v_audit;
    mismatch_amount := (v_payments - v_refunds) - v_audit;
    is_consistent := (mismatch_amount = 0);

    RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_financial_integrity() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_financial_integrity() TO service_role;
