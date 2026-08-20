-- 1. Ajout du rôle comptable si manquant
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND 'comptable' = ANY(enum_range(NULL::app_role)::text[])) THEN
    ALTER TYPE public.app_role ADD VALUE 'comptable';
  END IF;
END $$;

-- 2. Création de la table audit_finance
CREATE TABLE IF NOT EXISTS public.audit_finance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    operation_type TEXT NOT NULL,
    initial_amount NUMERIC(15,2) DEFAULT 0 NOT NULL,
    final_amount NUMERIC(15,2) DEFAULT 0 NOT NULL,
    difference NUMERIC(15,2) GENERATED ALWAYS AS (final_amount - initial_amount) STORED,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    agency_id UUID REFERENCES public.agences(id)
);

-- 3. Grants
GRANT SELECT, INSERT ON public.audit_finance TO authenticated;
GRANT ALL ON public.audit_finance TO service_role;

-- 4. RLS pour audit_finance
ALTER TABLE public.audit_finance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Financial roles can view audit" ON public.audit_finance;
CREATE POLICY "Financial roles can view audit" ON public.audit_finance
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'pdg') OR 
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'comptable')
);

DROP POLICY IF EXISTS "Financial roles can insert audit" ON public.audit_finance;
CREATE POLICY "Financial roles can insert audit" ON public.audit_finance
FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'pdg') OR 
  public.has_role(auth.uid(), 'super_admin') OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'comptable')
);

-- 5. Mise à jour de la vue financière consolidée
DROP VIEW IF EXISTS public.v_financial_summary;
CREATE OR REPLACE VIEW public.v_financial_summary AS
WITH sale_stats AS (
    SELECT 
        SUM(CASE WHEN status != 'annule' THEN total_amount ELSE 0 END) as total_ca_potential,
        SUM(CASE WHEN status != 'annule' THEN (total_amount - balance) ELSE 0 END) as total_collected_from_sales,
        COUNT(*) FILTER (WHERE status != 'annule') as active_sales_count
    FROM public.sales
),
refund_stats AS (
    SELECT COALESCE(SUM(amount), 0) as total_refunded FROM public.refunds
),
inventory_stats AS (
    SELECT 
        COALESCE(SUM(surface_area * COALESCE(base_price, 0)), 0) as stock_value
    FROM public.plots
    WHERE status = 'Disponible'
)
SELECT 
    COALESCE(s.total_ca_potential, 0) as total_ca_potential,
    COALESCE(s.total_collected_from_sales, 0) - COALESCE(r.total_refunded, 0) as total_collected_net,
    COALESCE(s.total_ca_potential, 0) - (COALESCE(s.total_collected_from_sales, 0) - COALESCE(r.total_refunded, 0)) as total_outstanding,
    COALESCE(s.active_sales_count, 0) as active_sales_count,
    COALESCE(i.stock_value, 0) as stock_value,
    CASE 
        WHEN COALESCE(s.total_ca_potential, 0) > 0 THEN ((COALESCE(s.total_collected_from_sales, 0) - COALESCE(r.total_refunded, 0)) / s.total_ca_potential) * 100 
        ELSE 0 
    END as recovery_rate
FROM sale_stats s, refund_stats r, inventory_stats i;

GRANT SELECT ON public.v_financial_summary TO authenticated;
