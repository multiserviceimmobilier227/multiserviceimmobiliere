-- Fix SECURITY DEFINER functions with search_path as recommended by linter
-- and ensure the reservations table has correct RLS for standard roles

ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;

-- Standardize access for reservations
GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;

-- RLS for reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view reservations" ON public.reservations;
CREATE POLICY "Authenticated users can view reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;
CREATE POLICY "Users can create reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins and managers can update reservations" ON public.reservations;
CREATE POLICY "Admins and managers can update reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'pdg') OR 
  public.has_role(auth.uid(), 'informaticien') OR
  auth.uid() = created_by
);