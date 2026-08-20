-- Correction des fonctions de base de données utilisant 'Validée' au lieu des valeurs de l'énumération sale_status
-- L'énumération sale_status contient : 'reservation', 'en_cours', 'termine', 'annule'

CREATE OR REPLACE FUNCTION public.prevent_validated_sale_edit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Utilisation des valeurs réelles de l'énumération sale_status
    IF OLD.status = 'en_cours' AND NEW.status = 'en_cours' AND NEW.status NOT IN ('termine', 'annule') THEN
        RAISE EXCEPTION 'Une vente validée ne peut plus être modifiée.';
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_sale_plot_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.plots SET status = 'Attribuée' WHERE id = NEW.plot_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Correction 'annulee' -> 'annule' pour correspondre à l'énumération
        IF (NEW.status = 'annule' AND OLD.status != 'annule') THEN
            UPDATE public.plots SET status = 'Disponible' WHERE id = NEW.plot_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

-- Mise à jour de la fonction de mutation qui utilisait aussi 'Validée'
-- Note : le champ status de sale_mutations est de type TEXT, mais par cohérence on garde des termes techniques
CREATE OR REPLACE FUNCTION public.handle_sale_mutation_validation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Dans le code UI, 'Validée' est envoyé pour les mutations. 
    -- Si on veut rester sur 'Validée' pour le type TEXT, c'est OK, 
    -- mais la fonction précédente échouait probablement si elle touchait à sale_status
    IF NEW.status = 'Validée' AND OLD.status = 'En attente' THEN
        -- 1. Libérer l'ancienne parcelle
        UPDATE public.plots SET status = 'Disponible' WHERE id = NEW.old_plot_id;
        
        -- 2. Attribuer la nouvelle parcelle à la vente
        UPDATE public.sales SET plot_id = NEW.new_plot_id WHERE id = NEW.sale_id;
        
        -- 3. Marquer la nouvelle parcelle comme Vendue
        UPDATE public.plots SET status = 'Vendue' WHERE id = NEW.new_plot_id;
        
        -- 4. Historique
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plot_status_history') THEN
            INSERT INTO public.plot_status_history (plot_id, status, changed_by)
            VALUES (NEW.old_plot_id, 'Disponible', NEW.validated_by);
            INSERT INTO public.plot_status_history (plot_id, status, changed_by)
            VALUES (NEW.new_plot_id, 'Vendue', NEW.validated_by);
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;
