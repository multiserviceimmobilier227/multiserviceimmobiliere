# MSI 2.0 — Référence complète du backend et de la base de données

Document de reconstruction intégrale (fidèle à l'état de production) du backend de
**Multi Services Immobilière (MSI 2.0)** : schémas, types, tables, contraintes, index,
RLS, GRANTs, fonctions, déclencheurs, vues, stockage et données de référence.

- Moteur : PostgreSQL (Supabase / Lovable Cloud), API Data REST (PostgREST).
- Application : TanStack Start + React 19, server functions (`createServerFn`), pas d'edge functions.
- Devise : FCFA (XOF, entiers). Fuseau : Africa/Niamey. Interface : français.

## Principes non négociables reflétés par ce schéma

1. **Traçabilité totale** : `audit_logs` universel alimenté par déclencheurs `private.process_audit_log()`
   sur toutes les tables métier ; `audit_finance` et `audit_finance_corrections` pour la finance.
2. **Aucune suppression destructive** : les tables sensibles n'ont pas de politique DELETE
   (documents, contrats, paiements corrigés, journaux de caisse, dépenses…). Toute correction crée une nouvelle trace.
3. **Validation PDG** : opérations sensibles (prix, dépenses, ajustements, remboursements, mutations)
   passent par des colonnes `validated_by_id` / `validation_date` et des politiques RLS dédiées.
4. **Sécurité par rôle** : rôles dans `user_roles` (jamais sur `profiles`), vérification par
   `private.has_role()`, `public.has_permission()`, `public.is_staff()` en SECURITY DEFINER.
5. **Intégrité foncière** : index unique partiel `idx_single_active_sale_per_plot` (une seule vente active
   par parcelle) + déclencheurs de synchronisation de statut.
6. **Logique financière en base** : imputation FIFO, caisse théorique, arriérés, numérotation atomique
   des documents — implémentés en SQL, jamais uniquement côté front.

## Ordre de restauration recommandé

1. Section 0 — schéma `private` (créer d'abord `private.has_role` avant les politiques qui l'utilisent).
2. Section 1 — types ENUM.
3. Section 2 — tables, contraintes, index (créer les tables sans FK croisées d'abord, puis les `ALTER TABLE … ADD CONSTRAINT`).
4. Section 4 — fonctions (avant les déclencheurs qui les référencent ; relancer la section 2 pour les `CREATE TRIGGER` si nécessaire).
5. Section 2 (suite) — RLS, GRANTs, politiques.
6. Section 3 — vues ; Section 5 — droits d'exécution.
7. Sections 6 et 7 — buckets de stockage et politiques `storage.objects`.
8. Section 8 — données de référence (rôles/permissions, catégories de dépenses, modèles de documents, paramètres, agences).

> Règle absolue : chaque `CREATE TABLE` du schéma `public` doit être suivi de ses `GRANT`
> puis de `ENABLE ROW LEVEL SECURITY` puis de ses politiques. Sans GRANT, l'API renvoie une erreur de permission.

## Rôles applicatifs

`app_role` : super_admin, pdg, comptable, secretaire, commercial, responsable_agence, informaticien,
client, admin, moderator, user. Les permissions fines sont dans `role_permissions` (section 8) et
consommées par `has_permission()` / `fn_my_access()`.

## Couche serveur de l'application (server functions)

Aucune logique sensible côté client. Modules `src/lib/*.functions.ts` appelés via `createServerFn`
avec le middleware `requireSupabaseAuth` (RLS appliquée en tant qu'utilisateur) :

| Module | Domaine |
| --- | --- |
| `access.functions.ts` | profil d'accès (`fn_my_access`), gestion des comptes et rôles |
| `auth.functions.ts` | rôles, journal d'audit, agences, paramètres métier |
| `crm.functions.ts` | clients, documents clients, interactions, historique |
| `real-estate.functions.ts` | lotissements, zones, îlots, parcelles, inventaire |
| `acquisitions.functions.ts` | acquisitions foncières et coûts de revient |
| `pricing.functions.ts` | grilles tarifaires, prix par parcelle, validation PDG |
| `sales.functions.ts` | ventes, échéanciers, mutations, ajustements |
| `finance.functions.ts` | encaissements, imputation, caisse, dépenses, remboursements, arriérés |
| `documents.functions.ts` | moteur documentaire PDF, numérotation, vérification QR |
| `settings.functions.ts` | paramètres globaux |

Le client navigateur (`@/integrations/supabase/client`) ne sert qu'aux lectures soumises à RLS et à l'auth.
La clé de service (`supabaseAdmin`) n'est chargée que dans les handlers serveur, après vérification du rôle.

---
## 0. Schéma privé (private)
```sql
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      and role = _role
  )
$function$
;

CREATE OR REPLACE FUNCTION private.prevent_validated_edit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Only allow Informaticien to bypass validation lock
    IF OLD.validated_by_id IS NOT NULL AND NOT private.has_role(auth.uid(), 'informaticien') THEN
        RAISE EXCEPTION 'Opération verrouillée : cette donnée a déjà été validée par le PDG et ne peut plus être modifiée.';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.process_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs(user_id, action, table_name, record_id, old_data)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD)::jsonb);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs(user_id, action, table_name, record_id, old_data, new_data)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs(user_id, action, table_name, record_id, new_data)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW)::jsonb);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.update_sale_on_payment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.sales
    SET balance = balance - NEW.amount,
        updated_at = now()
    WHERE id = NEW.sale_id;
    
    RETURN NEW;
END;
$function$
;

```
## 1. Types énumérés (ENUM)
```sql
CREATE TYPE public.acquisition_cost_category AS ENUM ('Prix Achat', 'Frais Acte', 'Géomètre', 'Commission', 'Taxe', 'Autre');
CREATE TYPE public.adjustment_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.adjustment_type AS ENUM ('change_plot', 'price_adjustment');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'pdg', 'comptable', 'secretaire', 'commercial', 'responsable_agence', 'informaticien', 'client', 'super_admin');
CREATE TYPE public.expense_status AS ENUM ('brouillon', 'en_attente_validation', 'validé', 'rejeté');
CREATE TYPE public.id_type AS ENUM ('cni', 'passeport', 'permis', 'autre');
CREATE TYPE public.payment_method AS ENUM ('espece', 'virement', 'cheque', 'mobile_money');
CREATE TYPE public.payment_plan_type AS ENUM ('comptant', 'echelonne');
CREATE TYPE public.plot_status AS ENUM ('disponible', 'reserve', 'vendu', 'litige');
CREATE TYPE public.plot_status_new AS ENUM ('Disponible', 'Réservée', 'Attribuée', 'En cours de paiement', 'Entièrement payée', 'Vendue', 'Bloquée', 'Annulée');
CREATE TYPE public.reservation_status AS ENUM ('active', 'converted', 'expired', 'cancelled');
CREATE TYPE public.sale_status AS ENUM ('reservation', 'en_cours', 'termine', 'annule');
CREATE TYPE public.schedule_status AS ENUM ('En attente', 'Partiel', 'Payé', 'Retard');
CREATE TYPE public.schedule_type AS ENUM ('automatique', 'manuel');
CREATE TYPE public.site_status AS ENUM ('actif', 'inactif', 'termine');
```

## 2. Tables

### public.acquisition_costs
```sql
CREATE TABLE public.acquisition_costs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  acquisition_id uuid NOT NULL,
  category acquisition_cost_category NOT NULL,
  amount numeric NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  description text,
  proof_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.acquisition_costs ADD CONSTRAINT acquisition_costs_pkey PRIMARY KEY (id);
ALTER TABLE public.acquisition_costs ADD CONSTRAINT acquisition_costs_acquisition_id_fkey FOREIGN KEY (acquisition_id) REFERENCES acquisitions(id) ON DELETE CASCADE;
ALTER TABLE public.acquisition_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PDG and Comptable can manage acquisition costs" ON public.acquisition_costs AS PERMISSIVE FOR ALL TO authenticated
  USING ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'comptable'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Staff can view acquisition costs" ON public.acquisition_costs AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE TRIGGER audit_acquisition_costs_trigger AFTER INSERT OR DELETE OR UPDATE ON public.acquisition_costs FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.acquisitions
```sql
CREATE TABLE public.acquisitions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  lotissement_id uuid,
  plot_id uuid,
  vendeur text NOT NULL,
  date_achat date DEFAULT CURRENT_DATE NOT NULL,
  prix_principal numeric DEFAULT 0 NOT NULL,
  status text DEFAULT 'En attente'::text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  prepared_by_id uuid,
  validated_by_id uuid,
  validation_date timestamp with time zone
);
ALTER TABLE public.acquisitions ADD CONSTRAINT acquisitions_pkey PRIMARY KEY (id);
ALTER TABLE public.acquisitions ADD CONSTRAINT acquisitions_lotissement_id_fkey FOREIGN KEY (lotissement_id) REFERENCES lotissements(id) ON DELETE SET NULL;
ALTER TABLE public.acquisitions ADD CONSTRAINT acquisitions_plot_id_fkey FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE SET NULL;
ALTER TABLE public.acquisitions ADD CONSTRAINT acquisitions_prepared_by_id_fkey FOREIGN KEY (prepared_by_id) REFERENCES auth.users(id);
ALTER TABLE public.acquisitions ADD CONSTRAINT acquisitions_validated_by_id_fkey FOREIGN KEY (validated_by_id) REFERENCES auth.users(id);
ALTER TABLE public.acquisitions ADD CONSTRAINT acquisitions_check CHECK (((lotissement_id IS NOT NULL) OR (plot_id IS NOT NULL)));
ALTER TABLE public.acquisitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PDG and Comptable can manage acquisitions" ON public.acquisitions AS PERMISSIVE FOR ALL TO authenticated
  USING ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'comptable'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "PDG can validate acquisitions" ON public.acquisitions AS PERMISSIVE FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'pdg'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'pdg'::app_role));
CREATE POLICY "Staff can view acquisitions" ON public.acquisitions AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Super Admin all on acquisitions" ON public.acquisitions AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER audit_acquisitions_trigger AFTER INSERT OR DELETE OR UPDATE ON public.acquisitions FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
CREATE TRIGGER tr_lock_validated_acquisition BEFORE UPDATE ON public.acquisitions FOR EACH ROW EXECUTE FUNCTION private.prevent_validated_edit();
```

### public.agences
```sql
CREATE TABLE public.agences (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  city text DEFAULT 'Maradi'::text NOT NULL,
  address text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  code text
);
ALTER TABLE public.agences ADD CONSTRAINT agences_pkey PRIMARY KEY (id);
ALTER TABLE public.agences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view active agences" ON public.agences AS PERMISSIVE FOR SELECT TO authenticated
  USING ((is_active = true));
CREATE POLICY "PDG and Informaticien can manage agences" ON public.agences AS PERMISSIVE FOR ALL TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Super Admin all on agences" ON public.agences AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public.agences FOR EACH ROW EXECUTE FUNCTION process_audit_log();
```

### public.app_settings
```sql
CREATE TABLE public.app_settings (
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_pkey PRIMARY KEY (key);
ALTER TABLE public.app_settings ADD CONSTRAINT app_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view settings" ON public.app_settings AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "PDG and Informaticien can manage settings" ON public.app_settings AS PERMISSIVE FOR ALL TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Super Admin all on app_settings" ON public.app_settings AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION process_audit_log();
```

### public.audit_finance
```sql
CREATE TABLE public.audit_finance (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  sale_id uuid,
  payment_id uuid,
  refund_id uuid,
  operation_type text NOT NULL,
  amount numeric NOT NULL,
  previous_balance numeric,
  new_balance numeric,
  user_id uuid,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  agency_id uuid
);
ALTER TABLE public.audit_finance ADD CONSTRAINT audit_finance_pkey PRIMARY KEY (id);
ALTER TABLE public.audit_finance ADD CONSTRAINT audit_finance_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES agences(id);
ALTER TABLE public.audit_finance ADD CONSTRAINT audit_finance_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id);
ALTER TABLE public.audit_finance ADD CONSTRAINT audit_finance_refund_id_fkey FOREIGN KEY (refund_id) REFERENCES refunds(id);
ALTER TABLE public.audit_finance ADD CONSTRAINT audit_finance_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id);
ALTER TABLE public.audit_finance ADD CONSTRAINT audit_finance_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.audit_finance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Financial roles can insert audit" ON public.audit_finance AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'super_admin'::text) OR has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'comptable'::text)));
CREATE POLICY "Financial roles can view audit" ON public.audit_finance AS PERMISSIVE FOR SELECT TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'super_admin'::text) OR ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'comptable'::text)) AND (agency_id IN ( SELECT audit_finance.agency_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))))));
CREATE POLICY "Super admins can view financial audit" ON public.audit_finance AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
```

### public.audit_finance_corrections
```sql
CREATE TABLE public.audit_finance_corrections (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  record_type text NOT NULL,
  record_id uuid NOT NULL,
  old_data jsonb,
  new_data jsonb,
  reason text NOT NULL,
  corrected_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.audit_finance_corrections ADD CONSTRAINT audit_finance_corrections_pkey PRIMARY KEY (id);
ALTER TABLE public.audit_finance_corrections ADD CONSTRAINT audit_finance_corrections_corrected_by_fkey FOREIGN KEY (corrected_by) REFERENCES auth.users(id);
ALTER TABLE public.audit_finance_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PDG peut consulter les corrections" ON public.audit_finance_corrections AS PERMISSIVE FOR SELECT TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));
CREATE POLICY "Utilisateurs authentifies peuvent tracer une correction" ON public.audit_finance_corrections AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((corrected_by = auth.uid()));
```

### public.audit_logs
```sql
CREATE TABLE public.audit_logs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs AS PERMISSIVE FOR SELECT TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Admins can view audit logs" ON public.audit_logs AS PERMISSIVE FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Super Admin all on audit_logs" ON public.audit_logs AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
```

### public.cash_journals
```sql
CREATE TABLE public.cash_journals (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  agency_id uuid NOT NULL,
  opened_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  opened_by_id uuid NOT NULL,
  closed_by_id uuid,
  opening_balance numeric(15,2) DEFAULT 0 NOT NULL,
  theoretical_closing_balance numeric(15,2) DEFAULT 0 NOT NULL,
  actual_closing_balance numeric(15,2),
  discrepancy numeric(15,2),
  discrepancy_reason text,
  status text DEFAULT 'ouvert'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.cash_journals ADD CONSTRAINT cash_journals_pkey PRIMARY KEY (id);
ALTER TABLE public.cash_journals ADD CONSTRAINT cash_journals_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES agences(id);
ALTER TABLE public.cash_journals ADD CONSTRAINT cash_journals_closed_by_id_fkey FOREIGN KEY (closed_by_id) REFERENCES auth.users(id);
ALTER TABLE public.cash_journals ADD CONSTRAINT cash_journals_opened_by_id_fkey FOREIGN KEY (opened_by_id) REFERENCES auth.users(id);
ALTER TABLE public.cash_journals ADD CONSTRAINT cash_journals_status_check CHECK ((status = ANY (ARRAY['ouvert'::text, 'fermé'::text, 'en_attente_validation'::text])));
ALTER TABLE public.cash_journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins et PDG voient tout sur les caisses" ON public.cash_journals AS PERMISSIVE FOR SELECT TO authenticated
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'super_admin'::text) OR has_role(auth.uid(), 'pdg'::text)));
CREATE POLICY "Agents voient leur agence" ON public.cash_journals AS PERMISSIVE FOR SELECT TO authenticated
  USING ((agency_id IN ( SELECT cash_journals.agency_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));
CREATE POLICY "Personnel habilité met à jour la caisse de son agence" ON public.cash_journals AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((has_permission(auth.uid(), 'manage_cash_journal'::text) OR has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'comptable'::app_role) OR has_role(auth.uid(), 'responsable_agence'::app_role)))
  WITH CHECK ((has_permission(auth.uid(), 'manage_cash_journal'::text) OR has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'comptable'::app_role) OR has_role(auth.uid(), 'responsable_agence'::app_role)));
CREATE POLICY "Personnel habilité ouvre la caisse de son agence" ON public.cash_journals AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (((opened_by_id = auth.uid()) AND (has_permission(auth.uid(), 'manage_cash_journal'::text) OR has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'comptable'::app_role) OR has_role(auth.uid(), 'responsable_agence'::app_role))));
CREATE TRIGGER tr_notify_pdg_on_cash_discrepancy AFTER UPDATE OF status ON public.cash_journals FOR EACH ROW WHEN ((new.status = 'fermé'::text)) EXECUTE FUNCTION fn_tr_notify_pdg_cash_discrepancy();
```

### public.client_documents
```sql
CREATE TABLE public.client_documents (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  client_id uuid NOT NULL,
  name text NOT NULL,
  document_type text NOT NULL,
  file_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid
);
ALTER TABLE public.client_documents ADD CONSTRAINT client_documents_pkey PRIMARY KEY (id);
ALTER TABLE public.client_documents ADD CONSTRAINT client_documents_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE public.client_documents ADD CONSTRAINT client_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can add client documents" ON public.client_documents AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (is_staff());
CREATE POLICY "Staff can view client documents" ON public.client_documents AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Super Admin all on client_documents" ON public.client_documents AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER audit_client_documents_trigger AFTER INSERT OR DELETE OR UPDATE ON public.client_documents FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.client_interactions
```sql
CREATE TABLE public.client_interactions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  client_id uuid NOT NULL,
  user_id uuid NOT NULL,
  interaction_type text NOT NULL,
  notes text,
  interaction_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.client_interactions ADD CONSTRAINT client_interactions_pkey PRIMARY KEY (id);
ALTER TABLE public.client_interactions ADD CONSTRAINT client_interactions_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE public.client_interactions ADD CONSTRAINT client_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.client_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage client interactions" ON public.client_interactions AS PERMISSIVE FOR ALL TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());
CREATE POLICY "Staff can view client interactions" ON public.client_interactions AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Super Admin all on client_interactions" ON public.client_interactions AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE POLICY "Users can record interactions" ON public.client_interactions AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));
CREATE TRIGGER audit_client_interactions_trigger AFTER INSERT OR DELETE OR UPDATE ON public.client_interactions FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.clients
```sql
CREATE TABLE public.clients (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text NOT NULL,
  address text,
  id_type id_type DEFAULT 'cni'::id_type NOT NULL,
  id_number text,
  occupation text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  date_naissance date,
  lieu_naissance text,
  nationalite text,
  civilite text,
  created_by uuid
);
ALTER TABLE public.clients ADD CONSTRAINT unique_client_phone UNIQUE (phone);
ALTER TABLE public.clients ADD CONSTRAINT clients_pkey PRIMARY KEY (id);
ALTER TABLE public.clients ADD CONSTRAINT clients_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.clients ADD CONSTRAINT clients_civilite_check CHECK ((civilite = ANY (ARRAY['M.'::text, 'Mme'::text, 'Mlle'::text])));
CREATE UNIQUE INDEX clients_email_unique_idx ON public.clients USING btree (email) WHERE ((email IS NOT NULL) AND (email <> ''::text));
CREATE UNIQUE INDEX clients_email_key ON public.clients USING btree (email) WHERE (email IS NOT NULL);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can delete clients" ON public.clients AS PERMISSIVE FOR DELETE TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'super_admin'::text)));
CREATE POLICY "Staff can insert clients" ON public.clients AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((is_staff() AND (created_by = auth.uid())));
CREATE POLICY "Staff can select clients" ON public.clients AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Staff can update clients" ON public.clients AS PERMISSIVE FOR UPDATE TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());
CREATE POLICY "Super Admin all on clients" ON public.clients AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER audit_clients_trigger AFTER INSERT OR DELETE OR UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.contract_snapshots
```sql
CREATE TABLE public.contract_snapshots (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  sale_id uuid NOT NULL,
  client_data jsonb NOT NULL,
  plot_data jsonb NOT NULL,
  sale_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid
);
ALTER TABLE public.contract_snapshots ADD CONSTRAINT contract_snapshots_pkey PRIMARY KEY (id);
ALTER TABLE public.contract_snapshots ADD CONSTRAINT contract_snapshots_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.contract_snapshots ADD CONSTRAINT contract_snapshots_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
ALTER TABLE public.contract_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view contract snapshots" ON public.contract_snapshots AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
```

### public.contracts
```sql
CREATE TABLE public.contracts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  sale_id uuid NOT NULL,
  contract_number text NOT NULL,
  content_url text,
  version integer DEFAULT 1,
  signed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.contracts ADD CONSTRAINT contracts_contract_number_key UNIQUE (contract_number);
ALTER TABLE public.contracts ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);
ALTER TABLE public.contracts ADD CONSTRAINT contracts_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can create contracts" ON public.contracts AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (is_staff());
CREATE POLICY "Staff can view contracts" ON public.contracts AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
```

### public.daily_cash_adjustments
```sql
CREATE TABLE public.daily_cash_adjustments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  journal_id uuid NOT NULL,
  amount numeric NOT NULL,
  reason text NOT NULL,
  adjusted_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.daily_cash_adjustments ADD CONSTRAINT daily_cash_adjustments_pkey PRIMARY KEY (id);
ALTER TABLE public.daily_cash_adjustments ADD CONSTRAINT daily_cash_adjustments_adjusted_by_fkey FOREIGN KEY (adjusted_by) REFERENCES auth.users(id);
ALTER TABLE public.daily_cash_adjustments ADD CONSTRAINT daily_cash_adjustments_journal_id_fkey FOREIGN KEY (journal_id) REFERENCES cash_journals(id) ON DELETE CASCADE;
ALTER TABLE public.daily_cash_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins or agency managers can insert adjustments" ON public.daily_cash_adjustments AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['pdg'::app_role, 'admin'::app_role, 'moderator'::app_role]))))));
CREATE POLICY "Users can view adjustments of their agency journals" ON public.daily_cash_adjustments AS PERMISSIVE FOR SELECT TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM (cash_journals j
     JOIN user_roles ur ON ((j.agency_id = ur.agence_id)))
  WHERE ((j.id = daily_cash_adjustments.journal_id) AND (ur.user_id = auth.uid())))));
```

### public.daily_cash_operations
```sql
CREATE TABLE public.daily_cash_operations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  agency_id uuid,
  operation_date date DEFAULT CURRENT_DATE,
  operation_type text,
  amount numeric(15,2) NOT NULL,
  payment_method text NOT NULL,
  reference_id uuid,
  description text,
  performed_by uuid,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.daily_cash_operations ADD CONSTRAINT daily_cash_operations_pkey PRIMARY KEY (id);
ALTER TABLE public.daily_cash_operations ADD CONSTRAINT daily_cash_operations_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES agences(id);
ALTER TABLE public.daily_cash_operations ADD CONSTRAINT daily_cash_operations_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES auth.users(id);
ALTER TABLE public.daily_cash_operations ADD CONSTRAINT daily_cash_operations_operation_type_check CHECK ((operation_type = ANY (ARRAY['ENTREE'::text, 'SORTIE'::text])));
ALTER TABLE public.daily_cash_operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and accountants can view cash ops" ON public.daily_cash_operations AS PERMISSIVE FOR SELECT TO authenticated
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'comptable'::text) OR has_role(auth.uid(), 'super_admin'::text)));
CREATE TRIGGER tr_sync_cash_inflows AFTER INSERT ON public.daily_cash_operations FOR EACH ROW EXECUTE FUNCTION fn_sync_cash_inflows();
CREATE TRIGGER tr_sync_cash_journal_balance_ops AFTER INSERT OR DELETE OR UPDATE ON public.daily_cash_operations FOR EACH ROW EXECUTE FUNCTION fn_sync_journal_balance();
```

### public.document_sequences
```sql
CREATE TABLE public.document_sequences (
  agency_code text NOT NULL,
  doc_type text NOT NULL,
  year integer NOT NULL,
  last_value integer DEFAULT 0 NOT NULL
);
ALTER TABLE public.document_sequences ADD CONSTRAINT document_sequences_pkey PRIMARY KEY (agency_code, doc_type, year);
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;
```

### public.document_templates
```sql
CREATE TABLE public.document_templates (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  doc_type text NOT NULL,
  label text NOT NULL,
  version integer DEFAULT 1 NOT NULL,
  header_text text,
  footer_text text,
  legal_mentions text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE public.document_templates ADD CONSTRAINT document_templates_doc_type_version_key UNIQUE (doc_type, version);
ALTER TABLE public.document_templates ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY templates_select_staff ON public.document_templates AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff(auth.uid()));
```

### public.documents
```sql
CREATE TABLE public.documents (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  doc_type text NOT NULL,
  doc_number text NOT NULL,
  agency_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  payload jsonb NOT NULL,
  template_version integer DEFAULT 1 NOT NULL,
  content_hash text NOT NULL,
  status text DEFAULT 'emis'::text NOT NULL,
  replaces_document_id uuid,
  storage_path text,
  issued_by uuid,
  issued_at timestamp with time zone DEFAULT now() NOT NULL,
  reissue_count integer DEFAULT 0 NOT NULL,
  cancelled_by uuid,
  cancelled_at timestamp with time zone,
  cancel_reason text
);
ALTER TABLE public.documents ADD CONSTRAINT documents_doc_number_key UNIQUE (doc_number);
ALTER TABLE public.documents ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
ALTER TABLE public.documents ADD CONSTRAINT documents_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES agences(id);
ALTER TABLE public.documents ADD CONSTRAINT documents_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES auth.users(id);
ALTER TABLE public.documents ADD CONSTRAINT documents_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES auth.users(id);
ALTER TABLE public.documents ADD CONSTRAINT documents_replaces_document_id_fkey FOREIGN KEY (replaces_document_id) REFERENCES documents(id);
ALTER TABLE public.documents ADD CONSTRAINT documents_status_chk CHECK ((status = ANY (ARRAY['emis'::text, 'annule'::text, 'remplace'::text])));
CREATE INDEX idx_documents_entity ON public.documents USING btree (entity_type, entity_id);
CREATE INDEX idx_documents_type_date ON public.documents USING btree (doc_type, issued_at DESC);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_insert_staff ON public.documents AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((is_staff(auth.uid()) AND (issued_by = auth.uid())));
CREATE POLICY documents_select_staff ON public.documents AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff(auth.uid()));
CREATE POLICY documents_update_direction ON public.documents AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)))
  WITH CHECK ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));
CREATE TRIGGER tr_documents_immutable BEFORE DELETE OR UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION fn_documents_immutable();
```

### public.expense_categories
```sql
CREATE TABLE public.expense_categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.expense_categories ADD CONSTRAINT expense_categories_name_key UNIQUE (name);
ALTER TABLE public.expense_categories ADD CONSTRAINT expense_categories_pkey PRIMARY KEY (id);
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All users can view categories" ON public.expense_categories AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "PDG and Informaticien can manage categories" ON public.expense_categories AS PERMISSIVE FOR ALL TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Super Admin all on expense_categories" ON public.expense_categories AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public.expense_categories FOR EACH ROW EXECUTE FUNCTION process_audit_log();
```

### public.expenses
```sql
CREATE TABLE public.expenses (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  date date DEFAULT CURRENT_DATE NOT NULL,
  amount numeric(15,2) NOT NULL,
  category_id uuid NOT NULL,
  description text NOT NULL,
  beneficiary text,
  payment_method text NOT NULL,
  agency_id uuid NOT NULL,
  project_id uuid,
  receipt_url text,
  status expense_status DEFAULT 'en_attente_validation'::expense_status NOT NULL,
  created_by_id uuid NOT NULL,
  validated_by_id uuid,
  validation_date timestamp with time zone,
  cash_journal_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  validation_notes text
);
ALTER TABLE public.expenses ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);
ALTER TABLE public.expenses ADD CONSTRAINT expenses_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES agences(id);
ALTER TABLE public.expenses ADD CONSTRAINT expenses_cash_journal_id_fkey FOREIGN KEY (cash_journal_id) REFERENCES cash_journals(id);
ALTER TABLE public.expenses ADD CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES expense_categories(id);
ALTER TABLE public.expenses ADD CONSTRAINT expenses_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES auth.users(id);
ALTER TABLE public.expenses ADD CONSTRAINT expenses_project_id_fkey FOREIGN KEY (project_id) REFERENCES lotissements(id);
ALTER TABLE public.expenses ADD CONSTRAINT expenses_validated_by_id_fkey FOREIGN KEY (validated_by_id) REFERENCES auth.users(id);
ALTER TABLE public.expenses ADD CONSTRAINT expenses_amount_check CHECK ((amount > (0)::numeric));
ALTER TABLE public.expenses ADD CONSTRAINT expenses_payment_method_check CHECK ((payment_method = ANY (ARRAY['espece'::text, 'nita'::text, 'virement'::text, 'cheque'::text, 'mobile_money'::text])));
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comptables et Admins voient leur agence" ON public.expenses AS PERMISSIVE FOR SELECT TO authenticated
  USING ((agency_id IN ( SELECT expenses.agency_id
   FROM user_roles
  WHERE (user_roles.user_id = auth.uid()))));
CREATE POLICY "PDG can see all expenses" ON public.expenses AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'pdg'::text));
CREATE POLICY "Super Admins et PDG voient toutes les dépenses" ON public.expenses AS PERMISSIVE FOR SELECT TO authenticated
  USING ((has_role(auth.uid(), 'super_admin'::text) OR has_role(auth.uid(), 'pdg'::text)));
CREATE POLICY "Utilisateurs peuvent insérer des dépenses" ON public.expenses AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE TRIGGER tr_lock_closed_cash_day BEFORE INSERT OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION fn_lock_closed_cash_journal();
CREATE TRIGGER tr_notify_agent_on_expense_status_change AFTER UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION fn_notify_agent_on_expense_status_change();
CREATE TRIGGER tr_notify_pdg_on_new_expense AFTER INSERT ON public.expenses FOR EACH ROW WHEN ((new.status = 'en_attente_validation'::expense_status)) EXECUTE FUNCTION fn_notify_pdg_on_new_expense();
CREATE TRIGGER tr_prevent_expense_deletion BEFORE DELETE ON public.expenses FOR EACH ROW EXECUTE FUNCTION fn_prevent_deletion();
CREATE TRIGGER tr_sync_cash_journal_balance_exp AFTER INSERT OR DELETE OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION fn_sync_journal_balance();
```

### public.ilots
```sql
CREATE TABLE public.ilots (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  zone_id uuid NOT NULL,
  numero text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.ilots ADD CONSTRAINT ilots_zone_id_numero_key UNIQUE (zone_id, numero);
ALTER TABLE public.ilots ADD CONSTRAINT ilots_pkey PRIMARY KEY (id);
ALTER TABLE public.ilots ADD CONSTRAINT ilots_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE;
ALTER TABLE public.ilots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage ilots" ON public.ilots AS PERMISSIVE FOR ALL TO authenticated
  USING ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'responsable_agence'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Super Admin all on ilots" ON public.ilots AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE POLICY "Users can view ilots" ON public.ilots AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE TRIGGER audit_ilots_trigger AFTER INSERT OR DELETE OR UPDATE ON public.ilots FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.lotissement_attachments
```sql
CREATE TABLE public.lotissement_attachments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  lotissement_id uuid NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.lotissement_attachments ADD CONSTRAINT lotissement_attachments_pkey PRIMARY KEY (id);
ALTER TABLE public.lotissement_attachments ADD CONSTRAINT lotissement_attachments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.lotissement_attachments ADD CONSTRAINT lotissement_attachments_lotissement_id_fkey FOREIGN KEY (lotissement_id) REFERENCES lotissements(id) ON DELETE CASCADE;
ALTER TABLE public.lotissement_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PDG and Informaticien can manage attachments" ON public.lotissement_attachments AS PERMISSIVE FOR ALL TO authenticated
  USING ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Users can view lotissement attachments" ON public.lotissement_attachments AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
```

### public.lotissements
```sql
CREATE TABLE public.lotissements (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  agence_id uuid,
  name text NOT NULL,
  location text NOT NULL,
  plan_communal text,
  superficie_totale numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.lotissements ADD CONSTRAINT lotissements_pkey PRIMARY KEY (id);
ALTER TABLE public.lotissements ADD CONSTRAINT lotissements_agence_id_fkey FOREIGN KEY (agence_id) REFERENCES agences(id);
ALTER TABLE public.lotissements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PDG and Informaticien can manage lotissements" ON public.lotissements AS PERMISSIVE FOR ALL TO authenticated
  USING ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Super Admin all on lotissements" ON public.lotissements AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE POLICY "Users can view lotissements" ON public.lotissements AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE TRIGGER audit_lotissements_trigger AFTER INSERT OR DELETE OR UPDATE ON public.lotissements FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.notifications
```sql
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid,
  title text NOT NULL,
  message text NOT NULL,
  type text,
  is_read boolean DEFAULT false,
  link text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System can create notifications" ON public.notifications AS PERMISSIVE FOR INSERT TO authenticated, service_role
  WITH CHECK (true);
CREATE POLICY "Users can see their own notifications" ON public.notifications AS PERMISSIVE FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));
CREATE POLICY "Users can view own notifications" ON public.notifications AS PERMISSIVE FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));
```

### public.payment_corrections
```sql
CREATE TABLE public.payment_corrections (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  payment_id uuid,
  old_amount numeric(15,2),
  new_amount numeric(15,2),
  old_data jsonb,
  new_data jsonb,
  reason text NOT NULL,
  corrected_by uuid,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.payment_corrections ADD CONSTRAINT payment_corrections_pkey PRIMARY KEY (id);
ALTER TABLE public.payment_corrections ADD CONSTRAINT payment_corrections_corrected_by_fkey FOREIGN KEY (corrected_by) REFERENCES auth.users(id);
ALTER TABLE public.payment_corrections ADD CONSTRAINT payment_corrections_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE;
ALTER TABLE public.payment_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and accountants can view corrections" ON public.payment_corrections AS PERMISSIVE FOR SELECT TO authenticated
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'comptable'::text) OR has_role(auth.uid(), 'super_admin'::text)));
CREATE TRIGGER tr_audit_payment_correction AFTER INSERT ON public.payment_corrections FOR EACH ROW EXECUTE FUNCTION fn_audit_payment_correction();
CREATE TRIGGER tr_notify_pdg_on_correction AFTER INSERT ON public.payment_corrections FOR EACH ROW EXECUTE FUNCTION fn_notify_pdg_on_correction();
```

### public.payment_schedules
```sql
CREATE TABLE public.payment_schedules (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  sale_id uuid NOT NULL,
  due_date date NOT NULL,
  amount_due numeric(20,2) NOT NULL,
  amount_paid numeric(20,2) DEFAULT 0,
  status text DEFAULT 'En attente'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  schedule_type text DEFAULT 'automatique'::text,
  notes text,
  last_reminder_sent_at timestamp with time zone
);
ALTER TABLE public.payment_schedules ADD CONSTRAINT tr_check_sale_schedule_consistency TRIGGER DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public.payment_schedules ADD CONSTRAINT payment_schedules_pkey PRIMARY KEY (id);
ALTER TABLE public.payment_schedules ADD CONSTRAINT payment_schedules_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
ALTER TABLE public.payment_schedules ADD CONSTRAINT payment_schedules_status_check CHECK ((status = ANY (ARRAY['En attente'::text, 'Payé'::text, 'Retard'::text])));
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers can delete payment schedules" ON public.payment_schedules AS PERMISSIVE FOR DELETE TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'super_admin'::text)));
CREATE POLICY "Staff can insert payment schedules" ON public.payment_schedules AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (is_staff());
CREATE POLICY "Staff can select payment schedules" ON public.payment_schedules AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Staff can update payment schedules" ON public.payment_schedules AS PERMISSIVE FOR UPDATE TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());
CREATE POLICY "Super Admin all on payment_schedules" ON public.payment_schedules AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE CONSTRAINT TRIGGER tr_check_sale_schedule_consistency AFTER INSERT OR DELETE OR UPDATE ON public.payment_schedules DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_sale_schedule_consistency();
```

### public.payments
```sql
CREATE TABLE public.payments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  sale_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  method payment_method NOT NULL,
  reference text,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  imputed_data jsonb DEFAULT '[]'::jsonb,
  confirmed_at timestamp with time zone,
  confirmed_by uuid
);
ALTER TABLE public.payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE public.payments ADD CONSTRAINT payments_confirmed_by_fkey FOREIGN KEY (confirmed_by) REFERENCES auth.users(id);
ALTER TABLE public.payments ADD CONSTRAINT payments_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read payments" ON public.payments AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Staff can record payments" ON public.payments AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role)));
CREATE POLICY "Super Admin all on payments" ON public.payments AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER audit_payments_trigger AFTER INSERT OR DELETE OR UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
CREATE TRIGGER tr_audit_payment_creation AFTER INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION fn_audit_payment_creation();
CREATE TRIGGER tr_notify_payment_registration AFTER INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION fn_notify_payment_registration();
CREATE TRIGGER tr_sync_payment_to_cash AFTER INSERT OR UPDATE OF confirmed_at ON public.payments FOR EACH ROW EXECUTE FUNCTION fn_sync_payment_to_cash();
CREATE TRIGGER update_sale_after_payment AFTER INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION private.update_sale_on_payment();
```

### public.plot_pricing
```sql
CREATE TABLE public.plot_pricing (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  plot_id uuid NOT NULL,
  base_price numeric(20,2) NOT NULL,
  min_price numeric(20,2),
  effective_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  prepared_by_id uuid,
  validated_by_id uuid,
  validation_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.plot_pricing ADD CONSTRAINT plot_pricing_pkey PRIMARY KEY (id);
ALTER TABLE public.plot_pricing ADD CONSTRAINT plot_pricing_plot_id_fkey FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE;
ALTER TABLE public.plot_pricing ADD CONSTRAINT plot_pricing_prepared_by_id_fkey FOREIGN KEY (prepared_by_id) REFERENCES auth.users(id);
ALTER TABLE public.plot_pricing ADD CONSTRAINT plot_pricing_validated_by_id_fkey FOREIGN KEY (validated_by_id) REFERENCES auth.users(id);
ALTER TABLE public.plot_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authorized roles can prepare plot pricing" ON public.plot_pricing AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'comptable'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "PDG can validate plot pricing" ON public.plot_pricing AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)))
  WITH CHECK ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Staff can view plot pricing" ON public.plot_pricing AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Super Admin all on plot_pricing" ON public.plot_pricing AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER audit_plot_pricing_trigger AFTER INSERT OR DELETE OR UPDATE ON public.plot_pricing FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.plot_status_history
```sql
CREATE TABLE public.plot_status_history (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  plot_id uuid NOT NULL,
  old_status plot_status_new,
  new_status plot_status_new NOT NULL,
  user_id uuid,
  reason text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.plot_status_history ADD CONSTRAINT plot_status_history_pkey PRIMARY KEY (id);
ALTER TABLE public.plot_status_history ADD CONSTRAINT plot_status_history_plot_id_fkey FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE CASCADE;
ALTER TABLE public.plot_status_history ADD CONSTRAINT plot_status_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.plot_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view status history" ON public.plot_status_history AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE TRIGGER audit_plot_status_history_trigger AFTER INSERT OR DELETE OR UPDATE ON public.plot_status_history FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.plots
```sql
CREATE TABLE public.plots (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  site_id uuid NOT NULL,
  plot_number text NOT NULL,
  surface_area numeric NOT NULL,
  base_price numeric NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  status plot_status_new DEFAULT 'Disponible'::plot_status_new NOT NULL,
  ilot_id uuid,
  plan_url text,
  cost_price_calculated numeric DEFAULT 0
);
ALTER TABLE public.plots ADD CONSTRAINT plots_site_id_plot_number_key UNIQUE (site_id, plot_number);
ALTER TABLE public.plots ADD CONSTRAINT plots_pkey PRIMARY KEY (id);
ALTER TABLE public.plots ADD CONSTRAINT plots_ilot_id_fkey FOREIGN KEY (ilot_id) REFERENCES ilots(id) ON DELETE CASCADE;
ALTER TABLE public.plots ADD CONSTRAINT plots_site_id_fkey FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage plots" ON public.plots AS PERMISSIVE FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read plots" ON public.plots AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Super Admin all on plots" ON public.plots AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER audit_plots_trigger AFTER INSERT OR DELETE OR UPDATE ON public.plots FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
CREATE TRIGGER tr_prevent_plot_deletion_with_sales BEFORE DELETE ON public.plots FOR EACH ROW EXECUTE FUNCTION fn_prevent_plot_deletion_with_sales();
```

### public.price_templates
```sql
CREATE TABLE public.price_templates (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  surface_range_min numeric NOT NULL,
  surface_range_max numeric NOT NULL,
  price_per_m2 numeric NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.price_templates ADD CONSTRAINT price_templates_pkey PRIMARY KEY (id);
ALTER TABLE public.price_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PDG and Informaticien can manage price templates" ON public.price_templates AS PERMISSIVE FOR ALL TO authenticated
  USING ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Users can view active price templates" ON public.price_templates AS PERMISSIVE FOR SELECT TO authenticated
  USING (((is_active = true) OR private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE TRIGGER audit_price_templates_trigger AFTER INSERT OR DELETE OR UPDATE ON public.price_templates FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.profiles
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone DEFAULT now(),
  email text
);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((auth.uid() = id))
  WITH CHECK ((auth.uid() = id));
```

### public.refunds
```sql
CREATE TABLE public.refunds (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  sale_id uuid NOT NULL,
  amount numeric NOT NULL,
  refund_date timestamp with time zone DEFAULT now(),
  reason text,
  processed_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  client_id uuid,
  method text,
  reference text
);
ALTER TABLE public.refunds ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);
ALTER TABLE public.refunds ADD CONSTRAINT refunds_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
ALTER TABLE public.refunds ADD CONSTRAINT refunds_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES auth.users(id);
ALTER TABLE public.refunds ADD CONSTRAINT refunds_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id);
ALTER TABLE public.refunds ADD CONSTRAINT refunds_amount_check CHECK ((amount > (0)::numeric));
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view refunds" ON public.refunds AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::text));
CREATE POLICY "Finance roles can create refunds" ON public.refunds AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'comptable'::text) OR has_role(auth.uid(), 'super_admin'::text)));
CREATE POLICY "Finance roles can view refunds" ON public.refunds AS PERMISSIVE FOR SELECT TO authenticated
  USING ((has_role(auth.uid(), 'admin'::text) OR has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'comptable'::text) OR has_role(auth.uid(), 'super_admin'::text)));
CREATE POLICY "Super admins can do everything on refunds" ON public.refunds AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER tr_audit_refund_creation AFTER INSERT ON public.refunds FOR EACH ROW EXECUTE FUNCTION fn_audit_refund_creation();
```

### public.reservations
```sql
CREATE TABLE public.reservations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  plot_id uuid NOT NULL,
  client_id uuid NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  status reservation_status DEFAULT 'active'::reservation_status NOT NULL,
  reminder_sent_at timestamp with time zone,
  cancellation_reason text
);
ALTER TABLE public.reservations ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);
ALTER TABLE public.reservations ADD CONSTRAINT reservations_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
ALTER TABLE public.reservations ADD CONSTRAINT reservations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.reservations ADD CONSTRAINT reservations_plot_id_fkey FOREIGN KEY (plot_id) REFERENCES plots(id);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins and managers can update reservations" ON public.reservations AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'informaticien'::app_role) OR (auth.uid() = created_by)));
CREATE POLICY "Authenticated users can view reservations" ON public.reservations AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Authorized users can create reservations" ON public.reservations AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = ANY (ARRAY['pdg'::app_role, 'informaticien'::app_role, 'secretaire'::app_role, 'commercial'::app_role]))))));
CREATE POLICY "Authorized users can update reservations" ON public.reservations AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = ANY (ARRAY['pdg'::app_role, 'informaticien'::app_role, 'secretaire'::app_role, 'commercial'::app_role]))))));
CREATE POLICY "Users can create reservations" ON public.reservations AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = created_by));
CREATE POLICY "Users can view all reservations" ON public.reservations AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE TRIGGER audit_reservations_trigger AFTER INSERT OR DELETE OR UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
CREATE TRIGGER reservation_plot_status_trigger AFTER INSERT OR UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION handle_reservation_status_change();
```

### public.role_permissions
```sql
CREATE TABLE public.role_permissions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  role app_role NOT NULL,
  permission text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_permission_key UNIQUE (role, permission);
ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage permissions" ON public.role_permissions AS PERMISSIVE FOR ALL TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "PDG can manage role permissions" ON public.role_permissions AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'pdg'::app_role));
```

### public.sale_adjustments
```sql
CREATE TABLE public.sale_adjustments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  sale_id uuid NOT NULL,
  type adjustment_type NOT NULL,
  amount numeric NOT NULL,
  reason text NOT NULL,
  status adjustment_status DEFAULT 'pending'::adjustment_status NOT NULL,
  requested_by uuid NOT NULL,
  validated_by uuid,
  validated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  previous_total_price numeric,
  new_total_price numeric
);
ALTER TABLE public.sale_adjustments ADD CONSTRAINT sale_adjustments_pkey PRIMARY KEY (id);
ALTER TABLE public.sale_adjustments ADD CONSTRAINT sale_adjustments_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id);
ALTER TABLE public.sale_adjustments ADD CONSTRAINT sale_adjustments_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
ALTER TABLE public.sale_adjustments ADD CONSTRAINT sale_adjustments_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES auth.users(id);
ALTER TABLE public.sale_adjustments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PDG and Admin can validate adjustments" ON public.sale_adjustments AS PERMISSIVE FOR UPDATE TO authenticated
  USING ((has_role(auth.uid(), 'pdg'::app_role) OR has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Staff can view adjustments" ON public.sale_adjustments AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Users can request adjustments" ON public.sale_adjustments AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = requested_by));
CREATE TRIGGER on_sale_adjustment_approved BEFORE UPDATE ON public.sale_adjustments FOR EACH ROW EXECUTE FUNCTION apply_sale_adjustment();
```

### public.sale_mutations
```sql
CREATE TABLE public.sale_mutations (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  sale_id uuid NOT NULL,
  old_plot_id uuid NOT NULL,
  new_plot_id uuid NOT NULL,
  reason text NOT NULL,
  price_difference numeric(20,2) NOT NULL,
  status text DEFAULT 'En attente'::text NOT NULL,
  requested_by uuid NOT NULL,
  validated_by uuid,
  validation_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.sale_mutations ADD CONSTRAINT sale_mutations_pkey PRIMARY KEY (id);
ALTER TABLE public.sale_mutations ADD CONSTRAINT sale_mutations_new_plot_id_fkey FOREIGN KEY (new_plot_id) REFERENCES plots(id);
ALTER TABLE public.sale_mutations ADD CONSTRAINT sale_mutations_old_plot_id_fkey FOREIGN KEY (old_plot_id) REFERENCES plots(id);
ALTER TABLE public.sale_mutations ADD CONSTRAINT sale_mutations_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id);
ALTER TABLE public.sale_mutations ADD CONSTRAINT sale_mutations_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
ALTER TABLE public.sale_mutations ADD CONSTRAINT sale_mutations_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES auth.users(id);
ALTER TABLE public.sale_mutations ADD CONSTRAINT sale_mutations_status_check CHECK ((status = ANY (ARRAY['En attente'::text, 'Validée'::text, 'Annulée'::text])));
ALTER TABLE public.sale_mutations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view mutations" ON public.sale_mutations AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Super Admin all on sale_mutations" ON public.sale_mutations AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE TRIGGER tr_handle_sale_mutation_validation AFTER UPDATE ON public.sale_mutations FOR EACH ROW EXECUTE FUNCTION handle_sale_mutation_validation();
```

### public.sale_transfers
```sql
CREATE TABLE public.sale_transfers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  sale_id uuid NOT NULL,
  old_plot_id uuid NOT NULL,
  new_plot_id uuid NOT NULL,
  reason text NOT NULL,
  price_difference numeric(15,2) DEFAULT 0 NOT NULL,
  authorized_by uuid,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.sale_transfers ADD CONSTRAINT sale_transfers_pkey PRIMARY KEY (id);
ALTER TABLE public.sale_transfers ADD CONSTRAINT sale_transfers_new_plot_id_fkey FOREIGN KEY (new_plot_id) REFERENCES plots(id);
ALTER TABLE public.sale_transfers ADD CONSTRAINT sale_transfers_old_plot_id_fkey FOREIGN KEY (old_plot_id) REFERENCES plots(id);
ALTER TABLE public.sale_transfers ADD CONSTRAINT sale_transfers_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
ALTER TABLE public.sale_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage transfers" ON public.sale_transfers AS PERMISSIVE FOR ALL TO authenticated
  USING ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'pdg'::app_role)));
CREATE POLICY "Staff can view transfers" ON public.sale_transfers AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
```

### public.sales
```sql
CREATE TABLE public.sales (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  client_id uuid NOT NULL,
  plot_id uuid NOT NULL,
  total_price numeric NOT NULL,
  down_payment numeric DEFAULT 0,
  balance numeric NOT NULL,
  status sale_status DEFAULT 'reservation'::sale_status NOT NULL,
  sale_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  prepared_by_id uuid,
  validated_by_id uuid,
  validation_date timestamp with time zone,
  catalog_price numeric(20,2),
  discount_amount numeric(20,2) DEFAULT 0,
  final_price numeric(20,2),
  price_validation_date timestamp with time zone,
  price_validated_by_id uuid,
  total_amount numeric(20,2),
  deposit_amount numeric(20,2),
  agency_id uuid,
  first_payment_date date,
  notes text,
  total_to_refund numeric DEFAULT 0 NOT NULL,
  refund_status text DEFAULT 'Aucun'::text NOT NULL
);
ALTER TABLE public.sales ADD CONSTRAINT sales_pkey PRIMARY KEY (id);
ALTER TABLE public.sales ADD CONSTRAINT sales_agency_id_fkey FOREIGN KEY (agency_id) REFERENCES agences(id);
ALTER TABLE public.sales ADD CONSTRAINT sales_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
ALTER TABLE public.sales ADD CONSTRAINT sales_plot_id_fkey FOREIGN KEY (plot_id) REFERENCES plots(id);
ALTER TABLE public.sales ADD CONSTRAINT sales_prepared_by_id_fkey FOREIGN KEY (prepared_by_id) REFERENCES auth.users(id);
ALTER TABLE public.sales ADD CONSTRAINT sales_price_validated_by_id_fkey FOREIGN KEY (price_validated_by_id) REFERENCES auth.users(id);
ALTER TABLE public.sales ADD CONSTRAINT sales_validated_by_id_fkey FOREIGN KEY (validated_by_id) REFERENCES auth.users(id);
CREATE UNIQUE INDEX idx_single_active_sale_per_plot ON public.sales USING btree (plot_id) WHERE (status = ANY (ARRAY['reservation'::sale_status, 'en_cours'::sale_status, 'termine'::sale_status]));
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PDG can validate sales" ON public.sales AS PERMISSIVE FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'pdg'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'pdg'::app_role));
CREATE POLICY "Staff can create sales" ON public.sales AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (is_staff());
CREATE POLICY "Staff can manage sales" ON public.sales AS PERMISSIVE FOR ALL TO authenticated
  USING ((private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'moderator'::app_role)));
CREATE POLICY "Staff can read sales" ON public.sales AS PERMISSIVE FOR SELECT TO authenticated
  USING (is_staff());
CREATE POLICY "Super Admin all on sales" ON public.sales AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE POLICY "Super admins can do everything on sales" ON public.sales AS PERMISSIVE FOR ALL TO authenticated
  USING ((has_role(auth.uid(), 'super_admin'::text) OR has_role(auth.uid(), 'admin'::text)));
CREATE TRIGGER audit_sales_trigger AFTER INSERT OR DELETE OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
CREATE TRIGGER sale_plot_status_trigger AFTER INSERT OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION handle_sale_plot_status_change();
CREATE TRIGGER tr_check_sale_price_update_protection BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION check_sale_price_update_protection();
CREATE TRIGGER tr_check_sale_schedule_consistency AFTER INSERT OR UPDATE OF total_amount, deposit_amount, status ON public.sales FOR EACH ROW EXECUTE FUNCTION fn_check_sale_schedule_consistency();
CREATE TRIGGER tr_handle_sale_cancellation AFTER UPDATE ON public.sales FOR EACH ROW WHEN ((new.status = 'annule'::sale_status)) EXECUTE FUNCTION fn_handle_sale_cancellation();
CREATE TRIGGER tr_lock_validated_sale BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION private.prevent_validated_edit();
CREATE TRIGGER tr_open_refund_claim_on_cancellation BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION fn_open_refund_claim_on_cancellation();
CREATE TRIGGER tr_prevent_validated_sale_edit BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION prevent_validated_sale_edit();
CREATE TRIGGER tr_sync_plot_status_integrity AFTER INSERT OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION fn_sync_plot_status_integrity();
CREATE TRIGGER tr_update_plot_status_on_sale AFTER INSERT OR UPDATE ON public.sales FOR EACH ROW EXECUTE FUNCTION update_plot_status_on_sale();
```

### public.sites
```sql
CREATE TABLE public.sites (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  location text NOT NULL,
  description text,
  status site_status DEFAULT 'actif'::site_status NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.sites ADD CONSTRAINT sites_pkey PRIMARY KEY (id);
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage sites" ON public.sites AS PERMISSIVE FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public read sites" ON public.sites AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE TRIGGER audit_sites_trigger AFTER INSERT OR DELETE OR UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

### public.user_roles
```sql
CREATE TABLE public.user_roles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  agence_id uuid
);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_agence_id_fkey FOREIGN KEY (agence_id) REFERENCES agences(id);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage user roles" ON public.user_roles AS PERMISSIVE FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Informaticiens can manage roles" ON public.user_roles AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'informaticien'::app_role))
  WITH CHECK (has_role(auth.uid(), 'informaticien'::app_role));
CREATE POLICY "PDG can see all roles" ON public.user_roles AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'pdg'::app_role));
CREATE POLICY "Super Admin all on user_roles" ON public.user_roles AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE POLICY "Users can view their own roles" ON public.user_roles AS PERMISSIVE FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));
CREATE TRIGGER audit_trigger AFTER INSERT OR DELETE OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION process_audit_log();
```

### public.zones
```sql
CREATE TABLE public.zones (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  lotissement_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.zones ADD CONSTRAINT zones_pkey PRIMARY KEY (id);
ALTER TABLE public.zones ADD CONSTRAINT zones_lotissement_id_fkey FOREIGN KEY (lotissement_id) REFERENCES lotissements(id) ON DELETE CASCADE;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PDG and Responsable can manage zones" ON public.zones AS PERMISSIVE FOR ALL TO authenticated
  USING ((private.has_role(auth.uid(), 'pdg'::app_role) OR private.has_role(auth.uid(), 'responsable_agence'::app_role) OR private.has_role(auth.uid(), 'informaticien'::app_role)));
CREATE POLICY "Super Admin all on zones" ON public.zones AS PERMISSIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::text));
CREATE POLICY "Users can view zones" ON public.zones AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);
CREATE TRIGGER audit_zones_trigger AFTER INSERT OR DELETE OR UPDATE ON public.zones FOR EACH ROW EXECUTE FUNCTION private.process_audit_log();
```

## 3. Vues
```sql
CREATE OR REPLACE VIEW public.v_commercial_performance_detailed AS
 SELECT p.id AS agent_id,
    p.email AS agent_email,
    COALESCE(p.full_name, p.email) AS agent_name,
    s.agency_id,
    a.name AS agency_name,
    count(s.id) AS total_sales,
    sum(COALESCE(s.final_price, s.total_price)) AS total_value,
    sum(s.balance) AS total_balance,
    sum((COALESCE(s.final_price, s.total_price) - COALESCE(s.balance, (0)::numeric))) AS collected_amount,
    count(s.id) FILTER (WHERE (s.balance > (0)::numeric)) AS active_sales,
    s.sale_date
   FROM ((profiles p
     LEFT JOIN sales s ON ((p.id = s.prepared_by_id)))
     LEFT JOIN agences a ON ((s.agency_id = a.id)))
  GROUP BY p.id, p.email, p.full_name, s.agency_id, a.name, s.sale_date;
CREATE OR REPLACE VIEW public.v_financial_summary AS
 WITH monthly_metrics AS (
         SELECT COALESCE(sum(sales.total_amount), (0)::numeric) AS monthly_sales,
            count(*) AS sales_count
           FROM sales
          WHERE ((sales.status = ANY (ARRAY['reservation'::sale_status, 'en_cours'::sale_status, 'termine'::sale_status])) AND (date_trunc('month'::text, sales.created_at) = date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)))
        ), collection_metrics AS (
         SELECT COALESCE(sum(payments.amount), (0)::numeric) AS monthly_collections
           FROM payments
          WHERE (date_trunc('month'::text, payments.payment_date) = date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))
        ), global_metrics AS (
         SELECT COALESCE(sum(sales.total_amount), (0)::numeric) AS total_ca_potential,
            COALESCE(sum(sales.balance), (0)::numeric) AS total_outstanding,
            count(*) AS active_sales_count
           FROM sales
          WHERE (sales.status = ANY (ARRAY['reservation'::sale_status, 'en_cours'::sale_status, 'termine'::sale_status]))
        ), payment_metrics AS (
         SELECT COALESCE(sum(payments.amount), (0)::numeric) AS total_payments
           FROM payments
        ), refund_metrics AS (
         SELECT COALESCE(sum(refunds.amount), (0)::numeric) AS total_refunds
           FROM refunds
        ), stock_metrics AS (
         SELECT COALESCE(sum(plots.base_price), (0)::numeric) AS stock_value,
            count(*) AS total_real_plots
           FROM plots
          WHERE (plots.status = 'Disponible'::plot_status_new)
        ), total_plots_count AS (
         SELECT count(*) AS total_count
           FROM plots
        ), integrity_metrics AS (
         SELECT count(*) AS integrity_alerts
           FROM audit_logs
          WHERE ((audit_logs.action = ANY (ARRAY['INTEGRITY_ALERT'::text, 'CRITICAL_INTEGRITY_VIOLATION'::text])) AND (audit_logs.created_at > (CURRENT_DATE - '7 days'::interval)))
        )
 SELECT m.monthly_sales,
    m.sales_count AS monthly_sales_count,
    c.monthly_collections,
    g.total_ca_potential,
    g.total_outstanding,
    g.active_sales_count,
    (p.total_payments - r.total_refunds) AS total_collected_net,
    s.stock_value,
    s.total_real_plots AS available_plots_count,
    tp.total_count AS total_plots_in_system,
    i.integrity_alerts
   FROM monthly_metrics m,
    collection_metrics c,
    global_metrics g,
    payment_metrics p,
    refund_metrics r,
    stock_metrics s,
    total_plots_count tp,
    integrity_metrics i;
CREATE OR REPLACE VIEW public.v_lotissement_profitability AS
 WITH site_costs AS (
         SELECT a_1.lotissement_id,
            sum(ac.amount) AS total_acquisition_cost
           FROM (acquisitions a_1
             JOIN acquisition_costs ac ON ((ac.acquisition_id = a_1.id)))
          GROUP BY a_1.lotissement_id
        ), site_expenses AS (
         SELECT expenses.project_id AS lotissement_id,
            sum(expenses.amount) AS total_expenses
           FROM expenses
          WHERE ((expenses.status = 'validé'::expense_status) AND (expenses.project_id IS NOT NULL))
          GROUP BY expenses.project_id
        ), site_sales_potential AS (
         SELECT l_1.id AS lotissement_id,
            sum(p.base_price) AS total_potential_value,
            count(p.id) AS total_plots_count
           FROM (((lotissements l_1
             JOIN zones z ON ((z.lotissement_id = l_1.id)))
             JOIN ilots i ON ((i.zone_id = z.id)))
             JOIN plots p ON ((p.ilot_id = i.id)))
          GROUP BY l_1.id
        ), site_sales_actual AS (
         SELECT l_1.id AS lotissement_id,
            sum(COALESCE(s.final_price, s.total_price)) AS total_sold_value,
            sum((COALESCE(s.final_price, s.total_price) - s.balance)) AS total_collected_amount,
            count(s.id) AS sold_plots_count
           FROM ((((lotissements l_1
             JOIN zones z ON ((z.lotissement_id = l_1.id)))
             JOIN ilots i ON ((i.zone_id = z.id)))
             JOIN plots p ON ((p.ilot_id = i.id)))
             JOIN sales s ON ((s.plot_id = p.id)))
          WHERE (s.status = ANY (ARRAY['en_cours'::sale_status, 'termine'::sale_status]))
          GROUP BY l_1.id
        )
 SELECT l.id,
    l.name,
    l.location,
    l.agence_id,
    a.name AS agence_name,
    COALESCE(sp.total_potential_value, (0)::numeric) AS potential_value,
    COALESCE(sp.total_plots_count, (0)::bigint) AS total_plots,
    COALESCE(sa.total_sold_value, (0)::numeric) AS sold_value,
    COALESCE(sa.total_collected_amount, (0)::numeric) AS collected_amount,
    COALESCE(sa.sold_plots_count, (0)::bigint) AS sold_plots,
    COALESCE(sc.total_acquisition_cost, (0)::numeric) AS acquisition_cost,
    COALESCE(se.total_expenses, (0)::numeric) AS operational_expenses,
    (COALESCE(sc.total_acquisition_cost, (0)::numeric) + COALESCE(se.total_expenses, (0)::numeric)) AS total_costs,
    (COALESCE(sa.total_collected_amount, (0)::numeric) - (COALESCE(sc.total_acquisition_cost, (0)::numeric) + COALESCE(se.total_expenses, (0)::numeric))) AS net_profit,
        CASE
            WHEN ((COALESCE(sc.total_acquisition_cost, (0)::numeric) + COALESCE(se.total_expenses, (0)::numeric)) > (0)::numeric) THEN ((COALESCE(sa.total_collected_amount, (0)::numeric) / (COALESCE(sc.total_acquisition_cost, (0)::numeric) + COALESCE(se.total_expenses, (0)::numeric))) * (100)::numeric)
            ELSE (0)::numeric
        END AS roi_percent
   FROM (((((lotissements l
     LEFT JOIN agences a ON ((l.agence_id = a.id)))
     LEFT JOIN site_sales_potential sp ON ((sp.lotissement_id = l.id)))
     LEFT JOIN site_sales_actual sa ON ((sa.lotissement_id = l.id)))
     LEFT JOIN site_costs sc ON ((sc.lotissement_id = l.id)))
     LEFT JOIN site_expenses se ON ((se.lotissement_id = l.id)));
CREATE OR REPLACE VIEW public.v_pending_refunds AS
 SELECT s.id AS sale_id,
    s.client_id,
    ((c.first_name || ' '::text) || c.last_name) AS client_name,
    c.phone AS client_phone,
    p.plot_number,
    s.total_to_refund,
    COALESCE(r.total_refunded, (0)::numeric) AS total_refunded,
    (s.total_to_refund - COALESCE(r.total_refunded, (0)::numeric)) AS remaining_amount,
    s.refund_status,
    s.updated_at AS cancelled_at
   FROM (((sales s
     JOIN clients c ON ((c.id = s.client_id)))
     JOIN plots p ON ((p.id = s.plot_id)))
     LEFT JOIN ( SELECT refunds.sale_id,
            sum(refunds.amount) AS total_refunded
           FROM refunds
          GROUP BY refunds.sale_id) r ON ((r.sale_id = s.id)))
  WHERE ((s.status = 'annule'::sale_status) AND (s.total_to_refund > (0)::numeric));
CREATE OR REPLACE VIEW public.v_sale_arrears AS
 WITH unpaid_stats AS (
         SELECT payment_schedules.sale_id,
            min(payment_schedules.due_date) AS oldest_unpaid_due_date,
            sum((payment_schedules.amount_due - COALESCE(payment_schedules.amount_paid, (0)::numeric))) AS total_arrears,
            count(*) AS unpaid_installments
           FROM payment_schedules
          WHERE ((payment_schedules.status <> 'Payé'::text) AND (payment_schedules.due_date < CURRENT_DATE))
          GROUP BY payment_schedules.sale_id
        )
 SELECT s.id AS sale_id,
    s.client_id,
    ((COALESCE(c.first_name, ''::text) || ' '::text) || COALESCE(c.last_name, ''::text)) AS client_name,
    c.phone AS client_phone,
    l.name AS lotissement_name,
    a.name AS agence_name,
    us.total_arrears,
    us.oldest_unpaid_due_date,
    (CURRENT_DATE - us.oldest_unpaid_due_date) AS days_overdue,
    ((CURRENT_DATE - us.oldest_unpaid_due_date) > 60) AS is_critical_delay,
    s.agency_id
   FROM (((((((sales s
     JOIN clients c ON ((s.client_id = c.id)))
     LEFT JOIN plots p ON ((s.plot_id = p.id)))
     LEFT JOIN ilots i ON ((p.ilot_id = i.id)))
     LEFT JOIN zones z ON ((i.zone_id = z.id)))
     LEFT JOIN lotissements l ON ((z.lotissement_id = l.id)))
     LEFT JOIN agences a ON ((s.agency_id = a.id)))
     JOIN unpaid_stats us ON ((s.id = us.sale_id)));
```

## 4. Fonctions et déclencheurs (définitions complètes)
```sql
CREATE OR REPLACE FUNCTION public.apply_sale_adjustment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (OLD.status = 'pending' AND NEW.status = 'approved') THEN
        -- Mise à jour de la vente
        UPDATE public.sales
        SET 
            total_price = total_price + NEW.amount,
            balance = balance + NEW.amount
        WHERE id = NEW.sale_id;
        
        NEW.validated_at = now();
        NEW.validated_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_financial_integrity()
 RETURNS TABLE(total_payments numeric, total_refunds numeric, audit_sum numeric, is_consistent boolean, mismatch_amount numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_payments numeric;
    v_refunds numeric;
    v_audit numeric;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO v_payments FROM public.payments;
    SELECT COALESCE(SUM(amount), 0) INTO v_refunds FROM public.refunds;
    -- Note: audit_finance stocke les montants signés ou catégorisés.
    -- On somme les types financiers impactant le cash.
    SELECT COALESCE(SUM(
        CASE 
            WHEN operation_type IN ('PAIEMENT', 'PAYMENT') THEN amount 
            WHEN operation_type IN ('REMBOURSEMENT', 'REFUND') THEN -amount
            ELSE 0 
        END
    ), 0) INTO v_audit FROM public.audit_finance;

    total_payments := v_payments;
    total_refunds := v_refunds;
    audit_sum := v_audit;
    mismatch_amount := (v_payments - v_refunds) - v_audit;
    is_consistent := (mismatch_amount = 0);

    RETURN NEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_sale_price_update_protection()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    payment_exists BOOLEAN;
    is_pdg BOOLEAN;
BEGIN
    -- Vérifier s'il y a déjà des paiements (on regarde amount_paid dans payment_schedules)
    SELECT EXISTS (
        SELECT 1 FROM public.payment_schedules 
        WHERE sale_id = NEW.id AND amount_paid > 0
    ) INTO payment_exists;

    IF payment_exists AND (OLD.total_amount != NEW.total_amount OR OLD.total_price != NEW.total_price) THEN
        -- Vérifier si l'utilisateur est PDG
        SELECT public.has_role(auth.uid(), 'pdg') INTO is_pdg;
        
        IF NOT is_pdg THEN
            RAISE EXCEPTION 'Modification de prix interdite car des paiements ont déjà été effectués. Seul le PDG peut autoriser une révision de prix.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_sale_schedule_consistency()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    total_scheduled NUMERIC;
    sale_balance NUMERIC;
BEGIN
    -- Get total amount scheduled for the sale
    SELECT COALESCE(SUM(amount_due - amount_paid), 0) INTO total_scheduled
    FROM public.payment_schedules
    WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id);

    -- Get sale balance
    SELECT balance INTO sale_balance
    FROM public.sales
    WHERE id = COALESCE(NEW.sale_id, OLD.sale_id);

    -- If balance is 0, no schedules are needed (already handled by application logic, but good to check)
    -- We only check if schedules exist. If they do, their remaining balance must match sale balance.
    IF EXISTS (SELECT 1 FROM public.payment_schedules WHERE sale_id = COALESCE(NEW.sale_id, OLD.sale_id)) THEN
        -- Allow for small rounding differences (e.g., < 1 FCFA)
        IF ABS(total_scheduled - sale_balance) > 1 THEN
            RAISE WARNING 'Incohérence détectée : Somme des échéances (%) != Solde de la vente (%)', total_scheduled, sale_balance;
            -- We don't block (RAISE EXCEPTION) to allow for mid-transaction updates, 
            -- but we log it or handle it in the application.
            -- MSI 2.0 choice: RAISE WARNING for now, application handles recalculation.
        END IF;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_audit_payment_correction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance NUMERIC;
  v_agency_id UUID;
  v_sale_id UUID;
BEGIN
  SELECT sale_id INTO v_sale_id FROM public.payments WHERE id = NEW.payment_id;
  SELECT balance, agency_id INTO v_balance, v_agency_id FROM public.sales WHERE id = v_sale_id;
  
  INSERT INTO public.audit_finance (
    operation_type, amount, payment_id, sale_id, user_id,
    previous_balance, new_balance, agency_id, notes
  ) VALUES (
    'CORRECTION_FINANCIERE', NEW.new_amount - NEW.old_amount, NEW.payment_id, v_sale_id, auth.uid(),
    v_balance - (NEW.new_amount - NEW.old_amount), v_balance, v_agency_id,
    'Correction de versement : ' || NEW.reason
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_audit_payment_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prev_balance NUMERIC;
  v_agency_id UUID;
BEGIN
  SELECT balance, agency_id INTO v_prev_balance, v_agency_id FROM public.sales WHERE id = NEW.sale_id;
  
  INSERT INTO public.audit_finance (
    operation_type, amount, payment_id, sale_id, user_id,
    previous_balance, new_balance, agency_id, notes
  ) VALUES (
    'paiement', NEW.amount, NEW.id, NEW.sale_id, auth.uid(),
    v_prev_balance + NEW.amount, v_prev_balance, v_agency_id,
    'Encaissement versement N°' || NEW.id
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_audit_refund_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT balance INTO v_balance FROM public.sales WHERE id = NEW.sale_id;
  INSERT INTO public.audit_finance (
    operation_type, amount, refund_id, sale_id, user_id,
    previous_balance, new_balance, notes
  ) VALUES (
    'remboursement', -NEW.amount, NEW.id, NEW.sale_id, auth.uid(),
    v_balance, v_balance, COALESCE(NEW.reason, 'Remboursement client')
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_calculate_sale_arrears(_sale_id uuid)
 RETURNS TABLE(total_arrears numeric, oldest_unpaid_due_date date, days_overdue integer, is_critical_delay boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;
    RETURN QUERY
    SELECT 
        SUM(ps.amount_due - COALESCE(ps.amount_paid, 0)),
        MIN(ps.due_date),
        (CURRENT_DATE - MIN(ps.due_date))::INTEGER,
        (CURRENT_DATE - MIN(ps.due_date) > 60)
    FROM public.payment_schedules ps
    WHERE ps.sale_id = _sale_id 
      AND ps.status != 'Payé' 
      AND ps.due_date < CURRENT_DATE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_calculate_theoretical_cash(_journal_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_opening numeric;
    v_inflows numeric;
    v_outflows numeric;
BEGIN
    -- Get opening balance
    SELECT opening_balance INTO v_opening 
    FROM cash_journals 
    WHERE id = _journal_id;

    -- Sum validated inflows (sales/payments) linked to this journal
    SELECT COALESCE(SUM(amount), 0) INTO v_inflows
    FROM daily_cash_operations
    WHERE cash_journal_id = _journal_id 
      AND operation_type = 'ENTREE';

    -- Sum validated outflows (expenses) linked to this journal
    SELECT COALESCE(SUM(amount), 0) INTO v_outflows
    FROM expenses
    WHERE cash_journal_id = _journal_id 
      AND status = 'validé';

    RETURN COALESCE(v_opening, 0) + v_inflows - v_outflows;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_check_and_notify_arrears()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    r RECORD;
    _pdg_id UUID;
BEGIN
    -- Get PDG user ID (first user with 'pdg' role)
    SELECT user_id INTO _pdg_id FROM public.user_roles WHERE role = 'pdg' LIMIT 1;

    -- J-7: Internal notification for agents
    FOR r IN 
        SELECT ps.sale_id, s.prepared_by_id, s.agency_id, ps.due_date, c.first_name || ' ' || c.last_name as client_name
        FROM public.payment_schedules ps
        JOIN public.sales s ON ps.sale_id = s.id
        JOIN public.clients c ON s.client_id = c.id
        WHERE ps.status != 'Payé' 
          AND ps.due_date = CURRENT_DATE + INTERVAL '7 days'
          AND (ps.last_reminder_sent_at IS NULL OR ps.last_reminder_sent_at < CURRENT_DATE)
    LOOP
        PERFORM public.fn_create_notification(
            r.prepared_by_id,
            'Échéance à J-7',
            'Le client ' || r.client_name || ' a une échéance prévue pour le ' || r.due_date,
            'info',
            r.sale_id
        );
        UPDATE public.payment_schedules SET last_reminder_sent_at = NOW() WHERE sale_id = r.sale_id AND due_date = r.due_date;
    END LOOP;

    -- J-2: Reminder
    FOR r IN 
        SELECT ps.sale_id, s.prepared_by_id, ps.due_date, c.first_name || ' ' || c.last_name as client_name
        FROM public.payment_schedules ps
        JOIN public.sales s ON ps.sale_id = s.id
        JOIN public.clients c ON s.client_id = c.id
        WHERE ps.status != 'Payé' 
          AND ps.due_date = CURRENT_DATE + INTERVAL '2 days'
          AND (ps.last_reminder_sent_at IS NULL OR ps.last_reminder_sent_at < CURRENT_DATE)
    LOOP
        PERFORM public.fn_create_notification(
            r.prepared_by_id,
            'Rappel Échéance J-2',
            'Urgent : Échéance dans 2 jours pour ' || r.client_name,
            'warning',
            r.sale_id
        );
        UPDATE public.payment_schedules SET last_reminder_sent_at = NOW() WHERE sale_id = r.sale_id AND due_date = r.due_date;
    END LOOP;

    -- J+1: Overdue Alert
    FOR r IN 
        SELECT ps.sale_id, s.prepared_by_id, ps.due_date, c.first_name || ' ' || c.last_name as client_name
        FROM public.payment_schedules ps
        JOIN public.sales s ON ps.sale_id = s.id
        JOIN public.clients c ON s.client_id = c.id
        WHERE ps.status != 'Payé' 
          AND ps.due_date = CURRENT_DATE - INTERVAL '1 day'
          AND (ps.last_reminder_sent_at IS NULL OR ps.last_reminder_sent_at < CURRENT_DATE)
    LOOP
        PERFORM public.fn_create_notification(
            r.prepared_by_id,
            'RETARD : Échéance impayée',
            'L''échéance du ' || r.due_date || ' pour ' || r.client_name || ' est maintenant en retard.',
            'error',
            r.sale_id
        );
        UPDATE public.payment_schedules SET last_reminder_sent_at = NOW() WHERE sale_id = r.sale_id AND due_date = r.due_date;
    END LOOP;

    -- J+60: PDG Alert for Critical Delay
    IF _pdg_id IS NOT NULL THEN
        FOR r IN 
            SELECT sale_id, client_name, total_arrears, days_overdue
            FROM public.v_sale_arrears
            WHERE is_critical_delay = TRUE
              AND sale_id NOT IN (
                  SELECT (new_data->>'sale_id')::UUID 
                  FROM public.audit_logs 
                  WHERE action = 'NOTIFY_PDG_CRITICAL_ARREARS' 
                    AND created_at > NOW() - INTERVAL '7 days'
              )
        LOOP
            PERFORM public.fn_create_notification(
                _pdg_id,
                'ALERTE CRITIQUE : Retard > 2 mois',
                'Le client ' || r.client_name || ' présente un retard critique de ' || r.days_overdue || ' jours (' || r.total_arrears || ' FCFA).',
                'error',
                r.sale_id
            );
            
            -- Log to prevent spamming the PDG every day for the same sale
            INSERT INTO public.audit_logs (action, table_name, record_id, new_data)
            VALUES ('NOTIFY_PDG_CRITICAL_ARREARS', 'sales', r.sale_id, jsonb_build_object('sale_id', r.sale_id, 'client_name', r.client_name));
        END LOOP;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_check_sale_schedule_consistency()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    total_scheduled NUMERIC(15,2);
    expected_balance NUMERIC(15,2);
BEGIN
    -- Only check for active sales with payment plans
    IF NEW.status IN ('en_cours', 'termine') THEN
        SELECT SUM(amount_due) INTO total_scheduled
        FROM public.payment_schedules
        WHERE sale_id = NEW.id;

        expected_balance := NEW.total_amount - COALESCE(NEW.deposit_amount, 0);

        -- Allow a 1 FCFA margin for rounding
        IF ABS(COALESCE(total_scheduled, 0) - expected_balance) > 1 THEN
            RAISE EXCEPTION 'Incohérence financière : Le total de l’échéancier (% FCFA) ne correspond pas au solde dû (% FCFA).', 
                total_scheduled, expected_balance;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_create_notification(_user_id uuid, _title text, _message text, _type text DEFAULT 'info'::text, _sale_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type, sale_id)
    VALUES (_user_id, _title, _message, _type, _sale_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_documents_immutable()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.fn_get_payment_imputation_preview(p_sale_id uuid, p_amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_remaining_amount NUMERIC(15,2) := p_amount;
    v_imputed_items JSONB := '[]'::jsonb;
    v_schedule RECORD;
    v_needed NUMERIC(15,2);
    v_apply NUMERIC(15,2);
BEGIN
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;
    FOR v_schedule IN 
        SELECT id, amount_due, amount_paid, due_date
        FROM public.payment_schedules
        WHERE sale_id = p_sale_id 
          AND status IN ('En attente', 'Partiel', 'Retard')
        ORDER BY due_date ASC
    LOOP
        EXIT WHEN v_remaining_amount <= 0;
        v_needed := v_schedule.amount_due - COALESCE(v_schedule.amount_paid, 0);
        v_apply := LEAST(v_remaining_amount, v_needed);
        IF v_apply > 0 THEN
            v_imputed_items := v_imputed_items || jsonb_build_object(
                'schedule_id', v_schedule.id,
                'due_date', v_schedule.due_date,
                'amount_applied', v_apply,
                'type', CASE WHEN v_schedule.due_date < CURRENT_DATE THEN 'Retard' ELSE 'Courant' END
            );
            v_remaining_amount := v_remaining_amount - v_apply;
        END IF;
    END LOOP;
    IF v_remaining_amount > 0 THEN
        v_imputed_items := v_imputed_items || jsonb_build_object(
            'schedule_id', NULL, 'due_date', NULL,
            'amount_applied', v_remaining_amount, 'type', 'Excédent / Anticipation'
        );
    END IF;
    RETURN v_imputed_items;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_handle_sale_cancellation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'annule' AND OLD.status <> 'annule' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.sales
      WHERE plot_id = NEW.plot_id AND id <> NEW.id
        AND status IN ('reservation', 'en_cours', 'termine')
    ) THEN
      UPDATE public.plots SET status = 'Disponible' WHERE id = NEW.plot_id;
    END IF;

    UPDATE public.payment_schedules
    SET status = 'Annulé'
    WHERE sale_id = NEW.id AND status <> 'Payé';

    INSERT INTO public.audit_finance (
      operation_type, amount, sale_id, user_id,
      previous_balance, new_balance, notes
    ) VALUES (
      'annulation', -COALESCE(NEW.total_amount, NEW.total_price, 0), NEW.id, auth.uid(),
      OLD.balance, 0, COALESCE(NEW.notes, 'Annulation de vente - Parcelle libérée')
    );
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_impute_payment_on_schedule(p_payment_id uuid, p_sale_id uuid, p_amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_remaining_amount NUMERIC(15,2) := p_amount;
    v_imputed_items JSONB := '[]'::jsonb;
    v_schedule RECORD;
    v_apply NUMERIC(15,2);
    v_needed NUMERIC(15,2);
    v_new_paid NUMERIC(15,2);
BEGIN
    IF NOT public.is_staff() THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;
    FOR v_schedule IN 
        SELECT id, amount_due, amount_paid, due_date
        FROM public.payment_schedules
        WHERE sale_id = p_sale_id 
          AND status IN ('En attente', 'Partiel', 'Retard')
        ORDER BY due_date ASC
    LOOP
        EXIT WHEN v_remaining_amount <= 0;
        v_needed := v_schedule.amount_due - COALESCE(v_schedule.amount_paid, 0);
        v_apply := LEAST(v_remaining_amount, v_needed);
        IF v_apply > 0 THEN
            v_new_paid := COALESCE(v_schedule.amount_paid, 0) + v_apply;
            UPDATE public.payment_schedules
            SET amount_paid = v_new_paid,
                status = CASE WHEN v_new_paid >= v_schedule.amount_due THEN 'Payé'::public.schedule_status ELSE 'Partiel'::public.schedule_status END,
                updated_at = now()
            WHERE id = v_schedule.id;
            v_imputed_items := v_imputed_items || jsonb_build_object(
                'schedule_id', v_schedule.id,
                'due_date', v_schedule.due_date,
                'amount_applied', v_apply,
                'type', CASE WHEN v_schedule.due_date < CURRENT_DATE THEN 'Retard' ELSE 'Courant' END
            );
            v_remaining_amount := v_remaining_amount - v_apply;
        END IF;
    END LOOP;
    IF v_remaining_amount > 0 THEN
         v_imputed_items := v_imputed_items || jsonb_build_object(
            'schedule_id', NULL, 'due_date', NULL,
            'amount_applied', v_remaining_amount, 'type', 'Excédent / Anticipation'
        );
    END IF;
    UPDATE public.payments SET imputed_data = v_imputed_items WHERE id = p_payment_id;
    RETURN v_imputed_items;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_lock_closed_cash_journal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_status text;
    v_journal_id uuid;
BEGIN
    v_journal_id := NEW.cash_journal_id;
    
    IF v_journal_id IS NOT NULL THEN
        SELECT status INTO v_status FROM cash_journals WHERE id = v_journal_id;
        IF v_status = 'fermé' THEN
            RAISE EXCEPTION 'Action impossible : la session de caisse est clôturée.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_my_access()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _result jsonb;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('authenticated', false, 'roles', '[]'::jsonb, 'permissions', '[]'::jsonb);
  END IF;

  SELECT jsonb_build_object(
    'authenticated', true,
    'user_id', _uid,
    'full_name', (SELECT p.full_name FROM public.profiles p WHERE p.id = _uid),
    'email', (SELECT p.email FROM public.profiles p WHERE p.id = _uid),
    'roles', COALESCE((SELECT jsonb_agg(DISTINCT ur.role::text) FROM public.user_roles ur WHERE ur.user_id = _uid), '[]'::jsonb),
    'is_super_admin', EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _uid AND ur.role = 'super_admin'::app_role),
    'permissions', CASE
      WHEN EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _uid AND ur.role = 'super_admin'::app_role)
        THEN COALESCE((SELECT jsonb_agg(DISTINCT rp.permission) FROM public.role_permissions rp), '[]'::jsonb)
      ELSE COALESCE((
        SELECT jsonb_agg(DISTINCT rp.permission)
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON rp.role = ur.role
        WHERE ur.user_id = _uid), '[]'::jsonb)
    END,
    'agency', (
      SELECT jsonb_build_object('id', a.id, 'name', a.name, 'city', a.city, 'code', a.code)
      FROM public.user_roles ur
      JOIN public.agences a ON a.id = ur.agence_id
      WHERE ur.user_id = _uid AND ur.agence_id IS NOT NULL
      ORDER BY ur.created_at
      LIMIT 1
    )
  ) INTO _result;

  RETURN _result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_next_document_number(_agency_id uuid, _doc_type text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.fn_notify_agent_on_expense_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (OLD.status <> NEW.status) AND NEW.status IN ('validé', 'rejeté') THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (
            NEW.created_by_id, 
            'finance', 
            'Statut de dépense mis à jour', 
            'Votre demande de dépense de ' || NEW.amount || ' FCFA a été ' || NEW.status,
            jsonb_build_object('expense_id', NEW.id, 'status', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_notify_payment_registration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_pdg_id UUID;
BEGIN
    IF NEW.confirmed_at IS NULL THEN
        FOR v_pdg_id IN 
            SELECT user_id FROM public.user_roles WHERE role IN ('pdg', 'super_admin')
        LOOP
            INSERT INTO public.notifications (
                user_id,
                title,
                message,
                type,
                link
            ) VALUES (
                v_pdg_id,
                'Nouvel encaissement à confirmer',
                'Un versement de ' || NEW.amount || ' FCFA a été saisi pour la vente ' || NEW.sale_id || ' et attend votre confirmation.',
                'PAYMENT_PENDING',
                '/ventes/' || NEW.sale_id
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_notify_pdg(_title text, _message text, _agency_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_pdg_id uuid;
BEGIN
    -- Find PDG
    SELECT user_id INTO v_pdg_id 
    FROM user_roles 
    WHERE role = 'pdg' 
    LIMIT 1;

    IF v_pdg_id IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, agency_id)
        VALUES (v_pdg_id, _title, _message, 'finance', _agency_id);
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_notify_pdg_on_correction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_pdg_id uuid;
    v_sale_id uuid;
BEGIN
    -- Récupérer le sale_id via le paiement
    SELECT sale_id INTO v_sale_id FROM public.payments WHERE id = NEW.payment_id;

    -- Trouver le PDG (ou premier admin) pour la notification
    SELECT user_id INTO v_pdg_id 
    FROM public.user_roles 
    WHERE role = 'pdg' 
    LIMIT 1;

    IF v_pdg_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (
            v_pdg_id,
            'Correction Financière',
            'Une correction de ' || NEW.new_amount || ' FCFA a été effectuée sur une vente.',
            'warning',
            '/ventes/' || v_sale_id
        );
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_notify_pdg_on_new_expense()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    pdg_id UUID;
    agency_name TEXT;
BEGIN
    -- Trouver le PDG (on prend le premier trouvé si plusieurs, mais MSI est mono-PDG en principe)
    SELECT user_id INTO pdg_id FROM public.user_roles WHERE role = 'pdg' LIMIT 1;
    
    SELECT nom INTO agency_name FROM public.agences WHERE id = NEW.agency_id;

    IF pdg_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, type, title, message, metadata)
        VALUES (
            pdg_id, 
            'finance', 
            'Nouvelle demande de dépense', 
            'Une dépense de ' || NEW.amount || ' FCFA a été soumise par l''agence ' || agency_name,
            jsonb_build_object('expense_id', NEW.id, 'agency_id', NEW.agency_id)
        );
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_open_refund_claim_on_cancellation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_paid numeric;
  v_refunded numeric;
BEGIN
  IF NEW.status = 'annule' AND OLD.status <> 'annule' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_paid FROM public.payments WHERE sale_id = NEW.id;
    SELECT COALESCE(SUM(amount), 0) INTO v_refunded FROM public.refunds WHERE sale_id = NEW.id;

    NEW.total_to_refund := GREATEST(v_paid - v_refunded, 0);
    NEW.refund_status := CASE WHEN NEW.total_to_refund > 0 THEN 'En cours' ELSE 'Aucun' END;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_prevent_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    RAISE EXCEPTION 'Suppression interdite pour garantir la traçabilité. Utilisez la procédure Annule et Remplace.';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_prevent_plot_deletion_with_sales()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF EXISTS (SELECT 1 FROM public.sales WHERE plot_id = OLD.id AND status IN ('reservation', 'en_cours', 'termine')) THEN
        -- Log l'alerte avant de bloquer
        INSERT INTO public.audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_values
        ) VALUES (
            auth.uid(),
            'CRITICAL_INTEGRITY_VIOLATION',
            'plots',
            OLD.id,
            jsonb_build_object('error', 'Tentative de suppression d''une parcelle vendue', 'plot_number', OLD.plot_number)
        );
        RAISE EXCEPTION 'Impossible de supprimer une parcelle associée à une vente active.';
    END IF;
    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_sync_cash_inflows()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_active_journal_id uuid;
BEGIN
    IF NEW.operation_type = 'ENTREE' THEN
        -- Find active journal for the agency
        SELECT id INTO v_active_journal_id
        FROM public.cash_journals
        WHERE agency_id = NEW.agency_id AND status = 'ouvert'
        LIMIT 1;

        IF v_active_journal_id IS NOT NULL THEN
            UPDATE public.cash_journals
            SET theoretical_closing_balance = theoretical_closing_balance + NEW.amount
            WHERE id = v_active_journal_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_sync_journal_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_journal_id uuid;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_journal_id := OLD.cash_journal_id;
    ELSE
        v_journal_id := NEW.cash_journal_id;
    END IF;

    IF v_journal_id IS NOT NULL THEN
        UPDATE cash_journals 
        SET theoretical_closing_balance = fn_calculate_theoretical_cash(v_journal_id)
        WHERE id = v_journal_id;
    END IF;

    RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_sync_payment_to_cash()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_sale_agency_id UUID;
BEGIN
    -- On ne synchronise en caisse QUE si le paiement est confirmé
    IF NEW.confirmed_at IS NOT NULL AND (OLD.confirmed_at IS NULL OR TG_OP = 'INSERT') THEN
        SELECT agency_id INTO v_sale_agency_id FROM public.sales WHERE id = NEW.sale_id;

        INSERT INTO public.daily_cash_operations (
            agency_id,
            operation_type,
            amount,
            payment_method,
            reference_id,
            description,
            performed_by
        ) VALUES (
            v_sale_agency_id,
            'ENTREE',
            NEW.amount,
            NEW.method,
            NEW.id,
            'Encaissement vente ' || NEW.sale_id || ' (Confirmé)',
            NEW.confirmed_by
        );
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_sync_plot_status_integrity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.status IN ('reservation', 'en_cours', 'termine') THEN
            UPDATE public.plots 
            SET status = 'Attribuée' 
            WHERE id = NEW.plot_id;
        ELSIF NEW.status = 'annule' THEN
            IF NOT EXISTS (
                SELECT 1 FROM public.sales 
                WHERE plot_id = NEW.plot_id 
                  AND id <> NEW.id 
                  AND status IN ('reservation', 'en_cours', 'termine')
            ) THEN
                UPDATE public.plots 
                SET status = 'Disponible' 
                WHERE id = NEW.plot_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_tr_notify_pdg_cash_discrepancy()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF ABS(NEW.discrepancy) > 5000 THEN
        PERFORM fn_notify_pdg(
            'Écart de caisse important',
            'Un écart de ' || NEW.discrepancy || ' FCFA a été constaté lors de la clôture de caisse.',
            NEW.agency_id
        );
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_tr_notify_pdg_large_expense()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.amount > 100000 THEN
        PERFORM fn_notify_pdg(
            'Dépense importante',
            'Une dépense de ' || NEW.amount || ' FCFA a été soumise pour validation (' || NEW.description || ').',
            NEW.agency_id
        );
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_verify_document(_doc_number text)
 RETURNS TABLE(doc_number text, doc_type text, issued_on date, status text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT d.doc_number, d.doc_type, (d.issued_at AT TIME ZONE 'Africa/Niamey')::date, d.status
  FROM public.documents d
  WHERE d.doc_number = _doc_number;
$function$
;

CREATE OR REPLACE FUNCTION public.get_plot_effective_price(_plot_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE
    _price NUMERIC;
    _surface NUMERIC;
BEGIN
    -- 1. Check for specific validated pricing first
    SELECT base_price INTO _price
    FROM public.plot_pricing
    WHERE plot_id = _plot_id 
      AND validated_by_id IS NOT NULL
      AND effective_date <= now()
    ORDER BY effective_date DESC
    LIMIT 1;

    IF _price IS NOT NULL THEN
        RETURN _price;
    END IF;

    -- 2. Fallback to current base_price on plot table (legacy or manual sync)
    SELECT base_price, surface INTO _price, _surface
    FROM public.plots
    WHERE id = _plot_id;

    IF _price > 0 THEN
        RETURN _price;
    END IF;

    -- 3. Fallback to price templates if surface is known
    SELECT price_per_m2 * _surface INTO _price
    FROM public.price_templates
    WHERE is_active = true
      AND _surface >= surface_range_min
      AND _surface <= surface_range_max
    LIMIT 1;

    RETURN COALESCE(_price, 0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_plot_transfer(p_sale_id uuid, p_new_plot_id uuid, p_reason text, p_author_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_old_plot_id uuid;
    v_old_price numeric;
    v_new_price numeric;
    v_price_diff numeric;
    v_sale_status text;
BEGIN
    -- 1. Récupérer l'ancienne parcelle et les infos de la vente
    SELECT plot_id, total_price, status INTO v_old_plot_id, v_old_price, v_sale_status FROM public.sales WHERE id = p_sale_id;
    
    IF v_old_plot_id IS NULL THEN
        RAISE EXCEPTION 'Vente non trouvée';
    END IF;

    -- 2. Récupérer le prix de la nouvelle parcelle
    SELECT price INTO v_new_price FROM public.plots WHERE id = p_new_plot_id;
    
    -- Note: si v_new_price est null dans plots, essayer base_price
    IF v_new_price IS NULL THEN
        SELECT base_price INTO v_new_price FROM public.plots WHERE id = p_new_plot_id;
    END IF;
    
    IF v_new_price IS NULL THEN
        RAISE EXCEPTION 'Nouvelle parcelle non trouvée ou prix non défini';
    END IF;

    -- 3. Vérifier si la nouvelle parcelle est disponible
    IF NOT EXISTS (SELECT 1 FROM public.plots WHERE id = p_new_plot_id AND status = 'Disponible') THEN
        RAISE EXCEPTION 'La nouvelle parcelle n''est pas disponible';
    END IF;

    -- 4. Calculer la différence
    v_price_diff := v_new_price - v_old_price;

    -- 5. Mettre à jour l'ancienne parcelle en 'Disponible'
    UPDATE public.plots SET status = 'Disponible' WHERE id = v_old_plot_id;

    -- 6. Mettre à jour la nouvelle parcelle
    UPDATE public.plots SET status = 'Attribuée' WHERE id = p_new_plot_id;

    -- 7. Mettre à jour la vente
    UPDATE public.sales 
    SET 
        plot_id = p_new_plot_id,
        total_price = v_new_price,
        balance = balance + v_price_diff,
        updated_at = now()
    WHERE id = p_sale_id;

    -- 8. Enregistrer le transfert
    INSERT INTO public.sale_transfers (
        sale_id, old_plot_id, new_plot_id, reason, price_difference, authorized_by
    ) VALUES (
        p_sale_id, v_old_plot_id, p_new_plot_id, p_reason, v_price_diff, p_author_id
    );

    -- 9. Audit log
    INSERT INTO public.audit_logs (
        user_id, action, entity_type, entity_id, table_name, details
    ) VALUES (
        p_author_id, 'PLOT_TRANSFER', 'sale', p_sale_id, 'sales',
        jsonb_build_object(
            'old_plot_id', v_old_plot_id, 
            'new_plot_id', p_new_plot_id, 
            'price_difference', v_price_diff,
            'reason', p_reason
        )
    );

END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_reservation_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status = 'active' THEN
            UPDATE public.plots 
            SET status = 'Réservée' 
            WHERE id = NEW.plot_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF NEW.status = 'active' AND OLD.status != 'active' THEN
            UPDATE public.plots 
            SET status = 'Réservée' 
            WHERE id = NEW.plot_id;
        ELSIF NEW.status IN ('expired', 'cancelled') AND OLD.status = 'active' THEN
            IF NOT EXISTS (SELECT 1 FROM public.reservations WHERE plot_id = NEW.plot_id AND status = 'active' AND id != NEW.id) THEN
                UPDATE public.plots 
                SET status = 'Disponible' 
                WHERE id = NEW.plot_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_sale_mutation_validation()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Dans le code UI, 'Validée' est envoyé pour les mutations. 
    -- Si on veut rester sur 'Validée' pour le type TEXT, c'est OK, 
    -- mais la fonction précédente échouait probablement si elle touchait à sale_status
    IF NEW.status = 'Validée' AND OLD.status = 'En attente' THEN
        -- 1. Libérer l'ancienne parcelle
        UPDATE public.plots SET status = 'Disponible' WHERE id = NEW.old_plot_id;
        
        -- 2. Attribuer la nouvelle parcelle à la vente
        UPDATE public.sales SET plot_id = NEW.new_plot_id WHERE id = NEW.sale_id;
        
        -- 3. Marquer la nouvelle parcelle comme Vendue
        UPDATE public.plots SET status = 'Vendue' WHERE id = NEW.new_plot_id;
        
        -- 4. Historique
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plot_status_history') THEN
            INSERT INTO public.plot_status_history (plot_id, status, changed_by)
            VALUES (NEW.old_plot_id, 'Disponible', NEW.validated_by);
            INSERT INTO public.plot_status_history (plot_id, status, changed_by)
            VALUES (NEW.new_plot_id, 'Vendue', NEW.validated_by);
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_sale_plot_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.plots SET status = 'Attribuée' WHERE id = NEW.plot_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Correction 'annulee' -> 'annule' pour correspondre à l'énumération
        IF (NEW.status = 'annule' AND OLD.status != 'annule') THEN
            UPDATE public.plots SET status = 'Disponible' WHERE id = NEW.plot_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = 'super_admin'::app_role
  ) OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission = _permission
  );
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT _user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role <> 'client'::public.app_role
  );
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_validated_sale_edit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Utilisation des valeurs réelles de l'énumération sale_status
    IF OLD.status = 'en_cours' AND NEW.status = 'en_cours' AND NEW.status NOT IN ('termine', 'annule') THEN
        RAISE EXCEPTION 'Une vente validée ne peut plus être modifiée.';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    old_val jsonb := NULL;
    new_val jsonb := NULL;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        old_val := to_jsonb(OLD);
        new_val := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        new_val := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        old_val := to_jsonb(OLD);
    END IF;

    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, 
            CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END, 
            TG_OP, 
            old_val, 
            new_val, 
            auth.uid());
    
    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_plot_status_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Utilise 'en_cours' qui est la valeur réelle de l'énumération sale_status
    IF NEW.status = 'en_cours' AND (OLD.status IS NULL OR OLD.status != 'en_cours') THEN
        UPDATE public.plots 
        SET status = 'Vendue' 
        WHERE id = NEW.plot_id;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plot_status_history') THEN
            INSERT INTO public.plot_status_history (plot_id, status, changed_by)
            VALUES (NEW.plot_id, 'Vendue', NEW.validated_by_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;

```

## 5. Droits d'exécution des fonctions
```sql
```

## 6. Buckets de stockage
```text
client_documents | client_documents | f | 
justificatifs_depenses | justificatifs_depenses | f | 
```

## 7. Politiques RLS sur storage.objects
```sql
CREATE POLICY "Managers can delete justificatifs" ON storage.objects FOR DELETE TO authenticated
  USING (((bucket_id = 'justificatifs_depenses'::text) AND (has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'super_admin'::text))));
CREATE POLICY "Owners and finance can update justificatifs" ON storage.objects FOR UPDATE TO authenticated
  USING (((bucket_id = 'justificatifs_depenses'::text) AND ((owner = auth.uid()) OR has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'super_admin'::text))))
  WITH CHECK ((bucket_id = 'justificatifs_depenses'::text));
CREATE POLICY "Owners and finance can view justificatifs" ON storage.objects FOR SELECT TO authenticated
  USING (((bucket_id = 'justificatifs_depenses'::text) AND ((owner = auth.uid()) OR (EXISTS ( SELECT 1
   FROM expenses e
  WHERE ((e.created_by_id = auth.uid()) AND (e.receipt_url ~~ ('%'::text || objects.name))))) OR has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'super_admin'::text) OR has_role(auth.uid(), 'comptable'::text))));
CREATE POLICY "Owners and managers can view client documents" ON storage.objects FOR SELECT TO authenticated
  USING (((bucket_id = 'client_documents'::text) AND ((owner = auth.uid()) OR (EXISTS ( SELECT 1
   FROM client_documents cd
  WHERE ((cd.created_by = auth.uid()) AND (cd.file_url ~~ ('%'::text || objects.name))))) OR has_role(auth.uid(), 'pdg'::text) OR has_role(auth.uid(), 'super_admin'::text) OR has_role(auth.uid(), 'responsable_agence'::text))));
CREATE POLICY "Staff can upload client documents" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (((bucket_id = 'client_documents'::text) AND (owner = auth.uid()) AND is_staff()));
CREATE POLICY "Staff can upload justificatifs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (((bucket_id = 'justificatifs_depenses'::text) AND (owner = auth.uid()) AND is_staff()));
```

## 8. Données de référence (à réinsérer)
```sql
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'adjust_sale') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'create_lotissement') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'create_reservation') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'create_sale') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_acquisitions') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_agences') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_arrears') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_cash_journal') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_contracts') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_expenses') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_finance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_plots') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_refunds') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_reservations') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_settings') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_tarifs') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'manage_users') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'register_payment') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'request_price_adjustment') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'sign_contract') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'transfer_plot') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'validate_payments') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'validate_price_adjustment') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'validate_sensitive_op') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_acquisitions') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_arrears') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_audit_logs') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_dashboard') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_documents') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_expenses') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_finance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_inventory') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_lotissements') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_performance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_reservations') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('pdg', 'view_tarifs') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'manage_cash_journal') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'manage_expenses') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'manage_finance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'manage_refunds') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'manage_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'register_payment') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'view_acquisitions') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'view_arrears') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'view_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'view_dashboard') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'view_documents') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'view_expenses') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'view_finance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('comptable', 'view_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'create_lotissement') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'create_reservation') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'manage_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'manage_plots') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'manage_reservations') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'manage_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'view_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'view_dashboard') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'view_documents') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'view_inventory') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'view_lotissements') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'view_reservations') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'view_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('secretaire', 'view_tarifs') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'create_reservation') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'manage_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'manage_plots') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'manage_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'view_arrears') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'view_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'view_dashboard') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'view_documents') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'view_inventory') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'view_lotissements') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'view_reservations') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'view_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('commercial', 'view_tarifs') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'manage_cash_journal') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'manage_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'manage_expenses') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'manage_plots') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'manage_reservations') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'manage_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'register_payment') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_arrears') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_dashboard') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_documents') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_expenses') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_finance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_inventory') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_lotissements') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_performance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_reservations') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('responsable_agence', 'view_tarifs') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'create_lotissement') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'create_reservation') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_acquisitions') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_agences') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_finance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_plots') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_reservations') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_sales') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_settings') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_tarifs') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'manage_users') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_acquisitions') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_arrears') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_audit_logs') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_clients') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_dashboard') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_documents') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_expenses') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_finance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_inventory') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_lotissements') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_performance') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_reservations') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('informaticien', 'view_tarifs') ON CONFLICT DO NOTHING;
INSERT INTO public.role_permissions (role, permission) VALUES ('client', 'view_dashboard') ON CONFLICT DO NOTHING;
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Carburant', NULL, true);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Communication', 'Téléphone, internet, marketing', false);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Divers', 'Autres dépenses non classées', false);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Fournitures', 'Papeterie, consommables', false);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Fournitures Bureau', NULL, true);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Impôts', NULL, true);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Impôts & Taxes', 'Obligations fiscales', false);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Loyer', NULL, true);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Loyer & Charges', 'Bureaux, électricité, eau', false);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Maintenance', NULL, true);
INSERT INTO public.expense_categories (name, description, is_system) VALUES ('Salaires', NULL, true);
INSERT INTO public.document_templates (doc_type, label, version, header_text, footer_text, legal_mentions, is_active) VALUES ('contrat', 'Contrat de vente', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Le présent contrat engage les parties dans les conditions énoncées.', true);
INSERT INTO public.document_templates (doc_type, label, version, header_text, footer_text, legal_mentions, is_active) VALUES ('echeancier', 'Échéancier de paiement', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Échéancier annexé au contrat de vente.', true);
INSERT INTO public.document_templates (doc_type, label, version, header_text, footer_text, legal_mentions, is_active) VALUES ('mise_en_demeure', 'Mise en demeure', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Mise en demeure notifiée conformément aux clauses du contrat.', true);
INSERT INTO public.document_templates (doc_type, label, version, header_text, footer_text, legal_mentions, is_active) VALUES ('quitus', 'Attestation de solde', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Atteste du paiement intégral du bien désigné.', true);
INSERT INTO public.document_templates (doc_type, label, version, header_text, footer_text, legal_mentions, is_active) VALUES ('recu', 'Reçu d''encaissement', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Ce reçu atteste du versement mentionné ci-dessus. Toute réédition porte la mention DUPLICATA.', true);
INSERT INTO public.document_templates (doc_type, label, version, header_text, footer_text, legal_mentions, is_active) VALUES ('relance', 'Lettre de relance', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Rappel amiable d''échéance impayée.', true);
INSERT INTO public.document_templates (doc_type, label, version, header_text, footer_text, legal_mentions, is_active) VALUES ('remboursement', 'Attestation de remboursement', 1, 'MULTI SERVICES IMMOBILIERE', 'Document généré électroniquement — vérifiable en ligne.', 'Atteste du remboursement effectué au bénéficiaire.', true);
INSERT INTO public.app_settings (key, value, description) VALUES ('business_rules', '{"currency": "FCFA", "cancellation_penalty_pct": 20, "payment_durations_months": [15, 20], "reservation_duration_days": 15, "recommended_down_payment_pct": 30}'::jsonb, 'Règles métier globales');
INSERT INTO public.agences (name, city, code, address, phone, is_active) VALUES ('Siège Maradi', 'Maradi', 'MAR', 'Quartier Administratif', NULL, true);
```
