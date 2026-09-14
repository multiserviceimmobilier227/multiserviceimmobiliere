# 🏗️ SPÉCIFICATION 05 : PORTEFEUILLE FONCIER, ACQUISITIONS & RENTABILITÉ IMMOBILIÈRE
**Inventaire Fonctionnel Détaillé des Modules 04 (Acquisitions Foncières) & 27 (Moteur de Rentabilité & Situation Réelle)**

---

## 1. 🌍 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 04. PORTEFEUILLE FONCIER & ACQUISITIONS

Le module **04. PORTEFEUILLE FONCIER** prend en charge le cycle complet d'acquisition des réserves foncières :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                       INVENTAIRE FONCTIONNEL DU MODULE 04. PORTEFEUILLE FONCIER & ACQUISITIONS                       ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. GESTION DES ACQUISITIONS DE RÉSERVES FONCIÈRES                                                                    ║
║    • Créer une acquisition : Saisie complète d'un nouveau projet d'achat de terre                                    ║
║    • Typologie d'acquisition :                                                                                       ║
║      - Acquisition globale : Achat en bloc d'un domaine ou grand terrain mère destiné à être loti                    ║
║      - Acquisition individuelle : Achat d'une parcelle unitaire ou bien spécifique                                   ║
║      - Acquisition par opportunité : Rachat de parcelles stratégiques (angles, abords de grands axes, opportunités)   ║
║    • Décomposition Financière de l'Acquisition :                                                                     ║
║      - Prix d'acquisition : Montant négocié payé aux propriétaires terriens / coutumiers                            ║
║      - Frais d'acquisition : Honoraires du notaire, droits d'enregistrement fiscaux et timbres                        ║
║      - Frais annexes : Études géomètre & bornage, redevances d'approbation d'urbanisme, décapage et reprofilage       ║
║      - Coût total consolidé : Somme exhaustive de tous les flux financiers engagés (coût de revient réel)           ║
║    • Documents d'acquisition (Coffre-fort WORM) :                                                                    ║
║      - Actes de vente notariés, conventions coutumières, décharges de paiement des propriétaires terriens            ║
║      - Plans de délimitation, procès-verbaux de bornage contradictoire, arrêtés ministériels d'approbation           ║
║    • Vendeur / Propriétaire d'origine : Identité, contacts, statut coutumier ou juridique, RIB/pièces d'identité    ║
║    • Date d'acquisition & Chronologie des décaissements                                                              ║
║    • Statut de l'acquisition (En négociation, Acquis, En cours d'approbation, Aménagé, Commercialisé, Clôturé)       ║
║    • Historique inaltérable de l'acquisition (Toutes les dépenses, visas PDG, modifications de bornage)             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 📈 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 27. MOTEUR ANALYTIQUE DE RENTABILITÉ IMMOBILIÈRE

Le module **27. RENTABILITÉ IMMOBILIÈRE** calcule avec une rigueur mathématique la rentabilité prévisionnelle et réelle de chaque opération foncière :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 27. RENTABILITÉ IMMOBILIÈRE                                ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. LE TRIPTYQUE ANALYTIQUE DE CALCUL DE RENTABILITÉ                                                                  ║
║                                                                                                                      ║
║    ┌────────────────────────────────────────────────────────────────────────────────────────┐                        ║
║    │ ÉTAPE 1 : CALCUL DU COÛT RÉEL CONSOLIDÉ                                                │                        ║
║    │ Coût acquisition (Prix d'achat terrain mère) + Frais d'actes/notaire + Travaux/bornage │                        ║
║    │ = COÛT RÉEL GLOBAL ($C_{\text{réel}}$)                                                 │                        ║
║    ├────────────────────────────────────────────────────────────────────────────────────────┤                        ║
║    │ ÉTAPE 2 : CALCUL DE LA MARGE POTENTIELLE CATALOGUE                                     │                        ║
║    │ Prix de vente théorique total (Somme des prix catalogue de toutes les parcelles créées)│                        ║
║    │ − Coût réel global ($C_{\text{réel}}$)                                                 │                        ║
║    │ = MARGE POTENTIELLE THÉORIQUE ($M_{\text{potentielle}}$)                               │                        ║
║    ├────────────────────────────────────────────────────────────────────────────────────────┤                        ║
║    │ ÉTAPE 3 : CALCUL DE LA SITUATION RÉELLE DU CASH / MARGE ENCAISSÉE                      │                        ║
║    │ Encaissements réels perçus (Total des versements effectifs encaissés sur les lots)     │                        ║
║    │ − Coûts réels engagés ($C_{\text{réel}}$)                                              │                        ║
║    │ = SITUATION RÉELLE DU CASH-FLOW & BÉNÉFICE RÉALISÉ ENCAISSÉ ($S_{\text{réelle}}$)      │                        ║
║    └────────────────────────────────────────────────────────────────────────────────────────┘                        ║
║                                                                                                                      ║
║ 2. INDICATEURS CLÉS DE PILOTAGE POUR LA DIRECTION                                                                    ║
║    • Seuil de Rentabilité / Point Mort (Break-Even) : Nombre exact de parcelles à vendre et encaisser                 ║
║      pour couvrir 100% des coûts d'acquisition et d'aménagement ($N_{\text{point\_mort}} = \frac{C_{\text{réel}}}{P_{\text{moyen}}}$)║
║    • Coût de revient unitaire par parcelle vendable ($C_{\text{parcelle}} = \frac{C_{\text{réel}}}{N_{\text{lots}}}$)║
║    • Coût de revient au m² utile ($C_{\text{m2}} = \frac{C_{\text{réel}}}{\sum \text{Surfaces}}$)                    ║
║    • Taux de Marge Opérationnelle Réalisée & Taux de Recouvrement du Lotissement                                     ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. 🧭 LE PROCESSUS D'ACQUISITION DU FONCIER BRUT (TERRAIN MÈRE)

Toute opération immobilière chez MSI débute par l'acquisition sécurisée d'une réserve foncière brute auprès des propriétaires coutumiers, d'opérateurs privés ou de l'État :

```text
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 1. NÉGOCIATION & ACHAT TERRAIN MÈRE (Convention Coutumière / Titre)    │
  │    Paiement des propriétaires terriens + Notaire + Frais d'actes       │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 2. ÉTUDES TOPOGRAPHIQUES & BORNAGE CONTRADICTOIRE (Cabinet Géomètre)   │
  │    Délimitation périmétrique + Pose des bornes mères                    │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 3. DOSSIER D'APPROBATION & URBANISME (Ministère / Direction Urbanisme)  │
  │    Obtention de l'Arrêté Ministériel d'Approbation de Lotissement      │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 4. AMÉNAGEMENT & VIABILISATION (Travaux Publics & Décapage)             │
  │    Ouverture des voies, terrassement, reprofilage, piquetage parcelles │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 5. INTÉGRATION AU CATALOGUE VENDABLE (Mise en Vente des Lots)          │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 🧮 CALCUL MATHÉMATIQUE DES COÛTS DE REVIENT & DU PRIX DE BASE AU M²

Pour garantir une rentabilité saine et éviter toute vente à perte, MSI 2.0 calcule automatiquement le coût de revient consolidé de chaque projet foncier.

### 2.1. Formule du Coût Réel Consolidé ($C_{\text{réel}}$)
$$C_{\text{réel}} = C_{\text{achat\_foncier}} + C_{\text{notaire\_actes}} + C_{\text{géomètre\_bornage}} + C_{\text{urbanisme\_taxes}} + C_{\text{viabilisation\_travaux}} + C_{\text{imprévus}}$$

Où :
- $C_{\text{achat\_foncier}}$ : Prix total payé aux propriétaires initiaux (FCFA).
- $C_{\text{notaire\_actes}}$ : Honoraires notariés, enregistrement fiscal et droits d'enregistrement.
- $C_{\text{géomètre\_bornage}}$ : Factures du géomètre agréé (levé topo, plan de masse, piquetage individuel des lots).
- $C_{\text{urbanisme\_taxes}}$ : Frais d'instruction et redevances de l'Arrêté Ministériel.
- $C_{\text{viabilisation\_travaux}}$ : Frais de décapage, engins (bulldozers, niveleuses), ouverture des artères et voies.
- $C_{\text{imprévus}}$ : Frais accessoires de sécurisation coutumière et démarches locales.

### 2.2. Coût de Revient Unitaire au Mètre Carré Utile Vendable ($C_{\text{revient\_m2}}$)
La superficie brute acquise comprend des voiries et réserves administratives (non vendables).  
La superficie utile vendable $S_{\text{utile}}$ est égale à :
$$S_{\text{utile}} = \sum_{i=1}^{N} \text{Surface}(\text{Parcelle}_i)$$

$$C_{\text{revient\_m2}} = \frac{C_{\text{réel}}}{S_{\text{utile}}}$$

---

## 3. 📈 CALCUL DU POINT MORT (SEUIL DE RENTABILITÉ) & DES 3 NIVEAUX DE MARGE

MSI 2.0 intègre un moteur analytique de rentabilité foncière en direct :

### 3.1. Le Point Mort Foncier (Nombre de parcelles à vendre pour couvrir 100% des coûts)
$$\text{Point Mort (Nombre de Lots)} = \left\lceil \frac{C_{\text{réel}}}{\text{Prix Moyen Vente d'un Lot}} \right\rceil$$
> **Exemple Concret :**  
> Si un lotissement a coûté au total $120\,000\,000\text{ FCFA}$ (achat + géomètre + décapage) et que le prix moyen d'une parcelle est de $3\,000\,000\text{ FCFA}$ :  
> Le Point Mort est atteint dès la **40ème parcelle vendue**. À partir de la 41ème parcelle, chaque vente constitue de la marge brute directe pour MSI.

### 3.2. Les 3 Niveaux de Rentabilité en Temps Réel

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. MARGE POTENTIELLE THÉORIQUE (Si 100% des parcelles sont vendues au prix) │
│    M_pot = Valeur_Catalogue_Totale - C_réel                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. MARGE CONTRACTUELLE ENGAGÉE (Sur la base des contrats signés CTR-)       │
│    M_eng = CA_Contrats_Signés - C_réel                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. RÉSULTAT DE TRÉSORERIE ENCAISSÉ RÉEL (La rentabilité effective cash)     │
│    R_cash = Encaissements_Réels_Encaissés - C_réel_Décaissé                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Dossier d'Acquisition Foncière Brute
export interface LandAcquisition {
  id: string;
  agency_id: string;
  project_code: string;           // ex: "ACQ-GOUDEL-2025-01"
  project_name: string;           // ex: "Acquisition Foncier Goudel Extension"
  location_description: string;   // Ville, Commune, Coordonnées
  seller_type: 'CUSTOMARY_OWNERS' | 'PRIVATE_INDIVIDUAL' | 'STATE_COMMUNE' | 'COMPANY';
  seller_contact_info: {
    representative_name: string;
    phone: string;
    national_id?: string;
  };
  
  // Surfaces
  total_raw_surface_hectares: number;
  total_raw_surface_sqm: number;
  usable_sellable_surface_sqm: number; // Somme des surfaces des lots créés
  
  // Postes de coûts réels engagés (FCFA)
  cost_land_purchase_xof: number;      // Achat terrain
  cost_notary_registration_xof: number;// Notaire & enregistrement fiscal
  cost_surveyor_topography_xof: number;// Géomètre & bornage
  cost_urbanism_approvals_xof: number; // Arrêté & urbanisme
  cost_earthworks_grading_xof: number; // Décapage & voirie
  cost_miscellaneous_xof: number;      // Frais divers
  
  // Agrégat calculé
  total_real_cost_xof: number;         // Somme de tous les coûts
  cost_per_sellable_sqm_xof: number;   // Coût de revient / m² utile
  
  // Urbanisme & Légalité
  cadastral_mother_title?: string;     // Titre Foncier Mère
  ministerial_decree_ref?: string;     // Réf Arrêté ministériel
  decree_approval_date?: string;
  surveyor_cabinet_name?: string;      // Nom du cabinet de géomètre agréé

  // Liens vers les parcelles issues de cette acquisition
  generated_subdivision_id?: string;
  total_lots_created: number;

  status: 'PROSPECTING' | 'ACQUIRED' | 'SURVEYING' | 'APPROVED' | 'DEVELOPING' | 'ACTIVE_SALES' | 'COMPLETED';
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

// Entité Ligne de Dépense d'Aménagement Foncier
export interface LandDevelopmentExpense {
  id: string;
  land_acquisition_id: string;
  expense_category: 'PURCHASE_PAYMENT' | 'SURVEYOR_INVOICE' | 'NOTARY_FEE' | 'EARTHWORK_BULLDOZER' | 'ADMIN_TAX';
  label: string;
  amount_xof: number;
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'CHECK';
  invoice_number?: string;
  invoice_scan_url?: string;
  is_justified: boolean;
  paid_date: string;
  paid_by_user_id: string;
  approved_by_ceo: boolean;
  ceo_approval_timestamp?: string;
}
```

---

## 5. 🔄 TRAÇABILITÉ & RÈGLES DE CONTRÔLE INTERNE DU DOMAINE 05
- **Toute dépense d'acquisition ou d'aménagement $> 500\,000\text{ FCFA}$** requiert formellement le visa préalable du PDG.
- **Rapprochement Automatique** : Les dépenses affectées à une acquisition foncière s'imputent directement dans les comptes de charges de classe 2/6 SYSCOHADA et incrémentent le coût de revient du lotissement.
- **Zéro `DELETE`** : Toute réévaluation ou ajustement du coût d'acquisition fait l'objet d'une écriture rectificative auditée avec motif obligatoire.
