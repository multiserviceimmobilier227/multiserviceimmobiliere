
-- Révoquer l'exécution sur la fonction restée dans le schéma public
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, authenticated, anon;
