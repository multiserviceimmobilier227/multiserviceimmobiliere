
CREATE OR REPLACE VIEW public.v_commercial_performance AS
SELECT 
    u.id as agent_id,
    u.email as agent_email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email) as agent_name,
    s.agency_id,
    a.name as agency_name,
    COUNT(s.id) as total_sales,
    SUM(COALESCE(s.final_price, s.total_price)) as total_value,
    SUM(COALESCE(s.final_price, s.total_price) - COALESCE(s.balance, 0)) as collected_amount,
    AVG(COALESCE(s.final_price, s.total_price)) as avg_sale_value
FROM 
    auth.users u
LEFT JOIN 
    public.sales s ON u.id = s.prepared_by_id
LEFT JOIN 
    public.agences a ON s.agency_id = a.id
GROUP BY 
    u.id, u.email, u.raw_user_meta_data, s.agency_id, a.name;

GRANT SELECT ON public.v_commercial_performance TO authenticated;
GRANT ALL ON public.v_commercial_performance TO service_role;
