# Plan de travail : Phase 9.3 — Contrats, Gel des données et Documents de vente

Cette phase se concentre sur la formalisation juridique de la vente : la génération du contrat, le gel historique des prix et des conditions au moment de la signature, et la gestion documentaire.

## 1. Extension du Modèle de Données (Supabase)

- **Table `contracts`** : Stockage des métadonnées du contrat juridique.
  - `id` (PK), `sale_id` (FK), `contract_number` (Unique).
  - `signed_at` (Timestamp), `terms_and_conditions` (Text).
  - `status` : `draft`, `signed`, `cancelled`.
  - `frozen_client_data` (JSONB) : Nom, prénom, CNIB au moment de la vente.
  - `frozen_plot_data` (JSONB) : Lotissement, zone, ilot, numéro, superficie.
  - `frozen_price_data` (JSONB) : Prix total, apport initial, échéances prévues.
- **Table `sale_documents`** : Gestion des fichiers liés (contrats scannés, reçus).
  - `id`, `sale_id`, `type` (contrat, recu, cnib), `file_url`, `created_at`.
- **Audit & Sécurité** :
  - `GRANT SELECT, INSERT, UPDATE ON public.contracts TO authenticated;`
  - `GRANT ALL ON public.contracts TO service_role;`
  - RLS : Seuls le PDG et les Administrateurs peuvent modifier un contrat une fois signé.

## 2. Logique Serveur (`src/lib/contracts.functions.ts`)

- `generateContract` : Initialise le contrat avec les données actuelles de la vente et les "gèle" dans les colonnes JSONB.
- `signContract` : Valide la signature, change le statut de la vente en "Finalisée" (si paiement total) ou "Attribuée" (si échelonné), et génère le numéro de contrat unique (ex: MSI-2026-XXXX).
- `getContractBySaleId` : Récupère les données gelées pour affichage/impression.

## 3. Interfaces Utilisateur (Frontend)

- **Route `/crm/ventes/$saleId/contrat`** :
  - Visualisation du contrat généré.
  - Bouton "Signer le contrat" (Action critique nécessitant confirmation).
  - Affichage comparatif si les données réelles (ex: prix actuel de la parcelle) ont changé depuis le gel.
- **Composant `ContractPreview`** : Gabarit HTML/Tailwind propre pour impression (A4).
- **Gestion Documentaire** : Zone d'upload pour le contrat scanné avec signature manuscrite.

## 4. Intégration Business

- **Gel des données** : Une fois le contrat signé, les modifications ultérieures du catalogue (prix au m², changement de zone) ne doivent JAMAIS impacter ce contrat.
- **Traçabilité** : Toute modification du contrat génère une entrée d'audit détaillée.

## Détails Techniques

- Utilisation de `zod` pour valider la structure des données gelées (JSONB).
- Génération de PDF (via impression navigateur ou librairie légère) respectant l'identité visuelle MSI.
