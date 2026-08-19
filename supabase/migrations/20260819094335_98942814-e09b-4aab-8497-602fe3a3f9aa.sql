-- 1. Create Price Templates for size-based pricing
CREATE TABLE public.price_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    surface_range_min NUMERIC NOT NULL,
    surface_range_max NUMERIC NOT NULL,
    price_per_m2 NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_templates TO authenticated;
GRANT ALL ON public.price_templates TO service_role;
ALTER TABLE public.price_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active price templates" ON public.price_templates
    FOR SELECT TO authenticated USING (is_active = true OR private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'informaticien'));

CREATE POLICY "PDG and Informaticien can manage price templates" ON public.price_templates
    FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'informaticien'));

-- 2. Create Plot Pricing for plot-specific history
CREATE TABLE public.plot_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID REFERENCES public.plots(id) ON DELETE CASCADE NOT NULL,
    base_price NUMERIC(20, 2) NOT NULL, -- Prix catalogue
    min_price NUMERIC(20, 2), -- Seuil critique de négociation
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    prepared_by_id UUID REFERENCES auth.users(id),
    validated_by_id UUID REFERENCES auth.users(id),
    validation_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plot_pricing TO authenticated;
GRANT ALL ON public.plot_pricing TO service_role;
ALTER TABLE public.plot_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view plot pricing" ON public.plot_pricing
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authorized roles can prepare plot pricing" ON public.plot_pricing
    FOR INSERT TO authenticated 
    WITH CHECK (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'comptable') OR private.has_role(auth.uid(), 'informaticien'));

CREATE POLICY "PDG can validate plot pricing" ON public.plot_pricing
    FOR UPDATE TO authenticated
    USING (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'informaticien'))
    WITH CHECK (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'informaticien'));

-- 3. Update sales table with financial columns (anticipating Phase 8/9)
-- Check if sales table exists first in the migration flow, usually created in Phase 5 or 8
-- But since we mentioned it in the plan, we ensure columns are there.
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS catalog_price NUMERIC(20, 2);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(20, 2) DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS final_price NUMERIC(20, 2);
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS price_validation_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS price_validated_by_id UUID REFERENCES auth.users(id);

-- 4. Triggers for Audit
CREATE TRIGGER audit_price_templates_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.price_templates
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();

CREATE TRIGGER audit_plot_pricing_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.plot_pricing
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();

-- 5. Helper function to get the effective price for a plot
CREATE OR REPLACE FUNCTION public.get_plot_effective_price(_plot_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    _price NUMERIC;
    _surface NUMERIC;
BEGIN
    -- 1. Check for specific validated pricing first
    SELECT base_price INTO _price
    FROM public.plot_pricing
    WHERE plot_id = _plot_id 
      AND validated_by_id IS NOT NULL
      AND effective_date <= now()
    ORDER BY effective_date DESC
    LIMIT 1;

    IF _price IS NOT NULL THEN
        RETURN _price;
    END IF;

    -- 2. Fallback to current base_price on plot table (legacy or manual sync)
    SELECT base_price, surface INTO _price, _surface
    FROM public.plots
    WHERE id = _plot_id;

    IF _price > 0 THEN
        RETURN _price;
    END IF;

    -- 3. Fallback to price templates if surface is known
    SELECT price_per_m2 * _surface INTO _price
    FROM public.price_templates
    WHERE is_active = true
      AND _surface >= surface_range_min
      AND _surface <= surface_range_max
    LIMIT 1;

    RETURN COALESCE(_price, 0);
END;
$$;
