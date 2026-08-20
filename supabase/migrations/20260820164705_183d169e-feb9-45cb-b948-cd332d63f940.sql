
-- Drop view before recreation
DROP VIEW IF EXISTS public.v_commercial_performance_detailed;
DROP VIEW IF EXISTS public.v_commercial_performance;

-- Update profiles table to include email
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Update function to handle new user signup with email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Populate existing emails
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Create detailed view
CREATE OR REPLACE VIEW public.v_commercial_performance_detailed AS
SELECT 
    p.id AS agent_id,
    p.email AS agent_email,
    COALESCE(p.full_name, p.email) AS agent_name,
    s.agency_id,
    a.name AS agency_name,
    count(s.id) AS total_sales,
    sum(COALESCE(s.final_price, s.total_price)) AS total_value,
    sum(s.balance) AS total_balance,
    sum(COALESCE(s.final_price, s.total_price) - COALESCE(s.balance, 0)) AS collected_amount,
    count(s.id) FILTER (WHERE s.balance > 0) AS active_sales,
    s.sale_date
FROM public.profiles p
LEFT JOIN public.sales s ON p.id = s.prepared_by_id
LEFT JOIN public.agences a ON s.agency_id = a.id
GROUP BY p.id, p.email, p.full_name, s.agency_id, a.name, s.sale_date;

-- Recreate base view if needed by other components
CREATE OR REPLACE VIEW public.v_commercial_performance AS
SELECT 
    agent_id,
    agent_email,
    agent_name,
    agency_id,
    agency_name,
    sum(total_sales) as total_sales,
    sum(total_value) as total_value,
    sum(collected_amount) as collected_amount,
    avg(total_value / total_sales) as avg_sale_value
FROM public.v_commercial_performance_detailed
GROUP BY agent_id, agent_email, agent_name, agency_id, agency_name;

GRANT SELECT ON public.v_commercial_performance_detailed TO authenticated;
GRANT SELECT ON public.v_commercial_performance_detailed TO service_role;
GRANT SELECT ON public.v_commercial_performance TO authenticated;
GRANT SELECT ON public.v_commercial_performance TO service_role;
