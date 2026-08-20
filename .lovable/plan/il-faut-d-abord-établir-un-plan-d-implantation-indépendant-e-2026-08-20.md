# Il faut d'abord établir un plan d'implantation indépendant et progressive de ce plan en 5 sous phases pour des plus meilleure exigences et un meilleur travail bien fait 👍 

# Plan de Travail - Phase 12 : Caisse, Dépenses et Flux Financiers

Cette phase est le pivot de la gestion financière de MSI 2.0. Elle introduit le contrôle rigoureux des sorties d'argent (dépenses), la clôture de caisse quotidienne et la vision consolidée de la trésorerie.

## Objectifs

- **Maîtrise des Sorties** : Digitalisation complète du cycle de dépense (saisie, justification, validation).
- **Intégrité de la Caisse** : Suivi en temps réel des espèces et transferts avec procédure de clôture sécurisée.
- **Réconciliation Financière** : Liaison entre les dépenses et les projets (lotissements) pour un calcul de marge réelle.
- **Audit & Sécurité** : Traçabilité totale des flux, aucune suppression, validation par le PDG pour les montants sensibles.

---

## 1. Backend & Base de Données (PostgreSQL)

### Nouvelles Tables

- `cash_journals` : Sessions de caisse quotidiennes.
  - `id`, `agency_id`, `opened_at`, `closed_at`, `opened_by_id`, `closed_by_id`.
  - `opening_balance` (solde initial), `theoretical_closing_balance` (calculé), `actual_closing_balance` (compté).
  - `discrepancy` (écart), `discrepancy_reason`, `status` (ouvert, fermé, en cours de validation).
- `expenses` : Registre des dépenses.
  - `id`, `date`, `amount`, `category_id` (FK), `description`, `beneficiary` (nom du tiers).
  - `payment_method` (Espèces, Nita, Transfert, etc.), `agency_id` (FK).
  - `project_id` (FK optionnel vers lotissement pour la rentabilité).
  - `receipt_url` (lien vers document justificatif).
  - `status` (brouillon, en attente_validation, validé, rejeté).
  - `created_by_id`, `validated_by_id`, `validation_date`.
- `expense_audit_logs` : Journal spécifique pour les corrections de dépenses.

### Logique SQL (Triggers & Fonctions)

- `fn_calculate_theoretical_cash` : Calcule le solde en fonction des encaissements (Phase 11) et des dépenses validées.
- `tr_prevent_expense_deletion` : Empêche la suppression physique d'une dépense.
- `tr_lock_closed_cash_day` : Interdit toute modification de transaction sur une journée dont la caisse est clôturée.
- `tr_notify_pdg_on_large_expense` : Notification automatique si une dépense dépasse un seuil configurable.
- `tr_notify_pdg_on_cash_discrepancy` : Alerte immédiate en cas d'écart de clôture.

---

## 2. Logique Métier (Server Functions)

- `manageCashSession` : Ouverture et clôture de la caisse avec vérification des droits.
- `submitExpense` : Création d'une dépense avec gestion de l'upload du justificatif (Lovable Storage).
- `validateExpense` : Circuit de validation PDG/Responsable (change le statut et impacte le solde théorique).
- `getFinancialFlows` : Récupération des flux entrants/sortants pour les rapports de trésorerie.
- `correctExpense` : Procédure "Annule et Remplace" avec motif obligatoire pour les erreurs de saisie.

---

## 3. Frontend & Interface Utilisateur (React)

### Gestion de la Caisse (`/finance/caisse`)

- **Tableau de Bord Caisse** : État actuel (Ouverte/Fermée), solde théorique dynamique.
- **Widget de Clôture** : Formulaire de comptage physique, champ de justification si écart, signature numérique.
- **Historique des Clôtures** : Liste des journées passées avec indicateurs visuels de conformité (vert/rouge pour les écarts).

### Gestion des Dépenses (`/finance/depenses`)

- **Flux de Saisie** : Formulaire optimisé avec sélection de catégorie, projet et drag-and-drop pour le reçu.
- **Centre de Validation** : Vue dédiée pour le PDG/Comptable pour valider/rejeter les dépenses en attente.
- **Filtres Avancés** : Recherche par agence, par lotissement, par période ou par catégorie.

### Rapports de Flux

- **Vue "Journal de Caisse"** : Chronologie combinée des encaissements (ventes) et des décaissements (dépenses).
- **Indicateurs Flash** : "Total Dépenses Mois", "Répartition par Catégorie" (Pie chart), "Impact Trésorerie".

---

## 4. Règle d'Exigence & Intégrité

1. **Justificatif Obligatoire** : Impossible de valider une dépense sans fichier joint ou sans une note explicite "Sans justificatif" validée par le PDG.
2. **Double Signature** : Toute clôture avec écart > 5 000 FCFA doit être co-validée par le PDG.
3. **Immutabilité** : Une dépense "Validée" ne peut plus être modifiée. Seule une contre-écriture ou une correction historisée est permise.
4. **Multi-Agences** : Les flux sont strictement isolés par agence, sauf pour le profil Super Admin/PDG qui a la vue consolidée.

---

## 5. Plan de Vérification (Assurance Qualité)

- **Test 1** : Effectuer une vente (Phase 11) -> Vérifier l'augmentation du solde théorique de caisse.
- **Test 2** : Saisir une dépense -> Vérifier qu'elle n'impacte pas le solde tant qu'elle n'est pas validée.
- **Test 3** : Clôturer la caisse avec un écart de 1 FCFA -> Vérifier la génération de la notification d'anomalie.
- **Test 4** : Tenter de supprimer une dépense via l'interface ou directement en base -> Vérifier le blocage par trigger.
- **Test 5** : Extraire le journal d'audit -> Vérifier que chaque mouvement de caisse est horodaté et sourcé.