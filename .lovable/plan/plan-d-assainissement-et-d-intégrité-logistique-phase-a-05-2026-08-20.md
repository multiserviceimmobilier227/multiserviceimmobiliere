# Plan d'Assainissement et d'Intégrité Logistique (Phase A-05)

Ce plan vise à corriger les incohérences de l'inventaire et des ventes, et à verrouiller le système pour empêcher toute vente de parcelles inexistantes ou de doublons, conformément à la rigueur d'un logiciel professionnel.

## Phase A-05.1 — Nettoyage et Assainissement de la Base
**Objectif :** Aligner la réalité logicielle avec la réalité physique (2 parcelles réelles).

- **Audit des Ventes Fantômes** : Identification des ventes (002 et 004) qui ne correspondent pas à des parcelles physiques réelles selon le signalement de l'utilisateur.
- **Remédiation Immédiate** :
  - Annulation des ventes sur les parcelles 002 et 004 si elles sont confirmées comme inexistantes.
  - Suppression des parcelles fictives du catalogue pour ne laisser que les parcelles réellement disponibles ou vendues.
- **Réinitialisation du CA** : Recalcul automatique du Chiffre d'Affaires après suppression des parcelles et ventes fictives.

## Phase A-05.2 — Verrouillage de la Logique Métier
**Objectif :** Empêcher techniquement la reproduction de ces erreurs.

- **Contrainte d'Unicité Stricte** : Renforcement de l'index `idx_single_active_sale_per_plot` pour garantir qu'une parcelle ne peut avoir qu'une seule vente active à la fois.
- **Validation de l'Existence** : Ajout d'une vérification systématique dans `createSaleDraft` pour s'assurer que la parcelle existe physiquement et n'est pas "Bloquée".
- **Protection des Statuts** : Automatisation du passage de la parcelle à "Vendue" ou "Attribuée" dès la première signature, avec interdiction de modification manuelle du statut tant qu'une vente est active.

## Phase A-05.3 — Interface de Confiance (Feedback Utilisateur)
**Objectif :** Rendre l'état du stock et des ventes indiscutable.

- **Dashboard d'Inventaire** : Ajout d'une vue "État Réel du Stock" montrant clairement le nombre total de parcelles créées vs parcelles vendues.
- **Alertes de Cohérence** : Mise en place d'un indicateur visuel si le nombre de ventes dépasse le nombre de parcelles disponibles.
- **Journal d'Intégrité** : Journalisation de toute tentative de double vente ou de création de parcelle suspecte dans `audit_logs`.

## Phase A-05.4 — Certification et Validation
**Objectif :** Prouver la solidité du système par des tests de stress.

- **Tests de Concurrence** : Simulation de 10 tentatives de vente simultanées sur la même parcelle pour vérifier le blocage.
- **Rapport de Stock** : Génération d'un document PDF/État listant chaque parcelle avec son historique de vente unique.
