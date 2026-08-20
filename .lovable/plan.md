# Plan d'Implantation Progressive - Phase 12 : Caisse, Dépenses et Flux (Diagnostic & Finalisation)

Ce plan vise à combler les lacunes identifiées dans l'implémentation de la Phase 12, notamment l'absence de certains déclencheurs (triggers), fonctions SQL critiques et la finalisation de l'interface utilisateur pour le PDG.

## 1. Backend & Base de Données (PostgreSQL)

### Fonctions & Triggers de Sécurité
- **`fn_calculate_theoretical_cash`** : Créer la fonction SQL pour calculer le solde en temps réel (Solde ouverture + Encaissements validés - Dépenses validées).
- **Triggers d'Intégrité** :
    - `tr_prevent_expense_deletion` : Interdire `DELETE` sur `expenses`.
    - `tr_lock_closed_cash_day` : Interdire `INSERT/UPDATE` sur `expenses` si le `cash_journal_id` associé est fermé.
    - `tr_notify_pdg_on_large_expense` : Créer une notification si dépense > 100 000 FCFA.
    - `tr_notify_pdg_on_cash_discrepancy` : Créer une notification si écart clôture > 5 000 FCFA.
- **Synchronisation** :
    - `tr_sync_cash_journal_balance` : Mettre à jour `theoretical_closing_balance` à chaque mouvement (entrée/sortie).

### RLS & Grants
- Vérifier et accorder explicitement les droits `EXECUTE` sur les fonctions `SECURITY DEFINER`.
- Assurer que la table `notifications` est accessible et isolée par utilisateur.

## 2. Logique Métier (Server Functions)

- **`validateExpense`** : S'assurer que le PDG reçoit une notification lors d'une nouvelle dépense soumise.
- **`closeCashSession`** : Intégrer la vérification du seuil d'écart pour la notification automatique.
- **Gestion des Justificatifs** : Implémenter le lien réel avec le stockage (ou placeholder structuré si non configuré).

## 3. Frontend & Interface Utilisateur (React)

### Centre de Validation PDG (`/finances/validations`)
- Créer une vue dédiée pour que le PDG puisse voir les dépenses `en_attente_validation` et les approuver/rejeter en masse ou individuellement.

### Améliorations `CashJournalStatus` & `ExpenseForm`
- **Upload** : Ajouter la logique simulée ou réelle d'upload de justificatif dans `ExpenseForm`.
- **Historique** : Ajouter un onglet "Sessions Passées" dans la vue finances pour voir les clôtures précédentes et les écarts.
- **Widget Sidebar** : Intégrer un indicateur visuel discret de l'état de la caisse (Ouverte/Fermée) dans la navigation principale.

## 4. Plan de Vérification

- **Test SQL** : Vérifier que le trigger empêche la suppression d'une dépense.
- **Test Flux** : Créer un encaissement (Phase 11) et vérifier que le solde théorique augmente.
- **Test Clôture** : Simuler une clôture avec écart et vérifier la création d'une ligne dans `notifications` pour le PDG.
- **Test Validation** : Valider une dépense et vérifier que le solde théorique diminue uniquement à cet instant.
