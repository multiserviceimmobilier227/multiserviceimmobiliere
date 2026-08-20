GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
GRANT ALL ON public.clients TO anon;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated selects" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated updates" ON public.clients;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can read clients" ON public.clients;
DROP POLICY IF EXISTS "Allow inserts for clients" ON public.clients;

CREATE POLICY "Allow inserts for clients" 
ON public.clients 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow select for clients" 
ON public.clients 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow update for clients" 
ON public.clients 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow delete for clients" 
ON public.clients 
FOR DELETE 
TO authenticated 
USING (true);