# Phase 5 — Acquisitions foncières et coûts de revient

Mise en place du suivi financier des acquisitions (lotissements globaux ou parcelles à l'unité) et calcul de la rentabilité théorique.

## Objectifs
- Suivi des acquisitions : achat global de lotissement ou achat de parcelles individuelles.
- Gestion des coûts directs (prix d'achat) et des frais complémentaires (notaire, géomètre, commissions, taxes).
- Calcul automatique du coût de revient par parcelle.
- Comparaison entre coût total investi et prix de vente potentiel (chiffre d'affaires prévisionnel).
- Écran de rentabilité par opération foncière.

## Étapes

1. **Migration SQL : Acquisitions et Frais**
   - [ ] Table `acquisitions` (lotissement_id ou plot_id, vendeur, date_achat, prix_principal, devis_frais_prevus).
   - [ ] Table `acquisition_costs` (acquisition_id, category [frais_acte, geometre, commission, etc.], amount, date, proof_url).
   - [ ] Ajout de champs financiers dans `plots` si nécessaire (prix_revient_calcule).
   - [ ] Vues SQL pour le calcul des totaux et de la rentabilité par lotissement.
   - [ ] Triggers d'audit sur les nouvelles tables financières.

2. **Backend : Server Functions**
   - [ ] CRUD Acquisitions.
   - [ ] Gestion des frais complémentaires.
   - [ ] Fonctions de calcul de rentabilité (CA potentiel vs Coûts réels).

3. **Frontend : Interface Acquisitions & Rentabilité**
   - [ ] Page `/immobilier/acquisitions` : Liste des achats fonciers et saisie des nouveaux dossiers.
   - [ ] Détail Acquisition : Saisie des frais au fil de l'eau.
   - [ ] Dashboard de Rentabilité : Graphiques simples comparant investissement et potentiel de vente par zone/lotissement.

## Règles Métier (Phase 5)
- **Trace financière** : Chaque dépense d'acquisition doit être rattachée à une catégorie et un justificatif peut être lié.
- **Répartition des coûts** : Pour un lotissement, le coût de revient par parcelle est calculé au prorata de la superficie ou de manière égale (selon choix).
- **Validation PDG** : La saisie d'une acquisition globale nécessite une validation spécifique.
- **Audit** : Toute modification d'un montant d'acquisition est tracée dans l'audit journal avec motif.
