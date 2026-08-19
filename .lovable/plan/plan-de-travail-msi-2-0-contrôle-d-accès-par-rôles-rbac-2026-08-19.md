# Plan de Travail MSI 2.0 — Contrôle d'Accès par Rôles (RBAC)

Ce plan vise à restreindre l'accès aux écrans et aux actions en fonction du profil de l'utilisateur (PDG, Comptable, Secrétaire, client, etc.).

## 1. Extension du Contexte d'Authentification

- Modifier `src/routes/_authenticated.tsx` pour récupérer le rôle de l'utilisateur via une `query` au chargement.
- Injecter ce rôle dans le contexte de route pour qu'il soit accessible globalement dans l'application.

## 2. Sécurisation du Rendu (AppShell)

- Adapter `src/components/AppShell.tsx` pour masquer les sections de navigation non autorisées :
  - **PDG / Informaticien** : Accès total.
  - **Comptable** : Finance et rapports uniquement.
  - **Secrétaire** : CRM et suivi des parcelles.
  - **Commercial** : CRM et consultation des parcelles
  - Client suivre ces paiements.

## 3. Gardes de Sécurité au Niveau des Routes

- Ajouter des vérifications `beforeLoad` dans les routes sensibles (ex: `/admin/*`) pour rediriger les utilisateurs non autorisés vers le tableau de bord.

## 4. Sécurisation des Actions (Server Functions)

- Modifier les fonctions serveur critiques (ex: `createLotissement`, `assignUserRole`) pour vérifier le rôle de l'utilisateur côté serveur avant exécution.

## Détails Techniques

- Utilisation de la table `user_roles` et de la fonction SQL `has_role` déjà existantes.
- Utilisation du middleware `requireSupabaseAuth` pour garantir l'identité de l'appelant.
- Implémentation d'un hook `useUserRole()` pour faciliter les vérifications dans les composants React.