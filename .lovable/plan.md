# Phase 9 — Contrats, Mutations et Sécurité Transactionnelle

Cette phase transforme les réservations de la Phase 8 en contrats fermes et gère les exceptions critiques (changement de parcelle, remise après signature) avec une traçabilité totale.

## Objectifs
- Figer les données au moment de la vente (Gel historique).
- Gérer les mutations (changement de parcelle A vers B).
- Sécuriser les modifications de prix post-paiement.
- Automatiser le cycle de vie des parcelles.

## Étapes de réalisation

### 1. Backend & Base de données (Supabase)
- **Table `contract_snapshots`** : Stocke une copie carbone des données de la parcelle et du client au moment de la signature pour garantir l'intégrité historique même si la parcelle change de prix ou de nom plus tard.
- **Table `sale_mutations`** : Historise les changements de parcelle (Ancienne, Nouvelle, Différence de prix, Motif).
- **Triggers SQL** :
  - Verrouillage strict : Empêcher toute modification du prix d'une vente si un paiement a déjà été effectué, sauf via une fonction de "Révision de Prix" validée par le PDG.
  - Libération automatique : Remettre une parcelle en "Disponible" si elle est remplacée lors d'une mutation.

### 2. Logique Serveur (TanStack Server Functions)
- `generateContractSnapshot` : Capture l'état des données lors de la validation.
- `requestPlotMutation` : Gère le transfert des fonds d'une parcelle à une autre.
- `adjustSalePrice` : Fonction spécifique pour appliquer une remise post-validation, avec calcul automatique du nouveau solde et vérification du rôle PDG.

### 3. Interface Utilisateur (React / UI)
- **Vue Contrat** : Affichage des clauses, des parties et du snapshot historique.
- **Interface de Mutation** : Assistant pour choisir une nouvelle parcelle, voir le delta financier et soumettre à validation.
- **Badge de Statut** : Évolution vers « Attribuée » dès le premier paiement reçu.

## Détails Techniques
- **Formule de solde** : `Nouveau Solde = (Prix Initial - Réduction) - Déjà Payé`.
- **Validation** : Toute mutation ou remise requiert `public.has_role(auth.uid(), 'pdg')`.
- **Trace** : Chaque mutation génère une entrée dans `audit_logs` avec l'ancien et le nouveau `plot_id`.

## User Facing Summary
Mise en place de la gestion contractuelle ferme : gel des données à la signature pour éviter les litiges, outil de changement de parcelle (mutation) et sécurisation des remises exceptionnelles validées par le PDG.
