
-- Vue de performance commerciale avec filtres temporels et détails financiers
CREATE OR REPLACE VIEW public.v_commercial_performance_detailed AS
SELECT 
    u.id AS agent_id,
    u.email AS agent_email,
    COALESCE((u.raw_user_meta_data ->> 'full_name'::text), (u.email)::text) AS agent_name,
    s.agency_id,
    a.name AS agency_name,
    count(s.id) AS total_sales,
    sum(COALESCE(s.final_price, s.total_price)) AS total_value,
    sum(s.balance) AS total_balance,
    sum(COALESCE(s.final_price, s.total_price) - COALESCE(s.balance, 0)) AS collected_amount,
    count(s.id) FILTER (WHERE s.balance > 0) AS active_sales,
    s.sale_date
FROM auth.users u
LEFT JOIN public.sales s ON u.id = s.prepared_by_id
LEFT JOIN public.agences a ON s.agency_id = a.id
GROUP BY u.id, u.email, u.raw_user_meta_data, s.agency_id, a.name, s.sale_date;

GRANT SELECT ON public.v_commercial_performance_detailed TO authenticated;
GRANT SELECT ON public.v_commercial_performance_detailed TO service_role;
