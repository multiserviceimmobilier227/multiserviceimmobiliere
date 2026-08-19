-- Secure process_audit_log
ALTER FUNCTION public.process_audit_log() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM anon;
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO service_role;

-- Secure has_role
-- Note: has_role is already SECURITY DEFINER and STABLE, just need to ensure permissions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
