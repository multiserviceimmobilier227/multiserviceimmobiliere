-- Fix security for has_role function
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;

-- Revoke default execute permissions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;

-- Grant execute only to service_role (and it stays usable in RLS policies)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;