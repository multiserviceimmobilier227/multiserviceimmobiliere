# Plan de travail : Phase 8 — Réservations

Mise en place du système de réservation temporaire des parcelles, avec gestion de la priorité, compte à rebours et libération automatique.

## 1. Extension de la Base de Données

- **Table `reservations`** : Gestion du cycle de vie des réservations.
    - `id`, `plot_id` (FK), `client_id` (FK), `created_by` (FK), `created_at`.
    - `expires_at` : Date d'expiration (J+15 par défaut).
    - `status` : `active`, `converted` (attribuée), `expired`, `cancelled`.
    - `reminder_sent_at` : Timestamp pour le suivi des rappels.
- **Mise à jour `plots`** :
    - Le statut `Réservée` doit être lié dynamiquement à l'existence d'une réservation active.
- **Audit & Sécurité** :
    - `GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;`
    - `GRANT ALL ON public.reservations TO service_role;`
    - Politiques RLS : Lecture pour tous les employés, création réservée aux Commerciaux et Secrétaires.
    - Activation de l'audit journalisé sur chaque action de réservation.

## 2. Logique Serveur (`src/lib/reservations.functions.ts`)

- `createReservation` : Crée une réservation pour 15 jours. Vérifie si la parcelle est `Disponible`.
- `cancelReservation` : Permet l'annulation manuelle (avec motif d'audit).
- `checkExpiredReservations` : Fonction (pouvant être appelée par cron) pour basculer les réservations de `active` vers `expired`.
- `convertReservationToSale` : (Logique partagée avec la Phase 9) Transforme le statut en `converted` dès la validation du premier paiement.

## 3. Interfaces Utilisateur (Frontend)

- **Composant `ReservationDialog`** : Formulaire rapide depuis la fiche parcelle ou la liste.
- **Route `/immobilier/reservations`** :
    - Tableau de bord des réservations en cours.
    - Compte à rebours visuel (ex: "Expire dans 3 jours").
    - Filtres par statut et par commercial.
- **Fiche Parcelle** :
    - Affichage du statut `Réservée` avec lien vers le client concerné.
    - Bouton "Annuler la réservation" (soumis à permission).

## 4. Automatisation et Rappels

- **Libération Automatique** : Toute parcelle avec une réservation expirée repasse immédiatement en `Disponible`.
- **Alertes** : Notification visuelle sur le tableau de bord pour les réservations expirant dans moins de 48h.

## Détails Techniques

- Fuseau horaire Niamey (UTC+1) utilisé pour tous les calculs d'expiration.
- Verrouillage transactionnel pour éviter qu'une parcelle soit réservée par deux utilisateurs simultanément.
