# Plan de travail : Phase 7 — Offres, prix et réductions

Mise en place du moteur de tarification et de gestion des offres commerciales, incluant l'historisation des prix et le contrôle des remises.

## 1. Extension de la Base de Données

- **Table `plot_pricing`** : Historique des prix par parcelle.
    - `id`, `plot_id`, `base_price` (prix catalogue), `min_price` (seuil critique), `effective_date`, `created_by`, `validated_by_id`.
- **Table `price_templates`** : Grilles de prix par gabarit (ex: 200m², 300m²).
    - `id`, `name`, `surface_range_min`, `surface_range_max`, `price_per_m2`, `is_active`.
- **Mise à jour `sales` (anticipation)** : Préparation des colonnes pour le calcul financier.
    - `catalog_price` (prix au moment du contrat), `discount_amount`, `final_price`.
- **Politiques RLS & Audit** : 
    - Seuls le PDG et l'Informaticien peuvent valider de nouveaux prix catalogue.
    - Activation de `private.process_audit_log` sur les nouvelles tables.

## 2. Logique Serveur (`src/lib/pricing.functions.ts`)

- `getPlotPrice` : Récupère le prix actuel d'une parcelle (soit spécifique, soit via gabarit).
- `updatePlotPrice` : Prépare un changement de prix (soumis à validation PDG si > 5%).
- `validatePriceChange` : Action réservée au PDG pour verrouiller un nouveau tarif.
- `calculateFinalPrice` : Logique de calcul `Prix Catalogue - Réduction = Prix Final`.

## 3. Interfaces Utilisateur (Frontend)

- **Route `/immobilier/tarifs`** :
    - Gestion des grilles par gabarit.
    - Vue d'ensemble des prix par lotissement.
- **Route `/immobilier/parcelles/$plotId/prix`** :
    - Historique complet des prix de la parcelle.
    - Graphique d'évolution (optionnel).
    - Formulaire de mise à jour de prix avec motif obligatoire (pour l'audit).
- **Intégration CRM/Ventes** : Affichage du prix catalogue vs prix négocié lors de la préparation d'une vente.

## 4. Règles Métier Critiques

- **Non-rétroactivité** : Un changement de prix catalogue ne modifie jamais le `final_price` d'un contrat déjà validé ou en cours.
- **Transparence** : La réduction est stockée comme une donnée distincte, pas comme une modification directe du prix catalogue.
- **Validation** : Toute baisse de prix en dessous du `min_price` défini nécessite une validation explicite du PDG.

## Détails Techniques

- Utilisation de `numeric(20, 2)` pour tous les montants FCFA.
- Sécurisation des fonctions de validation par `SECURITY DEFINER`.
