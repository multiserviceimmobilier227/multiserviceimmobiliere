-- Ensure RLS is enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they are too restrictive
DROP POLICY IF EXISTS "Staff can manage clients" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated selects" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated updates" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON public.clients;

-- Create broad policies for authenticated users
CREATE POLICY "Allow authenticated inserts" ON public.clients 
    FOR INSERT TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Allow authenticated selects" ON public.clients 
    FOR SELECT TO authenticated 
    USING (true);

CREATE POLICY "Allow authenticated updates" ON public.clients 
    FOR UPDATE TO authenticated 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated deletes" ON public.clients 
    FOR DELETE TO authenticated 
    USING (true);

-- Ensure grants are correct
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
