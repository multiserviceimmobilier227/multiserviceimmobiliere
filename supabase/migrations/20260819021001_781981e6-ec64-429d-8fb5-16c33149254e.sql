
-- Phase 4: CRM et Gestion Client

-- 1. Create Identification Type Enum
CREATE TYPE public.id_type AS ENUM ('cni', 'passeport', 'permis', 'autre');

-- 2. Create Clients Table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    address TEXT,
    id_type id_type DEFAULT 'cni' NOT NULL,
    id_number TEXT,
    occupation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Grants for clients
GRANT SELECT, INSERT, UPDATE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;

-- 4. Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 5. Policies for clients
CREATE POLICY "Authenticated users can read clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can manage clients" ON public.clients FOR ALL TO authenticated 
USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'moderator'));

-- 6. Audit trigger for clients
CREATE TRIGGER audit_clients_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.clients
FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
