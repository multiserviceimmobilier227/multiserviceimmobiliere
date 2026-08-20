DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.clients ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Update existing policies to be more explicit
DROP POLICY IF EXISTS "Allow select for clients" ON public.clients;
CREATE POLICY "Allow select for clients" 
ON public.clients 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Allow update for clients" ON public.clients;
CREATE POLICY "Allow update for clients" 
ON public.clients 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete for clients" ON public.clients;
CREATE POLICY "Allow delete for clients" 
ON public.clients 
FOR DELETE 
TO authenticated 
USING (true);
