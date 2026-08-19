# Plan de travail : Phase 8 — Moteur de Ventes et Contrats (Cœur du Système)

Cette phase constitue le cœur opérationnel de MSI 2.0. Elle permet de transformer une réservation ou une intention d'achat en une vente contractuelle verrouillée, avec un échéancier de paiement précis.

## 1. Extension de la Base de Données

- **Table `sales`** (Finalisation) :
    - `id`, `client_id`, `plot_id`, `status` (Brouillon, Validée, Annulée, Terminée).
    - `total_amount` (Prix final convenu), `deposit_amount` (Apport initial).
    - `payment_plan_type` (Comptant, Échéancier).
    - `agency_id`, `created_by`, `validated_by_id`.
- **Table `payment_schedules`** : Échéancier théorique des paiements.
    - `id`, `sale_id`, `due_date`, `amount_due`, `status` (En attente, Payé, Retard).
- **Table `contracts`** (Gestion des versions) :
    - Déjà existante, mais ajout de colonnes pour stocker les clauses spécifiques.
- **Triggers de sécurité** :
    - Verrouillage automatique de la parcelle (`Réservée` ou `Vendue`) lors de la validation d'une vente.
    - Interdiction de modifier une vente une fois validée par le PDG.

## 2. Logique Serveur (`src/lib/sales.functions.ts`)

- `createSaleDraft` : Prépare une vente avec calcul automatique de l'apport (min 30%) et des frais.
- `generatePaymentSchedule` : Calcule les échéances basées sur la durée choisie (ex: 6, 12, 24 mois).
- `validateSale` : Action PDG pour officialiser la vente. Déclenche la génération du numéro de contrat unique.
- `getSaleDetails` : Vue agrégée (Client + Parcelle + Échéancier).

## 3. Interfaces Utilisateur (Frontend)

- **Route `/ventes/nouvelle`** :
    - Workflow en étapes : Sélection Client -> Sélection Parcelle -> Configuration Financière.
    - Calculateur d'échéancier en temps réel.
- **Route `/ventes/$saleId`** :
    - Dossier de vente complet.
    - Visualisation de l'échéancier (Timeline).
    - Bouton "Générer Contrat" (PDF/Print).
- **Route `/ventes/liste`** :
    - Filtres par statut, agence et commercial.

## 4. Règles Métier Critiques

- **Apport Minimum** : Le système bloque la validation si l'apport est inférieur au paramètre global (ex: 30%) sauf dérogation PDG.
- **Unicité** : Une parcelle ne peut être liée qu'à une seule vente active (`Validée` ou `Brouillon`).
- **Audit** : Chaque changement de statut de la vente génère une entrée détaillée dans `audit_logs`.

## Détails Techniques

- Utilisation de la bibliothèque `date-fns` pour le calcul précis des échéances mensuelles.
- Génération de documents via templates HTML vers PDF (préparation pour Phase 9).
- Respect des **Framework Rules** : Hydratation sécurisée et QueryClient global.
