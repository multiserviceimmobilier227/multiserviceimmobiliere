CREATE POLICY "Authenticated users can manage client documents" 
ON public.client_documents FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can manage client interactions" 
ON public.client_interactions FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

GRANT ALL ON public.client_documents TO authenticated;
GRANT ALL ON public.client_interactions TO authenticated;
GRANT ALL ON public.clients TO authenticated;

-- Ensure service_role has access to all CRM tables
GRANT ALL ON public.clients TO service_role;
GRANT ALL ON public.client_documents TO service_role;
GRANT ALL ON public.client_interactions TO service_role;
