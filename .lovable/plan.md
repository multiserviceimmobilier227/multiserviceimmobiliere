# Phase 2 — Sécurité, rôles et audit (socle)

Mise en place du système de gestion des accès et de la traçabilité des opérations.

## Objectifs
- Gestion des rôles MSI : pdg, comptable, secretaire, commercial, responsable_agence, informaticien, client.
- Permissions granulaires et journal d'audit universel.
- Interface d'administration des utilisateurs et consultation des logs.

## Étapes
1. **Migration SQL : Rôles & Audit**
   - [x] Création du type `app_role` étendu.
   - [x] Table `user_roles` avec contraintes.
   - [x] Table `audit_logs` universelle.
   - [x] Fonctions de sécurité (`has_role`, `process_audit_log`).
   - [ ] Mise à jour des permissions (seul l'informaticien gère les rôles).

2. **Backend : Server Functions**
   - [ ] Gestion des utilisateurs (liste, attribution de rôle).
   - [ ] Lecture du journal d'audit.
   - [ ] Middleware de vérification de rôle.

3. **Frontend : Interface Admin**
   - [ ] Page `/admin/users` : Gestion des profils et rôles.
   - [ ] Page `/admin/audit` : Visualisation chronologique des actions.
   - [ ] Intégration dans `AppShell`.

## Détails Techniques
- Les rôles sont gérés via une table séparée pour éviter les escalades de privilèges.
- L'audit utilise des triggers PostgreSQL pour garantir que *toute* modification est enregistrée, même en dehors de l'application.
- Les opérations sensibles (remboursements, annulations) seront marquées pour validation PDG dans les phases suivantes.
