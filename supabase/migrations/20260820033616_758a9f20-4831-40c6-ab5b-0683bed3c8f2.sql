-- Fix security linter warnings

-- Revoke execute on internal security definer functions from public
REVOKE EXECUTE ON FUNCTION public.fn_audit_integrity_violation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_prevent_plot_deletion_with_sales() FROM PUBLIC;

-- Ensure service_role can still use them
GRANT EXECUTE ON FUNCTION public.fn_audit_integrity_violation() TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_prevent_plot_deletion_with_sales() TO service_role;

-- Fix search_path and execution for public.has_role (if it was flagged earlier)
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;
ALTER FUNCTION public.has_role(uuid, text) SET search_path = public;

-- Grant execution to authenticated for has_role (required for RLS)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
