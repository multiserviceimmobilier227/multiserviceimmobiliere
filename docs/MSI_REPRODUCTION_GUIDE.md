# MSI 2.0 — Guide de reproduction intégrale sur un nouveau projet Lovable

Ce document permet de recréer **à l'identique** la plateforme de gestion immobilière
Multi Services Immobilière (MSI 2.0). Il se lit avec son compagnon
`BACKEND_DATABASE_REFERENCE.md` (base de données complète : types, tables, RLS, fonctions,
déclencheurs, vues, stockage, données de référence).

Procédure : créer un projet Lovable vierge, activer Lovable Cloud, puis coller
la section « Prompt de démarrage » ci-dessous, puis appliquer les phases dans l'ordre.

---

## 0. Prompt de démarrage (à coller tel quel dans le nouveau projet)

> Construis MSI 2.0, un logiciel de gestion immobilière multi-agences pour Multi Services
> Immobilière (Maradi, Niger). Interface **100 % en français**, montants en **FCFA (entiers)**,
> fuseau **Africa/Niamey**, architecture **multi-agences dès la base**.
>
> Principes non négociables :
> 1. Traçabilité totale — journal d'audit universel alimenté par déclencheurs PostgreSQL.
> 2. Aucune suppression destructive — toute correction crée une nouvelle trace.
> 3. Les opérations sensibles (prix, dépenses, remboursements, annulations, mutations) exigent une validation PDG.
> 4. Historisation des prix et contrats (instantanés immuables).
> 5. Toute logique financière vit en base (SQL/déclencheurs), jamais uniquement côté front.
> 6. Rôles stockés dans une table `user_roles` séparée, jamais sur le profil.
>
> Stack imposée : TanStack Start + TanStack Router, React 19 + TypeScript strict, Tailwind v4 +
> shadcn/ui restylé MSI, Lucide, Recharts, TanStack Query, React Hook Form + Zod,
> Lovable Cloud (PostgreSQL + RLS + Storage + Auth). Logique serveur uniquement via
> `createServerFn` (aucune edge function).
>
> Applique ensuite, phase par phase, le schéma fourni dans `BACKEND_DATABASE_REFERENCE.md`.

---

## 1. Identité visuelle et design system

- **Magenta MSI `#D1127B`** = couleur primaire (actions, liens actifs, accents). `--primary-foreground: #ffffff`.
- Anthracite `#1a1a1a` pour le texte, fond blanc `#ffffff` ; mode sombre fond `#0a0a0a`.
- `--radius: 0.5rem`. Police : **Inter** (texte), **JetBrains Mono** (montants/références techniques).
- Tous les jetons sont sémantiques dans `src/styles.css` (`@theme` + variables) — jamais de
  `text-white`, `bg-black` ou couleurs en dur dans les composants.
- Mobile-first 360–430 px, rendu SaaS premium (jamais un ERP gris), accessibilité WCAG.
- Logo officiel MSI centralisé dans `src/components/ui/logo.tsx` (sidebar, page de connexion, PDF).
- Utilitaire `formatFCFA` centralisé dans `src/lib/utils.ts`, dates forcées en `Africa/Niamey`.

## 2. Dépendances à installer

```
@supabase/supabase-js  @tanstack/react-query  @tanstack/react-router  @tanstack/react-start
react-hook-form  @hookform/resolvers  zod  date-fns  lucide-react  recharts  sonner
tailwindcss@4  tailwindcss-animate  class-variance-authority  clsx  tailwind-merge
pdf-lib  qrcode  @types/qrcode  cmdk  vaul  embla-carousel-react  input-otp
react-day-picker  react-resizable-panels  + primitives @radix-ui/* utilisées par shadcn
```

Règle : aucune nouvelle dépendance sans justification ; un outil est ajouté seulement quand son module en a besoin.

## 3. Architecture des fichiers

```text
src/
  routes/
    __root.tsx                  en-tête, Toaster sonner, onAuthStateChange
    auth.tsx                    connexion (publique)
    verification.tsx            vérification publique d'un document par QR / numéro
    _authenticated.tsx          garde d'accès (ssr:false) + AppShell
    _authenticated.index.tsx    tableau de bord
    _authenticated/
      crm/index.tsx, crm/client.$clientId.tsx
      immobilier/lotissements|parcelles|parcelles.$plotId.prix|tarifs|acquisitions|inventaire|bilans
      ventes/liste|nouvelle|$saleId
      finances/index|impayes|validations
      direction/performance
      admin/users|agences|audit|settings
  components/
    AppShell.tsx  AccessGuard.tsx  NotificationCenter.tsx
    crm/  foncier/  ventes/  finance/  finances/  immobilier/  ui/
  hooks/useAccess.ts
  lib/
    permissions.ts  utils.ts
    access|auth|crm|real-estate|acquisitions|pricing|sales|finance|documents|settings.functions.ts
    documents/ (types, amount-in-words, renderer.server, engine.server, verify.server, download)
  integrations/supabase/  (généré par Lovable Cloud)
```

Règles de frontière : `*.functions.ts` = server functions appelables du client ;
`*.server.ts` = code serveur uniquement (jamais importé par un composant) ;
la clé de service n'est chargée que via `await import(...)` dans un handler, après contrôle du rôle.

## 4. Rôles, permissions et navigation

Rôles (`app_role`) : `super_admin, pdg, comptable, secretaire, commercial, responsable_agence,
informaticien, client` (+ legacy `admin, moderator, user`).

Contrôle d'accès en trois couches :
1. **Base** : RLS + `private.has_role()`, `public.has_permission()`, `public.is_staff()`, `public.fn_my_access()`.
2. **Serveur** : chaque server function revérifie la permission avant toute écriture sensible.
3. **Interface** : `useAccess()` + `AccessGuard` + table `ROUTE_PERMISSIONS` (`src/lib/permissions.ts`)
   qui filtre le menu et bloque la navigation.

Menu (libellé → route → permission) :

| Section | Écran | Route | Permission |
| --- | --- | --- | --- |
| Pilotage | Tableau de bord | `/` | `view_dashboard` |
| Foncier | Parcelles & Lotissements | `/immobilier/lotissements` | `view_lotissements` |
| Foncier | Bilans Stratégiques | `/immobilier/bilans` | `view_performance` |
| Foncier | Inventaire & Stock | `/immobilier/inventaire` | `view_inventory` |
| Foncier | Tarifs & Offres | `/immobilier/tarifs` | `view_tarifs` |
| Foncier | Acquisitions & Coûts | `/immobilier/acquisitions` | `view_acquisitions` |
| Commercial | Clients | `/crm` | `view_clients` |
| Commercial | Contrats & Ventes | `/ventes/liste` | `view_sales` |
| Finances | Journal de Caisse | `/finances?tab=overview` | `view_finance` |
| Finances | Retards & Impayés | `/finances/impayes` | `view_arrears` |
| Finances | Validations PDG | `/finances/validations` | `validate_sensitive_op` |
| Finances | Analyses & Performance | `/direction/performance` | `view_performance` |
| Finances | Remboursements | `/finances?tab=refunds` | `manage_refunds` |
| Finances | Audit & Flux | `/finances?tab=history` | `view_finance` |
| Administration | Utilisateurs | `/admin/users` | `manage_users` |
| Administration | Agences | `/admin/agences` | `manage_agences` |
| Administration | Journal d'Audit | `/admin/audit` | `view_audit_logs` |
| Administration | Paramètres | `/admin/settings` | `manage_settings` |

Les lignes exactes `role_permissions` sont fournies en section 8 du fichier base de données.

## 5. Plan de reconstruction en phases

| Phase | Contenu | Livrables |
| --- | --- | --- |
| 1 | Fondations : charte MSI, AppShell, FCFA, Lovable Cloud | design system, logo, navigation |
| 2 | Sécurité : `app_role`, `user_roles`, `audit_logs`, `has_role`, déclencheurs d'audit | `/admin/users`, `/admin/audit` |
| 3 | Référentiels : `agences`, `expense_categories`, `app_settings`, séquences documents | `/admin/agences`, `/admin/settings` |
| 4-5 | Portefeuille foncier : `lotissements`, `zones`, `ilots`, `plots`, `acquisitions`, `acquisition_costs` | écrans foncier, coût de revient |
| 6 | CRM : `clients`, `client_documents`, `client_interactions` | `/crm`, fiche client 360° |
| 7 | Prix : `price_templates`, `plot_pricing`, validation PDG | `/immobilier/tarifs` |
| 8-9 | Ventes & contrats : `sales`, `contracts`, `contract_snapshots`, `sale_mutations`, `sale_adjustments` | tunnel de vente, contrat immuable |
| 10 | Échéanciers : `payment_schedules`, déclencheur de cohérence | éditeur d'échéancier |
| 11 | Encaissements : `payments`, imputation FIFO, `audit_finance`, reçus | `/finances`, reçus |
| 12 | Caisse & dépenses : `cash_journals`, `expenses`, validation PDG | `/finances/validations` |
| 13 | Retards & relances : moteur d'arriérés, `notifications` J-7→J+60 | `/finances/impayes` |
| 14 | Performance : vues de rentabilité par lotissement, projection 12 mois | `/direction/performance`, `/immobilier/bilans` |
| 15 | Moteur documentaire : `documents`, `document_templates`, `document_sequences`, PDF + QR | page publique `/verification` |
| 16 | Remboursements : `refunds`, dette de remboursement automatique à l'annulation | onglet Remboursements |

Chaque phase = une migration SQL (tables → GRANT → RLS → politiques) puis les server functions puis l'écran.

## 6. Règles métier par défaut (`app_settings.business_rules`)

- Apport recommandé : **30 %** (paramétrable).
- Durées de paiement : **15 ou 20 mois** (paramétrable).
- Retenue en cas d'annulation : **20 %**.
- Délai de réservation : **15 jours**.
- Devise : **XOF / FCFA**, montants entiers.

Invariants financiers imposés en base :
- une seule vente active par parcelle (index unique partiel `idx_single_active_sale_per_plot`) ;
- total des échéances = prix de vente (déclencheur de cohérence) ;
- imputation FIFO des paiements sur les échéances ;
- caisse théorique recalculée par déclencheur, écart de caisse motivé et notifié au PDG ;
- annulation de vente : libération atomique de la parcelle + ouverture automatique de la dette de remboursement.

## 7. Numérotation et documents

- Numérotation atomique par agence / type / année via `fn_next_document_number` et `document_sequences`.
- Documents immuables : réédition = nouveau document liant `replaces_document_id`, jamais de modification.
- PDF générés avec `pdf-lib` côté serveur, montants en toutes lettres en français,
  QR renvoyant vers `/verification` qui appelle la fonction publique `fn_verify_document`.
- Pièces jointes dans des buckets privés, accès contrôlé par politiques sur `storage.objects`.

## 8. Ordre d'exécution recommandé

1. Créer le projet Lovable, activer Lovable Cloud, coller le prompt de la section 0.
2. Appliquer `BACKEND_DATABASE_REFERENCE.md` dans l'ordre indiqué en tête de ce fichier
   (schéma `private` → ENUM → tables → fonctions → RLS/GRANT/politiques → vues → stockage → données de référence).
3. Créer le premier compte, lui attribuer `pdg` dans `user_roles`, rattacher l'agence `Siège Maradi (MAR)`.
4. Installer les dépendances, poser la charte MSI, l'AppShell et la garde d'accès.
5. Dérouler les phases 1 → 16 ; après chaque phase : vérifier le linter de sécurité, les GRANT et les politiques.
6. Recette finale : ouvrir une caisse, enregistrer une vente + un paiement, générer un reçu PDF,
   vérifier son QR sur `/verification`, annuler une vente et contrôler la libération de la parcelle.

## 9. Pièges à éviter (constatés en production)

- Un `CREATE TABLE` sans `GRANT` → l'API renvoie une erreur de permission malgré la RLS.
- Politiques utilisant `has_role(uuid, text)` : supprimer cette surcharge, garder la version typée `app_role`.
- Ne jamais placer un `FormLabel` shadcn hors d'un `FormField` (erreur `useFormField must be used within FormField`).
- Ne pas mettre de garde d'authentification sur une route SSR de premier niveau : tout l'espace protégé vit sous `_authenticated/`.
- Ne jamais stocker un rôle sur `profiles` ; toujours `user_roles` + fonction SECURITY DEFINER.
- Fixer `search_path` sur chaque fonction SECURITY DEFINER et révoquer l'exécution à `anon` sur les fonctions sensibles.
