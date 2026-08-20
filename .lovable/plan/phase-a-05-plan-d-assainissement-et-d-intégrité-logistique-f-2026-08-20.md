# Phase A-05 — Plan d'Assainissement et d'Intégrité Logistique (Finalisation)

Ce plan finalise le verrouillage du système et assure une transparence totale sur l'état des stocks et des ventes.

## Phase A-05.2 — Renforcement du Verrouillage (Backend)
- **Journalisation des Violations d'Intégrité** : Modifier `createSaleDraft` pour insérer une entrée `CRITICAL_INTEGRITY_VIOLATION` dans `audit_logs` en cas de tentative de double vente ou de sélection d'une parcelle inexistante.
- **Validation SQL Hardened** : Ajouter une contrainte CHECK ou un trigger supplémentaire pour s'assurer que `plot_id` dans `sales` pointe toujours vers une parcelle existante dans `plots`.

## Phase A-05.3 — Interface de Confiance et Alertes (Frontend)
- **Alerte de Cohérence Globale** : Afficher un bandeau rouge sur le Dashboard si le nombre de ventes actives est incohérent avec le stock réel.
- **Journal d'Intégrité pour Administrateurs** : Créer une vue dans le Dashboard listant les alertes d'intégrité récentes.
- **Protection UI** : Désactiver le bouton de validation dans le tunnel de vente si la parcelle n'est plus disponible (polling temps réel).

## Phase A-05.4 — Certification : Page d'Inventaire et Rapports
- **Route `/admin/inventaire`** : Créer une page dédiée à l'inventaire listant chaque parcelle réelle, son statut actuel, et le client associé.
- **Rapport de Certification** : Bouton permettant de voir l'historique complet d'une parcelle (Audit Trail) pour prouver l'unicité de la vente.
- **Indicateurs de Performance MSI 2.0** : Ajout de métriques sur la vitesse de rotation des stocks et le taux d'occupation.

## Spécifications Techniques
- **Audit Logs** : Nouveau type d'action `INTEGRITY_ALERT`.
- **Dashboard** : Utilisation de `stats.activeSalesCount` vs `stats.totalRealPlots`.
- **Navigation** : Ajout de l'item "Inventaire & Stock" dans la sidebar.
