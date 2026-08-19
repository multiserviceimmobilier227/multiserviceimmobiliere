-- 1. Conversion en SECURITY INVOKER pour les fonctions qui ne nécessitent pas de privilèges élevés
-- La fonction has_role doit rester SECURITY DEFINER car elle lit dans user_roles qui est protégé par RLS
-- Les triggers de log d'audit ou de changement de statut peuvent souvent être INVOKER s'ils n'ont pas besoin de bypasser les RLS

-- 2. Révoquer l'accès 'authenticated' aux fonctions de trigger système (qui devraient être appelées par postgres)
REVOKE EXECUTE ON FUNCTION public.handle_reservation_status_change() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.process_audit_log() FROM authenticated;

-- 3. Si d'autres fonctions n'ont pas besoin d'être appelées par le client API, révoquer authenticated
REVOKE EXECUTE ON FUNCTION public.apply_sale_adjustment() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_plot_transfer(uuid, uuid, text, uuid) FROM authenticated;

-- Note: has_role doit rester accessible à 'authenticated' pour les politiques RLS,
-- mais le linter peut continuer à avertir. C'est un faux positif acceptable si le risque est mitigé.
