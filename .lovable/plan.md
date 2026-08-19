# Plan de Correction : Priorité Client et Cohérence des Flux

L'objectif est de s'assurer que toute vente ou versement est impérativement lié à un client déjà créé, conformément aux principes de traçabilité MSI 2.0.

## 1. CRM & Clients
- **Nouveau Bouton "Vendre" dans le CRM** : Ajouter une action directe sur chaque ligne client et dans la fiche 360° pour initier une vente pré-remplie.
- **Formulaire Client Rapide** : Intégrer la possibilité de créer un client "à la volée" depuis le tunnel de vente, mais avec une étape de validation/création réelle en base avant de lier la vente.

## 2. Tunnel de Vente (`/ventes/nouvelle`)
- **Renforcement du Sélecteur** : Améliorer le sélecteur de client avec une recherche plus performante.
- **Blocage Transactionnel** : Empêcher toute soumission si l'ID client est manquant ou invalide.
- **Réduction du bruit** : Ne plus permettre de saisir des noms "en texte libre" qui ne seraient pas en base.

## 3. Flux de Paiement (`/ventes/$saleId`)
- **Vérification du Lien** : S'assurer que le composant de paiement affiche clairement le nom du client lié.
- **Audit Log** : Chaque paiement enregistré doit mentionner le client dans le journal d'audit pour une traçabilité totale (Client X a payé Y FCFA pour la Vente Z).

## Détails Techniques
- Mise à jour de `src/routes/_authenticated/crm/index.tsx` pour ajouter le bouton "Initier Vente".
- Modification de `src/routes/_authenticated/ventes/nouvelle.tsx` pour simplifier le choix du client (recherche) et ajouter un raccourci "Nouveau Client".
- Ajout de gardes dans `src/lib/sales.functions.ts` pour rejeter les ventes sans `client_id` valide (déjà présent en Zod, mais à renforcer côté logique métier).
