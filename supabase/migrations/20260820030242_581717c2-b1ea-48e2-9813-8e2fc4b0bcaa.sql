-- 1. Vue pour le résumé financier consolidé
CREATE OR REPLACE VIEW public.v_financial_summary AS
SELECT 
    COALESCE(SUM(total_amount) FILTER (WHERE status != 'annule'), 0) as total_ca_potential,
    COALESCE(SUM(deposit_amount) FILTER (WHERE status != 'annule'), 0) + 
    COALESCE((SELECT SUM(amount) FROM public.payments), 0) as total_collected,
    COALESCE(SUM(balance) FILTER (WHERE status != 'annule'), 0) as total_outstanding,
    (SELECT COALESCE(SUM(base_price), 0) FROM public.plots WHERE status = 'Disponible') as inventory_value
FROM public.sales;

-- 2. Grant access
GRANT SELECT ON public.v_financial_summary TO authenticated;
GRANT ALL ON public.v_financial_summary TO service_role;

-- 3. Table pour les remboursements (Gestion des annulations propres)
CREATE TABLE IF NOT EXISTS public.refunds (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id uuid REFERENCES public.sales(id) NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0),
    refund_date timestamp with time zone DEFAULT now(),
    reason text,
    processed_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now()
);

GRANT SELECT, INSERT ON public.refunds TO authenticated;
GRANT ALL ON public.refunds TO service_role;

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can do everything on refunds"
ON public.refunds FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can view refunds"
ON public.refunds FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
