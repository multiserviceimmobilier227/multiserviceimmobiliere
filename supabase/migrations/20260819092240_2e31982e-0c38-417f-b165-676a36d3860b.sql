
-- 1. Sécurisation des fonctions
REVOKE EXECUTE ON FUNCTION private.prevent_validated_edit() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC;

-- 2. Correction de la vue
DROP VIEW IF EXISTS public.lotissement_profitability;
CREATE OR REPLACE VIEW public.lotissement_profitability WITH (security_invoker = on) AS
WITH stats AS (
    SELECT 
        l.id as lotissement_id,
        l.name,
        l.location,
        (SELECT COALESCE(SUM(prix_principal), 0) FROM public.acquisitions WHERE lotissement_id = l.id) + 
        (SELECT COALESCE(SUM(amount), 0) FROM public.acquisition_costs ac WHERE ac.acquisition_id IN (SELECT id FROM public.acquisitions WHERE lotissement_id = l.id)) as total_investment,
        (SELECT COALESCE(SUM(base_price), 0) FROM public.plots p WHERE p.ilot_id IN (SELECT i.id FROM public.ilots i JOIN public.zones z ON i.zone_id = z.id WHERE z.lotissement_id = l.id)) as potential_revenue
    FROM public.lotissements l
)
SELECT 
    *,
    CASE 
        WHEN total_investment > 0 THEN ((potential_revenue - total_investment) / total_investment) * 100 
        ELSE 0 
    END as margin_percentage
FROM stats;

GRANT SELECT ON public.lotissement_profitability TO authenticated;
