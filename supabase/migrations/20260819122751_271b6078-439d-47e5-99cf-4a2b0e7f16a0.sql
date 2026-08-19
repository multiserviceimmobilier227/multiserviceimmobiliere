
-- Création du type enum pour le statut de l'ajustement
CREATE TYPE public.adjustment_status AS ENUM ('pending', 'approved', 'rejected');

-- Suppression si elle existe (sécurité pour répétition)
DROP TABLE IF EXISTS public.sale_adjustments CASCADE;

-- Création de la table sale_adjustments enrichie
CREATE TABLE public.sale_adjustments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
    type public.adjustment_type NOT NULL,
    amount numeric NOT NULL, -- Positif pour surplus, négatif pour remise
    reason text NOT NULL,
    status public.adjustment_status NOT NULL DEFAULT 'pending',
    requested_by uuid REFERENCES auth.users(id) NOT NULL,
    validated_by uuid REFERENCES auth.users(id),
    validated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    
    -- Stockage des données avant/après pour audit précis
    previous_total_price numeric,
    new_total_price numeric
);

-- Grants
GRANT SELECT, INSERT ON public.sale_adjustments TO authenticated;
GRANT UPDATE ON public.sale_adjustments TO authenticated;
GRANT ALL ON public.sale_adjustments TO service_role;

-- RLS
ALTER TABLE public.sale_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view adjustments for their agency sales"
ON public.sale_adjustments FOR SELECT
TO authenticated
USING (true); -- Simplifié pour le moment, à affiner avec les agences si nécessaire

CREATE POLICY "Users can request adjustments"
ON public.sale_adjustments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "PDG and Admin can validate adjustments"
ON public.sale_adjustments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'admin'));

-- Fonction pour appliquer l'ajustement sur la vente
CREATE OR REPLACE FUNCTION public.apply_sale_adjustment()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status = 'pending' AND NEW.status = 'approved') THEN
        -- Mise à jour de la vente
        UPDATE public.sales
        SET 
            total_price = total_price + NEW.amount,
            balance = balance + NEW.amount
        WHERE id = NEW.sale_id;
        
        NEW.validated_at = now();
        NEW.validated_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_sale_adjustment_approved
    BEFORE UPDATE ON public.sale_adjustments
    FOR EACH ROW
    EXECUTE FUNCTION public.apply_sale_adjustment();
