# Phase 3 — Référentiels et administration

Mise en place des référentiels métier, de la gestion des agences et des paramètres configurables.

## Objectifs
- Gestion des agences et rattachement des utilisateurs.
- Référentiel des catégories de dépenses et moyens de paiement.
- Numérotation automatique des documents (factures, reçus).
- Paramètres métier configurables (apport, durées, retenues).

## Étapes
1. **Migration SQL : Référentiels & Agences**
   - [ ] Table `agences` (nom, adresse, ville).
   - [ ] Ajout de `agence_id` dans `user_roles` et les tables métier.
   - [ ] Table `expense_categories` (loyer, carburant, salaires, etc.).
   - [ ] Table `payment_methods` étendue (espèces, Nita, etc.).
   - [ ] Table `app_settings` pour les paramètres métier (JSONB).
   - [ ] Séquences pour la numérotation automatique des documents.

2. **Backend : Server Functions**
   - [ ] CRUD Agences.
   - [ ] Gestion des paramètres métier (lecture/écriture PDG/Informaticien).
   - [ ] Utilitaire de génération de numéros de documents.

3. **Frontend : Interface Administration**
   - [ ] Page `/admin/agences` : Gestion des points de vente.
   - [ ] Page `/admin/settings` : Configuration des règles métier (30% apport, etc.).
   - [ ] Mise à jour des formulaires pour inclure le choix de l'agence.

## Règles Métier (Phase 3)
- **Apport recommandé** : 30 % (configurable).
- **Durées de paiement** : 15 ou 20 mois (configurable).
- **Retenue en cas d'annulation** : 20 % (non-négociable selon cahier, mais paramétrable).
- **Délai réservation** : 15 jours.
- **Audit** : Toute modification des paramètres métier doit être loggée avec le motif.
