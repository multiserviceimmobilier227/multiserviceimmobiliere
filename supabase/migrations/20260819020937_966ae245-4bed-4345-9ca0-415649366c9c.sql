
-- Final Fix for SECURITY DEFINER functions callability

-- Revoke all permissions first
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon;

-- Grant only EXECUTE to roles that need it for RLS
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

-- Revoke all from process_audit_log (Trigger only)
REVOKE ALL ON FUNCTION public.process_audit_log() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_audit_log() FROM authenticated;
REVOKE ALL ON FUNCTION public.process_audit_log() FROM anon;
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO service_role;
