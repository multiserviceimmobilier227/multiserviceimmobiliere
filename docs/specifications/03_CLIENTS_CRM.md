# 👥 SPÉCIFICATION 03 : RELATION CLIENT, CRM ACQUÉREURS, KYC & DIASPORA
**Inventaire Fonctionnel Détaillé des Modules 11 (Dossier Client & Multi-Acquéreur) & 12 (CRM / Prospects)**

---

## 1. 👤 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 11. GESTION DES CLIENTS & MULTI-ACQUÉREURS

Le module **11. CLIENTS** centralise le dossier unique de l'acquéreur et son portefeuille de parcelles :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 11. GESTION DES CLIENTS                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. DOSSIER CLIENT UNIQUE (MATRICULE CLT-AAAA-XXXXX)                                                                  ║
║    • Identité civile complète : Nom, prénom, date et lieu de naissance, nationalité                                  ║
║    • Coordonnées complètes : Téléphone principal, WhatsApp international (E.164), Email, Adresse physique, Ville/Pays║
║    • Informations personnelles & Situation (Profession, statut résident local ou Diaspora)                           ║
║    • Pièce d'identité certifiée : Type (CNI, Passeport, Carte Consulaire), Numéro, Date d'expiration, Scan HD         ║
║    • Indicateur de complétude KYC (`is_kyc_completed` BOOLEAN) : calcul automatique par trigger système              ║
║    • Documents & Pièces justificatives (Mandat de procuration, justificatif de domicile, statuts société)           ║
║    • Photos d'identité & Notes confidentielles                                                                      ║
║    • Historique inaltérable de l'ensemble des modifications du profil                                                ║
║                                                                                                                      ║
║ 2. REGISTRE NUMÉRIQUE D'ACCUEIL DES VISITEURS & COURRIERS (`agency_visitor_logs`)                                    ║
║    • Journal d'accueil guichet : Nom, Téléphone, Motif (Renseignement, Dépôt KYC, Retrait acte), Notes               ║
║    • Traçabilité de l'agent d'accueil (Secrétaire) et horodatage inaltérable                                         ║
║                                                                                                                      ║
║ 3. ACTIVITÉ CLIENT & VUE À 360°                                                                                      ║
║    • Réservations actives et passées (Historique des options 15 jours)                                               ║
║    • Contrats souscrits (Liste exhaustive des conventions CTR- / CONV-)                                              ║
║    • Parcelles acquises (Statut physique, géolocalisation, îlot, lotissement)                                        ║
║    • Paiements effectués (Total versé, ventilation des échéances, reçus officiels RCP- téléchargeables)              ║
║    • Échéanciers en direct (Mensualités échues, solde restant dû, retards éventuels)                                 ║
║    • Reçus & Documents certifiés stockés dans le coffre-fort numérique                                               ║
║    • Remboursements & Décharges éventuelles (DECH-)                                                                  ║
║    • Historique des notifications envoyées (WhatsApp, SMS, Email) & Journal des interactions                          ║
║                                                                                                                      ║
║ 3. 💼 GESTION DES CLIENTS MULTI-ACQUÉREURS                                                                           ║
║    Un seul dossier client consolidé peut contenir plusieurs opérations indépendantes :                              ║
║    - Acquisition A (ex: Lot 14 - Tibiri - Échéancier 20 mois)                                                        ║
║    - Acquisition B (ex: Lot 22 - Goudel - Paiement comptant soldé)                                                   ║
║    - Acquisition C (ex: Lot 08 - Dan Goulbi - En cours)                                                              ║
║    🛡️ Règle Fondamentale : Chaque acquisition reste STRICTEMENT indépendante financièrement et contractuellement.     ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🤝 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 12. CRM & GESTION DES PROSPECTS

Le module **12. CRM / PROSPECTS** pilote le pipeline commercial et la conversion des opportunités :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 12. CRM & PROSPECTS                                        ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. FICHE PROSPECT & QUALIFICATION DU BESOIN                                                                         ║
║    • Fiche Prospect : Nom, prénom, coordonnées téléphoniques, WhatsApp, Email, Ville/Pays de résidence              ║
║    • Source du prospect : Visite au siège/agence, Stand terrain, WhatsApp Business, Facebook, Recommandation        ║
║    • Demande exprimée & Critères de recherche :                                                                      ║
║      - Parcelles recherchées : Lotissements ciblés, typologie souhaitée (Standard, Angle, Bordure voie)              ║
║      - Budget prévisionnel : Montant disponible, capacité de mensualité envisagée                                    ║
║      - Superficie recherchée : 300 m², 400 m², 500 m², 1 000 m² ou plus                                             ║
║                                                                                                                      ║
║ 2. SUIVI COMMERCIAL & RELANCES                                                                                       ║
║    • Statut du prospect : Nouveau, Qualifié, Visite Terrain Programmée, En Négociation, Option Posée, Perdu, Converti║
║    • Notes commerciales datées et journal des échanges                                                              ║
║    • Planning des relances commerciales (Alertes automatiques dans le cockpit du commercial)                         ║
║    • Historique complet des interactions (Appels, messages WhatsApp échangés, visites de sites réalisées)            ║
║                                                                                                                      ║
║ 3. CONVERSION FLUIDE PROSPECT ──► CLIENT                                                                             ║
║    • Conversion en 1 clic : Transformation du prospect en fiche client officielle CLT- dès signature ou acompte     ║
║    • Conservation intégrale de l'historique commercial lors de la conversion                                         ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. 🧭 LE CYCLE DE VIE DU CLIENT MSI (DE LA PROSPECTION AU MULTI-PROPRIÉTAIRE)

Le module CRM de MSI 2.0 structure la relation client en 4 étapes fluides, avec une attention particulière portée aux spécificités de la clientèle locale et de la Diaspora nigérienne :

```text
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 1. PROSPECT QUALIFIÉ (Source : Visite terrain, WhatsApp, Recommandation)│
  │    • Fiche de contact rapide (Nom, Téléphone, Canal d'acquisition)      │
  │    • Intérêt formulé pour un ou plusieurs lotissements                 │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 2. RÉSERVATION / INTENTION FERME (Option 15 jours active)               │
  │    • Collecte du KYC de base (CNI / Passeport, Justificatif de domicile)│
  │    • Désignation éventuelle d'un Mandataire Local (pour la Diaspora)    │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 3. ACQUÉREUR CONTRACTUEL ACTIF (Matricule Unique : CLT-AAAA-XXXXX)      │
  │    • Signature du premier contrat de vente (CTR-)                       │
  │    • Ouverture du Coffre-Fort Électronique de documents légaux          │
  │    • Accès à l'Espace Client PWA & Suivi d'échéances WhatsApp          │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 4. INVESTISSEUR MULTI-CONTRATS (Portefeuille Multi-Terrains)            │
  │    • Vue 360° consolidée : Cumul des parcelles souscrites               │
  │    • Échéanciers multiples gérés sous un identifiant unique inaltérable  │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 🛡️ LE PROTOCOLE KYC (KNOW YOUR CUSTOMER) & SPÉCIFICITÉS DIASPORA

La régularité des transferts de propriété foncière exige une identification infaillible de chaque souscripteur :

```text
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                LES 3 PROFILS D'ACQUÉREURS & EXIGENCES KYC                                │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 1. 🇳🇪 ACQUÉREUR LOCAL RÉSIDENT :                                                                        │
  │    • Copie certifiée conforme de la CNI / Passeport en cours de validité.                                │
  │    • Numéro de téléphone actif (Orange, Airtel, Moov, Zamani).                                           │
  │    • Profession / Activité économique & Adresse de résidence physique.                                  │
  │                                                                                                          │
  │ 2. 🌍 ACQUÉREUR DE LA DIASPORA (Europe, Amériques, Golfe, Afrique de l'Ouest) :                         │
  │    • Passeport nigérien valide ou Titre de séjour dans le pays de résidence.                             │
  │    • Numéro WhatsApp international actif (ex: +33, +1, +971, +225...).                                   │
  │    • Désignation obligatoire d'un Mandataire Local (Nom, CNI, Téléphone, Lien de parenté)                │
  │      ou signature d'une Procuration Notariée / Consulaire légalisée.                                     │
  │                                                                                                          │
  │ 3. 🏢 PERSONNE MORALE (Entreprises, Associations, Coopératives de travailleurs) :                       │
  │    • Statuts notariés, RCCM et NIF de la société.                                                        │
  │    • Procès-verbal désignant le représentant légal habilité à signer l'acte foncier.                     │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 💼 LA GESTION DU PORTEFEUILLE MULTI-TERRAINS & COMPTE CONSOLIDÉ

Un même client physique peut détenir plusieurs contrats en parallèle (ex: 2 parcelles à Niamey-Goudel et 1 parcelle à Maradi-Tibiri) :
- **Identifiant Unique Inaltérable** : `CLT-AAAA-XXXXX` (ex: `CLT-2026-00142`). Le client ne possède qu'un seul compte d'accès.
- **Portefeuille Multi-Contrats** : Chaque parcelle fait l'objet d'un contrat `CTR-` et d'un échéancier indépendant.
- **Ventilation Précise des Paiements** : Lors d'un versement, l'acquéreur ou le caissier choisit expressément le contrat cible. En cas de virement groupé, la cascade d'imputation ventile le montant selon les instructions écrites du client.

---

## 4. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Fiche Client / Prospect CRM
export interface CustomerProfile {
  id: string;
  customer_number: string;        // Matricule unique : "CLT-2026-00142"
  agency_id: string;              // Agence créatrice / de rattachement
  assigned_sales_agent_id: string;// Commercial référent
  
  // Catégorie
  customer_type: 'LOCAL_INDIVIDUAL' | 'DIASPORA_INDIVIDUAL' | 'CORPORATE_LEGAL_ENTITY';
  status: 'PROSPECT_LEAD' | 'OPTION_HOLDER' | 'ACTIVE_BUYER' | 'FULL_OWNER_COMPLETED' | 'ARCHIVED';
  
  // Identité Civile
  first_name: string;
  last_name: string;
  gender?: 'M' | 'F';
  birth_date?: string;
  birth_place?: string;
  nationality: string;            // ex: "Nigérienne"
  id_document_type: 'NATIONAL_ID_CARD' | 'PASSPORT' | 'CONSULAR_CARD' | 'DRIVING_LICENSE';
  id_document_number: string;
  id_document_expiry_date?: string;
  id_document_scan_url?: string;
  
  // Coordonnées & Canaux
  phone_primary: string;          // Numéro principal pour alertes SMS
  phone_whatsapp: string;         // Numéro WhatsApp (avec indicatif pays)
  email?: string;
  physical_address: string;
  city: string;
  country: string;                // "Niger", "France", "USA", "Côte d'Ivoire"...
  residence_permit_scan_url?: string; // Pour la Diaspora
  
  // Mandataire Local (Si Diaspora / Représentant)
  has_local_representative: boolean;
  representative_full_name?: string;
  representative_phone?: string;
  representative_id_number?: string;
  representative_mandate_scan_url?: string;
  
  // Personne Morale (Optionnel)
  company_name?: string;
  company_rccm?: string;
  company_nif?: string;
  
  // Synthèse Financière Consolidée
  total_contracts_count: number;
  total_contracted_amount_xof: number;
  total_paid_amount_xof: number;
  total_balance_due_xof: number;
  
  // Coffre-Fort Électronique
  vault_documents_count: number;
  
  created_at: string;
  updated_at: string;
}

// Entité Document du Coffre-Fort Client
export interface CustomerVaultDocument {
  id: string;
  customer_id: string;
  contract_id?: string;           // Optionnel si lié à un contrat précis
  document_type: 'ID_CARD_SCAN' | 'PASSPORT_SCAN' | 'PROXY_MANDATE' | 'CONTRACT_CTR' | 'RECEIPT_RCP' | 'AMENDMENT_AVN' | 'SETTLEMENT_ATTS' | 'OWNERSHIP_DEED' | 'DISCHARGE_DECH';
  file_title: string;
  file_url: string;
  file_size_bytes: number;
  file_mime_type: string;
  uploaded_by_user_id: string;
  uploaded_at: string;
  is_verified_by_accountant: boolean;
}
```

---

## 6. 👥 MATRICE OFFICIELLE DES PERMISSIONS : CLIENTS & CRM (MODULES 11 & 12)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 6.1. 📋 Liste des Clients & CRM

| Action / Périmètre Client | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Voir la liste des clients** | 👁️ (Tout le réseau) | 👁️ (Tous clients) | 👁️ (Clients de base) | 👁️ (Portefeuille & CRM) | 👁️ (Clients agence) | 👁️ (Accès technique) |
| **Rechercher un client** | 👁️ (Recherche globale)| 👁️ (Recherche financière)| 👁️ (Recherche simple) | 👁️ (Recherche commerciale)| 👁️ (Recherche agence)| 👁️ (Index & logs) |
| **Créer un nouveau client** | ➕ | 🔒 | ➕ | ➕ | ➕ | ⚙️ (Si besoin) |
| **Modifier données client** | ✏️ (Tout) | 🔒 | ✏️ (Infos administratives simples) | ✏️ (Infos commerciales) | ✏️ (Clients agence) | ⚙️ (Structure) |
| **Gérer les prospects CRM** | 👁️ / ✏️ | 🔒 | 👁️ (Accueil prospects) | ➕ / ✏️ (Prospection active) | 👁️ / ✏️ (Pipeline agence) | 👁️ (Système) |
| **Consulter l'historique financier** | 👁️ (Total) | 👁️ (Complet) | 🔒 | 🔒 | 👁️ (Restreint agence) | 👁️ (Audit technique) |

---

### 6.2. 👤 Fiche Client Détaillée (Le Centre de Relation Client 360°)

La fiche client constitue le carrefour névralgique de toute la relation acquéreur et rassemble 11 sections clés :
1. **Identité** : État civil complet, photo, filiation, statut résident ou diaspora.
2. **Coordonnées** : Téléphones, format WhatsApp international certifié E.164, adresse physique.
3. **Documents** : KYC certifié, scan CNI/Passeport, procurations notariées, mandat local.
4. **Acquisitions** : Cartographie des lots attribués (actifs et passés).
5. **Contrats** : Liste exhaustive des conventions signées (CTR- / CONV-).
6. **Paiements** : Historique exhaustif de tous les versements validés (Espèces, Banque, Mobile Money).
7. **Échéanciers** : Tableaux d'amortissement actifs, mensualités échues, solde restant dû.
8. **Reçus** : Reçus officiels avec mini-bilans (RCP-) scellés avec QR Code.
9. **Notifications** : Journal chronologique des messages et relances WhatsApp / SMS transmis.
10. **Historique** : Audit trail inaltérable de chaque modification apportée au dossier client.
11. **Activité** : Journal des visites de sites, options 15j et rendez-vous d'agence.

#### Matrice des Droits d'Accès par Section de la Fiche Client :

| Section Fiche Client | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. Identité & 2. Coordonnées** | 👁️ / ✏️ | 👁️ | 👁️ / ✏️ | 👁️ / ✏️ | 👁️ / ✏️ | 👁️ (Technique) |
| **3. Documents & KYC** | 👁️ / ✅ | 👁️ / ✅ (Conformité) | 👁️ / ➕ (Upload) | 👁️ / ➕ (Upload) | 👁️ / ✅ | 👁️ / ⚙️ |
| **4. Acquisitions & 5. Contrats** | 👁️ / ✅ | 👁️ (Contrats) | 👁️ (Lecture) | 👁️ / ➕ (Préparation) | 👁️ / ✏️ | 👁️ |
| **6. Paiements & 7. Échéanciers** | 👁️ / 💰 | 👁️ / 💰 / ✅ | 🔒 (Pas de finance) | 🔒 (Pas d'encaissement) | 👁️ (Consultation agence) | 👁️ |
| **8. Reçus Officiels (RCP-)** | 👁️ / 📄 | 👁️ / 📄 / 💰 | 👁️ (Téléchargement) | 👁️ (Téléchargement) | 👁️ / 📄 | 👁️ |
| **9. Notifications & 11. Activité** | 👁️ | 👁️ (Relances) | 👁️ / ➕ | 👁️ / ➕ | 👁️ / ➕ | 👁️ |
| **10. Historique & Audit** | 👁️ (Total 9 attributs)| 👁️ (Historique financier)| 🔒 | 🔒 | 👁️ (Son agence) | 👁️ (Système) |

### 📌 Répartition Synthétique des Responsabilités sur la Fiche Client :
- **👑 PDG :** Accès complet et souverain (décisions, dérogations, arbitrages, vision 360°).
- **📊 Comptable :** Accès complet et prioritaire sur le bloc : **Contrats + Paiements + Finances + Échéanciers**.
- **🧑💼 Secrétaire :** Accès administratif (saisie état civil, pièces justificatives, suivi des tâches).
- **📣 Commercial :** Accès commercial (prospection, suivi des besoins, offres, accompagnement visites).
- **🏢 Responsable d'agence :** Accès complet sur le portefeuille des clients de son agence.
- **🛠️ Admin technique :** Accès système et maintenance sans jamais intervenir dans les décisions financières ou commerciales.

---

## 7. 🗄️ STRUCTURE DE DONNÉES SQL CRM & PROSPECTION ASSOCIÉE

Le module CRM et prospection est modélisé par 7 entités clés dans la base de données :
- `prospects` : Enregistrement de l'opportunité avec matricule `PRP-YYYY-XXXXX`, budget min/max, lotissement cible et canal source.
- `prospect_interactions` : Journal des appels, messages WhatsApp, rendez-vous et comptes-rendus avec relances programmées.
- `field_visits` : Visites guidées de terrain avec référence `VIS-YYYY-XXXXX`, géolocalisation GPS, indicateur mandataire local et compte-rendu.
- `external_brokers` : Référentiel des démarcheurs et apporteurs d'affaires tiers (`BRK-YYYY-XXXXX`) avec scan de pièce et agence de rattachement.
- `commercial_commissions` : Calcul et traçabilité inaltérable des commissions commerciales (`COM-YYYY-XXXXX`) rattachées aux contrats signés avec rétrocession co-courtage.
- `prospect_reassignments` : Journal WORM des transferts de prospects entre commerciaux avec ancien/nouvel agent, auteur et motif obligatoire.
- `commercial_objectives` : Suivi mensuel des objectifs de vente par commercial (chiffre d'affaires en FCFA, surface $m^2$, nombre de parcelles).

---

## 8. 🎯 PROTOCOLE DES 4 CAS SPÉCIFIQUES MÉTIER DU COMMERCIAL FONCIER

### 8.1. 🤝 Co-Courtage & Apporteurs d'Affaires Externes
1. **Enregistrement de l'Apporteur d'Affaires** : Chaque démarcheur ou courtier externe est enregistré avec son identifiant `BRK-YYYY-XXXXX`, sa CNI certifiée et son numéro de téléphone.
2. **Partage de Commission** : Sur la vente conclue, la table `commercial_commissions` ventile précisément le montant revenant à l'agent MSI et la part reversée à l'apporteur externe (`broker_commission_amount`).
3. **Quittance & Décharge de Commission** : Le versement d'une commission à un démarcheur externe exige l'émission d'une décharge signée avec scan de la pièce d'identité (`broker_receipt_voucher_url`).

### 8.2. ⏳ Anti-Monopolisation du Stock Fonciers (Quota d'Options 15 Jours)
1. **Quota par Commercial** : Chaque commercial dispose d'un plafond par défaut de **5 options actives simultanées** (`max_active_reservations_limit`), contrôlé par le trigger `trg_enforce_commercial_reservations_quota`.
2. **Radar d'Alerte J-2** : Dès qu'une option atteint 13 jours sans versement d'acompte, une alerte visuelle ambrée et un rappel WhatsApp en 1 clic sont déclenchés.
3. **Libération Automatique** : À l'échéance des 15 jours sans prolongation validée par le Directeur d'Agence ou le PDG, la parcelle redevient instantanément `AVAILABLE` (🟢).

### 8.3. 🔄 Réattribution Inaltérable de Portefeuille Prospects (WORM)
1. **Autorisation Stricte** : Seul le Responsable d'Agence ou le PDG peut réaffecter un prospect d'un commercial à un autre.
2. **Historique Inaltérable** : L'opération est scellée dans `prospect_reassignments` avec horodatage, identifiant de l'ancien commercial, du nouveau commercial et motif obligatoire.
3. **Protection des Droits sur Commission** : Si une vente intervient dans les 30 jours suivant une réattribution, l'historique WORM permet d'arbitrer équitablement la répartition des commissions.

### 8.4. 🌍 Clients Diaspora & Visites Terrain par Mandataire Local
1. **Fiche de Visite par Mandataire** : Lorsque le prospect réside à l'étranger (France, USA, Golfe, etc.), la visite de terrain `field_visits` consigne expressément le nom, le numéro de téléphone et le lien de parenté du mandataire physique présent sur le lotissement.
2. **Transmission Immédiate au Commanditaire** : Les coordonnées GPS des 4 bornes ($B_1..B_4$) et les photos du terrain sont exportables immédiatement en fiche PDF partageable sur WhatsApp au client à l'étranger.

### 8.5. 📶 Mode Terrain PWA Hors-Ligne (Offline Mapbox)
1. **Mise en Cache Préalable** : Avant de partir sur le terrain en zone sahélienne périurbaine à faible couverture réseau, le commercial met en cache les tuiles vectorielles et parcelles du lotissement.
2. **Guidage GPS & Prise de Notes Hors-Ligne** : La boussole GPS et le formulaire de compte-rendu fonctionnent en local via IndexedDB et se synchronisent automatiquement dès le retour en zone 3G/4G ou Wi-Fi agence.


