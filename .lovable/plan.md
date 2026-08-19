# MSI 2.0 Implementation Plan

Logiciel de gestion immobilière (ERP + PWA client) pour Multi Services Immobilière, Maradi (Niger).

## Phase 1 - Fondations, Identité Visuelle et Backend (Completed)
- [x] Activation de Lovable Cloud (Base de données, Auth, Storage)
- [x] Design System MSI (Magenta #D1127B, Anthracite, Blanc)
- [x] Navigation Back-office (Sidebar métier)
- [x] Paramètres globaux (FCFA, Timezone Niamey)

## Phase 2 - Sécurité, Rôles et Audit (In Progress)
- [x] Création du schéma `user_roles` et fonction `has_role` (privée).
- [x] Table de Journal d'Audit (Audit Log) universelle et write-only.
- [x] Déclencheurs (Triggers) pour historisation automatique.
- [ ] Interface d'administration des rôles (PDG, Comptable, Secrétaire).
- [ ] Protection des routes et server functions par rôle.

## Phase 3 - Référentiel Immobilier (Schema Ready)
- [x] Gestion des Sites/Cités (Table `sites`).
- [x] Inventaire des parcelles (Table `plots`).
- [x] États des parcelles : Disponible, Réservée, Vendue, Litige.

## Phase 4 - CRM et Gestion Client (Schema Ready)
- [x] Fiche client complète (Table `clients`).
- [ ] Interface de gestion des clients.

## Phase 5 - Ventes et Moteur Financier (Schema Ready)
- [x] Gestion des Réservations et Contrats (Table `sales`).
- [x] Moteur d'imputation des paiements (Table `payments`).
- [ ] Échéanciers de paiement et relances.
- [ ] Gestion des retards et annulations.

## Détails Techniques
- **Stack**: TanStack Start, React 19, Tailwind v4.
- **Backend**: Lovable Cloud (PostgreSQL).
- **Sécurité**: RLS strict, Audit Log immuable.
- **Devise**: FCFA (XOF).
