# Plan de travail : Phase 9.5 — Modification de prix et Ajustements Financiers

Cette phase implémente la possibilité de modifier le prix d'une vente après sa création (réductions exceptionnelles, ajustements commerciaux) avec un processus de validation strict par le PDG.

## 1. Extension du Modèle de Données (Supabase)

- **Table `sale_adjustments`** : (Déjà esquissée en 9.3, à finaliser si besoin)
  - `id` (PK), `sale_id` (FK), `type` (Enum: 'discount', 'surcharge', 'price_correction').
  - `amount` (Numeric), `reason` (Text), `status` (Enum: 'pending', 'approved', 'rejected').
  - `requested_by` (FK), `validated_by` (FK), `validated_at` (Timestamp).
- **Triggers & Fonctions SQL** :
  - `apply_sale_adjustment` : Fonction déclenchée après approbation pour mettre à jour le `final_price` et le `balance` de la vente parente.
  - Sécurité : Seul un rôle `pdg` peut passer le statut à 'approved'.

## 2. Logique Serveur (`src/lib/sales.functions.ts`)

- `requestSaleAdjustment` : Crée une demande d'ajustement en attente.
- `approveSaleAdjustment` : Valide l'ajustement, met à jour les soldes et enregistre dans l'audit.
- `rejectSaleAdjustment` : Annule la demande.
- `getSaleAdjustments` : Liste l'historique des modifications de prix pour une vente.

## 3. Interfaces Utilisateur (Frontend)

- **Onglet "Ajustements Financiers"** dans `ventes.$saleId.tsx` :
  - Vue récapitulative : Prix initial -> Remises -> Prix Final.
  - Historique des demandes de modification de prix.
  - Bouton "Nouvelle demande de remise/ajustement" (pour les secrétaires/comptables).
  - Boutons de validation (visibles uniquement pour le PDG/Admin).
- **Modal `PriceAdjustmentDialog`** :
  - Saisie du montant (remise ou surplus).
  - Justification obligatoire.
  - Calculateur d'impact sur le solde restant.

## 4. Règles Métier & Sécurité

- **Traçabilité** : Le prix catalogue original ne doit jamais être écrasé, on utilise le champ `final_price`.
- **Hiérarchie** : Une remise ne peut pas être appliquée si elle rend le solde négatif (le client ne peut pas avoir payé plus que le prix final).
- **Audit** : Chaque ajustement crée une entrée détaillée dans le journal d'audit universel.

## Détails Techniques

- Utilisation de `useServerFn` pour les appels sécurisés.
- Mise à jour en temps réel des états React Query après validation.
