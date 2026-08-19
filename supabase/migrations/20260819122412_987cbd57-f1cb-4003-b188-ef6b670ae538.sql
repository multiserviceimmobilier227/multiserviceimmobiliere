
-- Table pour l'historique des transferts de parcelles
CREATE TABLE IF NOT EXISTS public.sale_transfers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
    old_plot_id uuid REFERENCES public.plots(id) NOT NULL,
    new_plot_id uuid REFERENCES public.plots(id) NOT NULL,
    reason text NOT NULL,
    price_difference numeric(15, 2) NOT NULL DEFAULT 0,
    authorized_by uuid, -- Directement lié à auth.users(id) si profile n'existe pas ou par convention
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.sale_transfers TO authenticated;
GRANT ALL ON public.sale_transfers TO service_role;

ALTER TABLE public.sale_transfers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage transfers' AND tablename = 'sale_transfers') THEN
        CREATE POLICY "Admins can manage transfers"
            ON public.sale_transfers
            FOR ALL
            TO authenticated
            USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'pdg'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view transfers' AND tablename = 'sale_transfers') THEN
        CREATE POLICY "Users can view transfers"
            ON public.sale_transfers
            FOR SELECT
            TO authenticated
            USING (true);
    END IF;
END $$;

-- Fonction pour gérer le transfert atomique de parcelle
CREATE OR REPLACE FUNCTION public.handle_plot_transfer(
    p_sale_id uuid,
    p_new_plot_id uuid,
    p_reason text,
    p_author_id uuid
) RETURNS void AS $$
DECLARE
    v_old_plot_id uuid;
    v_old_price numeric;
    v_new_price numeric;
    v_price_diff numeric;
    v_sale_status text;
BEGIN
    -- 1. Récupérer l'ancienne parcelle et les infos de la vente
    SELECT plot_id, total_price, status INTO v_old_plot_id, v_old_price, v_sale_status FROM public.sales WHERE id = p_sale_id;
    
    IF v_old_plot_id IS NULL THEN
        RAISE EXCEPTION 'Vente non trouvée';
    END IF;

    -- 2. Récupérer le prix de la nouvelle parcelle
    SELECT price INTO v_new_price FROM public.plots WHERE id = p_new_plot_id;
    
    -- Note: si v_new_price est null dans plots, essayer base_price
    IF v_new_price IS NULL THEN
        SELECT base_price INTO v_new_price FROM public.plots WHERE id = p_new_plot_id;
    END IF;
    
    IF v_new_price IS NULL THEN
        RAISE EXCEPTION 'Nouvelle parcelle non trouvée ou prix non défini';
    END IF;

    -- 3. Vérifier si la nouvelle parcelle est disponible
    IF NOT EXISTS (SELECT 1 FROM public.plots WHERE id = p_new_plot_id AND status = 'Disponible') THEN
        RAISE EXCEPTION 'La nouvelle parcelle n''est pas disponible';
    END IF;

    -- 4. Calculer la différence
    v_price_diff := v_new_price - v_old_price;

    -- 5. Mettre à jour l'ancienne parcelle en 'Disponible'
    UPDATE public.plots SET status = 'Disponible' WHERE id = v_old_plot_id;

    -- 6. Mettre à jour la nouvelle parcelle
    UPDATE public.plots SET status = 'Attribuée' WHERE id = p_new_plot_id;

    -- 7. Mettre à jour la vente
    UPDATE public.sales 
    SET 
        plot_id = p_new_plot_id,
        total_price = v_new_price,
        balance = balance + v_price_diff,
        updated_at = now()
    WHERE id = p_sale_id;

    -- 8. Enregistrer le transfert
    INSERT INTO public.sale_transfers (
        sale_id, old_plot_id, new_plot_id, reason, price_difference, authorized_by
    ) VALUES (
        p_sale_id, v_old_plot_id, p_new_plot_id, p_reason, v_price_diff, p_author_id
    );

    -- 9. Audit log
    INSERT INTO public.audit_logs (
        user_id, action, entity_type, entity_id, table_name, details
    ) VALUES (
        p_author_id, 'PLOT_TRANSFER', 'sale', p_sale_id, 'sales',
        jsonb_build_object(
            'old_plot_id', v_old_plot_id, 
            'new_plot_id', p_new_plot_id, 
            'price_difference', v_price_diff,
            'reason', p_reason
        )
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
