
-- Phase 3: Référentiel Immobilier

-- 1. Create Status Enums
CREATE TYPE public.site_status AS ENUM ('actif', 'inactif', 'termine');
CREATE TYPE public.plot_status AS ENUM ('disponible', 'reserve', 'vendu', 'litige');

-- 2. Create Sites/Cités Table
CREATE TABLE public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    status site_status DEFAULT 'actif' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Grants for sites
GRANT SELECT ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;

-- 4. Enable RLS on sites
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- 5. Policies for sites
CREATE POLICY "Public read sites" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage sites" ON public.sites FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- 6. Create Plots/Parcelles Table
CREATE TABLE public.plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
    plot_number TEXT NOT NULL,
    surface_area NUMERIC NOT NULL, -- in m² (200, 300, 400)
    base_price NUMERIC NOT NULL, -- in FCFA
    status plot_status DEFAULT 'disponible' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (site_id, plot_number)
);

-- 7. Grants for plots
GRANT SELECT ON public.plots TO authenticated;
GRANT ALL ON public.plots TO service_role;

-- 8. Enable RLS on plots
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- 9. Policies for plots
CREATE POLICY "Public read plots" ON public.plots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage plots" ON public.plots FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- 10. Audit triggers for sites and plots
CREATE TRIGGER audit_sites_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sites
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();

CREATE TRIGGER audit_plots_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.plots
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
