# 🗺️ CARTE DES ROUTES ET PAGES MSI 2.0 (TYPE-SAFE ROUTING)

Ce document détaille l'arborescence complète des routes applicatives du système MSI 2.0, leurs protections RBAC/ABAC et leurs composants associés.

---

## 1. ROUTES D'AUTHENTIFICATION & SESSIONS
- `/login` : Connexion hybride Collaborateurs (Email pro / Téléphone + Mot de passe) & Accès Acquéreurs (Téléphone + Mot de passe).
- `/logout` : Déconnexion sécurisée et révocation de session dans `msi_user_sessions`.
- `/lock` : Écran de verrouillage automatique après inactivité avec déverrouillage par code PIN/Mot de passe.

---

## 2. ROUTES DU BACK-OFFICE : LES 8 HUBS MAÎTRES & LEUR CONTEXTUALITÉ

L'ensemble des fonctionnalités est articulé autour de **8 Hubs Maîtres permanents** (au lieu d'une multitude de menus étourdissants) :

### 1. 🏠 Hub Accueil (`/dashboard`)
- `/dashboard` : Cockpit adapté au profil (DG, Responsable Agence, Commercial, etc.).
- `/notifications` : Flux des alertes et relances.

### 2. 🗺️ Hub Immobilier (`/immobilier`)
- `/immobilier` : Vue principale (Plan interactif Mapbox & Catalogue).
- `/immobilier/lotissements` & `/immobilier/lotissements/:id` : Gestion des lotissements et calques VRD.
- `/immobilier/parcelles` & `/immobilier/parcelles/:id` : Fiche parcellaire 360°, bornes GPS et état de vente.
- `/immobilier/acquisitions` : Achats fonciers bruts et frais géomètres.

### 3. 👥 Hub Clients (`/clients`)
- `/clients` : Répertoire KYC des acquéreurs et prospects.
- `/clients/:id` : Fiche client 360°, pièces justificatives et historique multi-parcelles.
- `/clients/prospects` : Répertoire CRM des prospects (`PRP-YYYY-XXXXX`) et pipeline Kanban.
- `/clients/apporteurs` : Registre des apporteurs d'affaires et démarcheurs externes (`BRK-YYYY-XXXXX`).
- `/clients/visiteurs` ou `/accueil/visiteurs` : Registre numérique d'accueil des visiteurs, motifs de visite et courriers arrivée/départ (`agency_visitor_logs`).

### 4. 📑 Hub Ventes (`/ventes` ou `/commercial`)
- `/ventes` : Pipeline commercial et suivi des opportunités.
- `/ventes/visites` : Planning et comptes-rendus des visites terrain GPS & mandataires diaspora (`VIS-YYYY-XXXXX`).
- `/ventes/reservations` : Réservations 15 jours gratuites, contrôle de quota max 5 et décomptes d'expiration.
- `/ventes/contrats` & `/ventes/contrats/:id` : Registre des contrats et avenants (création initialement en `DRAFT` pour la secrétaire).
- `/ventes/commissions` : Suivi personnel des commissions commerciales et quotes-parts de co-courtage (`COM-YYYY-XXXXX`).

### 5. 💰 Hub Finance (`/finance`)
- `/finance` : Synthèse financière du jour et indicateurs de trésorerie.
- `/finance/caisse` : Journal de caisse physique d'agence, ouvertures/clôtures et billetage obligatoire.
- `/finance/paiements` : Encaissements multi-modes et émission des reçus RCP certifiés.
- `/finance/echeanciers` : Gestion des échéanciers et impayés.
- `/finance/depenses` : Décaissements d'exploitation, bons de caisse et validation.
- `/finance/remboursements` : Résiliations, calculs de retenue 20% et échéanciers de restitution.
- `/finance/comptabilite` : Grand Livre SYSCOHADA (Cl. 1 à 8) et écritures à partie double.

### 6. 📂 Hub Documents (`/documents`)
- `/documents` : Coffre-fort numérique WORM et 9 gabarits PDF/A certifiés.
- `/documents/recus/:id` : Visualiseur de reçu sécurisé avec QR Code.
- `/documents/contrats/:id` : Générateur de contrat officiel en 11 articles.
- `/documents/emargement` : Registre d'émargement et décharges de remise physique de documents/contrats en agence (`document_handovers`).

### 7. 📊 Hub Rapports (`/rapports`)
- `/rapports` : Générateur d'états d'activité, bilans périodiques et exports Excel/PDF.

### 8. ⚙️ Hub Administration (`/administration`)
- `/administration` : Gestion des collaborateurs, agences et paramètres système.
- `/administration/roles` : Matrice des Rôles et des 18 Familles de Permissions (A à R).
- `/administration/audit` : Journal d'audit WORM inaltérable (QUI / QUOI / QUAND / AUTORISATION).

---

## 3. ROUTES ESPACE CLIENT MOBILE (PWA ACQUÉREUR)
- `/pwa/home` : Accueil acquéreur, synthèse des parcelles et statut des paiements.
- `/pwa/contrats` : Liste des contrats de l'acquéreur.
- `/pwa/contrats/:id` : Détail du contrat, échéancier personnel et historique des quittances RCP.
- `/pwa/recus/:id` : Quittance certifiée avec QR Code SHA-256 téléchargeable en PDF/A.
- `/pwa/gps/:lotId` : Boussole terrain Mapbox et guidage vers les 4 bornes géomètre.
- `/pwa/profil` : Informations KYC, modification du mot de passe et préférences de notification.
