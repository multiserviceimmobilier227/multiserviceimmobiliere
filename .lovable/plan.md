# Plan Phase 10 — Moteur d'échéancier MSI 2.0

L'objectif est de transformer la génération basique des mensualités en un moteur flexible et rigoureux, capable de gérer des montants variables et des durées spécifiques tout en garantissant le paiement intégral.

## 1. Extension du Modèle de Données (Backend)
- **Table `payment_schedules`** : Ajouter un champ `type` (automatique/manuel) et un champ `notes`.
- **Table `sales`** : Ajouter `first_payment_date` pour ancrer le début de l'échéancier.

## 2. Refonte du Tunnel de Vente (Frontend - Etape 3)
- **Sélecteur de durée** : Options rapides (15 mois, 20 mois) et mode "Exceptionnel" (nécessitant une note de justification).
- **Interface de saisie souple** : Remplacer le calcul unique par une liste éditable des mensualités.
  - Par défaut : Calcul égalitaire.
  - Édition : L'utilisateur peut modifier le montant du mois X, et le reste est automatiquement recalculé sur les mois suivants pour que `Somme(échéances) == Reste à payer`.
- **Validation** : Bloquer la validation du brouillon si `Somme(échéances) != Reste à payer`.

## 3. Logique de Calcul & Recalcul (`sales.functions.ts`)
- **Ancrage temporel** : Utiliser la date du premier versement effectif (ou une date choisie) comme point de départ `M0`.
- **Recalcul dynamique** :
  - Après une mutation (changement de parcelle avec différence de prix).
  - Après une révision de prix PDG.
  - Conserver les échéances déjà "Payées" et réajuster uniquement le solde sur les échéances "En attente".

## 4. Suivi & Dashboard
- **Vue détaillée par mois** : Grille `Mois | Montant Dû | Montant Payé | Reste` avec indicateur visuel de retard.
- **Garantie d'intégrité** : Un trigger SQL ou une fonction serveur pour vérifier qu'aucune modification de prix ne laisse l'échéancier dans un état incohérent.

## Détails Techniques
- Mise à jour du schéma Zod `createSaleSchema` pour inclure la liste détaillée des échéances.
- Modification de `createSaleDraft` pour insérer les échéances personnalisées.
- Nouveau composant `PaymentScheduleEditor.tsx` pour l'interface de vente.
