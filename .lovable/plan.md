# MSI 2.0 Implementation Plan

Logiciel de gestion immobilière (ERP + PWA client) pour Multi Services Immobilière, Maradi (Niger).

## Phase 1 - Fondations, Identité Visuelle et Backend (Completed)
- [x] Activation de Lovable Cloud (Base de données, Auth, Storage)
- [x] Design System MSI (Magenta #D1127B, Anthracite, Blanc)
- [x] Navigation Back-office (Sidebar métier)
- [x] Paramètres globaux (FCFA, Timezone Niamey)

## Phase 2 - Sécurité, Rôles et Audit (Next)
- [ ] Création du schéma `user_roles` et fonction `has_role`.
- [ ] Attribution des rôles : PDG (Admin), Comptable, Secrétaire, Admin Technique.
- [ ] Table de Journal d'Audit (Audit Log) universelle et write-only.
- [ ] Déclencheurs (Triggers) pour historisation automatique.

## Phase 3 - Référentiel Immobilier
- [ ] Gestion des Sites/Cités (ex: Cité Djiralaowa).
- [ ] Inventaire des parcelles (200m², 300m², 400m²).
- [ ] États des parcelles : Disponible, Réservée, Vendue, Litige.

## Phase 4 - CRM et Gestion Client
- [ ] Fiche client complète (Pièces d'identité, coordonnées).
- [ ] Historique des interactions et documents attachés.

## Phase 5 - Ventes et Moteur Financier
- [ ] Gestion des Réservations et Contrats.
- [ ] Échéanciers de paiement personnalisables.
- [ ] Moteur d'imputation des paiements (Encaissements).
- [ ] Gestion des retards et annulations (Règle des 20% de pénalité).

## Détails Techniques
- **Stack**: TanStack Start, React 19, Tailwind v4.
- **Backend**: Lovable Cloud (PostgreSQL).
- **Sécurité**: RLS strict, Audit Log immuable.
- **Devise**: FCFA (XOF).
