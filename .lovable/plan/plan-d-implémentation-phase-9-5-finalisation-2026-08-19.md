# Plan d'implémentation - Phase 9.5 (Finalisation)

## Phase 9.5 — Câblage UI & Opérationnalité Totale

### A. CRM & Foncier (Terminé)
- [x] Liste des lotissements, zones et ilots.
- [x] Vue hiérarchique : Lotissement > Zones > Ilots > Parcelles.
- [x] Formulaires de création Lotissement/Zone/Ilot/Parcelle.
- [x] Connexion du Dashboard aux compteurs réels (Clients, Parcelles).

### D. Acquisitions & Frais Annexes (Terminé)
- [x] Formulaire d'acquisition avec sélection optionnelle de lotissement/parcelle.
- [x] Enregistrement des frais annexes (Géomètre, Actes, etc.) liés à une acquisition.
- [x] Liste des acquisitions avec total investi (Prix + Frais).

### E. Dashboard Financier Réel (Terminé)
- [x] Création des fonctions d'agrégation `getDashboardStats` (Ventes du mois, Encaissements).
- [x] Câblage des indicateurs financiers sur le Dashboard principal.

### F. Finalisation & Audit final (À faire)
- [ ] Vérification de la cohérence des soldes clients après paiement partiel.
- [ ] Audit de sécurité sur les `createServerFn` (vérification systématique des rôles si nécessaire).
- [ ] Tests de bout en bout : Acquisition -> Lotissement -> Vente -> Paiement.

## Détails Techniques
- Utilisation de `supabaseAdmin` dans les `createServerFn` pour les agrégations complexes.
- Snapshots de contrats lors de la validation PDG pour garantir l'historique.
- Verrouillage des modifications de prix après le premier versement.
