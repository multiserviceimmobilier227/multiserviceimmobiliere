# 🏢 SPÉCIFICATION 02 : ORGANISATION MSI, GESTION D'ENTREPRISE & MULTI-AGENCES
**Architecture Territoriale, Paramètres Institutionnels, Cloisonnement & Multi-Tenant Territorial**

---

## 1. 🏛️ INVENTAIRE FONCTIONNEL DÉTAILLÉ : 01. ORGANISATION MSI

Le module **01. ORGANISATION MSI** gère l'ensemble de la structure institutionnelle, légale, bancaire et territoriale de l'entreprise :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                 INVENTAIRE FONCTIONNEL DU MODULE 01. ORGANISATION MSI                                 ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. GESTION DE L'ENTREPRISE & IDENTITÉ INSTITUTIONNELLE                                                               ║
║    • Informations Générales MSI : Dénomination (« AGENCE IMMOBILIERE MULTI-SERVICES » SARL), Sigle (MSI / AIMS)     ║
║    • Identité Visuelle : Logo officiel haute définition, favicon, filigranes pour documents PDF et espace client     ║
║    • Coordonnées Complètes :                                                                                         ║
║      - Adresse physique du Siège : Maradi, Quartier Ali Dan Sofo                                                    ║
║      - Téléphones officiels du Siège & des services (Standard, Recouvrement, Direction)                              ║
║      - Numéro WhatsApp Business officiel pour notifications & service client                                         ║
║      - Emails institutionnels (direction@, comptabilite@, contact@)                                                  ║
║    • Informations Légales & Statutaires :                                                                            ║
║      - Forme juridique : Société à Responsabilité Limitée (SARL)                                                     ║
║      - Numéro RCCM : NE/MAR/2023/B/502 du 12/07/2023 (Tribunal de Commerce de Maradi)                                 ║
║      - Direction Générale : Monsieur Abdoul Aziz SALISSOU ADARE (Nationalité Nigérienne)                             ║
║      - Capital Social & Déclaration d'Existence                                                                      ║
║    • Informations Fiscales :                                                                                         ║
║      - Numéro d'Identification Fiscale (NIF)                                                                         ║
║      - Régime d'imposition & Centre des Impôts de rattachement (DGI Maradi)                                          ║
║    • Informations Bancaires Officielles :                                                                            ║
║      - Comptes bancaires de l'entreprise (ex: BOA Niger, SONIBANK, BIA Niger, Banque Atlantique)                     ║
║      - Relevés d'Identité Bancaire (RIB) & Codes IBAN / BIC                                                          ║
║      - Comptes Mobile Money institutionnels (Airtel Money Business, Moov Money, Al Izza, Nita)                       ║
║    • Paramètres Généraux du Système :                                                                                ║
║      - Devise principale du système : Francs CFA (XOF / FCFA)                                                        ║
║      - Formats de documents & Gabarits d'impression (A4 portrait/paysage, marges normées)                             ║
║      - Moteur de numérotation séquentielle des documents (DEV-, RES-, CTR-, CONV-, RCP-, AVN-, RMB-, DECH-)          ║
║      - Paramètres globaux de notifications (Templates WhatsApp API, Passerelle SMS, Horaires d'envoi 08h-19h)       ║
║                                                                                                                      ║
║ 2. GESTION DES AGENCES & POINTS DE VENTE                                                                             ║
║    • Créer une agence : Attribution d'un code unique (AGC-MARADI-01, AGC-NIAMEY-01), type d'agence                   ║
║    • Modifier une agence : Mise à jour des coordonnées, adresses, localisation GPS                                   ║
║    • Activer / Désactiver une agence : Suspension temporaire avec préservation inaltérable de l'historique           ║
║    • Fiche complète de l'agence :                                                                                    ║
║      - Responsable d'agence désigné (Directeur d'Agence)                                                             ║
║      - Personnel affecté (Commerciaux, Caissiers, Secrétaires, Géomètres affectés)                                   ║
║      - Parcelles & Lotissements rattachés à l'agence                                                                 ║
║      - Portefeuille clients rattaché à l'agence                                                                      ║
║      - Caisses physiques de l'agence (soldes en temps réel, sessions d'ouverture/fermeture)                          ║
║      - Journal d'activité en direct de l'agence                                                                      ║
║      - Indicateurs de performance de l'agence (Ventes, Encaissements, Taux de recouvrement, Objectifs)               ║
║                                                                                                                      ║
║ 3. MULTI-AGENCES & PILOTAGE CONSOLIDÉ                                                                                ║
║    • Vue globale MSI : Consolidation nationale en temps réel pour le PDG et la DAF                                   ║
║    • Vue par agence : Cockpit opérationnel dédié à chaque agence régionale                                           ║
║    • Comparaison des agences : Palmarès des ventes, classements de performance, taux d'impayés comparés             ║
║    • Filtrage instantané par agence sur toutes les listes (Clients, Contrats, Lots, Caisses, Dépenses)               ║
║    • Transfert / Affectation contrôlée de dossiers clients ou de parcelles entre agences (Visa Direction)            ║
║    • Rapports consolidés : Bilan financier global, État du stock national, Balance comptable générale multi-agences ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🧭 L'ORGANISATION NATIONALE DU RÉSEAU AIMS / MSI

La société **« AGENCE IMMOBILIERE MULTI-SERVICES » SARL** structure ses opérations autour d'un **Siège Décisionnel Central situé à Maradi (Quartier Ali Dan Sofo)** et d'un réseau d'**Agences Régionales Opérationnelles** :

```text
                                  ┌─────────────────────────────────────────┐
                                  │ 👑 SIÈGE CENTRAL DE MARADI (Ali Dan Sofo│
                                  │      Direction Générale, DAF, IT,       │
                                  │     Comptabilité Générale Consolidée    │
                                  └─────────────────────────────────────────┘
                                                       │
         ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
         ▼                                             ▼                                             ▼
  ┌──────────────────────────────┐              ┌──────────────────────────────┐              ┌──────────────────────────────┐
  │ 🏢 AGENCE RÉGIONALE NIAMEY   │              │ 🏢 AGENCE RÉGIONALE MARADI   │              │ 🏢 AGENCES RÉGIONALES ZINDER │
  │ • Direction d'Agence         │              │ • Direction d'Agence         │              │    & TAHOUA (Expansion)      │
  │ • Guichet Caisse & Accueil   │              │ • Guichet Caisse locale      │              │ • Guichets & Équipes locales │
  │ • Équipe Commerciale Terrain │              │ • Équipe Commerciale locale  │              │ • Projets fonciers régionaux │
  │ • Lotissements régionaux     │              │ • Lotissements régionaux     │              │ • Portefeuilles clients      │
  └──────────────────────────────┘              └──────────────────────────────┘              └──────────────────────────────┘
```

---

## 3. 🛡️ LE PRINCIPE DU CLOISONNEMENT GÉOGRAPHIQUE HERMÉTIQUE (MULTI-TENANT TERRITORIAL)

Le cloisonnement territorial empêche les fuites d'informations commerciales et les interférences financières entre agences :

```text
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                              RÈGLES DE CLOISONNEMENT DES DONNÉES                                         │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 1. 🔒 ÉTANCHÉITÉ DES CAISSES :                                                                           │
  │    Une caissière de Niamey ne peut NI VOIR, NI SAISIR d'encaissement sur la caisse de Maradi ou Zinder.  │
  │                                                                                                          │
  │ 2. 🔒 ÉTANCHÉITÉ DES PROSPECTS & DOSSIERS CLIENTS :                                                      │
  │    Les commerciaux d'une agence accèdent uniquement aux prospects et contrats rattachés à leur agence    │
  │    (ou à leur portefeuille individuel), sauf dérogation formelle accordée par la Direction Générale.     │
  │                                                                                                          │
  │ 3. 🌐 ACCÈS CONSOLIDÉ EXCLUSIF :                                                                         │
  │    Seuls le PDG, le DAF et le Chef Comptable disposent d'une vue transversale consolidée sur l'ensemble │
  │    des agences du territoire national.                                                                   │
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 🏢 MATRICE OFFICIELLE DES PERMISSIONS : ORGANISATION & AGENCES

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 4.1. 🏛️ Entreprise & Paramètres Généraux

| Action Entreprise | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Voir informations MSI** | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ |
| **Modifier informations** | 📤 | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ |
| **Documents légaux** | 👁️ | 👁️ | 👁️ | 🔒 | 👁️ | ⚙️ |

### 4.2. 🏢 Gestion des Agences

| Prérogative Agences | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Voir toutes les agences** | 👁️ (National) | 👁️ (Données financières)| 🔒 (Son agence) | 🔒 (Son agence) | 🔒 (Son agence) | 👁️ (Toutes) |
| **Créer une agence** | 👑 (Décision) | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ (Configuration)|
| **Modifier une agence** | 👑 / 📤 | 🔒 | 🔒 | 🔒 | ✏️ (Infos locales)| ⚙️ (Paramètres) |
| **Activer / Désactiver agence** | 👑 (Décision) | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ (Exécution) |
| **Consulter performances** | 👁️ (Consolidé) | 👁️ (Financier)| 🔒 | 🔒 | 👁️ (Son agence) | 👁️ (Système) |

### 📌 Répartition Détaillée des Rôles sur les Agences :
- **👑 PDG :** Voir toutes les agences, créer de nouvelles agences, modifier, activer/désactiver, et consulter les performances comparées.
- **🏢 Responsable d'agence :** Voir son agence, gérer son activité opérationnelle quotidienne, consulter son portefeuille clients et lots affectés.
- **📊 Comptable :** Consulter l'ensemble des données financières et caisses nécessaires pour la tenue des comptes et la consolidation SYSCOHADA.
- **🛠️ Admin technique :** Gérer la configuration technique des agences (codes agences, endpoints, affectations système).

---

## 5. 🗺️ MATRICE DES DROITS & DÉLÉGATIONS PAR TYPE D'AGENCE

| Fonctionnalité / Opération | Agence Régionale (ex: Niamey, Zinder) | Siège Central (Maradi) | Direction Générale / PDG |
| :--- | :--- | :--- | :--- |
| **Création de Nouveaux Lotissements** | ❌ Consultation du stock uniquement | 🟢 Préparation technique & cadastrale | 👑 Validation & Lancement officiel |
| **Fixation & Modification des Prix** | ❌ Application stricte de la grille | ❌ Application de la grille officielle | 👑 Seul habilité à accorder une remise |
| **Encaissement Reçus Espèces `RCP-`** | 🟢 Caisse physique locale uniquement | 🟢 Caisse physique du Siège | 🟢 Consultation globale de toutes caisses |
| **Validation Dépenses d'Exploitation** | 🟡 Plafonnée à $\le 250\,000$ FCFA | 🟡 Plafonnée à $\le 1\,000\,000$ FCFA (DAF) | 👑 Obligatoire pour $> 1\,000\,000$ FCFA |
| **Arbitrage Résiliation / Retenue 20%** | ❌ Instruction du dossier & médiation | ❌ Contrôle des décomptes comptables | 👑 Arbitrage du taux de retenue |
| **Délivrance Attestations & Titres** | ❌ Transmission de la demande | 🟡 Émission certifiée (Chef Comptable)| 👑 Signature souveraine des Actes |

---

## 5. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Configuration Globale de l'Entreprise
export interface CompanySettings {
  id: string;
  company_name: string;          // "AGENCE IMMOBILIERE MULTI-SERVICES SARL"
  brand_name: string;            // "MSI" ou "AIMS"
  legal_form: string;            // "SARL"
  headquarters_address: string;  // "Maradi, Quartier Ali Dan Sofo"
  rccm_number: string;           // "NE/MAR/2023/B/502"
  rccm_date: string;             // "2023-07-12"
  nif_number: string;
  ceo_name: string;              // "Abdoul Aziz SALISSOU ADARE"
  ceo_nationality: string;       // "Nigérienne"
  
  // Coordonnées
  primary_phone: string;
  secondary_phone?: string;
  whatsapp_number: string;
  official_email: string;
  logo_url: string;
  watermark_url?: string;
  
  // Comptes bancaires & Mobile Money
  bank_accounts: {
    bank_name: string;
    account_number: string;
    rib: string;
    iban_swift?: string;
  }[];
  mobile_money_accounts: {
    provider: 'AIRTEL_MONEY' | 'MOOV_MONEY' | 'AL_IZZA' | 'NITA' | 'AMANATA';
    merchant_number: string;
    merchant_name: string;
  }[];
  
  // Paramètres système
  default_currency: 'XOF';
  document_numbering_prefix: {
    quote: 'DEV';
    reservation: 'RES';
    contract: 'CTR';
    convention: 'CONV';
    receipt: 'RCP';
    amendment: 'AVN';
    refund: 'RMB';
    discharge: 'DECH';
    certificate: 'ATTS';
  };
  notification_settings: {
    whatsapp_enabled: boolean;
    sms_enabled: boolean;
    sending_hours_start: string; // "08:00"
    sending_hours_end: string;   // "19:00"
  };
}

// Entité Agence / Point de Vente Territorial
export interface Agency {
  id: string;
  code: string;                   // "AGC-MARADI-01", "AGC-NIAMEY-01", "AGC-ZINDER-01"
  name: string;                   // "Siège Central de Maradi", "Agence Régionale de Niamey"
  agency_type: 'HEADQUARTERS' | 'REGIONAL_BRANCH' | 'SALES_KIOSK';
  
  // Localisation géographique
  country: string;                // "Niger"
  city: string;                   // "Maradi", "Niamey", "Zinder", "Tahoua"...
  district?: string;
  address_description: string;
  gps_latitude?: number;
  gps_longitude?: number;
  
  // Coordonnées de contact officielles
  phone_primary: string;
  phone_secondary?: string;
  official_email: string;
  whatsapp_number?: string;
  
  // Responsables & Affectations
  director_user_id?: string;      // Directeur d'agence en titre
  chief_cashier_user_id?: string; // Caissier principal
  
  // Paramètres financiers locaux
  default_cash_register_limit_xof: number; // Plafond d'encaisse physique
  max_expense_delegation_xof: number;      // ex: 250 000 FCFA
  
  is_active: boolean;
  opened_at: string;
  created_at: string;
  updated_at: string;
}

// Entité Affectation d'un Utilisateur à une Agence
export interface UserAgencyAssignment {
  id: string;
  user_id: string;
  agency_id: string;
  is_primary_agency: boolean;     // Agence principale d'affectation
  can_switch_agencies: boolean;   // True uniquement pour Auditeurs / DAF / PDG
  assigned_at: string;
  assigned_by_user_id: string;
}
```

---

## 6. 🔒 IMPLÉMENTATION DES POLITIQUES POSTGRESQL ROW LEVEL SECURITY (RLS)

```sql
-- Activation du RLS sur la table des contrats et opérations financières
ALTER TABLE msi_sales_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE msi_payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE msi_cash_sessions ENABLE ROW LEVEL SECURITY;

-- Politique d'accès hermétique aux contrats selon le profil de l'utilisateur connecté
CREATE POLICY rls_contracts_agency_isolation ON msi_sales_contracts
    FOR ALL
    USING (
        -- 1. Les Administrateurs Généraux, DAF et PDG voient TOUTES les agences
        (SELECT role FROM msi_users WHERE id = auth.uid()) IN ('CEO', 'DAF', 'CHIEF_ACCOUNTANT', 'SUPER_ADMIN')
        OR
        -- 2. Le Directeur d'Agence et le Comptable local ne voient que leur agence
        (agency_id = (SELECT agency_id FROM msi_users WHERE id = auth.uid()))
        OR
        -- 3. Le Commercial ne voit que ses propres contrats
        (sales_agent_id = auth.uid())
    );

-- Politique d'accès hermétique aux sessions de caisse
CREATE POLICY rls_cash_sessions_isolation ON msi_cash_sessions
    FOR ALL
    USING (
        (SELECT role FROM msi_users WHERE id = auth.uid()) IN ('CEO', 'DAF', 'CHIEF_ACCOUNTANT')
        OR
        (agency_id = (SELECT agency_id FROM msi_users WHERE id = auth.uid()))
    );
```

