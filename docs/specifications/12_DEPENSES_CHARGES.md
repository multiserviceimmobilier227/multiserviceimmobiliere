# 💸 SPÉCIFICATION 12 : DÉPENSES, CHARGES D'EXPLOITATION & JUSTIFICATIFS COMPTABLES
**Inventaire Fonctionnel Détaillé du Module 24 (Gestion Complète des Dépenses, Justificatifs & Dérogations)**

---

## 1. 💸 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 24. GESTION DES DÉPENSES & CHARGES

Le module **24. DÉPENSES** assure l'enregistrement, la catégorisation et le contrôle strict des engagements financiers :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 24. GESTION DES DÉPENSES                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. CRÉATION & ENREGISTREMENT D'UNE DÉPENSE                                                                           ║
║    • Montant de la dépense (en FCFA) & Date exacte de décaissement/engagement                                        ║
║    • Catégorie de charge (Nomenclature normalisée)                                                                   ║
║    • Description claire & Libellé détaillé de l'opération                                                            ║
║    • Bénéficiaire / Fournisseur (Identité, contact, NIF si entreprise)                                               ║
║    • Moyen de règlement : Caisse physique locale, Virement bancaire, Chèque, Mobile Money (Nita / Airtel)            ║
║    • Affectation analytique : Projet / Lotissement ciblé (ex: Aménagement Tibiri) ou Frais généraux Siège           ║
║    • Agence émettrice : Rattachement géographique strict                                                             ║
║    • Justificatif & Pièce jointe : Facture normalisée, reçu ou décharge scannée                                      ║
║    • Commentaire & Visa de validation selon les seuils de délégation                                                 ║
║    • Historique inaltérable de la dépense (auteur de saisie, approbateur, date de paiement)                          ║
║                                                                                                                      ║
║ 2. CATÉGORIES EXHAUSTIVES DE DÉPENSES PRISES EN CHARGE                                                               ║
║    • Loyer d'agence & Siège social                                                                                   ║
║    • CNSS / Cotisations sociales & Salaires du personnel                                                             ║
║    • Carburant & Déplacements visites terrains                                                                        ║
║    • Électricité (NIGELEC) & Eau (SEEN)                                                                              ║
║    • Maintenance générale & Entretien des locaux                                                                     ║
║    • Informatique, Réseau, Licences & Télécoms                                                                       ║
║    • Consommables de bureau & Imprimante                                                                             ║
║    • Matériel & Mobilier de bureau                                                                                   ║
║    • Climatisation (Installation & maintenance périodique)                                                           ║
║    • Impôts, Taxes & Redevances administratives                                                                     ║
║    • Travaux d'aménagement foncier (Bulldozer, géomètres, bornage)                                                   ║
║                                                                                                                      ║
║ 3. 🛡️ RÈGLE DES DÉPENSES SANS JUSTIFICATIF                                                                          ║
║    « Une dépense sans facture probante est POSSIBLE (achats locaux informels), mais la saisie d'une                  ║
║      JUSTIFICATION CIRCONSTANCIÉE et d'un BON DE DÉCHARGE SIGNÉ est STRICTEMENT OBLIGATOIRE. »                      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🧭 TYPOLOGIE DES DÉPENSES & CATÉGORISATION SYSCOHADA (CLASSE 6)

Toute sortie de fonds au sein de MSI (au Siège comme en Agence régionale) est rigoureusement classifiée selon le plan comptable général SYSCOHADA révisé :

```text
                                  ┌─────────────────────────────────────────┐
                                  │       DÉPENSE ENGAGÉE / DÉCAISSÉE       │
                                  └─────────────────────────────────────────┘
                                                       │
         ┌─────────────────────────┬───────────────────┴───────────────────┬─────────────────────────┐
         ▼                         ▼                                       ▼                         ▼
  ┌──────────────┐          ┌──────────────┐                        ┌──────────────┐          ┌──────────────┐
  │ 1. CHARGES   │          │ 2. SERVICES  │                        │ 3. CHARGES   │          │ 4. FRAIS     │
  │ D'EXPLOIT.   │          │ EXTÉRIEURS   │                        │ DU PERSONNEL │          │ FINANCIERS & │
  │ DIRECTES     │          │ (Compte 62/63│                        │ (Compte 66)  │          │ DIVERS       │
  │ (Compte 60/61│          │ Loyers, Pub, │                        │ Salaires,    │          │ (Compte 67/65│
  │ Carburant,   │          │ Entretien,   │                        │ Primes,      │          │ Frais banc., │
  │ Fournitures) │          │ Honoraires)  │                        │ CNSS)        │          │ Taxes)       │
  └──────────────┘          └──────────────┘                        └──────────────┘          └──────────────┘
```

### 1.1. Principaux Postes de Dépenses Opérationnelles
- **Frais de Fonctionnement d'Agence** : Loyer du local, électricité NIGELEC, eau SEEN, connexion Internet, fournitures de bureau et consommables imprimante.
- **Mobilité & Visites Terrain** : Carburant des véhicules de visite, entretien des engins et motos des commerciaux.
- **Marketing & Communication** : Impression de flyers, campagnes radio, affichage panneaux routiers, sponsorisation réseaux sociaux.
- **Honoraires & Prestataires** : Huissiers, avocats-conseils, gardiennage et sécurité des agences.

---

## 2. 🛡️ CONTRÔLE DES JUSTIFICATIFS & TRAITEMENT DES MENUES DÉPENSES SANS FACTURE

> **Règle Fondamentale de Rigueur Comptable :**  
> **Toute dépense doit être appuyée par une pièce justificative probante (Facture normalisée NIF, Reçu officiel, Décharge signée).**

```text
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ CAS A : DÉPENSE AVEC FACTURE PROBANTE (Fournisseur Structuré)           │
  │ Facture normalisée avec NIF / RCCM + Scan joint au dossier              │
  │ ► Statut : 🟢 JUSTIFIÉE DIRECTEMENT                                      │
  └─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │ CAS B : MENUE DÉPENSE DU SECTEUR INFORMEL (ex: Main d'œuvre locale,     │
  │ transport taxi, artisan soudeur, achat local non formalisé)             │
  │ 1. Établissement obligatoire d'un BON DE DÉCHARGE DE CAISSE DÉPENSE     │
  │ 2. Mention : Nom, CNI/Téléphone du bénéficiaire + Motif détaillé        │
  │ 3. Signature du bénéficiaire + Visa du Chef d'Agence                    │
  │ ► Statut : 🟡 JUSTIFIÉE PAR DÉCHARGE DÉROGATOIRE                        │
  └─────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────────────────────┐
  │ CAS C : DÉPENSE SANS AUCUNE PIÈCE JOINTE (Anomalie de Caisse)           │
  │ ► Statut : 🔴 PIÈCE MANQUANTE (Alerte rouge dans le Radar Comptable)    │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 👑 LE CIRCUIT HIÉRARCHIQUE DE VISA DES DÉPENSES (SEUILS DE DÉLÉGATION)

Pour concilier agilité opérationnelle locale et sécurité financière centrale, les dépenses sont soumises à une grille de délégation stricte :

| Tranche de Montant (FCFA) | Type d'Engagement | Autorité de Validation Requise | Circuit de Paiement |
| :--- | :--- | :--- | :--- |
| **$\le 50\,000\text{ FCFA}$** | Menues dépenses de caisse quotidiennes | **Directeur d'Agence** ou Comptable | Décaissement direct sur la Caisse physique locale |
| **$50\,001$ à $250\,000\text{ FCFA}$** | Charges courantes d'agence / Réparations | **Directeur d'Agence** + Visa Comptable Siège | Caisse locale ou Virement Mobile Money |
| **$250\,001$ à $1\,000\,000\text{ FCFA}$** | Loyers, Campagnes marketing, Achats matériel | **Directeur Administratif & Financier (DAF)** | Virement bancaire / Chèque |
| **$> 1\,000\,000\text{ FCFA}$** | Investissements, Travaux lourds, Véhicules | **VISA SOUVERAIN DU PDG OBLIGATOIRE** | Virement bancaire / Chèque après accord |

---

## 4. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Dépense / Charge d'Exploitation
export interface OperatingExpense {
  id: string;
  expense_number: string;        // ex: "DEP-NIA-2026-00124"
  agency_id: string;
  
  // Classification comptable SYSCOHADA
  syscohada_account_code: string; // ex: "6051" (Fournitures), "6221" (Loyers), "612" (Carburant)
  category: 'RENT' | 'UTILITIES' | 'FUEL_TRANSPORT' | 'OFFICE_SUPPLIES' | 'MARKETING_ADS' | 'FEES_LEGAL' | 'MAINTENANCE' | 'SALARIES' | 'OTHER';
  
  label: string;                  // Description claire de la dépense
  amount_xof: number;             // Montant en FCFA
  payment_method: 'CASH_DESK' | 'BANK_TRANSFER' | 'CHECK' | 'MOBILE_MONEY';
  cash_register_session_id?: string; // Si décaissé de la caisse physique
  bank_account_id?: string;       // Si payé par banque
  
  // Pièce justificative & Fournisseur
  supplier_name: string;          // Nom du commerçant / prestataire
  supplier_nif?: string;
  supplier_phone?: string;
  invoice_number?: string;
  invoice_scan_url?: string;
  receipt_type: 'NORMALIZED_INVOICE' | 'STANDARD_RECEIPT' | 'INFORMAL_VOUCHER' | 'MISSING_JUSTIFICATION';
  is_justified: boolean;
  
  // Traçabilité & Visas
  initiated_by_user_id: string;   // Demandeur
  approved_by_user_id?: string;   // Validateur (Directeur Agence / DAF / PDG)
  requires_ceo_approval: boolean; // Si > 1 000 000 FCFA
  ceo_approved: boolean;
  ceo_approval_timestamp?: string;
  
  // Imputation analytique
  allocated_subdivision_id?: string; // Si la dépense concerne un lotissement précis
  
  expense_date: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED_PAID' | 'REJECTED' | 'CANCELLED_AUDITED';
  created_at: string;
  updated_at: string;
}
```

---

## 5. 💸 MATRICE OFFICIELLE DES PERMISSIONS : DÉPENSES & ENGAGEMENTS (MODULE 24)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 5.1. 💸 Dépenses, Charges d'Exploitation & Justificatifs

| Action Dépenses | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Créer / Enregistrer une dépense** | ➕ | ➕ (Gestionnaire clé)| 🔒 (Pas d'écriture)| 🔒 | ➕ (Selon budget agence)| 🔒 |
| **Joindre une pièce justificative** | 👁️ / 📎 | 📎 (Scan facture/décharge)| 🔒 | 🔒 | 📎 (Justificatif local)| 🔒 |
| **Corriger selon workflow d'audit** | 👑 / ✏️ | ✏️ (Rectification auditée)| 🔒 | 🔒 | 🔒 | 🔒 |
| **Suivre les engagements & charges** | 👁️ (Analytique global)| 👁️ (Complet SYSCOHADA)| 🔒 | 🔒 | 👁️ (Charges agence) | 👁️ (Système)|
| **Valider une dépense standard** | 👑 | ✅ (Selon seuils)| 🔒 | 🔒 | ✅ (Seuil $\le 50k$ FCFA)| 🔒 |
| **Autoriser exception / Dépense lourde**| 🔴 👑 (Visa Souverain)| 📤 (Demande arbitrage)| 🔒 | 🔒 | 📤 (Transmission) | 🔒 |

---

## 6. 🔄 RÈGLES DE CONTRÔLE INTERNE & AUDIT DU DOMAINE 12
- **Le Radar des Justificatifs Manquants** : Toute dépense enregistrée avec le statut `MISSING_JUSTIFICATION` reste mise en surbrillance rouge dans le Cockpit Comptable jusqu'à l'upload de la pièce scannée.
- **Imputation Analytique par Lotissement** : Si une charge concerne directement l'entretien ou la promotion d'un lotissement spécifique, elle s'impute dans son compte de coût de revient sans gonfler artificiellement les frais généraux du Siège.
- **Zéro `DELETE`** : Une dépense erronée ou annulée fait l'objet d'une contre-passation comptable auditée avec motif obligatoire et conservation inaltérable de la trace initiale.
