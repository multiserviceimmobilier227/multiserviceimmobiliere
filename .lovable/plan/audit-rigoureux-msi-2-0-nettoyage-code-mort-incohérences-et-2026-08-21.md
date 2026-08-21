# Audit rigoureux MSI 2.0 — nettoyage code mort, incohérences et dettes techniques

Audit réalisé sur le code frontend, les fonctions serveur et la base (100 migrations, 39 tables, 6 vues, 48 fonctions, 57 triggers). Résultat : le typecheck passe, mais il existe des déchets réels et des doublons dangereux en base. Voici les constats vérifiés et le plan de correction.

## A. Déchets frontend (constatés)

1. `src/components/finances/RefundManagement.tsx` contient un bloc de texte parasite (lignes ~100-120) : consignes internes et un dump JSON d'erreur (`RUNTIME_ERROR`) affichés à l'utilisateur dans l'interface Remboursements. À supprimer et remplacer par une vraie description métier.
2. `src/components/AppShell.tsx` : « hack » de navigation par onglet (commentaire ligne 95) — deux entrées de menu pointent vers `/finances` (Remboursements, Audit & Flux) et « Réservations » pointe vers `/crm`. À remplacer par de vraies routes ou des liens avec paramètre de recherche.
3. Fichier orphelin à la racine : `fix_duplicates.sql` (script ponctuel d'annulation d'une vente en dur, avec UUID codé) — à supprimer.
4. Typage : ~80 occurrences de `any` hors composants UI, concentrées dans `ventes/$saleId.tsx` (17), `sales.functions.ts` (11), `impayes.tsx` (7), `crm.functions.ts` (7). À typer via les types générés de la base.

## B. Code mort côté serveur (fonctions exportées jamais appelées)

- `auth.functions.ts` : `checkUserRole`, `assignUserRole` (assignation de rôle non câblée à l'écran Utilisateurs — soit brancher, soit supprimer).
- `finance.functions.ts` : `getFinancialFlows`, `correctExpense` (fonctionnalité « correction de dépense » développée mais sans interface).
- `pricing.functions.ts` : `upsertPriceTemplate` (modèles de prix non éditables depuis l'UI).
- `real-estate.functions.ts` : `updatePlotStatus`, `getZonesByLotissement`.
- `sales.functions.ts` : `getSaleArrearsDetails`.
- `settings.functions.ts` : `getGlobalSettings` non utilisé, et **`getAgences` existe en double** dans `settings.functions.ts` et `auth.functions.ts` — source d'incohérence.

Décision à prendre par bloc : brancher (si la fonctionnalité manque à l'usage) ou supprimer.

## C. Incohérences et doublons en base (les plus critiques)

1. **`audit_finance_corrections` : RLS désactivée et 0 policy** — table exposée à l'API. Erreur de sécurité bloquante.
2. **Triggers d'audit en double** sur `clients`, `payments`, `plots`, `sales`, `sites` : `audit_trigger` ET `audit_<table>_trigger` appellent tous deux `process_audit_log` → chaque écriture crée deux lignes d'audit (les 331 lignes d'`audit_logs` sont donc partiellement gonflées).
3. **Synchronisation de caisse en double** sur `expenses` : `tr_sync_cash_journal_balance` (fn_sync_cash_journal_balance) + `tr_sync_cash_journal_balance_exp` (fn_sync_journal_balance) → risque de double décrément du solde théorique.
4. **Statut de parcelle piloté par 3 triggers** sur `sales` (`sale_plot_status_trigger`, `tr_update_plot_status_on_sale`, `tr_sync_plot_status_integrity`) et **verrouillage de vente validée en double** (`tr_lock_validated_sale` + `tr_prevent_validated_sale_edit`). Ordre d'exécution non maîtrisé.
5. **Cohérence échéancier en double** : `check_sale_schedule_consistency` (sur payment_schedules) et `fn_check_sale_schedule_consistency` (sur sales) — à documenter ou fusionner.
6. **Fonctions orphelines** (aucun trigger ne les appelle) : `fn_notify_pdg_on_large_expense`, `fn_notify_pdg_on_cash_discrepancy`, `fn_lock_closed_cash_day`, `fn_prevent_expense_deletion`, `fn_protect_plot_status`, `fn_update_late_schedules`, `fn_notify_pdg`, `handle_plot_transfer`, `check_financial_integrity`, `fn_audit_integrity_violation`, `get_plot_effective_price`, plus **deux surcharges de `has_role`**.
7. **Vues redondantes** : `lotissement_profitability` vs `v_lotissement_profitability`, `v_commercial_performance` vs `v_commercial_performance_detailed`, `v_financial_summary` (non utilisée par le code). Le code n'utilise que les versions `v_*_detailed` / `v_lotissement_profitability`.
8. **Linter base : 64 problèmes** — 5 vues SECURITY DEFINER (erreur), 1 table sans RLS, 5 fonctions sans `search_path`, 53 fonctions SECURITY DEFINER exécutables par `anon`/`authenticated`.
9. Tables jamais alimentées et sans usage côté code à confirmer : `sale_transfers`, `contracts` vs `contract_snapshots`, `lotissement_attachments`.

## Plan d'exécution (par lots, un lot par session)

**Lot 1 — Assainissement immédiat (sans risque)**
- Nettoyer le texte parasite de `RefundManagement.tsx`, supprimer `fix_duplicates.sql`, corriger les liens de navigation du menu.

**Lot 2 — Sécurité base (prioritaire)**
- Activer RLS + policies + GRANT sur `audit_finance_corrections`.
- Fixer `search_path` sur les 5 fonctions concernées, passer les vues en `security_invoker`, révoquer `EXECUTE` à `anon` sur les fonctions internes (garder `has_role` pour `authenticated`).

**Lot 3 — Dédoublonnage des triggers**
- Supprimer les triggers d'audit doublons, unifier la synchro de caisse sur une seule fonction, consolider la chaîne « statut parcelle » en un trigger unique et ordonné, supprimer le verrou de vente redondant.
- Purger les fonctions orphelines et la surcharge `has_role` en trop.

**Lot 4 — Vues et code serveur**
- Supprimer les vues redondantes après vérification des références, supprimer ou brancher les fonctions serveur mortes, unifier `getAgences` dans un seul module.

**Lot 5 — Qualité de code**
- Remplacer les `any` par les types générés sur les 4 fichiers les plus touchés, factoriser les requêtes dupliquées.

## Détails techniques

```text
Doublons triggers à supprimer (proposition):
  clients/payments/plots/sales/sites : DROP TRIGGER audit_trigger  (garder audit_<table>_trigger)
  expenses  : garder tr_sync_cash_journal_balance_exp, DROP tr_sync_cash_journal_balance
  sales     : garder tr_sync_plot_status_integrity, DROP sale_plot_status_trigger + tr_update_plot_status_on_sale
  sales     : garder tr_lock_validated_sale, DROP tr_prevent_validated_sale_edit
```

Chaque suppression se fait par migration, avec vérification préalable des dépendances et sans perte de données historiques (aucun DROP de table, aucun DELETE de ligne).

## Vérification

- Typecheck + build après chaque lot.
- Re-passage du linter base (objectif : 0 erreur).
- Test de bout en bout : création client → vente → encaissement → contrôle qu'une seule ligne d'audit et un seul mouvement de caisse sont générés.
