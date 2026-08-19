# Plan de travail : Phase 9.5 — Câblage UI & Opérationnalité Totale

Ce plan finalise l'intégration des fonctionnalités cœur (Ventes, Acquisitions, CRM, Foncier) pour rendre le logiciel MSI 2.0 pleinement exploitable.

## 1. Câblage CRM & Foncier (Réalisé)
- [x] **Hiérarchie Lotissements** : Navigation fluide de Lotissement > Zone > Ilot > Parcelles.
- [x] **Visualisation 360° Client** : Profil complet avec historique des interactions et acquisitions.
- [x] **Tableau de Bord** : Indicateurs temps réel (Ventes mensuelles, Recouvrements, Disponibilité foncière).

## 2. Cycle de Vente & Encaissements (Réalisé)
- [x] **Détail de Vente** : Interface riche regroupant client, parcelle, échéancier et historique.
- [x] **Gestion des Paiements** : Bouton "Encaisser Paiement" avec mise à jour instantanée du solde et traçabilité.
- [x] **Ajustements PDG** : Interface de révision de prix avec motif obligatoire.
- [x] **Validation & Snapshots** : Gel des données contractuelles lors de la signature.

## 3. Acquisitions & Coûts de Revient (Réalisé)
- [x] **Calculateur de Rentabilité** : Intégration des frais annexes (Géomètre, Actes, Commissions) dans le prix de revient.
- [x] **Formulaire d'Acquisition** : Sélection liée au stock foncier existant.

## 4. Prochaines Étapes (Phase 10+)
- [ ] **Génération PDF** : Moteur de génération de contrats et reçus au format PDF.
- [ ] **Automatisations CRM** : Relances automatiques par SMS/Email pour les retards de paiement.
- [ ] **Workflow de Mutation** : Formulaire complet pour le transfert de droits sur parcelle (A vers B).

## Détails Techniques
- Utilisation de `useMutation` pour les encaissements et validations.
- Recalcul des soldes côté serveur dans `sales.functions.ts`.
- Historisation systématique dans la table `payments` liée à `sales`.
