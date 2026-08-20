-- Synchronisation finale des statuts techniques pour éviter les erreurs d'énumération

-- 1. Vérification et correction de la fonction update_plot_status_on_sale
-- S'assure que toutes les références à 'Validée' sont remplacées par 'en_cours'
CREATE OR REPLACE FUNCTION public.update_plot_status_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Utilise 'en_cours' qui est la valeur réelle de l'énumération sale_status
    IF NEW.status = 'en_cours' AND (OLD.status IS NULL OR OLD.status != 'en_cours') THEN
        UPDATE public.plots 
        SET status = 'Vendue' 
        WHERE id = NEW.plot_id;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plot_status_history') THEN
            INSERT INTO public.plot_status_history (plot_id, status, changed_by)
            VALUES (NEW.plot_id, 'Vendue', NEW.validated_by_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

-- 2. Correction de toute valeur 'Validée' résiduelle dans la table sales
-- Cela évite que les triggers de mise à jour (comme lors d'un paiement) ne plantent
-- en essayant de manipuler une ligne avec un statut invalide.
UPDATE public.sales 
SET status = 'en_cours' 
WHERE status::text = 'Validée';

-- 3. Sécurité : révoquer l'exécution publique sur les fonctions SECURITY DEFINER sensibles
-- (Réponse aux alertes du linter Supabase)
REVOKE EXECUTE ON FUNCTION private.process_audit_log() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.prevent_validated_edit() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION private.update_sale_on_payment() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.process_audit_log() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.prevent_validated_edit() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.update_sale_on_payment() TO authenticated, service_role;
