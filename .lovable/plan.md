# Plan de Travail - Phase 13 : Retards et Relances

Cette phase vise à automatiser la détection des impayés et à structurer le processus de recouvrement sans pénalités automatiques, conformément aux directives de la direction.

## Sous-phase 13.1 : Moteur de Calcul et Data Pipeline
**Objectif** : Identifier en temps réel les retards sans altérer les données financières.
- **Backend (SQL)** :
    - Création d'une vue `v_sale_arrears` calculant pour chaque vente : montant attendu à date, montant encaissé, retard total, et date de la plus ancienne échéance impayée.
    - Ajout d'un champ `last_reminder_sent_at` dans `payment_schedules` pour éviter les doublons de relances.
- **Logique Métier** :
    - Fonction `calculateArrears(saleId)` pour obtenir un instantané précis du retard.
    - Définition du "Retard Critique" : `current_date - oldest_unpaid_due_date > 60 days`.

## Sous-phase 13.2 : Système de Notifications Multi-Niveaux
**Objectif** : Alerter aux moments clés (J-7, J-2, J, Post-échéance).
- **Automatisations (Triggers/Cron)** :
    - Notifications internes pour les agents de recouvrement à J-7.
    - Alerte système "Avertissement Fort" pour le client sur son interface/dossier à partir de J+1.
    - **Alerte PDG** : Déclenchement automatique d'une notification prioritaire pour tout retard critique (> 2 mois).
- **Interface Notifications** : Intégration dans le `NotificationCenter` existant avec filtres par gravité.

## Sous-phase 13.3 : Tableau de Bord des Impayés (CRM & Finance)
**Objectif** : Offrir une visibilité totale sur les créances.
- **UI (Frontend)** :
    - Nouvelle route `/finances/impayes` listant les clients en retard.
    - Indicateurs visuels : Orange (Retard simple), Rouge Clignotant (Retard critique).
    - Filtres par agence, par lotissement et par durée de retard.
- **Export** : Génération de listes de relance pour les agents terrain.

## Sous-phase 13.4 : Vue 360° Client & "Avertissement Fort"
**Objectif** : Marquer visuellement le dossier client en cas de défaut.
- **UI CRM** :
    - Bannière d'alerte en haut du profil client si un retard critique est détecté.
    - Historique des relances effectuées (date, mode, agent).
- **Actions PDG** : Bouton d'action directe depuis l'alerte pour convoquer le client ou suspendre temporairement le contrat.

## Détails Techniques & Sécurité
- **Multi-profils** : 
    - Les agents voient les retards de leur agence.
    - Le PDG voit la consolidation globale et les alertes critiques.
- **Intégrité** : Le calcul de retard est basé sur `payment_schedules` croisé avec `daily_cash_operations` pour une fiabilité à 100%.
- **Absence de Pénalités** : Aucune fonction SQL ne doit modifier le `amount_due` des échéances de manière automatique.
