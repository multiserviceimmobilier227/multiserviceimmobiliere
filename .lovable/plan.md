# Plan Phase 1 — Fondations, identité visuelle et backend (Vérification et Consolidation)

L'objectif est de vérifier l'intégrité du socle MSI 2.0 et de finaliser l'implantation rigoureuse des fondations pour garantir une base stable aux phases suivantes.

## 1. Lovable Cloud & Base de Données
- **Vérification RLS & Grants** : Audit systématique de toutes les tables créées (`clients`, `sales`, `plots`, `audit_logs`, `user_roles`).
- **Correction des permissions** : S'assurer que le rôle `pdg` a un accès total et que les autres rôles sont restreints au strict nécessaire via le mécanisme `has_role` (SECURITY DEFINER).
- **Nettoyage des Schémas** : Suppression de toute redondance dans les tables de base.

## 2. Design System MSI (Rigueur Visuelle)
- **Couleurs** : Application stricte du Magenta MSI (`#D1127B`) sur les éléments d'action (boutons, liens actifs) et le Gris Anthracite pour le texte et les bordures.
- **Typographie** : Vérification de la lisibilité sur mobile et bureau (Inter/Sans-serif standard).
- **Composants** : Harmonisation des `Card`, `Button` et `Input` avec le thème MSI.

## 3. Identité & Navigation
- **Logo** : Centralisation du logo dans `src/components/ui/logo.tsx` pour une utilisation cohérente (Sidebar, Page de connexion, Factures/PDF).
- **Navigation Back-Office** : 
  - Regroupement logique : CRM, Foncier, Ventes, Finances, Administration.
  - Gestion des états "actif" pour une meilleure orientation utilisateur.
- **Responsive** : Correction définitive de la sidebar mobile et du drawer.

## 4. Paramètres Globaux & Localisation
- **Formatage FCFA** : Centralisation de `formatFCFA` dans `src/lib/utils.ts`.
- **Dates & Temps** : Forçage du fuseau horaire `Africa/Niamey` dans toutes les fonctions serveur et affichages frontend.
- **Séquences MSI** : Vérification des générateurs de numéros de documents (Ventes, Paiements).

## 5. Vérification de la Page de Connexion
- **Expérience Utilisateur** : Design épuré avec logo MSI.
- **Redirection** : S'assurer que la redirection après connexion mène au Dashboard et non à une page blanche.

## Détails Techniques de Vérification
- Audit des logs console et erreurs réseau.
- Test de montée en charge légère sur les listes (Pagination).
- Vérification du middleware d'authentification Supabase dans `src/start.ts`.
