-- Create sale statuses enum
DO $$ BEGIN
    CREATE TYPE public.sale_status AS ENUM ('en_attente_apport', 'active', 'cloturee', 'annulee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment plan types enum
DO $$ BEGIN
    CREATE TYPE public.payment_plan_type AS ENUM ('comptant', 'echelonne');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create adjustment types enum
DO $$ BEGIN
    CREATE TYPE public.adjustment_type AS ENUM ('change_plot', 'price_adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.clients(id),
    plot_id UUID NOT NULL REFERENCES public.plots(id),
    agency_id UUID NOT NULL REFERENCES public.agences(id),
    status public.sale_status NOT NULL DEFAULT 'en_attente_apport',
    payment_plan_type public.payment_plan_type NOT NULL,
    total_price NUMERIC(15, 2) NOT NULL,
    down_payment_amount NUMERIC(15, 2) NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    contract_number TEXT UNIQUE NOT NULL,
    content_url TEXT, -- Link to storage
    version INTEGER DEFAULT 1,
    signed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sale adjustments table (for PDG validation audit trail)
CREATE TABLE IF NOT EXISTS public.sale_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    type public.adjustment_type NOT NULL,
    previous_data JSONB NOT NULL,
    new_data JSONB NOT NULL,
    reason TEXT NOT NULL,
    authorized_by UUID REFERENCES auth.users(id), -- PDG Validation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.sale_adjustments TO authenticated;
GRANT ALL ON public.sale_adjustments TO service_role;

-- RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_adjustments ENABLE ROW LEVEL SECURITY;

-- Policies for Sales
CREATE POLICY "Users can view sales of their agency"
ON public.sales FOR SELECT TO authenticated
USING (true); -- Simplified for now, will refine with agency check

CREATE POLICY "Collaborators can create sales"
ON public.sales FOR INSERT TO authenticated
WITH CHECK (true);

-- Policies for Adjustments (PDG/Info only for authorization)
CREATE POLICY "Authenticated users can view adjustments"
ON public.sale_adjustments FOR SELECT TO authenticated
USING (true);

-- Trigger for plot status automatic update
CREATE OR REPLACE FUNCTION public.handle_sale_plot_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.plots SET status = 'Attribuée' WHERE id = NEW.plot_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (NEW.status = 'annulee' AND OLD.status != 'annulee') THEN
            UPDATE public.plots SET status = 'Disponible' WHERE id = NEW.plot_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER sale_plot_status_trigger
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW EXECUTE FUNCTION public.handle_sale_plot_status_change();

-- Revoke public execution
REVOKE EXECUTE ON FUNCTION public.handle_sale_plot_status_change() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_sale_plot_status_change() TO service_role;