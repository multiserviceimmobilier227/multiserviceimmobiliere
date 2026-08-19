-- Policies for Contracts
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON public.contracts;
CREATE POLICY "Authenticated users can view contracts"
ON public.contracts FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Collaborators can create contracts" ON public.contracts;
CREATE POLICY "Collaborators can create contracts"
ON public.contracts FOR INSERT TO authenticated
WITH CHECK (true);

-- Policies for Adjustments Creation
DROP POLICY IF EXISTS "PDG and Informaticien can create adjustments" ON public.sale_adjustments;
CREATE POLICY "PDG and Informaticien can create adjustments"
ON public.sale_adjustments FOR INSERT TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'pdg') OR 
    public.has_role(auth.uid(), 'informaticien')
);