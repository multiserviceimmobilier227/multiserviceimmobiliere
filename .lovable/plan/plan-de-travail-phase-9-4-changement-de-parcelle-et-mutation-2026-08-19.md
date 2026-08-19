# Plan de travail : Phase 9.4 — Changement de parcelle et Mutations

Cette phase implémente la logique de transfert d'une vente d'une parcelle A vers une parcelle B, avec gestion des écarts financiers et traçabilité totale.

## 1. Extension du Modèle de Données (Supabase)

- **Table `sale_transfers`** : Historique des changements de parcelle.
  - `id` (PK), `sale_id` (FK), `old_plot_id` (FK), `new_plot_id` (FK).
  - `reason` (Text), `price_difference` (Numeric), `authorized_by` (FK profile).
  - `created_at` (Timestamp).
- **Triggers & Fonctions SQL** :
  - `handle_plot_transfer` : Fonction qui libère l'ancienne parcelle (statut 'Disponible') et occupe la nouvelle (statut 'Attribuée').
  - Mise à jour du `total_price` et du `balance` de la vente en fonction du prix de la nouvelle parcelle.

## 2. Logique Serveur (`src/lib/sales.functions.ts` ou `src/lib/transfers.functions.ts`)

- `transferSalePlot` : 
  - Vérifie la disponibilité de la nouvelle parcelle.
  - Calcule la différence de prix.
  - Met à jour la vente (`plot_id`, `total_price`, `balance`).
  - Enregistre le transfert dans `sale_transfers`.
  - Notifie le système d'audit.
- `getSaleTransfers` : Récupère l'historique des mutations pour une vente donnée.

## 3. Interfaces Utilisateur (Frontend)

- **Composant `PlotTransferDialog`** : 
  - Interface de sélection de la nouvelle parcelle (filtrée par disponibilité).
  - Affichage en temps réel de la différence de prix (Crédit/Débit pour le client).
  - Champ de saisie obligatoire pour le motif du transfert.
- **Intégration dans `ventes.$saleId.tsx`** :
  - Nouvel onglet ou bouton d'action "Changer de parcelle".
  - Affichage de l'historique des transferts dans un tableau dédié.

## 4. Règles Métier & Sécurité

- **Validation PDG** : Tout transfert changeant le solde de plus de X FCFA peut nécessiter une validation explicite (optionnel selon configuration).
- **Inviolabilité** : L'ancienne parcelle doit repasser en statut 'Disponible' immédiatement pour permettre une nouvelle vente.
- **Audit** : L'auteur du transfert et la raison sont obligatoirement tracés.

## Détails Techniques

- Utilisation de transactions SQL pour garantir que le changement de parcelle et la mise à jour financière sont atomiques.
