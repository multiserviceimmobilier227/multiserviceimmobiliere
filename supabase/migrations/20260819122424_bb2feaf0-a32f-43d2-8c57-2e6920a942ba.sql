
-- 1. Révoquer l'exécution publique (par défaut) pour les fonctions SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) FROM authenticated;

-- 2. Accorder l'exécution uniquement aux rôles nécessaires (si nécessaire)
GRANT EXECUTE ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) TO service_role;

-- 3. Fixer le search_path pour éviter le détournement de recherche
ALTER FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) SET search_path = public;
