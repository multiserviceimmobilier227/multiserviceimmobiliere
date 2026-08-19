-- Secure system trigger functions
ALTER FUNCTION public.process_audit_log() SET search_path = public;
ALTER FUNCTION public.handle_reservation_status_change() SET search_path = public;

-- Revoke execute permissions for security definer functions
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM anon;

REVOKE EXECUTE ON FUNCTION public.handle_reservation_status_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_reservation_status_change() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_reservation_status_change() FROM anon;

-- Grant execute only to service_role (needed for triggers)
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_reservation_status_change() TO service_role;