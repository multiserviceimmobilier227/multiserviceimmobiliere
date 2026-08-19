
-- 1. Révoquer l'exécution sur la fonction identifiée par le linter
REVOKE EXECUTE ON FUNCTION private.update_sale_on_payment() FROM PUBLIC, authenticated, anon;

-- 2. S'assurer que les GRANTs sur les tables de la Phase 3 (paramètres) sont complets
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
GRANT SELECT ON public.expense_categories TO authenticated;
GRANT ALL ON public.expense_categories TO service_role;
