# Plan de Correction : Priorité Client et Cohérence des Flux

L'objectif est de s'assurer que toute vente ou versement est impérativement lié à un client déjà créé, conformément aux principes de traçabilité MSI 2.0.

## 1. CRM & Clients
- **Nouveau Bouton "Vendre" dans le CRM** : Ajouter une action directe sur chaque ligne client et dans la fiche 360° pour initier une vente pré-remplie.
- **Lien Direct** : Faciliter la navigation du Client vers ses Ventes et vice-versa.

## 2. Tunnel de Vente (`/ventes/nouvelle`)
- **Amélioration du Sélecteur** : Utiliser une recherche textuelle pour trouver un client existant rapidement.
- **Raccourci Création** : Permettre d'ouvrir le dialogue de création client directement depuis la page de vente si le client n'existe pas encore.
- **Validation Stricte** : La logique serveur `createSaleDraft` impose déjà un `clientId` (UUID), nous allons nous assurer que l'UI ne permet aucune ambiguïté.

## 3. Flux de Paiement (`/ventes/$saleId`)
- **Affichage Client** : Renforcer la visibilité du client sur la page de détails de vente.
- **Historique** : Garantir que l'historique de paiement est rattaché à la fois à la vente et, par extension, au dossier client 360°.

## Détails Techniques
- `src/routes/_authenticated/crm/index.tsx` : Ajout du bouton "Vendre".
- `src/routes/_authenticated/ventes/nouvelle.tsx` : Intégration du `ClientFormDialog` pour création à la volée.
- `src/lib/sales.functions.ts` : Vérification que le `client_id` pointe vers un client actif.
