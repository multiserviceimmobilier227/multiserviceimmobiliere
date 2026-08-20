# MSI 2.0 — Phase 10 : Moteur d'échéancier dynamique

Cette phase constitue le cœur de la flexibilité financière de MSI. Elle permet de gérer des échéanciers non linéaires tout en garantissant l'intégrité du solde final.

## 1. Objectifs de la Phase 10
- **Flexibilité totale** : Permettre des montants variables par mois (ex: 100k les 6 premiers mois, puis 50k).
- **Intégrité financière** : Garantir que `somme(échéances) == (Prix Total - Apport)`.
- **Réactivité** : Recalcul automatique des mensualités restantes lors d'une modification de prix ou de durée.
- **Traceur de retard** : Identification immédiate des retards par rapport à la `due_date`.

## 2. Architecture Technique

### A. Base de Données (PostgreSQL)
- **Table `payment_schedules`** :
    - `sale_id` (FK)
    - `due_date` (Date d'échéance)
    - `amount_due` (Montant attendu)
    - `amount_paid` (Montant réellement encaissé - mis à jour par Phase 11)
    - `status` (Enum: `En attente`, `Partiel`, `Payé`, `Retard`)
    - `schedule_type` (Enum: `automatique`, `manuel`)
- **Trigger `tr_check_sale_schedule_consistency`** :
    - Vérifie avant chaque commit sur une vente que le total de l'échéancier correspond au solde dû.
    - Empêche la validation PDG si l'échéancier n'est pas équilibré.

### B. Moteur de Calcul (Backend - `sales.functions.ts`)
- **`generateStandardSchedule`** : Crée 15 ou 20 mensualités égales à partir de la `first_payment_date`.
- **`recalculateRemainingSchedules`** : 
    - Appelé lors d'un changement de prix ou d'une mutation.
    - Prend le `nouveau_solde_dû`, soustrait ce qui est déjà `Payé`, et répartit le reste sur les échéances `En attente`.
- **`processPaymentImputation`** :
    - Logique FIFO (First-In, First-Out) : un versement de 150k pour une échéance de 100k solde la première et applique les 50k restants à la suivante.

### C. Interface Utilisateur (Frontend - `PaymentScheduleEditor.tsx`)
- **Mode Auto/Manuel** : Basculement fluide entre génération égale et édition ligne par ligne.
- **Ajustement en cascade** : Modifier la mensualité M1 recalcule automatiquement M2...Mn pour garder l'équilibre.
- **Visualisation des écarts** : Badge d'alerte rouge si le total est incorrect.

## 3. Scénarios de Test Exigeants
1. **Écart de centimes** : Vérifier que la dernière mensualité absorbe les arrondis de division.
2. **Paiement excédentaire** : Un client paie 3 mois d'avance ; vérifier que 3 échéances passent en "Payé".
3. **Modification de prix en cours de route** : Le PDG baisse le prix de 500k alors qu'il reste 10 mois ; les 10 mensualités doivent baisser de 50k chacune.
4. **Retard critique** : Vérifier que le statut passe en `Retard` dès que `current_date > due_date` et `amount_paid < amount_due`.

## 4. Livrables de la Phase 10
- Moteur de génération dynamique.
- Trigger de cohérence financière.
- Interface d'édition avec protection contre les déséquilibres.
- API de recalcul pour les mutations.
