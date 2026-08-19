-- 1. Add RLS policy for Ilots (was missing)
CREATE POLICY "Admins can manage ilots" ON public.ilots
    FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'responsable_agence') OR private.has_role(auth.uid(), 'informaticien'));

-- 2. Secure functions: Revoke public execute on private schema functions
-- The process_audit_log should only be executable by service_role (triggers)
REVOKE ALL ON FUNCTION private.process_audit_log() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.process_audit_log() FROM authenticated;
GRANT EXECUTE ON FUNCTION private.process_audit_log() TO service_role;
