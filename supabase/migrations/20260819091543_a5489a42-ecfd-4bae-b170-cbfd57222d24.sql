-- 1. Add management policy for acquisition_costs
CREATE POLICY "PDG and Comptable can manage acquisition costs" ON public.acquisition_costs
    FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'comptable') OR private.has_role(auth.uid(), 'informaticien'));

-- 2. Recreate the view to ensure it is not SECURITY DEFINER (default is security invoker)
-- The lint might be triggered if it was created in a way that implies definer rights.
DROP VIEW IF EXISTS public.lotissement_profitability;
CREATE VIEW public.lotissement_profitability AS
SELECT 
    l.id AS lotissement_id,
    l.name AS lotissement_name,
    COALESCE(SUM(a.prix_principal), 0) + COALESCE(SUM(ac.amount), 0) AS total_investment,
    (SELECT COALESCE(SUM(p.base_price), 0) FROM public.plots p JOIN public.ilots i ON p.ilot_id = i.id JOIN public.zones z ON i.zone_id = z.id WHERE z.lotissement_id = l.id) AS potential_revenue,
    (SELECT COUNT(*) FROM public.plots p JOIN public.ilots i ON p.ilot_id = i.id JOIN public.zones z ON i.zone_id = z.id WHERE z.lotissement_id = l.id) AS total_plots
FROM 
    public.lotissements l
LEFT JOIN 
    public.acquisitions a ON l.id = a.lotissement_id
LEFT JOIN 
    public.acquisition_costs ac ON a.id = ac.acquisition_id
GROUP BY 
    l.id, l.name;

GRANT SELECT ON public.lotissement_profitability TO authenticated;

-- 3. Double check process_audit_log restriction
REVOKE EXECUTE ON FUNCTION private.process_audit_log() FROM authenticated;
REVOKE EXECUTE ON FUNCTION private.process_audit_log() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.process_audit_log() TO service_role;
