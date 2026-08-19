
-- Extension de la table clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS date_naissance DATE,
ADD COLUMN IF NOT EXISTS lieu_naissance TEXT,
ADD COLUMN IF NOT EXISTS nationalite TEXT,
ADD COLUMN IF NOT EXISTS civilite TEXT CHECK (civilite IN ('M.', 'Mme', 'Mlle'));

-- Table pour les documents clients
CREATE TABLE public.client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    document_type TEXT NOT NULL, -- e.g., 'CNI', 'Passeport', 'Permis'
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

GRANT SELECT, INSERT, UPDATE ON public.client_documents TO authenticated;
GRANT ALL ON public.client_documents TO service_role;

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view client documents" 
ON public.client_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add client documents" 
ON public.client_documents FOR INSERT TO authenticated WITH CHECK (true);

-- Table pour les interactions clients (CRM)
CREATE TABLE public.client_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    interaction_type TEXT NOT NULL, -- e.g., 'Appel', 'Visite', 'Courrier', 'Réclamation'
    notes TEXT,
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT ON public.client_interactions TO authenticated;
GRANT ALL ON public.client_interactions TO service_role;

ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view client interactions" 
ON public.client_interactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can record interactions" 
ON public.client_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Activation de l'audit
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_client_documents_trigger') THEN
        CREATE TRIGGER audit_client_documents_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.client_documents
        FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_client_interactions_trigger') THEN
        CREATE TRIGGER audit_client_interactions_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.client_interactions
        FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
    END IF;
END $$;

-- Mise à jour du trigger d'audit sur clients
DROP TRIGGER IF EXISTS audit_clients_trigger ON public.clients;
CREATE TRIGGER audit_clients_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.clients
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
