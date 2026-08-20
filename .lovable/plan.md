# Plan d'Implantation Progressive - Phase 12 : Caisse, Dépenses et Flux

Pour garantir une rigueur maximale, l'implantation de la Phase 12 est divisée en 5 sous-phases indépendantes et vérifiables.

## Sous-Phase 12.1 : Infrastructure & Référentiels Dépenses
- **Objectif** : Préparer le terrain SQL et les catégories.
- **Actions** :
    - Migration SQL : Création de la table `expenses` et `expense_audit_logs`.
    - Initialisation des catégories de dépenses système (Loyer, Salaires, Carburant, etc.).
    - Mise à jour des RLS pour garantir l'isolation multi-agences.
- **Vérification** : Capacité à lire les catégories de dépenses via une Server Function.

## Sous-Phase 12.2 : Gestion de la Session de Caisse (Journal)
- **Objectif** : Contrôler l'ouverture et la fermeture des journées financières.
- **Actions** :
    - Migration SQL : Table `cash_journals`.
    - Logique : Fonctions `openCashSession` et `closeCashSession`.
    - UI : Widget d'état de caisse dans le Header/Sidebar.
- **Vérification** : Impossibilité de saisir une dépense si la caisse n'est pas ouverte.

## Sous-Phase 12.3 : Enregistrement & Justification des Dépenses
- **Objectif** : Digitaliser les sorties d'argent.
- **Actions** :
    - UI : Formulaire de saisie des dépenses avec upload de justificatif.
    - Logique : Server Function `submitExpense` avec stockage Supabase.
    - Métier : Statut "En attente" par défaut.
- **Vérification** : Apparition de la dépense dans le journal d'audit en mode brouillon.

## Sous-Phase 12.4 : Circuit de Validation & Impact Trésorerie
- **Objectif** : Activer le contrôle du PDG et le calcul des soldes.
- **Actions** :
    - Logique : `fn_calculate_theoretical_cash` (calcul dynamique Entrées - Sorties validées).
    - UI : Liste des dépenses en attente de validation pour le PDG.
    - Triggers : Verrouillage des dépenses validées.
- **Vérification** : Le solde théorique de caisse diminue uniquement après validation PDG d'une dépense.

## Sous-Phase 12.5 : Clôture, Écarts & Reporting
- **Objectif** : Finaliser la journée et analyser les flux.
- **Actions** :
    - UI : Écran de clôture avec saisie du montant physique.
    - Logique : Gestion des écarts (discrepancy) et notifications PDG automatisées.
    - Rapports : Vue "Flux de Trésorerie" (Entrées/Sorties consolidées).
- **Vérification** : Notification envoyée au PDG si écart > 5 000 FCFA à la clôture.
