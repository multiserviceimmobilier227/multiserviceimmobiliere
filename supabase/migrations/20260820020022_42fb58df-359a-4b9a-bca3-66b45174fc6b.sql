GRANT USAGE ON SCHEMA public TO authenticated, service_role, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role, anon;
GRANT USAGE ON TYPE public.app_role TO authenticated, service_role, anon;