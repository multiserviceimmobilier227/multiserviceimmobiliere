# Phase 9.5 — Câblage UI & Opérationnalité Totale

Cette phase intermédiaire vise à rendre toutes les interfaces existantes 100% fonctionnelles en reliant les boutons inactifs aux fonctions serveur et à la base de données.

## Sous-phase A — Câblage CRM Complet
- **Objectif** : Rendre la création et l'édition de clients opérationnelles.
- **Actions** :
    - Créer le formulaire de création de client (`Dialog` dans `crm/index.tsx`).
    - Créer le formulaire d'édition de client dans la fiche 360°.
    - Relier au serveur via `upsertClient`.
    - Gérer l'upload des documents d'identité (CNI, Passeport).

## Sous-phase B — Câblage Foncier (Lotissements & Zones)
- **Objectif** : Permettre la saisie du patrimoine foncier.
- **Actions** :
    - Implémenter le formulaire "Nouveau Lotissement" avec choix de l'agence.
    - Ajouter la possibilité de créer des Zones et des Îlots directement depuis la vue lotissement.
    - Relier aux fonctions `createLotissement`, `createZone`, `createIlot`.

## Sous-phase C — Câblage Foncier (Parcelles & Stock)
- **Objectif** : Gestion granulaire des parcelles.
- **Actions** :
    - Créer le formulaire d'ajout de parcelle (individuel ou par lot).
    - Permettre la modification des caractéristiques techniques (surface, position).
    - Intégrer la validation PDG lors de l'ajout massif de stock.

## Sous-phase D — Câblage des Acquisitions
- **Objectif** : Enregistrer les investissements fonciers.
- **Actions** :
    - Formulaire "Nouvelle Acquisition" (Vendeur, prix principal, frais annexes).
    - Liaison automatique avec la création de lotissement ou de parcelle.
    - Calcul en temps réel du coût de revient prévisionnel.

## Sous-phase E — Dashboard Réel & Analytics
- **Objectif** : Remplacer les chiffres "0" par la réalité.
- **Actions** :
    - Créer une fonction serveur `getDashboardStats` qui agrège :
        - Somme des `total_price` des ventes validées (Ventes du mois).
        - Somme des paiements reçus (Encaissements).
        - Compte des parcelles avec statut 'Disponible'.
        - Compte des clients uniques.
    - Mettre à jour `src/routes/_authenticated.index.tsx`.

## Sous-phase F — Finalisation & Audit de Cohérence
- **Objectif** : Vérifier que chaque bouton du menu et chaque action de table produit un résultat.
- **Actions** :
    - Test de bout en bout : Acquisition -> Lotissement -> Parcelles -> Prix -> Client -> Vente -> Audit.
    - Correction des derniers liens morts ou redirections incorrectes.

## Détails Techniques
- Utilisation de `react-hook-form` et `zod` pour les nouveaux formulaires.
- `useMutation` de TanStack Query pour la synchronisation immédiate de l'UI.
- Respect strict des triggers RLS et de la traçabilité audit_logs sur chaque nouvelle action.
