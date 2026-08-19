
-- 1. Table contract_snapshots pour le gel historique
CREATE TABLE public.contract_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    client_data JSONB NOT NULL,
    plot_data JSONB NOT NULL,
    sale_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Table sale_mutations pour les changements de parcelles
CREATE TABLE public.sale_mutations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    old_plot_id UUID NOT NULL REFERENCES public.plots(id),
    new_plot_id UUID NOT NULL REFERENCES public.plots(id),
    reason TEXT NOT NULL,
    price_difference NUMERIC(20, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Validée', 'Annulée')),
    requested_by UUID NOT NULL REFERENCES auth.users(id),
    validated_by UUID REFERENCES auth.users(id),
    validation_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT ON public.contract_snapshots TO authenticated;
GRANT ALL ON public.contract_snapshots TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.sale_mutations TO authenticated;
GRANT ALL ON public.sale_mutations TO service_role;

-- RLS
ALTER TABLE public.contract_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_mutations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view contract snapshots" ON public.contract_snapshots
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view mutations" ON public.sale_mutations
    FOR SELECT TO authenticated USING (true);

-- 3. Trigger pour libérer la parcelle lors d'une mutation validée
CREATE OR REPLACE FUNCTION public.handle_sale_mutation_validation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Validée' AND OLD.status = 'En attente' THEN
        -- 1. Libérer l'ancienne parcelle
        UPDATE public.plots SET status = 'Disponible' WHERE id = NEW.old_plot_id;
        
        -- 2. Attribuer la nouvelle parcelle à la vente
        UPDATE public.sales SET plot_id = NEW.new_plot_id WHERE id = NEW.sale_id;
        
        -- 3. Marquer la nouvelle parcelle comme Vendue/Occupée
        UPDATE public.plots SET status = 'Vendue' WHERE id = NEW.new_plot_id;
        
        -- 4. Ajouter à l'historique des parcelles
        INSERT INTO public.plot_status_history (plot_id, status, changed_by)
        VALUES (NEW.old_plot_id, 'Disponible', NEW.validated_by);
        INSERT INTO public.plot_status_history (plot_id, status, changed_by)
        VALUES (NEW.new_plot_id, 'Vendue', NEW.validated_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_handle_sale_mutation_validation
    AFTER UPDATE ON public.sale_mutations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_sale_mutation_validation();

-- 4. Protection contre modification de prix si paiement existe (sauf PDG)
CREATE OR REPLACE FUNCTION public.check_sale_price_update_protection()
RETURNS TRIGGER AS $$
DECLARE
    payment_exists BOOLEAN;
    is_pdg BOOLEAN;
BEGIN
    -- Vérifier s'il y a déjà des paiements (on regarde amount_paid dans payment_schedules)
    SELECT EXISTS (
        SELECT 1 FROM public.payment_schedules 
        WHERE sale_id = NEW.id AND amount_paid > 0
    ) INTO payment_exists;

    IF payment_exists AND (OLD.total_amount != NEW.total_amount OR OLD.total_price != NEW.total_price) THEN
        -- Vérifier si l'utilisateur est PDG
        SELECT public.has_role(auth.uid(), 'pdg') INTO is_pdg;
        
        IF NOT is_pdg THEN
            RAISE EXCEPTION 'Modification de prix interdite car des paiements ont déjà été effectués. Seul le PDG peut autoriser une révision de prix.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_check_sale_price_update_protection
    BEFORE UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.check_sale_price_update_protection();
