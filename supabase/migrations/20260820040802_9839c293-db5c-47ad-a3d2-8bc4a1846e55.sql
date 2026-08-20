-- Sécurisation des fonctions SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.fn_get_payment_imputation_preview(UUID, NUMERIC) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_get_payment_imputation_preview(UUID, NUMERIC) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_impute_payment_on_schedule(UUID, UUID, NUMERIC) FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_impute_payment_on_schedule(UUID, UUID, NUMERIC) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_audit_payment_creation() FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_audit_payment_creation() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.fn_audit_payment_correction() FROM public;
REVOKE EXECUTE ON FUNCTION public.fn_audit_payment_correction() FROM authenticated;

-- Correction des politiques RLS pour audit_finance (Multi-agences)
-- Le PDG et Super Admin voient tout, les autres ne voient que leur agence
DROP POLICY IF EXISTS "Financial roles can view audit" ON public.audit_finance;
CREATE POLICY "Financial roles can view audit" ON public.audit_finance
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'pdg') OR 
  public.has_role(auth.uid(), 'super_admin') OR 
  (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'comptable')) 
    AND agency_id IN (SELECT agency_id FROM public.user_roles WHERE user_id = auth.uid()) -- Note: needs agency_id in user_roles or similar mapping
  )
);
