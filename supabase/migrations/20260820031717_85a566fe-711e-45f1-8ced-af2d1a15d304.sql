-- Phase A-02: Remboursements, réconciliation et audit

GRANT SELECT, INSERT, UPDATE ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;

DROP POLICY IF EXISTS "Finance roles can view refunds" ON public.refunds;
CREATE POLICY "Finance roles can view refunds" ON public.refunds
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pdg')
  OR public.has_role(auth.uid(), 'comptable') OR public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "Finance roles can create refunds" ON public.refunds;
CREATE POLICY "Finance roles can create refunds" ON public.refunds
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pdg')
  OR public.has_role(auth.uid(), 'comptable') OR public.has_role(auth.uid(), 'super_admin')
);

-- Journalisation automatique des remboursements
CREATE OR REPLACE FUNCTION public.fn_audit_refund_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT balance INTO v_balance FROM public.sales WHERE id = NEW.sale_id;
  INSERT INTO public.audit_finance (
    operation_type, amount, refund_id, sale_id, user_id,
    previous_balance, new_balance, notes
  ) VALUES (
    'remboursement', -NEW.amount, NEW.id, NEW.sale_id, auth.uid(),
    v_balance, v_balance, COALESCE(NEW.reason, 'Remboursement client')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_audit_refund_creation ON public.refunds;
CREATE TRIGGER tr_audit_refund_creation
AFTER INSERT ON public.refunds
FOR EACH ROW EXECUTE FUNCTION public.fn_audit_refund_creation();

-- Le trigger d'audit de paiement doit être unique et fiable (search_path)
CREATE OR REPLACE FUNCTION public.fn_audit_payment_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev_balance NUMERIC;
BEGIN
  SELECT balance INTO v_prev_balance FROM public.sales WHERE id = NEW.sale_id;
  INSERT INTO public.audit_finance (
    operation_type, amount, payment_id, sale_id, user_id,
    previous_balance, new_balance
  ) VALUES (
    'paiement', NEW.amount, NEW.id, NEW.sale_id, auth.uid(),
    v_prev_balance, GREATEST(v_prev_balance - NEW.amount, 0)
  );
  RETURN NEW;
END;
$$;

-- Annulation : libération de parcelle + trace négative du CA contracté
CREATE OR REPLACE FUNCTION public.fn_handle_sale_cancellation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'annule' AND OLD.status <> 'annule' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.sales
      WHERE plot_id = NEW.plot_id AND id <> NEW.id
        AND status IN ('reservation', 'en_cours', 'termine')
    ) THEN
      UPDATE public.plots SET status = 'Disponible' WHERE id = NEW.plot_id;
    END IF;

    UPDATE public.payment_schedules
    SET status = 'Annulé'
    WHERE sale_id = NEW.id AND status <> 'Payé';

    INSERT INTO public.audit_finance (
      operation_type, amount, sale_id, user_id,
      previous_balance, new_balance, notes
    ) VALUES (
      'annulation', -COALESCE(NEW.total_amount, NEW.total_price, 0), NEW.id, auth.uid(),
      OLD.balance, 0, COALESCE(NEW.notes, 'Annulation de vente - Parcelle libérée')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Un seul trigger d'annulation (suppression du doublon)
DROP TRIGGER IF EXISTS tr_on_sale_cancel ON public.sales;