# MSI 2.0 — Phase 9.5 D-E-F : Opérationnalité Totale & Dashboard

Le but de cette intervention est de finaliser les câblages backend/frontend restants pour que toutes les pages du logiciel soient 100% fonctionnelles, en mettant l'accent sur les acquisitions, les coûts de revient et un tableau de bord consolidé.

## 1. Sous-phase D : Acquisitions & Coûts de revient (Finalisation)
- [ ] **Formulaire d'Acquisition** : Ajouter la sélection optionnelle d'un lotissement ou d'une parcelle spécifique (achat en gros vs détail).
- [ ] **Gestion des Frais** : Ajouter un bouton et un dialogue pour enregistrer des frais annexes (géomètre, taxes, commission) directement depuis la liste des acquisitions.
- [ ] **Calcul de Rentabilité** : Implémenter la logique de calcul `(Prix Revente Total - Coût de Revient Total) / Coût de Revient Total` sur la fiche lotissement.

## 2. Sous-phase E : Tableau de Bord Réel (Consolidé)
- [ ] **Indicateurs Financiers** : Câbler les "Ventes du mois" et "Encaissements" avec des fonctions serveur réelles.
- [ ] **Stock & Clients** : S'assurer que les compteurs reflètent l'état actuel de la base de données.
- [ ] **Graphiques (Optionnel)** : Préparer la structure pour l'évolution des encaissements.

## 3. Sous-phase F : Audit de Cohérence & Navigation
- [ ] **Nettoyage Sidebar** : Supprimer les liens morts ou les rediriger vers les pages actives.
- [ ] **Gestion des Sites** : S'assurer que la création de parcelles fonctionne avec des sites valides.
- [ ] **Seeds & Data** : Vérifier que les données de démo (Horizon 2) sont cohérentes avec le nouveau câblage.

## Détails techniques
- **Frontend** : Utilisation de `react-hook-form` + `zod` pour tous les nouveaux formulaires.
- **Backend** : `createServerFn` pour les agrégations financières (SUM sur les ventes et frais).
- **Base de données** : Vérification des RLS sur les tables `acquisitions` et `acquisition_costs`.
