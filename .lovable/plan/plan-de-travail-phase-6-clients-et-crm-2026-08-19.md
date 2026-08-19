# Plan de travail : Phase 6 — Clients et CRM

Implémentation d'un module CRM complet pour la gestion des relations clients de Multi Services Immobilière, garantissant la traçabilité des dossiers et des interactions.

## 1. Extension de la Base de Données

- **Table `client_documents`** : Stockage des pièces d'identité et documents scannés.
    - `id`, `client_id`, `name`, `document_type` (CNI, Passeport, Permis, etc.), `file_url`, `created_at`.
- **Table `client_interactions`** : Historique des échanges (appels, visites, réclamations).
    - `id`, `client_id`, `user_id` (auteur), `type` (Appel, Visite, Courrier), `notes`, `date`, `created_at`.
- **Mise à jour `clients`** : Ajout de colonnes pour une fiche complète.
    - `date_naissance`, `lieu_naissance`, `nationalite`, `civilite` (M., Mme, Mlle).
- **Triggers d'Audit** : Activation systématique de l'audit sur ces nouvelles tables.

## 2. Logique Serveur (`src/lib/crm.functions.ts`)

- `getClients` : Liste avec filtres (nom, téléphone, agence).
- `getClientDetails` : Vue agrégée incluant :
    - Fiche d'identité.
    - Liste des acquisitions (liées par `client_id` dans les futures ventes).
    - Documents archivés.
    - Historique des interactions.
- `createClient` / `updateClient` : Gestion sécurisée avec validation Zod.
- `addClientInteraction` / `uploadClientDocument`.

## 3. Interfaces Utilisateur (Frontend)

- **Route `/crm/clients`** :
    - Liste des clients avec recherche rapide en temps réel.
    - Filtres par statut d'acquisition ou par agence.
- **Route `/crm/clients/$clientId`** :
    - **Onglet Profil** : Informations personnelles et contacts.
    - **Onglet Acquisitions** : Liste des lots achetés/réservés (prêt pour la Phase 7/8).
    - **Onglet Documents** : Visionneuse et archivage numérique.
    - **Onglet Historique** : Chronologie des interactions avec le personnel MSI.

## 4. Sécurité et Rôles

- `Commercial`, `Secretaire`, `Comptable` : Lecture et ajout d'interactions.
- `Secretaire`, `Comptable` : Gestion des documents d'identité.
- RLS : Les accès seront restreints selon l'agence de rattachement (multi-agences).

## Détails Techniques

- **Stockage** : Utilisation du bucket `client-documents` sécurisé dans Lovable Cloud.
- **Audit** : `private.process_audit_log` enregistrera chaque modification des données client.
- **Performance** : Indexation sur les champs `last_name`, `first_name` et `phone`.
