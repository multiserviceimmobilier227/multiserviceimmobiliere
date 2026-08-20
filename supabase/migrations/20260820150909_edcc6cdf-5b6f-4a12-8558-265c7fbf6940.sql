-- Sécurisation des fonctions de notification et audit
ALTER FUNCTION public.fn_notify_pdg_on_new_expense() SET search_path = public;
ALTER FUNCTION public.fn_notify_agent_on_expense_status_change() SET search_path = public;
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;

-- Révoquer l'exécution publique par défaut pour les fonctions sensibles
REVOKE EXECUTE ON FUNCTION public.fn_notify_pdg_on_new_expense() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.fn_notify_agent_on_expense_status_change() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.fn_notify_pdg_on_new_expense() TO service_role;
GRANT EXECUTE ON FUNCTION public.fn_notify_agent_on_expense_status_change() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) TO authenticated, service_role;
