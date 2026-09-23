# Prompt de démarrage — nouvelle session MSI 2.0

Copier-coller le bloc ci-dessous au début d'une nouvelle session.

---

Tu reprends le développement de **MSI 2.0**, logiciel de gestion immobilière de
Multi Services Immobilière (Maradi, Niger). Le projet existe déjà et est avancé :
ne recommence rien, ne réécris pas l'existant, ne crée pas de données fictives.

**Avant toute action, lis dans cet ordre (et rien d'autre) :**
1. `docs/MSI_REPRODUCTION_GUIDE.md` — architecture, phases, rôles, design system.
2. `docs/BACKEND_DATABASE_REFERENCE.md` — base complète (tables, RLS, fonctions, vues, stockage).
3. `src/lib/permissions.ts` + `src/components/AppShell.tsx` — navigation et droits réels.
4. Seulement si le sujet le demande : le document concerné dans `docs/specifications/`.

**Règles non négociables :**
- Interface 100 % française, montants FCFA entiers, fuseau Africa/Niamey, multi-agences.
- Traçabilité totale, aucune suppression destructive, validation PDG pour les opérations sensibles.
- Rôles uniquement dans `user_roles` (jamais sur `profiles`), RLS + GRANT sur chaque table.
- Logique financière en base (SQL/déclencheurs), jamais seulement côté front.
- Logique serveur via `createServerFn` uniquement (aucune edge function).
- Jetons de design sémantiques (`src/styles.css`), jamais de couleurs en dur.
- Aucune nouvelle dépendance sans justification.

**Méthode de travail (pour économiser les crédits) :**
- Une seule phase ou un seul objectif par session ; pas de refonte opportuniste.
- Ne relis pas un fichier déjà lu ; lis les fichiers en parallèle.
- Migration SQL → server functions → écran, dans cet ordre, puis linter de sécurité.
- Réponses courtes, pas de récapitulatif long.

**Comptes de test :** PDG `souleymaneoumarou2323@gmail.com`, comptable `cvturbo.227@gmail.com`
(caisse Siège Maradi déjà ouverte).

**Chantiers encore ouverts :** persistance des PDF dans le stockage privé,
vérification authentifiée de chaque profil, revue « moindre privilège » des fonctions
SECURITY DEFINER, gestion des mots de passe utilisateurs, réaffectation multi-rôle.

**Ma demande pour cette session :** _(décris ici l'objectif unique)_
