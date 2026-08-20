# Phase 11 & A-02 — Finalisation et Certification Financière

Cette phase parachève le cœur transactionnel de MSI 2.0 en comblant les lacunes d'imputation, d'audit et d'interface identifiées.

## 1. Moteur d'Imputation & Trésorerie (Backend)
- **Refonte de `audit_finance`** : Ajout de `agency_id` et normalisation des colonnes pour une traçabilité multi-agences parfaite.
- **Optimisation de `fn_impute_payment_on_schedule`** :
    - Gestion intelligente des excédents : si le montant dépasse les échéances dues, il est marqué comme "Crédit/Anticipation" au lieu de rester "orphelin".
    - Correction de la priorité FIFO.
- **Preview RPC** : Création de `fn_get_payment_imputation_preview` pour permettre à la comptable de voir l'impact financier *avant* de valider.
- **Hardening des Triggers** : Unification des triggers d'audit pour les paiements, corrections et remboursements afin d'éviter les doublons ou omissions.

## 2. Interface Utilisateur & UX (Frontend)
- **Calculatrice d'Imputation en Temps Réel** : Intégration dans le dialogue d'encaissement. L'utilisateur voit instantanément quelles mensualités seront apurées.
- **Centre de Notifications Financières** : Interface dédiée au PDG pour valider les encaissements en attente.
- **Audit Ledger View** : Ajout d'un onglet "Audit" dans le dossier de vente pour visualiser chaque mouvement financier (trace de correction, annulation, etc.).

## 3. Spécifications Techniques & Sécurité
- **Audit "CORRECTION_FINANCIERE"** : Marquage explicite de chaque modification de montant.
- **RLS Multi-Agences** : Renforcement des politiques pour s'assurer qu'une agence ne voit pas l'audit d'une autre, sauf pour le PDG/Super-Admin.

## Critères de Validation
- [ ] L'excédent de paiement est correctement tracé.
- [ ] La calculatrice UI prévisualise l'imputation sans erreur.
- [ ] Toute correction de paiement génère une trace indélébile dans `audit_finance`.
- [ ] Le reçu « Mini-Bilan » reflète la situation après imputation complète.
