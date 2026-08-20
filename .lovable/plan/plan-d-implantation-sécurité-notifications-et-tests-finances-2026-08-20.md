# Plan d'Implantation : Sécurité, Notifications et Tests (Finances)

Ce plan vise à finaliser la robustesse de la Phase 12 en verrouillant les accès serveurs, en automatisant les alertes de suivi et en garantissant la non-régression via des tests automatisés.

## 1. Sécurité Serveur (Backend & RLS)
- **Validation PDG au niveau serveur** : Renforcer `validateExpense` pour vérifier non seulement le rôle `pdg` mais aussi l'existence de la dépense et son état actuel.
- **Accès Route PDG** : Ajouter un garde-fou dans le composant `ExpenseValidations` pour rediriger les utilisateurs non-autorisés (en complément de la protection serveur).
- **RLS Hardening** : S'assurer que seul le PDG peut lire les dépenses au statut `en_attente_validation` de toutes les agences, tandis que les agents ne voient que les leurs.

## 2. Notifications Automatisées
- **Triggers PostgreSQL** :
    - `tr_notify_expense_status_change` : Envoi d'une notification dans la table `notifications` lors du passage à `validé` ou `rejeté`.
    - `tr_notify_pdg_new_expense` : Alerte immédiate pour le PDG lorsqu'une dépense est soumise.
- **UI Notifications** : Mise à jour du `NotificationCenter` pour afficher ces nouveaux types d'alertes financières.

## 3. Tests de Bout-en-Bout (Playwright)
- **Scénario 1 : Blocage Caisse Fermée** :
    - Tenter de soumettre une dépense en espèces sans session ouverte.
    - Vérifier le message d'erreur et l'impossibilité de cliquer sur "Soumettre".
- **Scénario 2 : Cycle d'Approbation** :
    - Connexion en tant qu'agent : soumission d'une dépense.
    - Connexion en tant que PDG : validation dans le centre de contrôle.
    - Vérification du changement de statut et de la notification reçue par l'agent.

## Détails Techniques
- Utilisation de `createServerFn` middleware pour la validation de rôle.
- Tables cibles : `expenses`, `notifications`, `user_roles`.
- Outil de test : Playwright (script python/js dans `/tmp/browser`).
