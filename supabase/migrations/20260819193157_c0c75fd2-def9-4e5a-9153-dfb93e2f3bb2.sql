-- 1. Security Hardening for update_plot_status_on_sale
ALTER FUNCTION public.update_plot_status_on_sale() SET search_path = public;

-- 2. Security Hardening for has_role
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- 3. Security Hardening for handle_sale_mutation_validation
ALTER FUNCTION public.handle_sale_mutation_validation() SET search_path = public;

-- 4. Security Hardening for check_sale_price_update_protection
ALTER FUNCTION public.check_sale_price_update_protection() SET search_path = public;
