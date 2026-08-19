
-- Fix Security Linter Issues

-- 1. Fix: RLS Enabled No Policy for user_roles
-- Only admins should be able to see/manage user roles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix: Function Search Path Mutable for process_audit_log
ALTER FUNCTION public.process_audit_log() SET search_path = public;

-- 3. Fix: Revoke public/authenticated EXECUTE on SECURITY DEFINER functions
-- We want these to be callable only by the system/triggers or explicitly by admins if needed
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
-- We need authenticated to be able to use has_role in policies, but not call it directly?
-- Actually, policies run with the user's role, so they need EXECUTE.
-- The warning 0029 is specifically about direct execution.
-- But since it's SECURITY DEFINER, it's safer to keep it restricted.
-- Re-granting to authenticated so policies work, but adding a check inside if needed?
-- No, the linter just warns about direct callability. 
-- Let's keep it restricted to service_role and use it in policies which should be fine.
-- Wait, RLS policies run as the user. If EXECUTE is revoked, the policy fails.
-- So we MUST grant EXECUTE to authenticated for policies to work.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- For process_audit_log, it's a trigger function, users shouldn't call it.
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_audit_log() TO service_role;
