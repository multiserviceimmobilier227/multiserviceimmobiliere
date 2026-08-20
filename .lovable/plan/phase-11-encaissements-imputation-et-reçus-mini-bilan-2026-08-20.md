# Phase 11 — Encaissements, Imputation et Reçus « Mini-Bilan »

Cette phase déploie le cœur financier de MSI 2.0, garantissant une traçabilité totale des flux de trésorerie et une imputation rigoureuse sur les échéanciers.

## Objectifs
- Saisie sécurisée des paiements (PDG/Comptable).
- Imputation intelligente (Retards > Courant > Anticipé).
- Génération de reçus officiels avec état financier instantané (Mini-Bilan).
- Zéro suppression, traçabilité par corrections historisées.

## Sous-phases d'exécution

### 11.1 — Socle de Trésorerie & Audit Ledger
- **Caisse Quotidienne** : Création de la table `daily_cash_operations` pour le suivi des flux physiques.
- **Journal d'Audit Financier** : Extension du trigger d'audit pour capturer les métadonnées de paiement (moyen, référence, auteur).
- **Permissions** : Restriction de la validation des paiements au PDG et au Comptable.

### 11.2 — Moteur d'Imputation Cascade (FIFO)
- **Logique d'Imputation** : Développement d'une fonction SQL `fn_impute_payment_on_schedule` :
    1. Apurement des reliquats de retards (plus anciens d'abord).
    2. Affectation à la mensualité du mois courant.
    3. Gestion des paiements excédentaires (anticipation sur les mois futurs ou solde créditeur).
- **Notifications** : Déclenchement d'une notification PDG pour chaque encaissement saisi par la comptabilité.

### 11.3 — UI d'Encaissement & Validation
- **Interface de Saisie** : Formulaire dynamique avec sélection du moyen de paiement et calculatrice d'imputation en temps réel.
- **Workflow de Confirmation** : Double validation optionnelle ou notification immédiate au PDG en cas d'absence.
- **Historisation des Corrections** : Système de "Annule et Remplace" pour les erreurs de saisie (aucune suppression).

### 11.4 — Reçu « Mini-Bilan » & Exportation
- **Composant ReceiptGenerator** : Génération de PDF/Web-view format ticket ou A5.
- **Contenu du Reçu** :
    - Détail du versement actuel.
    - Cumul payé à date vs Prix total du contrat.
    - Reste à payer (Solde).
    - État de l'échéancier (Mois à jour, mois en retard).
    - Espace signature et cachet.

## Spécifications Techniques

### Schéma Base de Données
- `public.payments` : Ajout de `imputed_data` (JSONB) pour tracer exactement quelle partie du montant a payé quelle échéance.
- `public.payment_corrections` : Table de liaison pour documenter les motifs de modification.

### Règles Métier
- **Retards prioritaires** : Impossible de payer le mois M+1 si le mois M est en retard.
- **Excédents** : Configurable entre "Réduction des mensualités futures" ou "Réduction de la durée du contrat".

## Critères de Validation (Exigence MSI)
- [ ] Chaque encaissement est lié à un `client_id` et un `sale_id` valides.
- [ ] Le solde de la vente est décrémenté atomiquement à l'insertion du paiement.
- [ ] Le reçu affiche la situation financière exacte après le paiement.
- [ ] Toute correction de montant génère une ligne d'audit "CORRECTION_FINANCIERE".
