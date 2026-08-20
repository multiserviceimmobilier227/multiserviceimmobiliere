# Plan de Remédiation : Intégrité des Données, CRM et Ventes

Le diagnostic a révélé plusieurs incohérences majeures :
- **CRM** : Des doublons de clients sont présents dans la base (identifiés par le même numéro de téléphone mais des emails différents).
- **Ventes** : Les ventes enregistrées en base ne s'affichent pas dans l'interface (`/ventes/liste`) en raison d'un manque de synchronisation des RLS ou de données orphelines.
- **Tableau de Bord** : Le compteur "Clients Actifs" est gonflé par les doublons et les clients sans transactions.

## Objectifs
1.  **Nettoyage des données** : Fusionner les doublons de clients et corriger les attributions de ventes.
2.  **Correction de l'interface Ventes** : Rendre les ventes visibles et fonctionnelles.
3.  **Fiabilisation du Dashboard** : Afficher des statistiques basées sur les transactions réelles.
4.  **Verrouillage du CRM** : Empêcher la création de doublons par téléphone.

## Détails Techniques

### 1. Base de Données (SQL)
- Créer une contrainte unique sur `phone` dans la table `clients` pour bloquer les doublons à la source.
- Fusionner les clients identifiés comme doublons :
    - `Ibrahim Moussa` (plusieurs entrées)
    - `Charifa Oumarou Saâdou` (doublon par email)
    - `Test Validation` (données de test à nettoyer)
- Mettre à jour les `client_id` dans `sales` et `reservations` pour pointer vers le compte unique conservé.
- Supprimer les comptes clients orphelins ou redondants.
- Harder les RLS sur la table `sales` pour garantir que les utilisateurs `super_admin` et `admin` voient tout.

### 2. Backend (Server Functions)
- Modifier `getClients` pour inclure un filtrage plus strict.
- Mettre à jour `getDashboardStats` pour distinguer "Clients totaux" de "Clients avec ventes actives".

### 3. Frontend (Routes & UI)
- Debugger la route `src/routes/_authenticated/ventes/liste.tsx` pour comprendre pourquoi elle retourne une liste vide malgré les données en DB (vérification des jointures et des filtres Supabase).
- Ajouter une validation côté client dans `ClientFormDialog` pour vérifier l'existence du numéro de téléphone avant soumission.

### 4. Vérification (Playwright)
- Scénario : Créer un client -> Lui affecter une vente -> Vérifier son apparition dans le dashboard et la liste des ventes.
- Scénario : Tenter de créer un client avec un téléphone déjà existant -> Vérifier le blocage.
