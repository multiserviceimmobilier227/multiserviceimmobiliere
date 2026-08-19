# Phase 9 — Contrats et Ventes (Moteur Principal)

Cette phase constitue le cœur transactionnel de MSI 2.0. Elle transforme une intention (réservation) en un engagement juridique et financier irréversible, tout en permettant la flexibilité opérationnelle (changement de parcelle, modification de prix) sous strict contrôle.

## 1. Architecture des Données (Backend)
- **Table `sales` (Ventes)** : 
    - `id`, `client_id`, `plot_id`, `agency_id`, `status` (en_attente_apport, active, cloturee, annulee).
    - `payment_plan_type` (comptant, echelonne).
    - `total_price` (montant figé à la signature).
    - `down_payment_amount` (apport initial convenu).
    - `signed_at`, `created_by`.
- **Table `contracts` (Contrats)** : 
    - Document juridique lié à une vente. Stockage des métadonnées et versionnage.
- **Table `sale_adjustments` (Ajustements)** : 
    - Historique des changements de parcelle ou modifications de prix.
    - `sale_id`, `type` (change_plot, price_adjustment).
    - `previous_data` (JSONB), `new_data` (JSONB).
    - `reason`, `authorized_by` (Validation PDG obligatoire).

## 2. Logique Métier (Server Functions)
- **`createSale`** : Initialise la vente, fige le prix actuel de la parcelle, calcule l'apport minimal (basé sur les `app_settings` à 30% par défaut) et passe la parcelle en "Attribuée / En cours de paiement".
- **`transferPlot`** : 
    - Libère la parcelle A (statut "Disponible").
    - Assigne la parcelle B.
    - Recalcule la différence de prix et met à jour le solde du client.
    - Nécessite une `validation_id` du PDG.
- **`adjustSalePrice`** :
    - Permet de modifier le prix final (remise exceptionnelle) après signature.
    - Met à jour le solde restant.
    - Nécessite une `validation_id` du PDG.

## 3. Interface Utilisateur (Frontend)
- **Module de Signature de Vente (`/sales/new`)** :
    - Sélection Client + Parcelle (ou conversion depuis réservation).
    - Sélecteur de mode : Comptant (100%) ou Échelonné.
    - Calculateur d'apport initial dynamique.
- **Gestion des Ventes (`/sales/$saleId`)** :
    - Vue 360° du contrat : échéancier prévisionnel, état des paiements.
    - Bouton "Changer de parcelle" (Ouvre un workflow de transfert).
    - Bouton "Ajuster le prix" (Ouvre une demande de remise).
- **Tableau de Bord des Ventes** : Suivi global du portefeuille par agence.

## 4. Sécurité et Intégrité
- **Gel Historique** : Une fois signée, les données de base de la vente ne peuvent être modifiées sans créer une trace dans `sale_adjustments`.
- **RBAC** :
    - `create_sale` : Secrétaire / Comptable.
    - `validate_adjustment` : PDG uniquement.

## 5. Sous-Phases d'Implémentation
1.  **9.1 : Fondations Database** (Tables, RLS, Triggers de statut).
2.  **9.2 : Moteur de Création de Vente** (Logique de prix figé et apport).
3.  **9.3 : Workflow de Changement de Parcelle** (Transfert et libération).
4.  **9.4 : Ajustements de Prix & Validations PDG**.
5.  **9.5 : Interface de Gestion et Documents**.
