
-- Migration : Phase A-03 - Excellence Analytique
-- Optimisation de la vue financière consolidée

CREATE OR REPLACE VIEW public.v_financial_summary AS
WITH sale_stats AS (
    SELECT 
        COALESCE(SUM(total_amount), 0) AS total_ca_potential,
        COALESCE(SUM(total_amount - balance), 0) AS total_collected_from_sales,
        COUNT(*) AS active_sales_count
    FROM public.sales
    WHERE status IN ('reservation', 'en_cours', 'termine')
),
refund_stats AS (
    SELECT COALESCE(SUM(amount), 0) AS total_refunded
    FROM public.refunds
),
inventory_stats AS (
    SELECT COALESCE(SUM(surface_area * COALESCE(base_price, 0)), 0) AS stock_value
    FROM public.plots
    WHERE status = 'Disponible'
),
monthly_stats AS (
    SELECT 
        COALESCE(SUM(CASE WHEN sale_date >= date_trunc('month', current_date) THEN total_amount ELSE 0 END), 0) as monthly_sales
    FROM public.sales
    WHERE status IN ('reservation', 'en_cours', 'termine')
),
monthly_payments AS (
    SELECT COALESCE(SUM(amount), 0) as monthly_payments_sum
    FROM public.payments
    WHERE payment_date >= date_trunc('month', current_date)
)
SELECT 
    s.total_ca_potential,
    (s.total_collected_from_sales - r.total_refunded) AS total_collected_net,
    (s.total_ca_potential - (s.total_collected_from_sales - r.total_refunded)) AS total_outstanding,
    s.active_sales_count,
    i.stock_value,
    CASE 
        WHEN s.total_ca_potential > 0 THEN ((s.total_collected_from_sales - r.total_refunded) / s.total_ca_potential) * 100
        ELSE 0 
    END AS recovery_rate,
    m.monthly_sales,
    mp.monthly_payments_sum as monthly_collections
FROM sale_stats s, refund_stats r, inventory_stats i, monthly_stats m, monthly_payments mp;

GRANT SELECT ON public.v_financial_summary TO authenticated;
GRANT SELECT ON public.v_financial_summary TO service_role;
