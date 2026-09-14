# 🗺️ MSI 2.0 — CARTOGRAPHIE EXHAUSTIVE PAGE PAR PAGE PAR PROFIL

Ce document constitue la **spécification d'architecture des interfaces utilisateur (Étape 4)**. Il définit pour chaque profil l'arborescence complète et le cheminement opérationnel réel :
$$\text{Connexion} \longrightarrow \text{Dashboard} \longrightarrow \text{Menu} \longrightarrow \text{Sous-menu} \longrightarrow \text{Page} \longrightarrow \text{Sous-page} \longrightarrow \text{Action} \longrightarrow \text{Modale / Formulaire} \longrightarrow \text{Résultat / Traçabilité}$$

---

## 🧭 INDEX DES PROFILS CARTOGRAPHIÉS

1. [👑 Profil 1 : PDG (Direction Générale & Visas Souverains)](#-profil-1--pdg-direction-générale--visas-souverains)
2. [📊 Profil 2 : COMPTABLE (Finance, Caisse, SYSCOHADA & Recouvrement)](#-profil-2--comptable-finance-caisse-syscohada--recouvrement)
3. [🧑💼 Profil 3 : SECRÉTAIRE (Accueil, Dossiers KYC & Opérations Administratives)](#-profil-3--secrétaire-accueil-dossiers-kyc--opérations-administratives)
4. [📣 Profil 4 : COMMERCIAL (Prospection, Pipeline CRM, Portefeuille & Réservations)](#-profil-4--commercial-prospection-pipeline-crm-portefeuille--réservations)
5. [🏢 Profil 5 : RESPONSABLE D'AGENCE (Supervision Locale, Stock & Caisse Agence)](#-profil-5--responsable-dagence-supervision-locale-stock--caisse-agence)
6. [🛠️ Profil 6 : INFORMATICIEN / ADMIN TECHNIQUE (Infrastructure & Sécurité Système)](#-profil-6--informaticien--admin-technique-infrastructure--sécurité-système)
7. [👤 Profil 7 : CLIENT ACQUÉREUR (PWA Mobile Autonome & Passwordless)](#-profil-7--client-acquéreur-pwa-mobile-autonome--passwordless)

---

## 👑 PROFIL 1 : PDG (DIRECTION GÉNÉRALE & VISAS SOUVERAINS)

### 📌 Synthèse du Profil
- **Rôle :** Autorité décisionnelle suprême, supervision consolidée nationale multi-agences.
- **Pouvoirs Exclusifs :** Fixation des prix m², remises dérogatoires, signature souveraine des contrats (`CTR-`), arbitrage des annulations/retenues, validation des dépenses exceptionnelles.
- **Règle Cardinal :** Même le PDG est tracé inaltérablement dans le grand livre d'audit (`msi_master_audit_logs`).

```text
👑 PDG — ARBORESCENCE DE NAVIGATION COMPLÈTE
│
├── 🔑 AUTHENTIFICATION
│   └── Connexion MFA (Email professionnel + Mot de passe fort + Code OTP Authenticator)
│
├── 🏠 DASHBOARD EXÉCUTIF (Cockpit National Consolidé)
│   ├── KPI Trésorerie en direct (Disponibilités Banques + Caisses toutes agences)
│   ├── KPI Patrimoine Foncier (Stock parcelles : Disponibles, Réservées, Vendues, Litiges)
│   ├── KPI Commercial (Chiffre d'affaires engagé vs Encaissé vs Restant dû national)
│   ├── 🚨 Centre des Visas & Décisions en Attente (Badge rouge clignotant)
│   └── 🔴 Radar des Risques (Dépassements caisse, contentieux, retards critiques > 60j)
│
├── 🏢 ORGANISATION & RÉSEAU NATIONAL
│   ├── 🌐 Vue Consolidée Multi-Agences (Niamey Siège, Maradi, Zinder, Tahoua, etc.)
│   ├── 🏢 Fiche Agence (Performance financière, encaissements, stock attribué)
│   └── ➕ Créer / Modifier une Agence
│       └── [Modale] Définition code, adresse, responsable, comptes bancaires rattachés
│
├── 👥 CLIENTS & CRM (Vision Réseau 360°)
│   ├── 📋 Répertoire Global Clients (Recherche multicritère instantanée)
│   └── 👤 Fiche Client 360°
│       ├── Onglet Identité & KYC (Vérification pièces légalisées)
│       ├── Onglet Dossiers & Contrats (Historique multi-contrats de l'acquéreur)
│       ├── Onglet État Financier (Cumul versé, échéanciers en cours, solde global)
│       ├── Onglet Coffre-Fort (Téléchargement contrats signés, reçus `RCP-`, attestations)
│       └── Onglet Journal d'Audit (Historique chronologique des interactions)
│
├── 🗺️ PATRIMOINE FONCIER & LOTISSEMENTS
│   ├── 📑 Liste des Lotissements & Acquisitions Foncieres
│   ├── ➕ Nouveau Lotissement (Import plan de masse SIG, coordonnées GPS, parcellisation)
│   ├── 🗺️ Matrice / Plan Interactif des Parcelles (Grille dynamique SVG/Leaflet)
│   └── 📍 Fiche Parcelle (Détails superficie, coût de revient, statut, historique)
│       ├── [Action Souveraine] Bloquer / Mettre en Réserve Litige
│       └── [Action Souveraine] Débloquer / Remettre en Vente
│
├── 🏷️ PRIX, OFFRES & DÉROGATIONS TARIFAIRES (Zone Exclusivité PDG)
│   ├── 💲 Grille Tarifaire Officielle (Prix catalogue / m² par lotissement)
│   │   └── [Action Souveraine] Modifier le prix de référence au m²
│   ├── 🎁 Packs & Campagnes Promotionnelles (Création remises temporaires, pack diaspora)
│   └── ⚖️ File des Demandes de Dérogations (Soumises par les commerciaux/agences)
│       ├── [Modale Arbitrage] Consultation motif + simulateur d'impact sur la marge
│       ├── [Bouton Action] 🟢 Accorder la remise spéciale (Signature électronique)
│       └── [Bouton Action] 🔴 Rejeter avec motif motivé obligatoire
│
├── 🤝 CONTRATS & ENGAGEMENTS JURIDIQUES
│   ├── 📋 Registre National des Contrats (`CTR-`)
│   ├── 🚨 File des Contrats en Attente de Signature Souveraine
│   │   └── [Écran d'Examen] Visualisation des 3 pages du contrat + contrôle acompte 30%
│   │       ├── [Action Souveraine] 🟢 Signer & Apposer le Sceau Numérique (QR Code)
│   │       └── [Action] ↩️ Renvoyer en correction au service commercial/comptable
│   ├── 📜 Gestion des Avenants (`AVN-`) (Changement de lot, réaménagement financier)
│   └── 📄 Génération des Actes Officiels (Attestation de solde `ATTS-`, Cession `TRF-`)
│
├── 🔄 ANNULATIONS & CONTENTIEUX (Zone Décisionnelle Critique)
│   ├── 📋 Registre des Dossiers en Procédure de Résiliation
│   └── ⚖️ Fiche d'Arbitrage d'Annulation
│       ├── Synthèse financière (Total versé, durée de détention, motif résiliation)
│       ├── [Choix Taux de Retenue] 20% Standard (Règle contractuelle) OU Dérogation PDG (0% à 19%)
│       ├── [Bouton Décision] 🟢 Valider la Résiliation Définitive
│       │   └── ⚡ Déclenchements automatiques :
│       │       ├── Contrat classé `ANNULÉ`
│       │       ├── Parcelle libérée instantanément en `DISPONIBLE` (🟢)
│       │       ├── Échéancier de remboursement `RMB-` créé pour la comptabilité
│       │       └── PV de Décharge `DECH-` généré pour signature légalisée
│       └── [Bouton Décision] 🔴 Rejeter la demande d'annulation
│
├── 🏦 TRÉSORERIE, CAISSES & FINANCES
│   ├── 📊 Cockpit Trésorerie Nationale (Soldes consolidés Banques + Caisses)
│   ├── 🏦 Suivi des Sessions de Caisse des Agences (Alertes écarts et clôtures)
│   ├── 💸 Validation des Dépenses Lourdes (Dépenses $> 50\,000\text{ FCFA}$)
│   │   └── [Modale Approbation] Examen facture proforma + Visa PDG
│   └── 💰 Validation des Plans de Remboursement Acquéreurs
│
├── 📚 SUPERVISION COMPTABILITÉ SYSCOHADA
│   ├── 📊 Bilan Consolidé & Compte de Résultat Prévisionnel
│   ├── 📈 Balance Générale & Grand Livre
│   └── 📑 Rentabilité Analytique par Lotissement (Coûts d'acquisition vs Ventes encaissées)
│
└── 📜 GRAND LIVRE D'AUDIT SOUVERAIN (Gouvernance & Conformité)
    ├── 🔍 Journal d'Audit Global Inaltérable (9 attributs obligatoires)
    └── 📥 Export Sécurisé des Logs d'Audit (Scellé cryptographique pour CAC / Commissaire aux comptes)
```

---

## 📊 PROFIL 2 : COMPTABLE (FINANCE, CAISSE, SYSCOHADA & RECOUVREMENT)

### 📌 Synthèse du Profil
- **Rôle :** Maître d'œuvre de la chaîne financière, gestion des encaissements, caisse physique, dépenses, lettrage, états SYSCOHADA et suivi des recouvrements.
- **Interdictions :** 🔒 Ne peut pas modifier unilatéralement le prix d'un contrat, ni effacer une transaction (`ZERO DELETE`).

```text
📊 COMPTABLE — ARBORESCENCE DE NAVIGATION COMPLÈTE
│
├── 🔑 AUTHENTIFICATION (Email ou Téléphone + Mot de passe fort)
│
├── 🏠 1. DASHBOARD FINANCIER & COCKPIT COMPTABLE (`/dashboard` ou `/comptabilite/dashboard`)
│   ├── 📊 KPI Trésorerie Consolidée : Solde Banque Global + Solde Caisse Ouverte
│   ├── 📈 KPI Encaissements du Jour & du Mois (Ventilation Espèces, Virement, Mobile Money)
│   ├── 🚨 Radar des Échéances Impayées & Retards de Paiement (Filtres J+15, J+30, J+60)
│   ├── ⏳ File d'attente « Versements & Virements à Pointer / Valider » (`PENDING_APPROVAL`)
│   ├── ⚠️ Alerte « Pièces Justificatives Manquantes » sur Dépenses d'Exploitation
│   └── ⚡ Raccourcis Comptoir : Nouvel Encaissement, Clôture Caisse, Saisie Dépense, Grand Livre
│
├── 💵 2. GESTION DES ENCAISSEMENTS & QUITTANCES WORM (`/paiements` ou `/comptabilite/paiements`)
│   ├── ➕ Formulaire d'Encaissement Multi-Canal (Espèces, Virement, Chèque, Nita, Al-Izza, Airtel)
│   │   ├── 🔍 Sélection Acquéreur & Contrat Actif (Rapprochement immédiat du solde restant dû)
│   │   ├── 🔢 Saisie Montant Brut, Mode, N° Bordereau / Transaction & Frais Opérateur (`fee_amount`)
│   │   └── ⛓️ Moteur d'Imputation Séquentielle Automatique FIFO (Apurement des échéances les plus anciennes)
│   ├── 📑 Registre Inaltérable des Paiements Scellés (`PAY-YYYY-XXXXX`)
│   │   ├── 🖨️ Émission & Impression de la Quittance Fiscale WORM (`RCP-YYYY-XXXXX` avec Hash SHA-256)
│   │   ├── 🖨️ Gestion des Duplicatas Certifiés (`DUPLICATA N°X` avec motif obligatoire & audit log)
│   │   └── 🚫 Gestion des Rejets de Chèque / Virement (`BOUNCED_REJECTED` avec rétablissement des impayés)
│   └── ↩️ Module d'Extourne / Contre-passation d'Erreur (`payment_reversals` / `REV-YYYY-XXXXX`)
│       ├── ✍️ Formulaire de demande d'extourne (Motif circonstancié $\ge 20$ car. + Visa PDG obligatoire)
│       └── 🔒 Génération automatique de l'écriture inverse d'annulation (Zéro DELETE)
│
├── 🏦 3. CAISSE PHYSIQUE D'AGENCE & GESTION DES ESPÈCES (`/caisse` ou `/tresorerie/caisse`)
│   ├── 🟢 Session Quotidienne de Caisse (Ouverture avec fond de caisse initial & verrouillage d'unicité)
│   ├── 📜 Journal des Mouvements d'Espèces Temps Réel (`cash_movements` : Entrées Reçus, Sorties Dépenses/Remb.)
│   ├── 🪙 Clôture Journalière & Grille de Billetage Physique (`cash_session_denominations`)
│   │   ├── 🔢 Saisie des Coupures : Billets (10 000, 5 000, 2 000, 1 000, 500) + Total Pièces
│   │   ├── ⚖️ Comparaison Automatique : Solde Physique Compté vs Solde Théorique du Système
│   │   └── 📝 Formulaire Obligatoire de PV d'Écart de Caisse en cas de différence ($\ge 10$ car.)
│   └── 🏦 Module de Versement d'Espèces vers la Banque (`bank_deposits` / `DEP-BQ-YYYY-XXXXX`)
│       ├── 📤 Saisie du transfert de fonds Caisse ($5711$) ➔ Banque ($5211$) via compte de virement ($5850$)
│       └── 📎 Dépôt obligatoire du scan du bordereau bancaire tamponné (`deposit_slip_url`)
│
├── 💸 4. DÉPENSES D'EXPLOITATION & BONS DE DÉCAISSEMENT (`/depenses` ou `/comptabilite/depenses`)
│   ├── ➕ Formulaire d'Enregistrement de Dépense (`EXP-YYYY-XXXXX`)
│   │   ├── 🏷️ Catégorisation Analytique (Lotissement/Projet, Travaux VRD, Géomètre, Carburant, Loyer)
│   │   ├── 📎 Zone de Téléversement Obligatoire de la Facture / Reçu Normalisé (`receipt_voucher_url`)
│   │   └── 🛡️ Circuit d'Approbation Hiérarchique (Validation directe $\le 50\,000$ F / Visa PDG $> 50\,000$ F)
│   └── ⏱️ Gestion des Avances sur Frais & Régularisation Différée (`is_advance = true`)
│       ├── 👤 Enregistrement du bénéficiaire de l'avance (Missions géomètres, équipes terrain)
│       └── 🔄 Clôture d'avance : Justification par factures réelles + Restitution du reliquat en caisse
│
├── 💰 5. EXÉCUTION DES REMBOURSEMENTS ACQUÉREURS (`/remboursements` ou `/ventes/remboursements`)
│   ├── 📋 Vue du Plan d'Apurement des Résiliations Validées par le PDG (Après déduction de la retenue légale)
│   ├── 🔍 Contrôle Préalable du PV de Décharge Signé & Légalisé (`discharge_document_url`)
│   └── 💵 Exécution du Décaissement par Tranche (Espèces au guichet avec reçu ou Chèque/Virement bancaire)
│
├── 📚 6. COMPTABILITÉ GÉNÉRALE & SYSCOHADA RÉVISÉ (`/comptabilite/general` ou `/comptabilite/syscohada`)
│   ├── 📖 Plan Comptable Foncier Paramétré (Classes 1 à 8 : Clients $4111$, Caisses $5711$, Banques $5211$, Ventes $7011$)
│   ├── 📑 Saisie des Écritures & Journaux Auxiliaires en Partie Double (Journaux VT, CA, BQ, OD)
│   │   ├── ⚖️ Contrôle Strict d'Équilibre Débit = Crédit à chaque enregistrement de pièce
│   │   └── 🔏 Immutabilité WORM des Écritures Comptables validées
│   ├── 📊 Grand Livre Général & Balance à 6 Colonnes (Filtrage par compte, période, lotissement analytique)
│   ├── ⏱️ Rapprochement Bancaire & Lettrage des Comptes (`bank_reconciliations` & `bank_statements`)
│   │   ├── 📥 Import / Saisie des Relevés Bancaires Mensuels (BOA, Sonibank, Ecobank, BIA)
│   │   └── 🔗 Lettrage des Quittances et Dépôts vs Lignes de Relevé (Calcul automatique de l'état de concordance)
│   └── 🔒 Clôture Périodique & Verrouillage d'Exercice (`accounting_periods`)
│       └── 🛑 Verrouillage irréversible interdisant toute modification rétroactive sur un mois clôturé
│
└── 📈 7. ÉTATS FINANCIERS & EXPORTS FISCAUX (`/comptabilite/rapports`)
    ├── 📥 Export Grand Livre & Journaux normalisés (Formats Excel/CSV, Sage, Odoo)
    ├── 📊 Balance Âgée & Rapport de Recouvrement des Créances Clients
    └── 📑 États Récapitulatifs de TVA et Taxes Foncières pour les déclarations fiscales
```

---

## 👩💼 PROFIL 3 : SECRÉTAIRE (ACCUEIL, DOSSIERS KYC & OPÉRATIONS ADMINISTRATIVES)

### 📌 Synthèse du Profil
- **Rôle :** Premier point de contact, accueil physique et téléphonique, création des fiches clients de base, numérisation des pièces KYC, impression de quittances remises en main propre, suivi des tâches administratives.
- **Interdictions Absolues :** 🔒 **AUCUNE ÉCRITURE FINANCIÈRE, AUCUN ENCAISSEMENT DIRECT, AUCUNE MODIFICATION DE PRIX.**

```text
👩💼 SECRÉTAIRE — ARBORESCENCE DE NAVIGATION COMPLÈTE
│
├── 🔑 AUTHENTIFICATION (Email ou Téléphone + Mot de passe fort)
│
├── 🏠 DASHBOARD ACCUEIL & TÂCHES ADMINISTRATIVES
│   ├── 📋 Calendrier des Rendez-vous & Visites du Jour
│   ├── 🚨 Dossiers Clients Incomplets (Indicateur dynamique `is_kyc_completed`, badges pièces manquantes)
│   ├── 🔔 Alertes Opérationnelles (Demandes d'informations, courriers en attente)
│   └── ⚡ Raccourcis : Nouveau Visiteur, Fiche KYC, Vérifier Disponibilités, Poser Option 15j
│
├── 👥 GESTION DES CLIENTS & REGISTRE D'ACCUEIL (Module Principal Accueil)
│   ├── 📋 Registre Numérique des Visiteurs & Courriers (`agency_visitor_logs`)
│   │   └── [Formulaire Accueil] Nom Visiteur, Téléphone, Objet de Visite (Renseignement, Dépôt, Retrait), Notes
│   ├── 📋 Annuaire des Clients & Fiches KYC
│   ├── ➕ Enregistrer un Nouveau Client (Création dossier KYC sans self-service)
│   │   └── [Formulaire Fiche KYC]
│   │       ├── Civilité, Nom, Prénom, Téléphone principal (WhatsApp), Email
│   │       ├── Nationalité, N° Pièce d'identité (CNI, Passeport), Date de validité
│   │       ├── Adresse, Profession, Personne à contacter en cas d'urgence
│   │       ├── 📎 Upload des Scans : CNI recto/verso + Photo d'identité (Calcul auto `is_kyc_completed`)
│   │       └── [Bouton] 💾 Enregistrer le Dossier Client
│   └── 👤 Fiche Client (Consultation administrative & KYC)
│       ├── [Action] 📎 Mettre à jour / Uploader une pièce KYC manquante
│       └── [Action] 🖨️ Imprimer une Quittance ou Document déjà validé pour remise au client
│
├── 🗺️ CONSULTATION DU FONCIER (Lecture Seule)
│   ├── 🗺️ Plan Interactif des Lotissements (Vérification des parcelles libres pour renseigner les visiteurs)
│   └── 📍 Fiche Parcelle (Consultation caractéristiques, surface, plan de situation)
│
├── 📅 GESTION DES OPTIONS & RÉSERVATIONS 15 JOURS (Opérations de Base)
│   ├── 📋 Liste des Réservations en Cours
│   └── ➕ Enregistrer une Demande de Réservation 15j
│       └── [Formulaire] Client + Parcelle + Pièce d'identité (Transmission au commercial/responsable)
│
├── 🤝 CONTRATS & CONVENTIONS (Préparation Administrative)
│   ├── 📋 Liste des Contrats (Lecture seule agence)
│   ├── ➕ Préparer un Dossier de Contrat (Statut verrouillé à `DRAFT` par trigger système)
│   │   └── [Action] 📤 Soumettre le dossier complet pour validation hiérarchique
│   └── 🖨️ Impression du Contrat Final Validé par le PDG
│
├── 🔄 DEMANDES D'ANNULATION (Prise en Charge Guichet)
│   └── ➕ Enregistrer une Demande de Résiliation Déposée par un Client
│       └── [Formulaire] Saisie motif écrit déposé par le client + Scan de la lettre manuscrite
│           └── [Action] 📤 Transmettre à la Direction / Comptabilité pour instruction
│
└── 📁 COFFRE-FORT, COURRIER & DÉCHARGES PHYSIQUES
    ├── 📑 Répertoire des Modèles de Lettres & Documents types
    ├── 📥 Registre des Courriers Arrivée / Départ
    └── ✍️ Décharge de Remise Physique de Document (`document_handovers` WORM)
        └── [Formulaire Émargement] Nom du récupérateur, CNI, Téléphone, Signature numérique/manuscrite
```

---

## 📣 PROFIL 4 : COMMERCIAL (PROSPECTION, PIPELINE CRM, PORTEFEUILLE & RÉSERVATIONS)

### 📌 Synthèse du Profil
- **Rôle :** Chasse, prospection, développement du portefeuille, gestion du pipeline des ventes, poses d'options 15 jours, visites terrain, préparation des dossiers de vente.
- **Interdictions Absolues :** 🔒 **PAS D'ENCAISSEMENT DIRECT (Les fonds vont à la Caisse/Banque), PAS DE REMISE SANS ACCORD DU PDG.**

```text
👔 COMMERCIAL — ARBORESCENCE DE NAVIGATION COMPLÈTE
│
├── 🔑 AUTHENTIFICATION (Téléphone ou Email + Mot de passe fort)
│
├── 🏠 1. COCKPIT COMMERCIAL & DASHBOARD DES VENTES (`/commercial` ou `/dashboard`)
│   ├── 🎯 Objectifs du Mois vs Réalisé (Chiffre d'affaires en FCFA, surface en m², nombre de lots)
│   ├── 📊 Pipeline CRM en Temps Réel (Prospects chauds, En négociation, Réservations actives)
│   ├── ⏱️ Radar des Options 15 Jours (Alertes J-2 avant libération automatique de la parcelle)
│   ├── 📅 Planning des Visites Terrain & Rendez-vous du jour
│   ├── 💰 Estimation du Portefeuille de Commissions (`commercial_commissions` : En attente / Validées)
│   └── ⚡ Raccourcis Rapides : Nouveau Prospect, Poser Option 15j, Plan SIG Mapbox, Simuler Échéancier
│
├── 👥 2. CRM PIPELINE, PROSPECTS & PORTEFEUILLE (`/commercial/prospects`)
│   ├── ➕ Formulaire d'Acquisition Prospect (`prospects` / `PRP-YYYY-XXXXX`)
│   │   ├── 📝 Nom, Prénom, Téléphone principal, WhatsApp international (E.164), Email, Ville/Pays
│   │   ├── 📢 Canal d'Acquisition (Visite spontanée, WhatsApp, Facebook, Stand terrain, Recommandation)
│   │   ├── 🎯 Critères de Recherche (Lotissement cible, Typologie, Superficie souhaitée 300 à 1000 m²)
│   │   └── 💵 Capacité Financière (Budget global envisagé, mensualité supportable)
│   ├── 📊 Vue Pipeline Kanban des Opportunités (Drag & Drop : Nouveau ➔ Qualifié ➔ Visite ➔ Négociation ➔ Option ➔ Converti)
│   ├── 👤 Fiche Prospect 360° & Journal des Échanges (`prospect_interactions`)
│   │   ├── 📞 Journalisation des interactions (Appel, WhatsApp, Rendez-vous physique, Note mémo)
│   │   ├── ⏰ Programmation d'une relance avec rappel automatique dans le cockpit
│   │   └── 🔄 Bouton 1-Clic : « Convertir en Client Acquéreur Officiel » (`CLT-YYYY-XXXXX`)
│   └── 📋 Annuaire de son Portefeuille Clients Actifs
│
├── 🗺️ 3. CATALOGUE FONCIER SIG MAPBOX & SIMULATEUR (`/commercial/parcelles`)
│   ├── 🗺️ Carte SIG Mapbox Interactive Plein Écran
│   │   ├── 🎨 Statuts dynamiques parcellaires (Vert = Libre, Jaune = Option 15j, Bleu = Vendu, Rouge = Bloqué)
│   │   ├── 🔍 Filtres instantanés (Par lotissement, îlot, budget max, superficie, parcelles d'angle)
│   │   └── 📍 Clic sur Parcelle : Volet latéral avec coordonnées des 4 bornes (B1..B4), prix et statut
│   ├── 🧮 Simulateur d'Échéancier en Temps Réel (Aide à la Vente)
│   │   ├── 🔢 Saisie de l'acompte initial (Ex: 30%, 40%, 50%)
│   │   ├── ⏱️ Sélection de la durée (Comptant, 3, 6, 12, 15, 20 ou 24 mois)
│   │   └── 📋 Génération instantanée du tableau prévisionnel des mensualités
│   └── 📄 Génération de la Fiche Offre Commerciale (Export PDF prêt à partager sur WhatsApp au prospect)
│
├── 🚗 4. VISITES GUIDÉES TERRAIN & ÉTATS DES LIEUX (`/commercial/visites`)
│   ├── 📅 Planning des Visites Guidées de Sites (`field_visits` / `VIS-YYYY-XXXXX`)
│   ├── 🧭 Mode Boussole & Guidage GPS Terrain
│   │   ├── 📍 Localisation temps réel du commercial sur le lotissement via GPS
│   │   └── 📏 Calcul de la distance restante en mètres jusqu'aux bornes de la parcelle
│   └── 📝 Saisie du Compte-Rendu de Visite (Validation de l'intérêt, objections formulées, suite à donner)
│
├── 📅 5. GESTION DES OPTIONS & RÉSERVATIONS 15 JOURS (`/commercial/reservations`)
│   ├── 📋 Registre de ses Réservations Actives (`reservations` / `RES-YYYY-XXXXX`)
│   ├── ➕ Poser une Option 15 Jours sur une Parcelle Libre
│   │   ├── 🔒 Verrouillage instantané de la parcelle au statut RESERVED
│   │   ├── ⏱️ Déclenchement automatique du chronomètre WORM de 15 jours
│   │   └── 📱 Envoi automatique du SMS / WhatsApp de confirmation d'option au client
│   ├── 🚨 Radar d'Expiration & Relance
│   │   ├── 🟡 Alerte J-2 avant libération automatique du lot
│   │   └── 📲 Bouton de relance WhatsApp préformatée en 1 clic
│   └── 🔄 Action : « Transformer la Réservation en Dossier de Vente »
│
├── 🤝 6. MONTAGE DES DOSSIERS DE VENTE & COMMISSIONS (`/commercial/ventes`)
│   ├── ➕ Assistant de Montage de Contrat de Vente (En 4 étapes guidées)
│   │   ├── 1️⃣ Étape 1 : Sélection / Création de la fiche Acquéreur & Pièces KYC
│   │   ├── 2️⃣ Étape 2 : Sélection de la Parcelle & Application des offres commerciales
│   │   ├── 3️⃣ Étape 3 : Définition des Modalités (Acompte convenu, durée, mensualités)
│   │   └── 4️⃣ Étape 4 : Soumission du dossier (Statut initial PENDING_APPROVAL vers la Direction)
│   ├── 🏷️ Module de Demande de Dérogation Commerciale (`contract_discounts`)
│   │   └── 📝 Formulaire de Demande de Remise soumise à l'arbitrage souverain du PDG
│   └── 💰 Suivi Personnel des Commissions (`commercial_commissions` / `COM-YYYY-XXXXX`)
│       ├── 📜 Tableau récapitulatif des commissions acquises par contrat validé
│       └── 📊 Statut du versement (En attente visa, Validée par la DAF, Versée)
│
└── 📁 7. OUTILS & SUPPORTS D'AIDE À LA VENTE (`/commercial/documents`)
    ├── 📑 Bibliothèque des Dépliants & Fiches Techniques PDF des lotissements
    └── 📈 Rapport Personnel d'Activité (Taux de conversion, total surfaces vendues en m²)
```

---

## 🏢 PROFIL 5 : RESPONSABLE D'AGENCE (SUPERVISION LOCALE, STOCK & CAISSE AGENCE)

### 📌 Synthèse du Profil
- **Rôle :** Pilote opérationnel d'une agence régionale (Maradi, Zinder, Niamey Ouest, etc.), supervision de l'équipe commerciale et administrative locale, suivi du stock parcellaire de son périmètre, contrôle de la caisse agence.
- **Périmètre Strict :** 🏢 Limité exclusivement aux données et collaborateurs de son agence (`AGENCE_ID`).

```text
🏢 RESPONSABLE D'AGENCE — ARBORESCENCE DE NAVIGATION COMPLÈTE
│
├── 🔑 AUTHENTIFICATION (Email + Mot de passe + OTP)
│
├── 🏠 DASHBOARD DE SUPERVISION AGENCE
│   ├── KPI Agence (Chiffre d'affaires agence, réservations actives, parcelles disponibles)
│   ├── 👥 Performance de l'Équipe Commerciale Locale (Classement des ventes par commercial)
│   ├── 🏦 État de la Caisse Agence en Direct (Solde actuel, statut Ouverte/Fermée)
│   └── 🚨 Alertes Locales (Options expirant dans l'agence, retards de paiement de l'agence)
│
├── 👥 GESTION DES CLIENTS DE L'AGENCE
│   ├── 📋 Répertoire des Clients Rattachés à l'Agence
│   └── 👤 Fiche Client Agence (Supervision globale, suivi des paiements locaux)
│
├── 🗺️ STOCK PARCELLAIRE DE L'AGENCE
│   ├── 🗺️ Plan Interactif des Lotissements Rattachés à l'Agence
│   ├── 📍 Fiche Parcelle (Gestion locale, affectation d'options)
│   └── ➕ Proposer une Nouvelle Parcelle / Lotissement Local (Transmission au Siège)
│
├── 📅 SUPERVISION DES RÉSERVATIONS AGENCE
│   ├── 📋 Vue Consolidée des Options de tous les commerciaux de l'agence
│   └── ⏱️ Suivi des Délais & Arbitrage Local des Prolongations (selon délégation)
│
├── 🤝 DOSSIERS DE VENTES & CONTRATS AGENCE
│   ├── 📋 Registre des Contrats de l'Agence
│   ├── 🔍 Vérification & Visa Préalable Responsable d'Agence
│   │   └── [Action] 📤 Transmettre avec avis favorable au Siège pour signature PDG
│   └── 📄 Génération des Documents & Remise Officielle des Actes aux Clients
│
├── 🏦 CAISSE & DÉPENSES DE L'AGENCE (Si caisse agence autonome)
│   ├── 👁️ Supervision de la Session de Caisse Quotidienne de l'Agence
│   ├── ➕ Enregistrer une Dépense d'Agence (Dans la limite du budget local alloué)
│   └── ✅ Visa & Validation du PV de Billetage Journalier de l'Agence
│
├── 🔄 ANNULATIONS LOCALES (Instruction Agence)
│   └── 📋 Dossiers d'Annulation de l'Agence (Préparation de l'avis motivé pour le PDG)
│
└── 📊 RAPPORTS D'ACTIVITÉ AGENCE
    ├── 📑 Rapport Hebdomadaire / Mensuel d'Agence (Export pour la Direction Générale)
    └── 📜 Journal d'Activité Interne de l'Agence
```

---

## 🛠️ PROFIL 6 : INFORMATICIEN / ADMIN TECHNIQUE (INFRASTRUCTURE & SÉCURITÉ SYSTÈME)

### 📌 Synthèse du Profil
- **Rôle :** Gardien technique de l'infrastructure, gestion des comptes utilisateurs, attribution dynamique des rôles et des périmètres, supervision des sauvegardes, monitoring et sécurité.
- **Règle Fondamentale :** ❌ **L'ADMIN TECHNIQUE N'EST PAS LE PATRON MÉTIER. ACCÈS TOTALEMENT INTERDIT SUR LES ÉCRITURES FINANCIÈRES ET COMMERCES SANS TRABILITÉ.**

```text
🛠️ ADMIN TECHNIQUE — ARBORESCENCE DE NAVIGATION COMPLÈTE
│
├── 🔑 AUTHENTIFICATION ULTRA-SÉCURISÉE (MFA Matériel / FIDO2 + OTP)
│
├── 🏠 DASHBOARD D'ADMINISTRATION SYSTÈME & SANTÉ INFRASTRUCTURE
│   ├── 🖥️ Métriques Serveur & DB (Temps de réponse, charge CPU/RAM, connexions actives)
│   ├── 👥 Utilisateurs Connectés en Temps Réel (Sessions actives, IP, terminaux)
│   ├── 🚨 Alertes Sécurité (Échecs de connexion répétés, anomalies d'accès)
│   └── 🔌 Statut des Passerelles Externes (WhatsApp Business API, SMS Gateway, Cloud Storage)
│
├── 👥 GESTION DES UTILISATEURS DU SYSTÈME
│   ├── 📋 Annuaire des Utilisateurs (PDG, Comptables, Secrétaires, Commerciaux, Responsables)
│   ├── ➕ Créer un Nouvel Utilisateur
│   │   └── [Formulaire Administrateur]
│   │       ├── Identité, Email professionnel, Numéro de téléphone
│   │       ├── Affectation du Rôle Principal
│   │       ├── Définition du Périmètre d'Accès (`GLOBAL`, `AGENCE`, `MULTI_AGENCES`)
│   │       └── [Action] ✉️ Générer le lien d'activation sécurisé avec réinitialisation de mot de passe
│   ├── ✏️ Modifier / Révoquer des Accès
│   │   ├── [Action] 🔒 Bloquer / Désactiver un Compte Utilisateur
│   │   └── [Action] 🔄 Forcer la Réinitialisation MFA / Déconnecter toutes les sessions
│   └── 📜 Historique des Connexions & Authentifications
│
├── 🛡️ RÔLES, PERMISSIONS & MATRICE DYNAMIQUE (Zone RBAC)
│   ├── 📋 Liste des Profils & Rôles Système
│   ├── ➕ Créer un Rôle Personnalisé (ex: *Auditeur Externe*, *Assistant Commercial*)
│   └── ⚙️ Matrice de Configuration des 18 Familles de Permissions (A à R)
│       └── [Interface de Cochage Granulaire]
│           └── Pour chaque famille : Activer `VIEW`, `CREATE`, `EDIT`, `SUBMIT`, `VALIDATE`, `EXPORT`
│
├── ⚙️ PARAMÈTRES GÉNÉRAUX & CONFIGURATION MÉTIER
│   ├── 🏢 Paramètres Entreprise (Coordonnées, NIF, RCCM, logos officiels)
│   ├── 📄 Gestionnaire des Modèles de Documents (Éditeur de templates HTML/PDF pour contrats et reçus)
│   ├── 📱 Configuration des Passerelles de Notification (WhatsApp API, SMS Gateway Twilio/Orange)
│   └── 🔢 Séquences & Formats de Numérotation (`CTR-`, `RCP-`, `RES-`, `RMB-`, `CLT-`)
│
├── 💾 SAUVEGARDES, INTÉGRITÉ & RESTAURATION
│   ├── 📦 État des Sauvegardes Automatiques Quotidiennes (PostgreSQL / Supabase)
│   ├── 🔄 Test de Restauration à Froid (Procédure de PRA / PCA)
│   └── 🔒 Scellement Cryptographique des Snapshots DB
│
└── 📜 GRAND LIVRE D'AUDIT TECHNIQUE (Inaltérable)
    ├── 🔍 Journal Complet des Événements Système (`msi_master_audit_logs`)
    │   └── Filtrage avancé : Par utilisateur, par IP, par module, par niveau de sévérité
    └── 🔒 Contrôle d'Intégrité de la Chaîne HMAC (Vérification anti-altération des logs)
```

---

## 👤 PROFIL 7 : CLIENT ACQUÉREUR (PWA MOBILE AUTONOME & PASSWORDLESS)

### 📌 Synthèse du Profil
- **Rôle :** Acquéreur de parcelles chez MSI.
- **Accès :** Application mobile PWA indépendante du back-office, authentification simplifiée sans mot de passe par **code OTP WhatsApp / SMS**.
- **Périmètre :** 🔒 **Accès strictement restreint à ses propres parcelles, contrats, reçus et échéanciers.**

```text
👤 CLIENT ACQUÉREUR — ARBORESCENCE DE LA PWA MOBILE
│
├── 🔑 AUTHENTIFICATION SANS MOT DE PASSE (Passwordless OTP)
│   ├── Écran 1 : Saisie du Numéro de Téléphone Officiel
│   ├── Écran 2 : Réception & Saisie du Code Temporaire à 6 Chiffres (Reçu par WhatsApp / SMS)
│   └── Connexion instantanée avec mémorisation sécurisée de session
│
├── 🏠 1. ACCUEIL (Tableau de Bord Personnel)
│   ├── 🌟 Carte de Bienvenue & Statut Global Acquéreur
│   ├── 📊 Jauge de Progression Globale (% Financier total payé sur l'ensemble de ses parcelles)
│   ├── 💰 Synthèse Financière : Total Acheté | Total Versé | Reste à Payer
│   ├── 🚨 Prochaine Échéance Due (Montant, date limite, bouton payer)
│   └── ⚡ Raccourcis Rapides : Télécharger Reçus, Contacter mon Commercial, Localiser mes Lots
│
├── 🗺️ 2. MES ACQUISITIONS & PARCELLES
│   ├── 📋 Liste de mes Lots Souscrits (Ex: *Lot N°412 - Cité des Palmiers, Maradi*)
│   └── 📍 Fiche Détaillée de la Parcelle
│       ├── Superficie ($m^2$), Numéro d'îlot, Numéro de parcelle
│       ├── Plan de situation & Plan de masse du lotissement
│       └── 🧭 Bouton Guidage GPS vers les 4 Bornes Géomètre ($B_1, B_2, B_3, B_4$)
│
├── 🤝 3. MES CONTRATS & ACTES JURIDIQUES
│   ├── 📋 Liste de mes Contrats de Vente Validés (`CTR-`)
│   └── 📄 Visualisation & Téléchargement PDF avec QR Code d'Authenticité
│
├── 📅 4. MES ÉCHÉANCIERS & PLANS DE PAIEMENT
│   ├── 📊 Calendrier Dynamique des Mensualités par Contrat
│   └── 📋 Tableau d'Amortissement Interactif
│       ├── Pastille Verte (🟢) : Mensualité Réglée (avec N° Reçu rattaché)
│       ├── Pastille Bleue (🔵) : Mensualité Courante
│       └── Pastille Grise (⚪) : Mensualités Futures
│
├── 💳 5. MES PAIEMENTS & DÉCLARATION
│   ├── 📋 Historique Certifié de tous mes Versements Réalisés
│   └── ➕ Déclarer un Nouveau Virement / Paiement Mobile Money
│       └── [Formulaire Mobile Déclaration]
│           ├── Choix du contrat rattaché
│           ├── Montant déclaré + Mode (Virement bancaire, Nita, Al Izza, Airtel Money)
│           ├── Référence de la transaction
│           ├── 📸 Photo / Capture d'écran du bordereau de versement
│           └── [Bouton] 📤 Envoyer pour validation comptable
│
├── 🧾 6. MES REÇUS OFFICIELS (Quittances Numériques `RCP-`)
│   ├── 📋 Galerie de toutes mes Quittances Officielles
│   └── 📥 Téléchargement Immédiat du Reçu Officiel PDF Sécurisé
│
├── 📁 7. MON COFFRE-FORT NUMÉRIQUE
│   ├── 📜 Attestations Officielles de Solde (`ATTS-`)
│   ├── 📑 Copies de mes Actes de Cession / Transfert de Propriété
│   └── 🪪 Mes Pièces d'Identité Enregistrées (KYC)
│
├── 💰 8. MES REMBOURSEMENTS (Uniquement si contrat résilié)
│   └── 📊 Suivi Transparent du Calendrier de Remboursement et des Tranches Versées
│
├── 🔔 9. NOTIFICATIONS & HISTORIQUE
│   └── 📋 Historique des Rappels d'Échéances et Confirmations d'Encaissement
│
└── 📞 10. CONTACT & SUPPORT MSI
    ├── 👤 Fiche de mon Commercial Référent (Photo, Nom, Téléphone direct)
    ├── 💬 Bouton Chat WhatsApp Direct avec le Support MSI Siège
    └── 🏢 Coordonnées & Itinéraire vers l'Agence de Rattachement
```

---

## 🎯 MATRICE DES ACTIONS & MODALES ASSOCIÉES

Cette table synthétise pour le futur codage (Phases 7, 8, 9) l'ensemble des **modales, formulaires et feedbacks d'état** indispensables à implémenter :

| Profil | Écran Déclencheur | Action / Bouton | Type d'Élément UI | Données Saisies / Affichées | Feedback / Résultat Système |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **👑 PDG** | Grille des prix | Modifier prix m² | Modale confirmation | Nouveau prix, date d'effet, motif | Modification actée + Log souverain |
| **👑 PDG** | File des remises | Arbitrer remise | Modale décisionnelle | Taux remise accordé, simulateur marge | Visa apposé + Notification commercial |
| **👑 PDG** | File contrats | Signer contrat | Écran de signature | Signature électronique + Code OTP | Contrat scellé `SIGNE_PDG` + QR Code |
| **👑 PDG** | File annulations | Valider résiliation | Modale résiliation | Choix retenue (20% ou dérog), motif | Contrat annulé + Parcelle libérée |
| **📊 Comptable** | Paiements | Nouveau paiement | Formulaire cascade | Montant, mode, contrat, bordereau | Échéances soldées + Reçu `RCP-` émis |
| **📊 Comptable** | Caisse | Clôture de caisse | Formulaire billetage | Décompte billets et pièces | Caisse verrouillée + PV écart si $\neq 0$ |
| **📊 Comptable** | Dépenses | Saisir dépense | Formulaire dépense | Montant, compte SYSCOHADA, scan | Dépense enregistrée + Écriture au journal |
| **🧑💼 Secrétaire**| Clients | Nouveau client | Formulaire KYC | Identité, contact, upload CNI/Photo | Dossier client créé + Code `CLT-` |
| **🧑💼 Secrétaire**| Accueil | Imprimer quittance| Modale impression | Sélection reçu client | PDF officiel généré pour impression |
| **📣 Commercial**| Parcelle | Poser option 15j | Modale réservation | Client, lot, pièce identité | Chronomètre 15j lancé + SMS client |
| **📣 Commercial**| Contrat | Monter dossier | Assistant 4 étapes | Client, lot, acompte $\ge 30\%$, durée | Dossier transmis pour visa |
| **🏢 Resp. Agence**| Agence | Clôture caisse agence| Modale visa local | Contrôle billetage caissier | Visa agence apposé + Envoi Siège |
| **🛠️ Admin Tech** | Utilisateurs | Créer compte | Formulaire création | Rôle, agence, email, permissions | Lien d'activation généré |
| **👤 Client PWA** | Paiements | Déclarer paiement | Formulaire mobile | Montant, réf transaction, photo | Envoi pour validation au comptable |
