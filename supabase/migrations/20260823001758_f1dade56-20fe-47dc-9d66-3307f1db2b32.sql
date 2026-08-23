-- 15.1 Socle documentaire
ALTER TABLE public.agences ADD COLUMN IF NOT EXISTS code text;
UPDATE public.agences SET code = upper(substr(regexp_replace(coalesce(city, name), '[^a-zA-Z]', '', 'g'), 1, 3)) WHERE code IS NULL;

CREATE TABLE IF NOT EXISTS public.document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type text NOT NULL,
  label text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  header_text text,
  footer_text text,
  legal_mentions text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doc_type, version)
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type text NOT NULL,
  doc_number text NOT NULL UNIQUE,
  agency_id uuid REFERENCES public.agences(id),
  entity_type text NOT NULL,
  entity_id uuid,
  payload jsonb NOT NULL,
  template_version integer NOT NULL DEFAULT 1,
  content_hash text NOT NULL,
  status text NOT NULL DEFAULT 'emis',
  replaces_document_id uuid REFERENCES public.documents(id),
  storage_path text,
  issued_by uuid REFERENCES auth.users(id),
  issued_at timestamptz NOT NULL DEFAULT now(),
  reissue_count integer NOT NULL DEFAULT 0,
  cancelled_by uuid REFERENCES auth.users(id),
  cancelled_at timestamptz,
  cancel_reason text,
  CONSTRAINT documents_status_chk CHECK (status IN ('emis','annule','remplace'))
);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON public.documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_date ON public.documents(doc_type, issued_at DESC);

CREATE TABLE IF NOT EXISTS public.document_sequences (
  agency_code text NOT NULL,
  doc_type text NOT NULL,
  year integer NOT NULL,
  last_value integer NOT NULL DEFAULT 0,
  PRIMARY KEY (agency_code, doc_type, year)
);

GRANT SELECT ON public.document_templates TO authenticated;
GRANT ALL ON public.document_templates TO service_role;
GRANT SELECT, INSERT ON public.documents TO authenticated;
GRANT UPDATE (status, cancelled_by, cancelled_at, cancel_reason, reissue_count, storage_path) ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
GRANT ALL ON public.document_sequences TO service_role;

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_select_staff" ON public.document_templates;
CREATE POLICY "templates_select_staff" ON public.document_templates
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "documents_select_staff" ON public.documents;
CREATE POLICY "documents_select_staff" ON public.documents
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "documents_insert_staff" ON public.documents;
CREATE POLICY "documents_insert_staff" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND issued_by = auth.uid());

DROP POLICY IF EXISTS "documents_update_direction" ON public.documents;
CREATE POLICY "documents_update_direction" ON public.documents
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'pdg'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'pdg'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

-- Numérotation atomique
CREATE OR REPLACE FUNCTION public.fn_next_document_number(_agency_id uuid, _doc_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_year integer := EXTRACT(YEAR FROM (now() AT TIME ZONE 'Africa/Niamey'))::int;
  v_seq integer;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  SELECT coalesce(code, 'MSI') INTO v_code FROM public.agences WHERE id = _agency_id;
  IF v_code IS NULL THEN v_code := 'MSI'; END IF;

  INSERT INTO public.document_sequences (agency_code, doc_type, year, last_value)
  VALUES (v_code, _doc_type, v_year, 1)
  ON CONFLICT (agency_code, doc_type, year)
  DO UPDATE SET last_value = public.document_sequences.last_value + 1
  RETURNING last_value INTO v_seq;

  RETURN 'MSI/' || v_code || '/' || upper(_doc_type) || '/' || v_year::text || '/' || lpad(v_seq::text, 5, '0');
END;
$$;
REVOKE ALL ON FUNCTION public.fn_next_document_number(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.fn_next_document_number(uuid, text) TO authenticated, service_role;

-- Immuabilité du contenu émis
CREATE OR REPLACE FUNCTION public.fn_documents_immutable()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Suppression de document interdite';
  END IF;
  IF NEW.doc_number IS DISTINCT FROM OLD.doc_number
     OR NEW.payload IS DISTINCT FROM OLD.payload
     OR NEW.content_hash IS DISTINCT FROM OLD.content_hash
     OR NEW.doc_type IS DISTINCT FROM OLD.doc_type
     OR NEW.issued_by IS DISTINCT FROM OLD.issued_by
     OR NEW.issued_at IS DISTINCT FROM OLD.issued_at THEN
    RAISE EXCEPTION 'Un document émis est immuable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_documents_immutable ON public.documents;
CREATE TRIGGER tr_documents_immutable
  BEFORE UPDATE OR DELETE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.fn_documents_immutable();

-- Vérification publique (aucune donnée sensible)
CREATE OR REPLACE FUNCTION public.fn_verify_document(_doc_number text)
RETURNS TABLE(doc_number text, doc_type text, issued_on date, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT d.doc_number, d.doc_type, (d.issued_at AT TIME ZONE 'Africa/Niamey')::date, d.status
  FROM public.documents d
  WHERE d.doc_number = _doc_number;
$$;
REVOKE ALL ON FUNCTION public.fn_verify_document(text) FROM public;
GRANT EXECUTE ON FUNCTION public.fn_verify_document(text) TO anon, authenticated, service_role;

-- Modèles initiaux
INSERT INTO public.document_templates (doc_type, label, version, header_text, footer_text, legal_mentions)
VALUES
  ('recu', 'Reçu d''encaissement', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Ce reçu atteste du versement mentionné ci-dessus. Toute réédition porte la mention DUPLICATA.'),
  ('contrat', 'Contrat de vente', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Le présent contrat engage les parties dans les conditions énoncées.'),
  ('echeancier', 'Échéancier de paiement', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Échéancier annexé au contrat de vente.'),
  ('relance', 'Lettre de relance', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Rappel amiable d''échéance impayée.'),
  ('mise_en_demeure', 'Mise en demeure', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Mise en demeure notifiée conformément aux clauses du contrat.'),
  ('remboursement', 'Attestation de remboursement', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Atteste du remboursement effectué au bénéficiaire.'),
  ('quitus', 'Attestation de solde', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Atteste du paiement intégral du bien désigné.')
ON CONFLICT (doc_type, version) DO NOTHING;