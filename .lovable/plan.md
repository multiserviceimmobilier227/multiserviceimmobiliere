# Phase 4 — Portefeuille foncier

Mise en place de la gestion des lotissements, des zones, des îlots et des parcelles avec suivi des statuts et historisation.

## Objectifs
- Gestion structurée du foncier : Lotissement > Zone > Îlot > Parcelle.
- Cycle de vie complet des parcelles (Disponible, Réservée, Vendue, etc.).
- Historisation automatique de chaque changement de statut.
- Support des documents (plans, pièces jointes) par lotissement.
- Visualisation en liste et en grille/plan.

## Étapes

1. **Migration SQL : Structure Foncier & Statuts**
   - [ ] Table `lotissements` (nom, localisation, plan_communal, superficie_totale).
   - [ ] Table `zones` (nom, description, lotissement_id).
   - [ ] Table `ilots` (numero, zone_id).
   - [ ] Table `plots` (parcelles) enrichie : `ilot_id`, `superficie`, `prix_m2`, `status`, `numero`.
   - [ ] Type enum `plot_status` complet : `Disponible`, `Réservée`, `Attribuée`, `En cours de paiement`, `Entièrement payée`, `Vendue`, `Bloquée`, `Annulée`.
   - [ ] Table `plot_status_history` pour la traçabilité horodatée des changements de statut.
   - [ ] Table `lotissement_attachments` pour les fichiers (plans, PDF).
   - [ ] Triggers d'audit sur toutes les nouvelles tables.

2. **Backend : Server Functions**
   - [ ] CRUD Lotissements, Zones, Îlots.
   - [ ] CRUD Parcelles avec validation de l'historisation des statuts.
   - [ ] Gestion des fichiers joints (Supabase Storage).
   - [ ] Fonctions de recherche et filtrage par statut/zone.

3. **Frontend : Interface Portefeuille Foncier**
   - [ ] Page `/immobilier/lotissements` : Liste et création des lotissements.
   - [ ] Page `/immobilier/parcelles` : Vue liste filtrable par statut et lotissement.
   - [ ] Vue "Grille/Plan" : Visualisation synthétique des parcelles d'un îlot/lotissement.
   - [ ] Détail parcelle : Historique des changements de statut et documents liés.

## Règles Métier (Phase 4)
- **Traceur de statut** : Toute modification du statut d'une parcelle doit créer une entrée dans `plot_status_history` avec l'utilisateur et le motif.
- **Identification** : Une parcelle est identifiée de manière unique par Lotissement + Îlot + Numéro.
- **Superficie** : La superficie doit être saisie en m² et est obligatoire pour le calcul du prix.
- **Audit** : Toute suppression (logique) ou modification de prix/superficie est tracée dans l'audit journal.
