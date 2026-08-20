# Plan de Finalisation - Phase 12 : Caisse, Dépenses et Flux Financiers

Ce plan finalise les aspects critiques de la gestion financière, notamment l'intégrité des documents, le contrôle PDG et la gestion des écarts de caisse.

## 1. Infrastructure Database (Migrations SQL)
- Création de la table `daily_cash_adjustments` pour tracer les corrections d'écarts de caisse.
- Ajout de colonnes de commentaires de validation dans la table `expenses`.
- Configuration du bucket storage `justificatifs_depenses` avec RLS.
- `GRANT` des accès aux tables pour les rôles `authenticated` et `service_role`.

## 2. Upload de Justificatifs & Liaison Projets
- Mise à jour de `ExpenseForm.tsx` pour inclure un vrai sélecteur de fichiers et le bouton d'upload Supabase Storage.
- Liaison dynamique des dépenses aux projets (lotissements) via une recherche par nom/agence.

## 3. Validation PDG avec Commentaires & Journalisation
- Extension de `validateExpense` dans `finance.functions.ts` pour accepter un commentaire de validation.
- Mise à jour de `validations.tsx` pour permettre la saisie d'une raison lors du rejet ou de l'approbation.
- Intégration de l'historique d'audit (corrections précédentes) directement dans la vue PDG.

## 4. Flux de Traitement des Écarts de Caisse
- Refonte de `closeCashSession` pour gérer les écarts significatifs (> 5000 FCFA) nécessitant une justification.
- Interface de saisie d'ajustement dans `CashJournalStatus.tsx` lors de la clôture.
- Notification automatique du PDG en cas d'écart non justifié.

## Détails techniques

```text
Tables impactées:
- expenses (ajout status_notes text)
- cash_journals (triggers d'ajustement)
- daily_cash_adjustments (nouvelle table)

Composants:
- ExpenseForm (upload logic)
- ExpenseValidations (feedback PDG)
- CashJournalStatus (flow clôture)
```

## Vérification
- Test d'upload de justificatif (image/pdf).
- Test de validation PDG avec commentaire.
- Test de clôture de caisse avec écart et vérification du journal d'audit.
