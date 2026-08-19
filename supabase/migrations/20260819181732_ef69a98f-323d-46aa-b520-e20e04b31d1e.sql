-- Update sales table if it exists or create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sales') THEN
        CREATE TABLE public.sales (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL REFERENCES public.clients(id),
            plot_id UUID NOT NULL REFERENCES public.plots(id),
            status TEXT NOT NULL DEFAULT 'Brouillon' CHECK (status IN ('Brouillon', 'Validée', 'Annulée', 'Terminée')),
            total_amount NUMERIC(20, 2) NOT NULL,
            deposit_amount NUMERIC(20, 2) NOT NULL,
            payment_plan_type TEXT NOT NULL DEFAULT 'Échéancier' CHECK (payment_plan_type IN ('Comptant', 'Échéancier')),
            agency_id UUID REFERENCES public.agences(id),
            created_by UUID REFERENCES auth.users(id),
            validated_by_id UUID REFERENCES auth.users(id),
            validation_date TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    ELSE
        ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Brouillon' CHECK (status IN ('Brouillon', 'Validée', 'Annulée', 'Terminée'));
        ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS total_amount NUMERIC(20, 2);
        ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(20, 2);
        ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agences(id);
    END IF;
END
$$;

-- Table payment_schedules
CREATE TABLE IF NOT EXISTS public.payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount_due NUMERIC(20, 2) NOT NULL,
    amount_paid NUMERIC(20, 2) DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Payé', 'Retard')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS & Grants
GRANT SELECT, INSERT, UPDATE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.payment_schedules TO authenticated;
GRANT ALL ON public.payment_schedules TO service_role;

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplicates
DROP POLICY IF EXISTS "Users can view sales of their agency" ON public.sales;
CREATE POLICY "Users can view sales of their agency" ON public.sales
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view payment schedules" ON public.payment_schedules;
CREATE POLICY "Users can view payment schedules" ON public.payment_schedules
    FOR SELECT TO authenticated USING (true);

-- Trigger to lock validated sales
CREATE OR REPLACE FUNCTION public.prevent_validated_sale_edit()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'Validée' AND NEW.status = 'Validée' AND NEW.status != 'Terminée' AND NEW.status != 'Annulée' THEN
        RAISE EXCEPTION 'Une vente validée ne peut plus être modifiée.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_prevent_validated_sale_edit ON public.sales;
CREATE TRIGGER tr_prevent_validated_sale_edit
    BEFORE UPDATE ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_validated_sale_edit();

-- Trigger to update plot status on sale validation
CREATE OR REPLACE FUNCTION public.update_plot_status_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Validée' AND (OLD.status IS NULL OR OLD.status != 'Validée') THEN
        UPDATE public.plots 
        SET status = 'Vendue' 
        WHERE id = NEW.plot_id;
        
        -- Log status change in plot_status_history if the table exists
        IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'plot_status_history') THEN
            INSERT INTO public.plot_status_history (plot_id, status, changed_by)
            VALUES (NEW.plot_id, 'Vendue', NEW.validated_by_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_plot_status_on_sale ON public.sales;
CREATE TRIGGER tr_update_plot_status_on_sale
    AFTER UPDATE OR INSERT ON public.sales
    FOR EACH ROW
    EXECUTE FUNCTION public.update_plot_status_on_sale();
