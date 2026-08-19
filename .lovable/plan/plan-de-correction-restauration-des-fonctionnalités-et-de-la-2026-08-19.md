# Plan de correction : Restauration des fonctionnalités et de la navigation

L'utilisateur signale une perte massive de fonctionnalités et une interface non fonctionnelle. Cela est dû à une mise à jour partielle des permissions et à une omission dans le composant `AppShell` lors du dernier refactoring.

## 1. Restauration du Menu Complet (`src/components/AppShell.tsx`)

- Réintégrer toutes les sections manquantes visibles dans les captures d'écran de référence :
  - **Immobilier** : Ajouter "Suivi des Parcelles".
  - **CRM & Ventes** : S'assurer que "Contrats & Ventes" et "Réservations" sont présents.
  - **Finance** (Nouvelle section) : Ajouter "Encaissements", "Dépenses" et "Comptabilité".
- Harmoniser les labels avec les attentes de l'utilisateur.

## 2. Sécurisation du Chargement des Rôles (`src/routes/_authenticated.tsx`)

- Améliorer la gestion du chargement pour éviter l'affichage d'un menu vide pendant la récupération des permissions.
- Ajouter une gestion d'erreur robuste : si la récupération échoue, tenter de recharger ou afficher un message explicite au lieu de bloquer la navigation.
- S'assurer que le `pdg` a toujours accès à tout, même en cas de délai de synchronisation de la matrice dynamique.

## 3. Mise à jour de la Matrice de Permissions (`src/lib/permissions.ts`)

- Compléter l'objet `ROLE_PERMISSIONS.pdg` avec TOUTES les permissions existantes dans le type `Permission`.
- S'assurer que les rôles `admin` et `informaticien` sont également complets.
- Ajouter les permissions pour la section Finance : `view_finance`, `manage_finance`, `view_expenses`, `manage_expenses`, `validate_payments`.

## 4. Vérification de la Réactivité et de la Navigation

- Vérifier que les composants `Link` pointent vers des routes existantes.
- S'assurer qu'aucun bug de "hydratation" ne bloque les clics (vérification du `mounted` state).
- Corriger le problème de "clic impossible" en vérifiant les superpositions éventuelles (z-index ou modals mal fermées).

## Détails Techniques

- Utilisation de `checkPermission` systématique dans le menu.
- Le rôle `pdg` dans `hasPermission` restera le "master switch" (toujours `true`).
