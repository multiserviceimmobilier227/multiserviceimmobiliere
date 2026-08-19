-- 1. Create Acquisition Categories Enum
CREATE TYPE public.acquisition_cost_category AS ENUM (
    'Prix Achat',
    'Frais Acte',
    'Géomètre',
    'Commission',
    'Taxe',
    'Autre'
);

-- 2. Create Acquisitions table
CREATE TABLE public.acquisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lotissement_id UUID REFERENCES public.lotissements(id) ON DELETE SET NULL,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    vendeur TEXT NOT NULL,
    date_achat DATE NOT NULL DEFAULT CURRENT_DATE,
    prix_principal NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'En attente' NOT NULL, -- En attente, Validé, Clôturé
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (lotissement_id IS NOT NULL OR plot_id IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.acquisitions TO authenticated;
GRANT ALL ON public.acquisitions TO service_role;
ALTER TABLE public.acquisitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view acquisitions" ON public.acquisitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "PDG and Comptable can manage acquisitions" ON public.acquisitions
    FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'comptable') OR private.has_role(auth.uid(), 'informaticien'));

-- 3. Create Acquisition Costs table (Additional fees)
CREATE TABLE public.acquisition_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acquisition_id UUID REFERENCES public.acquisitions(id) ON DELETE CASCADE NOT NULL,
    category public.acquisition_cost_category NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.acquisition_costs TO authenticated;
GRANT ALL ON public.acquisition_costs TO service_role;
ALTER TABLE public.acquisition_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view acquisition costs" ON public.acquisition_costs FOR SELECT TO authenticated USING (true);

-- 4. Add cost fields to plots for calculated data
ALTER TABLE public.plots ADD COLUMN cost_price_calculated NUMERIC DEFAULT 0;

-- 5. Views for Profitability Analysis
CREATE OR REPLACE VIEW public.lotissement_profitability AS
SELECT 
    l.id AS lotissement_id,
    l.name AS lotissement_name,
    COALESCE(SUM(a.prix_principal), 0) + COALESCE(SUM(ac.amount), 0) AS total_investment,
    (SELECT COALESCE(SUM(p.base_price), 0) FROM public.plots p JOIN public.ilots i ON p.ilot_id = i.id JOIN public.zones z ON i.zone_id = z.id WHERE z.lotissement_id = l.id) AS potential_revenue,
    (SELECT COUNT(*) FROM public.plots p JOIN public.ilots i ON p.ilot_id = i.id JOIN public.zones z ON i.zone_id = z.id WHERE z.lotissement_id = l.id) AS total_plots
FROM 
    public.lotissements l
LEFT JOIN 
    public.acquisitions a ON l.id = a.lotissement_id
LEFT JOIN 
    public.acquisition_costs ac ON a.id = ac.acquisition_id
GROUP BY 
    l.id, l.name;

GRANT SELECT ON public.lotissement_profitability TO authenticated;

-- 6. Audit Triggers
CREATE TRIGGER audit_acquisitions_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.acquisitions
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();

CREATE TRIGGER audit_acquisition_costs_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.acquisition_costs
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
