# Commence pas à par par la phase A-01

&nbsp;

# Plan d'Excellence Opérationnelle et Financière (MSI 2.0)

Ce plan vise à finaliser l'architecture de confiance de MSI 2.0, en garantissant une fiabilité absolue du chiffre d'affaires, une traçabilité totale des mouvements de fonds et une intégrité métier sans faille.

## Phase A-01 — Architecture de Confiance et Audit Financier

**Objectif :** Créer le moteur d'audit qui journalise chaque changement de valeur et sécuriser les accès.

- **Journalisation Universelle** : Création de la table `audit_finance` pour tracer :
  - Montant initial, montant final, type de mouvement (paiement, remboursement, annulation, ajustement).
  - Auteur de l'action et timestamp précis.
- **RLS Financière (Sécurité)** : Verrouillage strict des tables financières (`sales`, `payment_schedules`, `refunds`, `audit_finance`) aux rôles `comptable`, `admin` et `pdg`.
- **Intégrité Backend** : Refonte des fonctions de calcul de CA dans `sales.functions.ts` et `acquisitions.functions.ts` pour utiliser des agrégations SQL robustes (traitement des `null` avec `COALESCE`).

## Phase A-02 — Moteur de Réconciliation et Annulations

**Objectif :** Gérer proprement le cycle de vie des ventes, notamment les retours en arrière.

- **Gestion des Remboursements** : Finalisation du workflow de remboursement (`refunds`) lié aux annulations de ventes.
- **Triggers Automatisés** : 
  - `fn_handle_sale_cancellation` : Libération immédiate de la parcelle, recalcul du CA prévisionnel et injection d'une trace d'audit négative.
  - `fn_audit_payment_creation` : Journalisation automatique de chaque encaissement dans le grand livre d'audit.
- **Synchronisation Temps Réel** : Garantie que le statut de la parcelle (`plots.status`) est l'image fidèle et instantanée du contrat le plus récent.

## Phase A-03 — Excellence Analytique (Dashboard PDG)

**Objectif :** Fournir une vision cristalline et indiscutable de la santé financière.

- **Vue Financière Consolidée** : Optimisation de `v_financial_summary` pour inclure :
  - **CA Contracté** : Somme des contrats actifs.
  - **Recouvrement Réel** : Somme des versements encaissés (net de remboursements).
  - **Reste à Recouvrer** : CA Contracté - Recouvrement Réel.
  - **Valeur du Stock** : Estimation financière des parcelles non vendues.
- **Interface Décisionnelle** : 
  - Intégration de graphiques de tendance (Recouvrement vs Objectifs).
  - Barre de progression du taux de recouvrement global sur le Dashboard.
  - Annotations visuelles des ajustements manuels du CA pour le PDG.

## Phase A-04 — Certification et Tests de Stress

**Objectif :** Prouver la fiabilité du système sous toutes les contraintes.

- **Batterie de Tests "Chaos"** :
  - Scénario de double paiement simultané.
  - Scénario d'annulation d'une vente déjà partiellement payée.
  - Scénario de modification de prix validée par le PDG et impact sur l'échéancier.
- **Rapport de Conformité** : Génération d'un état de santé financier automatique vérifiant que `Total Paiements = Somme Audit Finance`.

> '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
>
> -> Vérifier ajustement du CA.