-- 1. Update plot_status enum to be more comprehensive
-- We use a new enum to avoid transaction issues with ALTER TYPE
CREATE TYPE public.plot_status_new AS ENUM (
    'Disponible', 
    'Réservée', 
    'Attribuée', 
    'En cours de paiement', 
    'Entièrement payée', 
    'Vendue', 
    'Bloquée', 
    'Annulée'
);

-- 2. Create Lotissements (Land Projects) table
CREATE TABLE public.lotissements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agence_id UUID REFERENCES public.agences(id),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    plan_communal TEXT,
    superficie_totale NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lotissements TO authenticated;
GRANT ALL ON public.lotissements TO service_role;
ALTER TABLE public.lotissements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lotissements" ON public.lotissements
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "PDG and Informaticien can manage lotissements" ON public.lotissements
    FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'informaticien'));

-- 3. Create Zones table
CREATE TABLE public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lotissement_id UUID REFERENCES public.lotissements(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.zones TO authenticated;
GRANT ALL ON public.zones TO service_role;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view zones" ON public.zones FOR SELECT TO authenticated USING (true);
CREATE POLICY "PDG and Responsable can manage zones" ON public.zones
    FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'responsable_agence') OR private.has_role(auth.uid(), 'informaticien'));

-- 4. Create Ilots table
CREATE TABLE public.ilots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE NOT NULL,
    numero TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(zone_id, numero)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ilots TO authenticated;
GRANT ALL ON public.ilots TO service_role;
ALTER TABLE public.ilots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ilots" ON public.ilots FOR SELECT TO authenticated USING (true);

-- 5. Enrich Plots table
-- First, handle the type conversion for status
ALTER TABLE public.plots RENAME COLUMN status TO status_old;
ALTER TABLE public.plots ADD COLUMN status public.plot_status_new DEFAULT 'Disponible' NOT NULL;
ALTER TABLE public.plots ADD COLUMN ilot_id UUID REFERENCES public.ilots(id) ON DELETE CASCADE;
ALTER TABLE public.plots ADD COLUMN plan_url TEXT;

-- Update existing plots to use new status
UPDATE public.plots SET status = 'Disponible' WHERE status_old = 'disponible';
UPDATE public.plots SET status = 'Réservée' WHERE status_old = 'reserve';
UPDATE public.plots SET status = 'Vendue' WHERE status_old = 'vendu';

-- Remove old column
ALTER TABLE public.plots DROP COLUMN status_old;

-- 6. Status history for plots (Traceability)
CREATE TABLE public.plot_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_id UUID REFERENCES public.plots(id) ON DELETE CASCADE NOT NULL,
    old_status public.plot_status_new,
    new_status public.plot_status_new NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT ON public.plot_status_history TO authenticated;
GRANT ALL ON public.plot_status_history TO service_role;
ALTER TABLE public.plot_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view status history" ON public.plot_status_history FOR SELECT TO authenticated USING (true);

-- 7. Lotissement attachments
CREATE TABLE public.lotissement_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lotissement_id UUID REFERENCES public.lotissements(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, DELETE ON public.lotissement_attachments TO authenticated;
GRANT ALL ON public.lotissement_attachments TO service_role;
ALTER TABLE public.lotissement_attachments ENABLE ROW LEVEL SECURITY;

-- 8. Audit Triggers
CREATE TRIGGER audit_lotissements_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.lotissements
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();

CREATE TRIGGER audit_zones_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.zones
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();

CREATE TRIGGER audit_ilots_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.ilots
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();

CREATE TRIGGER audit_plot_status_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.plot_status_history
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
