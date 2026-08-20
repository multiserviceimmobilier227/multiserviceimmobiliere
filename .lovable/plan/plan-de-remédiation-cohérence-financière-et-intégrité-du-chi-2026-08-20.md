# Plan de Remédiation : Cohérence Financière et Intégrité du Chiffre d'Affaires (MSI 2.0)

L'audit a révélé une incohérence majeure entre le Chiffre d'Affaires (CA) affiché sur le tableau de bord et la réalité comptable (versements effectifs vs réservations vs ventes validées). Le plan vise à aligner le système sur les standards comptables immobiliers.

## Objectifs
- **Récupérer la cohérence financière** : Distinguer le CA Potentiel (Ventes) du CA Réel (Encaissements).
- **Tracer chaque FCFA** : S'assurer que les annulations impactent immédiatement les statistiques.
- **Réparer le Tableau de Bord** : Afficher des indicateurs fiables et indiscutables.

## Architecture Financière
- **CA Potentiel** = Somme des `total_amount` des ventes en statut `en_cours` ou `termine`.
- **Encaissements** = Somme cumulée des `deposit_amount` (dépôts) et de tous les `payments` validés.
- **Remboursements** = Gestion des cas d'annulation avec sortie de caisse (nouvelle table `refunds`).

## Étapes de réalisation

### 1. Refonte du Moteur de Calcul (Backend)
- Modifier `getDashboardStats` pour une logique rigoureuse :
    - `monthlySales` : Somme des prix de vente des contrats actifs (excluant `annule`).
    - `monthlyCollections` : Flux financier réel (Somme des paiements reçus ce mois).
    - `outstandingBalance` : Reste à recouvrer sur les ventes actives.
- Créer une vue SQL `v_financial_summary` pour centraliser ces calculs côté base de données (plus performant et robuste).

### 2. Intégrité des Données & Annulations
- S'assurer que le passage d'une vente à `annule` remet la parcelle en `Disponible` ET déduit instantanément le montant du CA prévisionnel.
- Implémenter le calcul de la valeur du stock (Stock Invendu = Parcelles `Disponible` * Prix de base).

### 3. Interface Utilisateur (Dashboard)
- Remplacer les cartes de stats actuelles par :
    - **Ventes Contractées (Mois)** : Montant total des nouveaux contrats signés.
    - **Recouvrement Réel (Mois)** : Argent effectivement entré en caisse.
    - **Taux de Recouvrement** : (Encaissements / Ventes Contractées) %.
    - **Valeur du Stock Invendu** : Vision du potentiel restant.
- Ajouter des graphiques de tendance (Ventes vs Encaissements).

### 4. Vérification & Stress Test
- Simuler 10 scénarios complexes :
    - Vente avec dépôt -> Vérifier CA et Encaissements.
    - Paiement partiel -> Vérifier Encaissements et Reste à payer.
    - Annulation de vente -> Vérifier disparition du CA prévisionnel.
    - Mutation de parcelle (changement de prix) -> Vérifier ajustement du CA.

## Détails Techniques
- **Base de données** : Création d'une table `audit_finance` pour journaliser tout mouvement de valeur.
- **RLS** : Verrouiller les modifications financières aux rôles `comptable`, `admin` et `pdg`.
- **Logic** : Utilisation de `SUM(COALESCE(...))` en SQL pour éviter les erreurs `null` dans les calculs.
