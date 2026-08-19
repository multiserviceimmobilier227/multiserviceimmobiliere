
-- 1. RLS pour lotissement_attachments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lotissement_attachments') THEN
        CREATE POLICY "Users can view lotissement attachments" ON public.lotissement_attachments FOR SELECT TO authenticated USING (true);
        CREATE POLICY "PDG and Informaticien can manage attachments" ON public.lotissement_attachments FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'pdg') OR private.has_role(auth.uid(), 'informaticien'));
    END IF;
END $$;

-- 2. Révocation stricte des droits d'exécution sur les fonctions SECURITY DEFINER
-- Ces fonctions doivent être appelées uniquement par le système (triggers/RLS)
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION private.prevent_validated_edit() FROM PUBLIC, authenticated, anon;
REVOKE EXECUTE ON FUNCTION private.process_audit_log() FROM PUBLIC, authenticated, anon;

-- 3. S'assurer que les GRANTs sur les tables sont corrects après l'audit
GRANT SELECT ON public.lotissement_attachments TO authenticated;
GRANT ALL ON public.lotissement_attachments TO service_role;
