ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Les politiques existantes devraient maintenant fonctionner correctement avec created_by
-- On s'assure que authenticated a bien tous les droits
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
