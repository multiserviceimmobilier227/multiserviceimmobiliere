# 🗺️ SPÉCIFICATION 04 : PATRIMOINE FONCIER, LOTISSEMENTS, ÎLOTS & PARCELLES
**Inventaire Fonctionnel Détaillé des Modules 05 (Lotissements), 06 (Îlots), 07 (Parcelles) & 08 (Prix Foncier)**

---

## 1. 🗺️ INVENTAIRE FONCTIONNEL DÉTAILLÉ : 05. GESTION DES LOTISSEMENTS

Le module **05. LOTISSEMENTS** permet l'aménagement, la structuration spatiale, la cartographie et le découpage cadastral de chaque site immobilier :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 05. GESTION DES LOTISSEMENTS                               ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. GESTION DU SITE & INFORMATIONS GÉNÉRALES                                                                         ║
║    • Créer un lotissement : Code unique (LOT-MAR-TIBIRI-01), désignation commerciale, agence de rattachement         ║
║    • Modifier un lotissement : Rectification des paramètres techniques avant scellement cadastral                    ║
║    • Informations générales complètes :                                                                              ║
║      - Localisation précise : Ville (Maradi, Niamey, Zinder...), Commune, Arrondissement, Quartier, Repères          ║
║      - Zone géographique : Type de zone (Résidentielle, Commerciale, Périurbaine, Zone d'extension)                 ║
║      - Superficie brute totale (en Hectares et en m²) & Superficie utile vendable                                    ║
║      - Arrêté ministériel d'approbation d'urbanisme (Numéro officiel, date de signature, autorité émettrice)        ║
║                                                                                                                      ║
║ 2. PLANS, CARTOGRAPHIES & GESTION DOCUMENTAIRE                                                                       ║
║    • Plans de masse & fichiers géomètres (Formats DWG, DXF, GeoJSON, Shapefile, PDF HD)                              ║
║    • Cartographie interactive SIG : Visualisation dynamique des limites globales du site et des voies d'accès       ║
║    • Coordonnées GPS du polygone englobant (Latitude / Longitude des sommets du périmètre)                           ║
║    • Documents officiels rattachés (Titre foncier mère, Procès-verbal de bornage contradictoire, Arrêté d'approbation║
║                                                                                                                      ║
║ 3. STRUCTURATION EN ÎLOTS & DÉCOUPAGE EN PARCELLES                                                                   ║
║    • Gestion des Îlots : Création, numérotation (ex: Îlot 01, Îlot 02, Îlot 12B), affectation spatiale              ║
║    • Génération & Découpage des Parcelles : Création des lots individuels rattachés à chaque îlot                   ║
║    • Statut du lotissement : En étude, En aménagement, En commercialisation active, Soldé/Épuisé, Archivé           ║
║    • Historique inaltérable : Journal de tous les aménagements, ajouts d'îlots et attributions de parcelles          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🧩 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 06. GESTION DES ÎLOTS

Le module **06. ÎLOTS** structure l'organisation urbaine intermédiaire et les statistiques par bloc :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                INVENTAIRE FONCTIONNEL DU MODULE 06. GESTION DES ÎLOTS                                ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. STRUCTURATION & PARAMÉTRAGE DE L'ÎLOT                                                                             ║
║    • Créer un îlot : Numérotation normalisée (ex: Îlot 01, Îlot 14, Îlot 22B)                                       ║
║    • Lotissement associé : Rattachement obligatoire au site foncier parent                                           ║
║    • Parcelles associées : Liste exhaustive de toutes les parcelles découpées au sein de l'îlot                      ║
║    • Superficie globale de l'îlot : Somme des surfaces des parcelles (m²)                                           ║
║    • Plan & Fichier géomètre : Extrait de plan d'îlot géoréférencé avec les emprises de voiries                     ║
║    • Localisation spatiale : Position géographique relative au sein du plan masse                                    ║
║                                                                                                                      ║
║ 2. STATISTIQUES, DISPONIBILITÉ & HISTORIQUE                                                                          ║
║    • Tableau de bord statistique de l'îlot :                                                                         ║
║      - Nombre total de parcelles dans l'îlot                                                                         ║
║      - Parcelles disponibles (🟢)                                                                                   ║
║      - Parcelles réservées / en cours de paiement (🟡 / 🟠)                                                           ║
║      - Parcelles entièrement soldées & actées (🔵 / 🏁)                                                               ║
║      - Taux d'occupation et pourcentage de commercialisation de l'îlot                                               ║
║    • Disponibilité en temps réel (Jauge visuelle interactive)                                                        ║
║    • Historique inaltérable de l'îlot (Dates de création, modifications de limites, lots créés/modifiés)             ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. 🏠 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 07. GESTION DES PARCELLES

Le module **07. PARCELLES** gère la fiche d'identité individuelle, la traçabilité intégrale et les actions sur chaque lot :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                              INVENTAIRE FONCTIONNEL DU MODULE 07. GESTION DES PARCELLES                              ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. FICHE D'IDENTITÉ COMPLÈTE DE LA PARCELLE                                                                          ║
║    • Numéro de parcelle / Lot (ex: Lot 18) & Identifiant complet (ex: LOT-MAR-TIBIRI-01-I04-P18)                     ║
║    • Îlot d'appartenance & Lotissement parent                                                                        ║
║    • Superficie exacte en m² (ex: 300 m², 400 m², 500 m²)                                                           ║
║    • Localisation & Typologie : Standard (1 façade), Angle (2 façades), Bordure de grand boulevard                  ║
║    • Coordonnées géographiques & Cartographie : 4 Bornes géomètres B1, B2, B3, B4 (Latitude / Longitude)            ║
║    • Plan individuel de la parcelle (Extrait cadastral PDF avec QR Code)                                             ║
║    • Données financières de la parcelle :                                                                            ║
║      - Prix catalogue en vigueur (calculé au m² ou forfaitaire avec surcoût d'angle)                                 ║
║      - Prix actuel applicable                                                                                        ║
║      - Historique des prix et révisions tarifaires passées                                                           ║
║      - Coût d'acquisition & Prix de revient unitaire attribué ($C_{\text{revient}}$)                                 ║
║    • Documents rattachés au lot (Procès-verbal de bornage individuel, fiche technique, photos du terrain)            ║
║    • Notes & Remarques techniques (Topographie, servitudes de passage, viabilisation)                                ║
║                                                                                                                      ║
║ 2. LES 8 STATUTS DU CYCLE DE VIE D'UNE PARCELLE                                                                      ║
║    1. 🟢 DISPONIBLE : Libre à la commercialisation et à la réservation                                               ║
║    2. 🟡 RÉSERVÉE : Option gratuite 15 jours active avec compte à rebours                                            ║
║    3. 🟠 EN COURS DE PAIEMENT : Contrat signé CTR-, acompte 30% versé, mensualités en cours                          ║
║    4. 🔵 ENTIÈREMENT PAYÉE : 100% du prix et frais de cession de 35 000 F soldés                                     ║
║    5. 🏁 VENDUE / TITRE DÉLIVRÉ : Acte de Cession officiel et clés remis à l'acquéreur                                ║
║    6. 🔴 BLOQUÉE : Gelée temporairement (décision de la Direction, litige foncier, réajustement de bornage)          ║
║    7. ⚪ ANNULÉE : Contrat résilié, dossier archivé et parcelle libérée                                              ║
║    8. ⚫ NON COMMERCIALISABLE : Réservée aux équipements d'intérêt public (Mosquée, École, Place publique)           ║
║                                                                                                                      ║
║ 3. FONCTIONS & ACTIONS OPÉRATIONNELLES SUR LES PARCELLES                                                             ║
║    • Rechercher instantanément (par numéro, îlot, référence, superficie, nom du lotissement)                         ║
║    • Filtrer par critères multicritères (Statut, typologie, tranche de prix, agence, superficie)                      ║
║    • Trier (par prix croissant/décroissant, surface, disponibilité, date d'ajout)                                    ║
║    • Visualiser sur plan interactif 2D/SIG avec code couleur dynamique par statut                                    ║
║    • Modifier les paramètres modifiables (avant scellement contractuel)                                              ║
║    • Bloquer / Libérer une parcelle (avec motif et visa Direction)                                                   ║
║    • Réserver pour un prospect (génération du reçu d'option 15 jours)                                                ║
║    • Attribuer / Vendre (génération de la convention de vente officielle CTR- / CONV-)                                ║
║    • Consulter l'historique complet (toutes les transactions, changements de statut, réservations passées)           ║
║    • Voir le client lié (Fiche complète de l'acquéreur)                                                              ║
║    • Voir le contrat actif (Échéancier, versements, conventions signées)                                             ║
║    • Voir les paiements effectués (Reçus RCP- générés, soldes, échéances)                                            ║
║    • Voir la rentabilité financière en direct de la parcelle (Prix de vente effectif - Coût de revient unitaire)     ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 4. 💰 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 08. TARIFICATION, PRIX NÉGOCIÉ & RÈGLE FONDAMENTALE

Le module **08. PRIX** encadre la fixation des grilles tarifaires et protège les contrats existants :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 08. TARIFICATION & PRIX                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. GESTION DES PRIX CATALOGUE                                                                                        ║
║    • Définir les prix de base par lotissement (au m² ou forfait par lot)                                             ║
║    • Majoration des parcelles d'angle (+10% à +15%) et grandes voies (+15% à +25%)                                   ║
║    • Modifier les prix catalogue (Seul le profil PDG est habilité)                                                    ║
║    • Historique complet des révisions de prix avec Date d'entrée en vigueur                                           ║
║                                                                                                                      ║
║ 2. GESTION DES PRIX NÉGOCIÉS & REMISES CLIENT                                                                        ║
║    • Prix catalogue de référence                                                                                     ║
║    • Montant de la réduction accordée (en FCFA ou en %)                                                              ║
║    • Prix final net contractuel                                                                                      ║
║    • Motif obligatoire de la remise (ex: Achat groupé, paiement cash, négociation spéciale)                          ║
║    • Autorisation & Visa : Décision souveraine du PDG avec horodatage UTC+1 et ID validateur                        ║
║    • Historique inaltérable de la négociation rattaché au contrat                                                    ║
║                                                                                                                      ║
║ 3. 🛡️ LA RÈGLE FONDAMENTALE DU VERROUILLAGE DU PRIX HISTORIQUE                                                       ║
║    « Un contrat conserve STRICTEMENT son prix historique scellé à la date de signature,                             ║
║      même si le prix catalogue de la parcelle ou du lotissement augmente ultérieurement. »                          ║
║    Le moteur de base de données garantit l'immutabilité du montant contractuel scellé dans le CTR-.                 ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 5. 🧭 LA HIÉRARCHIE SPATIALE & CADASTRALE DU PATRIMOINE MSI

Chaque site foncier développé par MSI est structuré selon une hiérarchie spatiale rigoureusement conforme aux normes d'urbanisme du Niger :

```text
                                  ┌─────────────────────────────────────────┐
                                  │      1. PROJET / SITE MAÎTRE           │
                                  │ (Titre Foncier Mère, Arrêté Ministériel)│
                                  └─────────────────────────────────────────┘
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │     2. LOTISSEMENT OPÉRATIONNEL         │
                                  │  (ex: "Cité des Palmiers - Maradi",     │
                                  │   "Résidence Concorde - Niamey Goudel") │
                                  └─────────────────────────────────────────┘
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │            3. ÎLOT FONCIER              │
                                  │   (Bloc urbain délimité par des voies,  │
                                  │    ex: Îlot 04, Îlot 12, Section B)     │
                                  └─────────────────────────────────────────┘
                                                       │
                                                       ▼
                                  ┌─────────────────────────────────────────┐
                                  │     4. PARCELLE / LOT INDIVIDUEL        │
                                  │ (Surface m², Bornes GPS B1-B4, Statut)  │
                                  └─────────────────────────────────────────┘
```

---

## 2. 🚦 LA MACHINE D'ÉTAT STRICTE AUX 8 STATUTS DE PARCELLE

Chaque parcelle dans le catalogue MSI possède un et un seul statut parmi les 8 états autorisés. Les transitions entre statuts sont strictement encadrées par le moteur métier :

```text
                                     ┌─────────────────────────────────┐
                                     │     1. DISPONIBLE (🟢)          │
                                     │   (Libre à la commercialisation)│
                                     └─────────────────────────────────┘
                                           │                     │
                ┌──────────────────────────┘                     └──────────────────────────┐
                ▼                                                                           ▼
  ┌───────────────────────────┐                                               ┌───────────────────────────┐
  │ 2. OPTION_RÉSERVÉE (🟡)   │                                               │ 7. BLOQUÉE_LITIGE (🔴)    │
  │ (Option gratuite 15 jours)│                                               │ (Gelée par décision DG)   │
  └───────────────────────────┘                                               └───────────────────────────┘
                │
                ├──────────────────────────┐ (Si 15j expirés sans acompte)
                │                          ▼
                │             ┌───────────────────────────┐
                │             │     RETOUR À DISPONIBLE   │
                │             └───────────────────────────┘
                ▼ (Signature Contrat + Acompte)
  ┌───────────────────────────┐
  │ 3. EN_COURS_PAIEMENT (🟠) │
  │ (Échéancier actif en cours│
  └───────────────────────────┘
                │
                ├──────────────────────────────────────────────────────┐
                │ (Paiements réguliers jusqu'à Solde = 0 FCFA)         │ (Résiliation pour impayé / accord)
                ▼                                                      ▼
  ┌───────────────────────────┐                          ┌───────────────────────────┐
  │ 4. ENTIÈREMENT_PAYÉE (🔵) │                          │ 6. ANNULÉE_REMISE_EN_VENTE│
  │ (100% encaissé, Titre prêt│                          │ (Pénalité 20%, Lot libéré)│
  └───────────────────────────┘                          └───────────────────────────┘
                │                                                      │
                ▼                                                      ▼
  ┌───────────────────────────┐                          ┌───────────────────────────┐
  │ 5. TITRE_DÉLIVRÉ (🏁)     │                          │     RETOUR À DISPONIBLE   │
  │ (Acte & Clés remis client)│                          └───────────────────────────┘
  └───────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ 8. NON_COMMERCIALISABLE (⚫) : Réservée aux Espaces Publics (Mosquée, École, Place, Espaces Verts)│
  └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 📐 CARACTÉRISTIQUES FONCIÈRES & TYPOLOGIES D'EMPLACEMENT

La valeur marchande d'une parcelle dépend de sa superficie géométrique et de sa typologie d'implantation :

| Typologie d'Emplacement | Coefficient de Valorisation | Description & Intérêt Commercial |
| :--- | :---: | :--- |
| **Parcelle Standard (Façade simple)** | $\times 1.00$ | Lot rectiligne avec accès sur une voie standard ($10\text{m}$ ou $12\text{m}$). |
| **Parcelle d'Angle (2 Façades)** | $\times 1.10$ à $\times 1.15$ | Lot à l'intersection de deux voies, offrant une double accessibilité et plus de luminosité. |
| **Parcelle sur Grande Voie / Boulevard** | $\times 1.20$ à $\times 1.30$ | Emplacement stratégique sur voie principale $\ge 20\text{m}$, fort potentiel commercial/boutiques. |
| **Parcelle Spéciale (Espace Vert / Public)** | $\text{Non vendable}$ | Affectation collective d'intérêt général (école, centre de santé, lieu de culte). |

---

## 4. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Lotissement / Site Foncier
export interface SubdivisionProject {
  id: string;
  agency_id: string;              // Agence gestionnaire (ex: Maradi, Niamey)
  code: string;                   // ex: "LOT-MAR-PALMIERS", "LOT-NIA-GOUDEL"
  name: string;                   // "Cité des Palmiers", "Résidence Concorde"
  
  // Cadastre & Urbanisme
  ministerial_approval_number: string; // Numéro d'arrêté d'approbation d'urbanisme
  approval_date: string;
  total_surface_area_sqm: number;
  marketable_surface_area_sqm: number;
  total_islands_count: number;
  total_parcels_count: number;
  
  // Coordonnées GPS du polygone englobant
  gps_center_latitude: number;
  gps_center_longitude: number;
  boundary_coordinates: { latitude: number; longitude: number }[];
  
  // Données Financières
  land_acquisition_cost_xof: number; // Coût d'achat du terrain mère
  development_works_cost_xof: number; // Coût géomètre + terrassement + bornage
  total_project_cost_xof: number;
  target_sales_revenue_xof: number;
  break_even_parcels_count: number;  // Seuil du point mort en nombre de lots
  
  status: 'PLANNING' | 'DEVELOPMENT' | 'ACTIVE_SALES' | 'SOLD_OUT' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

// Entité Parcelle Individuelle (Lot)
export interface LandParcel {
  id: string;
  subdivision_id: string;
  island_number: string;          // Numéro de l'îlot (ex: "04", "B12")
  parcel_number: string;          // Numéro du lot (ex: "18", "42")
  full_identifier: string;        // "GOUDEL-I04-L18"
  
  // Dimensions & Surface
  surface_area_sqm: number;       // ex: 300, 400, 500 m²
  dimension_frontage_m?: number;  // Façade (ex: 15 m)
  dimension_depth_m?: number;     // Profondeur (ex: 20 m)
  
  // Emplacement & Typologie
  location_type: 'STANDARD' | 'CORNER_2_STREETS' | 'MAIN_BOULEVARD' | 'PUBLIC_RESERVE';
  street_width_m?: number;        // Largeur de voie
  
  // Coordonnées des 4 Bornes Géomètre (B1, B2, B3, B4)
  boundary_landmarks: {
    point_name: 'B1' | 'B2' | 'B3' | 'B4';
    gps_latitude: number;
    gps_longitude: number;
  }[];
  
  // Tarification
  base_price_per_sqm_xof: number;
  calculated_base_price_xof: number;
  corner_surcharge_amount_xof: number;
  final_catalog_price_xof: number;
  
  // Machine d'état aux 8 statuts
  status: 'AVAILABLE' | 'OPTION_RESERVED' | 'ACTIVE_IN_PAYMENT' | 'FULLY_PAID' | 'TITLE_DEED_DELIVERED' | 'CANCELLED_RESALE' | 'BLOCKED_LITIGATION' | 'NON_MARKETABLE';
  
  // Lien vers la réservation / contrat actif
  active_reservation_id?: string;
  active_contract_id?: string;
  current_customer_id?: string;
  
  created_at: string;
  updated_at: string;
}
```

---

## 6. 🗺️ MATRICE OFFICIELLE DES PERMISSIONS : PATRIMOINE IMMOBILIER & PARCELLES (MODULES 04 À 08)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 6.1. 🗺️ Portefeuille Foncier & Lotissements

| Action Portefeuille Foncier | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Voir les lotissements & plans** | 👁️ (Tout le patrimoine) | 👁️ (Consultation globale) | 👁️ (Consultation) | 👁️ (Disponibilités) | 👁️ (Son agence) | 👁️ (Accès technique) |
| **Consulter les coûts & valeurs foncières** | 👁️ (Coûts mères + VRD) | 👁️ (Complet analytique) | 🔒 | 🔒 | 👁️ (Périmètre local) | 👁️ (Base de données) |
| **Créer un lotissement / terrain mère** | 👑 (Décision) / ➕ | 🔒 | 🔒 | 🔒 | 📤 (Propose) | ⚙️ (Configuration) |
| **Modifier données lotissement** | 👑 / ✏️ | 🔒 | 🔒 | 🔒 | ✏️ (Son périmètre) | ⚙️ (Paramétrage) |

---

### 6.2. 🏷️ Parcelles & Gestion du Stock Foncier

| Action sur les Parcelles | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Voir les parcelles** | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ |
| **Créer des parcelles** | ➕ | 🔒 | 🔒 | 🔒 | ➕ (Si habilité) | ⚙️ (Import SIG/Lots)|
| **Modifier informations simples (façade, notes)** | ✏️ | 🔒 | 🔒 | 🔒 | ✏️ (Son agence) | ⚙️ |
| **Modifier le prix catalogue / base m²** | 🔴 👑 (Souverain) | 🔒 | 🔒 | 🔒 | 🔒 (Sauf délégation)| 🔒 |
| **Bloquer une parcelle (Litige / Réserve)** | 🔴 👑 / 🔒 | 🔒 | 🔒 | 🔒 | 🔒 (Si habilité) | ⚙️ (Technique) |
| **Attribuer / Vendre (Lier au contrat)** | 👑 / ✅ | 👁️ / 💰 | 👁️ (Lecture) | 📤 / ➕ (Workflow) | ✅ (Validation vente)| 👁️ |
| **Libérer une parcelle (Fin d'option 15j / Annulation)** | 👑 / ⚡ (Automatique) | ⚡ (Auto sur résiliation) | 🔒 | 🔒 | ⚡ (Auto à J+15) | ⚙️ |
| **Supprimer une parcelle** | ❌ (Interdit) | ❌ (Interdit) | ❌ (Interdit) | ❌ (Interdit) | ❌ (Interdit) | ❌ (Interdit) |

### 📌 Répartition Synthétique des Responsabilités sur le Foncier :
- **👑 PDG :** Décision souveraine sur les acquisitions, approbation des lotissements, **droit exclusif de modification des prix catalogue**, arbitrage des déblocages.
- **📊 Comptable :** Consultation du patrimoine avec focus analytique : **coûts d'acquisition du terrain mère + quote-part VRD + valorisation bilancielle + suivi des acomptes**.
- **🧑💼 Secrétaire :** Consultation des disponibilités et des caractéristiques techniques pour l'accueil des visiteurs.
- **📣 Commercial :** Consultation dynamique de la disponibilité commerciale des lots (plan 2D vert/jaune/bleu) et génération des propositions d'attribution.
- **🏢 Responsable d'agence :** Gestion opérationnelle du portefeuille foncier affecté à son agence, contrôle des découpages et suivi des attributions locales.
- **🛠️ Admin technique :** Administration technique des couches SIG, imports de découpages parcellaires sans pouvoir de décision commerciale ou tarifaire.
- **🚫 RÈGLE ABSOLUE : ZÉRO SUPPRESSION PHYSIQUE.** Une parcelle créée ne peut jamais être effacée (elle est marquée `NON_COMMERCIALISABLE`, `ARCHIVÉE` ou `RESTITUÉE`).

