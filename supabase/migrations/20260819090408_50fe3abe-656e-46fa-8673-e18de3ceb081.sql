-- Policy for expense_categories
CREATE POLICY "PDG and Informaticien can manage categories" ON public.expense_categories
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'pdg') OR public.has_role(auth.uid(), 'informaticien'));

CREATE POLICY "All users can view categories" ON public.expense_categories
    FOR SELECT TO authenticated USING (true);
