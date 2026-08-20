-- Secure fn_sync_plot_status_integrity
ALTER FUNCTION public.fn_sync_plot_status_integrity() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.fn_sync_plot_status_integrity() FROM anon;

-- Secure has_role (app_role version)
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

-- Secure has_role (text version)
ALTER FUNCTION public.has_role(uuid, text) SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM anon;
