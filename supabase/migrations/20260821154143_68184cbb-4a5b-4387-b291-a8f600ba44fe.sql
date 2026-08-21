-- LOT 2 : Sécurité
ALTER TABLE public.audit_finance_corrections ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.audit_finance_corrections TO authenticated;
GRANT ALL ON public.audit_finance_corrections TO service_role;
CREATE POLICY "PDG peut consulter les corrections" ON public.audit_finance_corrections
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'pdg'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Utilisateurs authentifies peuvent tracer une correction" ON public.audit_finance_corrections
  FOR INSERT TO authenticated WITH CHECK (corrected_by = auth.uid());

ALTER VIEW public.v_financial_summary SET (security_invoker = true);
ALTER VIEW public.v_sale_arrears SET (security_invoker = true);
ALTER VIEW public.v_lotissement_profitability SET (security_invoker = true);
ALTER VIEW public.v_commercial_performance_detailed SET (security_invoker = true);

ALTER FUNCTION public.fn_check_sale_schedule_consistency() SET search_path = public;

-- LOT 3 : Déduplication des triggers d'audit (doublons avec audit_<table>_trigger)
DROP TRIGGER IF EXISTS audit_trigger ON public.clients;
DROP TRIGGER IF EXISTS audit_trigger ON public.payments;
DROP TRIGGER IF EXISTS audit_trigger ON public.plots;
DROP TRIGGER IF EXISTS audit_trigger ON public.sales;
DROP TRIGGER IF EXISTS audit_trigger ON public.sites;
DROP TRIGGER IF EXISTS tr_sync_cash_journal_balance ON public.expenses;
DROP TRIGGER IF EXISTS tr_notify_pdg_on_large_expense ON public.expenses;

-- Fonctions orphelines
DROP FUNCTION IF EXISTS public.fn_sync_cash_journal_balance();
DROP FUNCTION IF EXISTS public.fn_lock_closed_cash_day();
DROP FUNCTION IF EXISTS public.fn_prevent_expense_deletion();
DROP FUNCTION IF EXISTS public.fn_protect_plot_status();
DROP FUNCTION IF EXISTS public.fn_update_late_schedules();
DROP FUNCTION IF EXISTS public.fn_notify_pdg_on_cash_discrepancy();
DROP FUNCTION IF EXISTS public.fn_notify_pdg_on_large_expense();
DROP FUNCTION IF EXISTS public.fn_audit_integrity_violation();

-- LOT 4 : Vues mortes
DROP VIEW IF EXISTS public.lotissement_profitability;
DROP VIEW IF EXISTS public.v_commercial_performance;

-- LOT 4bis : Remboursements (couche manquante référencée par le code)
ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS total_to_refund numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_status text NOT NULL DEFAULT 'Aucun';

ALTER TABLE public.refunds
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id),
  ADD COLUMN IF NOT EXISTS method text,
  ADD COLUMN IF NOT EXISTS reference text;

CREATE OR REPLACE FUNCTION public.fn_open_refund_claim_on_cancellation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_paid numeric;
  v_refunded numeric;
BEGIN
  IF NEW.status = 'annule' AND OLD.status <> 'annule' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_paid FROM public.payments WHERE sale_id = NEW.id;
    SELECT COALESCE(SUM(amount), 0) INTO v_refunded FROM public.refunds WHERE sale_id = NEW.id;

    NEW.total_to_refund := GREATEST(v_paid - v_refunded, 0);
    NEW.refund_status := CASE WHEN NEW.total_to_refund > 0 THEN 'En cours' ELSE 'Aucun' END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_open_refund_claim_on_cancellation ON public.sales;
CREATE TRIGGER tr_open_refund_claim_on_cancellation
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.fn_open_refund_claim_on_cancellation();

CREATE OR REPLACE VIEW public.v_pending_refunds
WITH (security_invoker = true) AS
SELECT
  s.id AS sale_id,
  s.client_id,
  c.first_name || ' ' || c.last_name AS client_name,
  c.phone AS client_phone,
  p.plot_number,
  s.total_to_refund,
  COALESCE(r.total_refunded, 0) AS total_refunded,
  s.total_to_refund - COALESCE(r.total_refunded, 0) AS remaining_amount,
  s.refund_status,
  s.updated_at AS cancelled_at
FROM public.sales s
JOIN public.clients c ON c.id = s.client_id
JOIN public.plots p ON p.id = s.plot_id
LEFT JOIN (
  SELECT sale_id, SUM(amount) AS total_refunded FROM public.refunds GROUP BY sale_id
) r ON r.sale_id = s.id
WHERE s.status = 'annule' AND s.total_to_refund > 0;

GRANT SELECT ON public.v_pending_refunds TO authenticated;