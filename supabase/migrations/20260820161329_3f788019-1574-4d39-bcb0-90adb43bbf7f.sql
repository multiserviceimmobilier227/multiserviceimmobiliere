
-- 1. Create the arrears view
CREATE OR REPLACE VIEW public.v_sale_arrears AS
WITH unpaid_stats AS (
    SELECT 
        sale_id,
        MIN(due_date) as oldest_unpaid_due_date,
        SUM(amount_due - COALESCE(amount_paid, 0)) as total_arrears,
        COUNT(*) as unpaid_installments
    FROM public.payment_schedules
    WHERE status != 'Payé' AND due_date < CURRENT_DATE
    GROUP BY sale_id
)
SELECT 
    s.id as sale_id,
    s.client_id,
    (COALESCE(c.first_name, '') || ' ' || COALESCE(c.last_name, '')) as client_name,
    c.phone as client_phone,
    l.name as lotissement_name,
    a.name as agence_name,
    us.total_arrears,
    us.oldest_unpaid_due_date,
    CURRENT_DATE - us.oldest_unpaid_due_date as days_overdue,
    (CURRENT_DATE - us.oldest_unpaid_due_date > 60) as is_critical_delay,
    s.agency_id
FROM public.sales s
JOIN public.clients c ON s.client_id = c.id
LEFT JOIN public.plots p ON s.plot_id = p.id
LEFT JOIN public.ilots i ON p.ilot_id = i.id
LEFT JOIN public.zones z ON i.zone_id = z.id
LEFT JOIN public.lotissements l ON z.lotissement_id = l.id
LEFT JOIN public.agences a ON s.agency_id = a.id
JOIN unpaid_stats us ON s.id = us.sale_id;

-- 2. Add last_reminder_sent_at to payment_schedules
ALTER TABLE public.payment_schedules ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMPTZ;

-- 3. Create RPC for detailed arrears
CREATE OR REPLACE FUNCTION public.fn_calculate_sale_arrears(_sale_id UUID)
RETURNS TABLE (
    total_arrears NUMERIC,
    oldest_unpaid_due_date DATE,
    days_overdue INTEGER,
    is_critical_delay BOOLEAN
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        SUM(amount_due - COALESCE(amount_paid, 0)) as total_arrears,
        MIN(due_date) as oldest_unpaid_due_date,
        (CURRENT_DATE - MIN(due_date))::INTEGER as days_overdue,
        (CURRENT_DATE - MIN(due_date) > 60) as is_critical_delay
    FROM public.payment_schedules
    WHERE sale_id = _sale_id 
      AND status != 'Payé' 
      AND due_date < CURRENT_DATE;
$$;

-- 4. Grants
GRANT SELECT ON public.v_sale_arrears TO authenticated;
GRANT SELECT ON public.v_sale_arrears TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_calculate_sale_arrears(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_calculate_sale_arrears(UUID) TO service_role;
