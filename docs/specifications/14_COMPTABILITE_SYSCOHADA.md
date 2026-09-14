# 🧮 SPÉCIFICATION 14 : COMPTABILITÉ GÉNÉRALE SYSCOHADA, ÉCRITURES & ÉTATS FINANCIERS
**Inventaire Fonctionnel Détaillé du Module 26 (Plan Comptable OHADA, Journaux, Grand Livre, Balance & Exports)**

---

## 1. 📚 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 26. MOTEUR COMPTABLE SYSCOHADA RÉVISÉ

Le système **MSI 2.0** intègre un véritable moteur comptable en partie double automatisé et conforme aux normes OHADA :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 26. COMPTABILITÉ SYSCOHADA                                 ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. ARCHITECTURE COMPTABLE DU SYSTÈME MSI 2.0                                                                        ║
║    • Plan Comptable Général OHADA paramétrable (Classes 1 à 8 avec sous-comptes spécifiques Foncier)                 ║
║    • Gestion des Comptes Généraux et des Comptes Auxiliaires (Clients 4111, Fournisseurs 4011, Banques 5211...)      ║
║    • Journaux Comptables Auxiliaires :                                                                               ║
║      - Journal des Ventes (VT) : Constatation des contrats de vente de parcelles (CTR-)                              ║
║      - Journal de Caisse & Trésorerie (CA) : Encaissements (RCP-) et décaissements de menues dépenses                ║
║      - Journal de Banque (BQ) : Opérations bancaires (SONIBANK, BOA, BIA, BSIC) et Mobile Money                      ║
║      - Journal des Opérations Diverses (OD) : Résiliations, retenues 20%, extournes et régularisations              ║
║    • Saisie & Génération automatique d'Écritures en Partie Double (Débits = Crédits stricts)                         ║
║                                                                                                                      ║
║ 2. LIVRES, ÉTATS FINANCIERS & EXPORTS COMPTABLES                                                                     ║
║    • Grand Livre Général & Grands Livres Auxiliaires (Lettrage automatique)                                          ║
║    • Balance Générale des Comptes (6 colonnes : Soldes d'ouverture, Mouvements Débit/Crédit, Soldes de clôture)      ║
║    • Compte de Résultat intermédiaire (Charges de classe 6 vs Produits de classe 7)                                  ║
║    • Bilan Actif / Passif & Tableau des Flux de Trésorerie                                                           ║
║    • Suivi des Coûts Fonciers & Immobilisations (Terrains mères, viabilisation, matériels d'exploitation)            ║
║    • Export Comptable Normalisé (Format Excel / CSV / FEC compatible avec les logiciels comptables Sage / Odoo)      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🧭 L'ARCHITECTURE DU MOTEUR COMPTABLE SYSCOHADA DE MSI 2.0

Le système MSI 2.0 intègre un moteur comptable sous-jacent qui traduit instantanément chaque transaction opérationnelle (vente, encaissement, dépense, résiliation, retenue) en **écritures comptables en partie double** selon le plan comptable général **SYSCOHADA Révisé** :

```text
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 1. ÉVÉNEMENT OPÉRATIONNEL (Vente, Reçu RCP-, Dépense, Résiliation RMB-) │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 2. GÉNÉRATEUR AUTOMATIQUE D'ÉCRITURES SYSCOHADA (Partie Double)         │
  │    Débit (Compte X) = Crédit (Compte Y) — Équilibre Mathématique Stricte│
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
  ┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
  │ 3. JOURNAUX AUXILIAIRES  │  │ 4. GRAND LIVRE DES       │  │ 5. BALANCE GÉNÉRALE      │
  │ • Journal des Ventes (VT)│  │    COMPTES OHADA         │  │    DES COMPTES (6 col)   │
  │ • Journal Trésorerie (CA)│  │ • Compte 4111 (Clients)  │  │ • Soldes Débiteurs       │
  │ • Journal Banque (BQ)    │  │ • Compte 5211 (Banques)  │  │ • Soldes Créditeurs      │
  │ • Journal Opér. Div. (OD)│  │ • Compte 7011 (Ventes)   │  │ • Contrôle de clôture    │
  └──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
```

---

## 2. 📑 PLAN DE COMPTES SPÉCIFIQUE IMMOBILIER & FONCIER (CLASSES 1 À 8)

Le plan comptable configuré pour l'activité foncière et minière de MSI s'articule comme suit :

```text
  ┌─────────┬──────────────────────────────────────────────────────────────────────────────────┐
  │ Classe  │ Rôle & Principaux Comptes Utilisés                                               │
  ├─────────┼──────────────────────────────────────────────────────────────────────────────────┤
  │ Cl. 1   │ RESSOURCES DURABLES : 1013 Capital social, 162 Emprunts bancaires.               │
  │ Cl. 2   │ ACTIF IMMOBILISÉ : 211 Terrains propres, 245 Matériel et mobilier.              │
  │ Cl. 3   │ STOCKS FONCIERS : 311 Terrains bruts acquis, 331 Terrains en cours d'aménag.    │
  │ Cl. 4   │ TIERS : 4011 Fournisseurs géomètres, 4111 Clients acquéreurs, 471 Débiteurs div.│
  │ Cl. 5   │ TRÉSORERIE : 5211 Banques (SONIBANK/BOA/BIA), 5711 Caisse Maradi, 5712 Niamey... │
  │ Cl. 6   │ CHARGES D'EXPLOITATION : 605 Achats études/géomètre, 613 Loyers, 624 Transports.│
  │ Cl. 7   │ PRODUITS D'EXPLOITATION : 7011 Ventes parcelles, 7078 Pénalités résiliation 20%.│
  │ Cl. 8   │ OPÉRATIONS EXTRAORDINAIRES : 831 Charges exceptionnelles, 841 Produits except.   │
  └─────────┴──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ⚖️ LES 4 SCHÉMAS D'ÉCRITURES COMPTABLES AUTOMATIQUES MAJEURS

### 3.1. Schéma 1 : Signature d'un Contrat de Vente Foncier (`CTR-`)
Constatation de la créance sur l'acquéreur et du produit des ventes :
- **Débit :** `4111.CLT_XXXX` (Compte individuel Client Acquéreur) $\rightarrow$ *Montant Total Net du Contrat*.
- **Crédit :** `7011.LOT_XXXX` (Ventes de terrains aménagés par lotissement) $\rightarrow$ *Montant Total Net du Contrat*.

### 3.2. Schéma 2 : Encaissement d'une Mensualité ou Acompte (`RCP-`)
Constatation de l'entrée de fonds en trésorerie et réduction de la dette du client :
- **Débit :** `5711` (Caisse Agence) OU `5211` (Banque) OU `5731` (Mobile Money Nita/Airtel) $\rightarrow$ *Montant Encaissé*.
- **Crédit :** `4111.CLT_XXXX` (Compte individuel Client Acquéreur) $\rightarrow$ *Montant Encaissé*.

### 3.3. Schéma 3 : Dépense d'Exploitation avec Bon de Caisse (`DEP-`)
Constatation de la charge et sortie de trésorerie :
- **Débit :** `6051` (Frais de géomètre / travaux) OU `6131` (Loyer agence) OU `6241` (Carburant / Déplacement) $\rightarrow$ *Montant Dépensé*.
- **Crédit :** `5711` (Caisse Agence) OU `5211` (Banque) $\rightarrow$ *Montant Dépensé*.

### 3.4. Schéma 4 : Résiliation avec Retenue Réglementaire de 20% (`RMB-`)
Extinction de la dette initiale, constatation du produit de pénalité et de la dette de remboursement :
- **Débit :** `7011.LOT_XXXX` (Annulation du produit de vente initial) $\rightarrow$ *Montant Total Contrat Annulé*.
- **Crédit :** `4111.CLT_XXXX` (Solde de la créance initiale) $\rightarrow$ *Solde restant impayé*.
- **Crédit :** `7078` (Pénalités et retenues acquises sur résiliation 20%) $\rightarrow$ *Montant Retenue*.
- **Crédit :** `4712` (Dette de remboursement envers le client RMB-) $\rightarrow$ *Montant Net à Reverser*.

---

## 4. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Compte du Plan Comptable SYSCOHADA
export interface SyscohadaAccount {
  id: string;
  account_number: string;         // ex: "41110001", "70110002", "57110001"
  account_class: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  label: string;                  // ex: "Clients - Acquéreurs Fonciers", "Caisse Principale Maradi"
  account_type: 'ASSET' | 'LIABILITY' | 'EXPENSE' | 'REVENUE';
  is_auxiliary: boolean;          // True si compte auxiliaire rattaché à un client ou fournisseur
  parent_account_number?: string; // ex: "4111"
  is_active: boolean;
}

// Entité Pièce / Écriture Comptable
export interface AccountingJournalEntry {
  id: string;
  entry_number: string;           // Numéro séquentiel : "ECR-2026-000458"
  journal_code: 'VT' | 'CA' | 'BQ' | 'OD'; // Ventes, Caisse, Banque, Opérations Diverses
  accounting_date: string;        // Date de valeur comptable
  agency_id: string;
  
  // Rapprochement avec l'acte de gestion d'origine
  source_document_type: 'CONTRACT_CTR' | 'RECEIPT_RCP' | 'EXPENSE_DEP' | 'REFUND_RMB' | 'CASH_DISCREPANCY';
  source_document_id: string;
  source_reference: string;       // ex: "RCP-2026-00142", "CTR-2026-00089"
  
  label: string;                  // Libellé de l'écriture
  debit_account_number: string;
  credit_account_number: string;
  amount_xof: number;             // Montant en FCFA (Égalité Débit = Crédit)
  
  is_validated: boolean;
  validated_by_user_id?: string;
  created_at: string;
}
```

---

## 5. 🔄 RÈGLES D'INTÉGRITÉ COMPTABLE, LETTRAGE & VERROUILLAGE D'EXERCICE
- **Équilibre Arithmétique Strict (Partie Double)** : Aucune écriture ne peut être enregistrée si $\sum \text{Débits} \neq \sum \text{Crédits}$ sur les lignes de `accounting_entry_lines`.
- **Immuabilité des Écritures Validées (WORM)** : Une écriture comptable validée et clôturée ne peut être ni modifiée ni supprimée (`ZERO DELETE`). Toute correction s'effectue par **extourne (contre-passation)** dans le journal des Opérations Diverses (`OD`) ou par `payment_reversals`.
- **Lettrage Automatique** : Le système lettre automatiquement les écritures du compte client `4111` à chaque émission de reçu `RCP-` via `reconciled_letter`.
- **Verrouillage Irréversible des Périodes Clôturées (`accounting_periods`)** :
  - Dès qu'une période mensuelle ou annuelle est marquée `is_locked = true` par le Chef Comptable / PDG, le trigger `trg_enforce_period_lock_entries` interdit définitivement toute insertion, mise à jour ou suppression d'écritures rattachées à cette période.
- **Rapprochement Bancaire Mensuel (`bank_reconciliations` & `bank_statements`)** :
  - Confrontation mathématique entre le solde comptable du grand livre (Compte $5211$) et le solde du relevé bancaire importé.
  - Traçabilité des chèques en circulation et des dépôts en cours d'encaissement pour justifier tout écart de trésorerie.

---

## 6. 📚 MATRICE OFFICIELLE DES PERMISSIONS : COMPTABILITÉ SYSCOHADA (MODULE 26)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 6.1. 📚 Comptabilité Générale & Analytique (SYSCOHADA Révisé)

| Action Comptabilité | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Plan comptable & Paramétrage comptes** | 👁️ | ➕ / ✏️ (Maître du plan)| 🔒 | 🔒 | 🔒 | ⚙️ (Structure DB) |
| **Journaux & Saisie écritures (Partie double)**| 👁️ | ➕ / 💰 (Opérationnel clé)| 🔒 | 🔒 | 🔒 | 🔒 (Pas d'écriture)|
| **Rapprochements bancaires & caisse** | 👁️ | ✅ (Exécution mensuelle)| 🔒 | 🔒 | 👁️ (Caisse locale)| 🔒 |
| **Clôtures périodiques & Arrêtés** | 👑 / ✅ | ✅ (Opérationnel)| 🔒 | 🔒 | 🔒 | ⚙️ (Verrouillage DB)|
| **Rapports & États financiers (Bilan, CR)**| 👁️ (Stratégique)| 👁️ / 📄 / 📥 (Complet)| 🔒 | 🔒 | 👁️ (Rapports limités agence)| 👁️ (Logs)|
| **Analyse analytique par lotissement** | 👁️ (Marges/Rentabilité)| 👁️ (Complet)| 🔒 | 🔒 | 👁️ (Son agence) | 🔒 |

### 📌 Répartition Détaillée des Rôles sur la Comptabilité :
- **📊 Comptable (Profil Principal / Maître d'Œuvre) :** Gestion complète du plan de comptes, journaux, écritures, rapprochements, balances, grands livres, clôtures périodiques et états financiers SYSCOHADA.
- **👑 PDG :** Consultation intégrale, supervision des équilibres financiers généraux, validation des clôtures d'exercice et analyse des rapports de synthèse.
- **🏢 Responsable d'agence :** Consultation restreinte aux rapports analytiques d'exploitation de sa propre agence.
- **🧑💼 Secrétaire & 📣 Commercial :** 🔒 **Accès totalement interdit** à la comptabilité générale.
- **🛠️ Admin technique :** ⚙️ Configuration technique de la base de données, sans aucune possibilité d'altérer ou d'écrire des écritures comptables métier.
