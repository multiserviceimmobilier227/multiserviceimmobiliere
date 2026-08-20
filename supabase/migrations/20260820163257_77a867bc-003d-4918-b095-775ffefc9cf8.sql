-- 1. Vue consolidée de la rentabilité par lotissement
CREATE OR REPLACE VIEW public.v_lotissement_profitability AS
WITH site_costs AS (
    -- Coûts d'acquisition par lotissement
    SELECT 
        a.lotissement_id,
        SUM(ac.amount) as total_acquisition_cost
    FROM public.acquisitions a
    JOIN public.acquisition_costs ac ON ac.acquisition_id = a.id
    GROUP BY a.lotissement_id
),
site_expenses AS (
    -- Dépenses opérationnelles liées au lotissement
    SELECT 
        project_id as lotissement_id,
        SUM(amount) as total_expenses
    FROM public.expenses
    WHERE status = 'validé' AND project_id IS NOT NULL
    GROUP BY project_id
),
site_sales_potential AS (
    -- Valeur vénale totale (potentiel)
    SELECT 
        l.id as lotissement_id,
        SUM(p.base_price) as total_potential_value,
        COUNT(p.id) as total_plots_count
    FROM public.lotissements l
    JOIN public.zones z ON z.lotissement_id = l.id
    JOIN public.ilots i ON i.zone_id = z.id
    JOIN public.plots p ON p.ilot_id = i.id
    GROUP BY l.id
),
site_sales_actual AS (
    -- Chiffre d'affaires contractualisé et encaissé
    -- Encaissé = final_price - balance (ce qui a été effectivement payé)
    SELECT 
        l.id as lotissement_id,
        SUM(COALESCE(s.final_price, s.total_price)) as total_sold_value,
        SUM(COALESCE(s.final_price, s.total_price) - s.balance) as total_collected_amount,
        COUNT(s.id) as sold_plots_count
    FROM public.lotissements l
    JOIN public.zones z ON z.lotissement_id = l.id
    JOIN public.ilots i ON i.zone_id = z.id
    JOIN public.plots p ON p.ilot_id = i.id
    JOIN public.sales s ON s.plot_id = p.id
    WHERE s.status IN ('en_cours', 'termine')
    GROUP BY l.id
)
SELECT 
    l.id,
    l.name,
    l.location,
    l.agence_id,
    a.name as agence_name,
    COALESCE(sp.total_potential_value, 0) as potential_value,
    COALESCE(sp.total_plots_count, 0) as total_plots,
    COALESCE(sa.total_sold_value, 0) as sold_value,
    COALESCE(sa.total_collected_amount, 0) as collected_amount,
    COALESCE(sa.sold_plots_count, 0) as sold_plots,
    COALESCE(sc.total_acquisition_cost, 0) as acquisition_cost,
    COALESCE(se.total_expenses, 0) as operational_expenses,
    (COALESCE(sc.total_acquisition_cost, 0) + COALESCE(se.total_expenses, 0)) as total_costs,
    (COALESCE(sa.total_collected_amount, 0) - (COALESCE(sc.total_acquisition_cost, 0) + COALESCE(se.total_expenses, 0))) as net_profit,
    CASE 
        WHEN (COALESCE(sc.total_acquisition_cost, 0) + COALESCE(se.total_expenses, 0)) > 0 
        THEN (COALESCE(sa.total_collected_amount, 0) / (COALESCE(sc.total_acquisition_cost, 0) + COALESCE(se.total_expenses, 0))) * 100 
        ELSE 0 
    END as roi_percent
FROM public.lotissements l
LEFT JOIN public.agences a ON l.agence_id = a.id
LEFT JOIN site_sales_potential sp ON sp.lotissement_id = l.id
LEFT JOIN site_sales_actual sa ON sa.lotissement_id = l.id
LEFT JOIN site_costs sc ON sc.lotissement_id = l.id
LEFT JOIN site_expenses se ON se.lotissement_id = l.id;

-- 2. Permissions
GRANT SELECT ON public.v_lotissement_profitability TO authenticated;
GRANT SELECT ON public.v_lotissement_profitability TO service_role;
