# 🏦 SPÉCIFICATION 11 : CAISSE PHYSIQUE, GESTION DES ÉCARTS & TRÉSORERIE CONSOLIDÉE
**Inventaire Fonctionnel Détaillé des Modules 23 (Caisse & Écarts) & 25 (Supervision de Trésorerie Consolidée)**

---

## 1. 🏦 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 23. GESTION DE LA CAISSE & PROTOCOLE D'ÉCART

Le module **23. CAISSE** assure le contrôle opérationnel des espèces en agence et garantit qu'aucun écart ne disparaisse silencieusement :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 23. GESTION DE LA CAISSE                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. OUVERTURE DE CAISSE                                                                                               ║
║    • Solde initial constaté (Fond de roulement physique en coffre)                                                   ║
║    • Responsable de caisse désigné (Caissière titulaire ou remplaçante)                                              ║
║    • Date et heure exacte d'ouverture de session (ex: 07h45 UTC+1)                                                  ║
║                                                                                                                      ║
║ 2. FLUX PENDANT LA JOURNÉE                                                                                           ║
║    • Encaissements clients (Versements espèces avec reçus RCP- délivrés)                                             ║
║    • Dépenses & Menus frais (Bons de décaissements validés BDC-)                                                     ║
║    • Autres entrées (Alimentation de caisse depuis la banque, apports)                                               ║
║    • Autres sorties (Versements d'espèces sur les comptes bancaires de l'entreprise)                                 ║
║                                                                                                                      ║
║ 3. CLÔTURE DE CAISSE EN FIN DE JOURNÉE                                                                               ║
║    • Calcul du Solde Théorique : $S_{\text{théorique}} = S_{\text{init}} + \text{Entrées} - \text{Sorties}$          ║
║    • Comptage Réel & Billetage physique (Coupures de 10 000, 5 000, 2 000, 1 000, 500, pièces)                     ║
║    • Calcul automatique de l'Écart : $\Delta_{\text{caisse}} = S_{\text{réel}} - S_{\text{théorique}}$              ║
║    • Historique inaltérable de la session et archivage de clôture                                                    ║
║                                                                                                                      ║
║ 4. 🛡️ PROTOCOLE OFFICIEL DU TRAITEMENT DES ÉCARTS DE CAISSE                                                         ║
║    « APPROCHE RETENUE : CLÔTURE AUTORISÉE + ANOMALIE OBLIGATOIRE + JUSTIFICATION + NOTIFICATION PDG + AUDIT PERMANENT »║
║    • La clôture ne doit jamais être bloquée inutilement (afin de ne pas paralyser le fonctionnement de l'agence),    ║
║    • MAIS un écart constaté ne peut JAMAIS disparaître silencieusement :                                             ║
║      - Enregistrement immédiat d'une anomalie rouge permanente dans le journal d'audit,                              ║
║      - Saisie d'une justification circonstanciée obligatoire par le responsable de caisse,                           ║
║      - Envoi instantané d'une alerte au PDG et au Chef Comptable,                                                    ║
║      - Traitement comptable SYSCOHADA (Compte d'écart en instance 471 / Compte de régularisation).                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 📊 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 25. SUPERVISION DE TRÉSORERIE CONSOLIDÉE

Le module **25. TRÉSORERIE** offre une vue panoramique et en temps réel de la liquidité globale de l'entreprise :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 25. SUPERVISION DE TRÉSORERIE                              ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. CONSOLIDATION MULTI-CANAUX EN TEMPS RÉEL                                                                          ║
║    • Solde Actuel Global & Disponibilités immédiates (Caisses + Banques + Comptes Mobile Money)                      ║
║    • Total des Entrées de la période (Encaissements contrats, acomptes, apports)                                     ║
║    • Total des Sorties de la période :                                                                               ║
║      - Dépenses & Charges de fonctionnement                                                                          ║
║      - Remboursements nets décaissés aux acquéreurs désistés                                                         ║
║      - Décaissements pour travaux et acquisitions foncières                                                          ║
║    • Solde Théorique calculé automatiquement & Rapprochement bancaire                                                ║
║    • Historique complet et inaltérable des flux de trésorerie                                                        ║
║                                                                                                                      ║
║ 2. ANALYSE MULTI-DIMENSIONNELLE                                                                                      ║
║    • Situation de Trésorerie par Période (Journalière, Hebdomadaire, Mensuelle, Trimestrielle, Annuelle)              ║
║    • Situation de Trésorerie par Agence (Siège Ali Dan Sofo, Maradi, Niamey, Tahoua, Zinder, etc.)                  ║
║    • Situation par Compte Financier (SONIBANK, BOA, BIA, Nita, Airtel Money, Caisse physique)                        ║
║    • Prévisionnel de trésorerie & Alertes de seuil minimum de liquidité                                              ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. 🧭 LE CYCLE QUOTIDIEN DE GESTION DE CAISSE (OUVERTURE ──► CLÔTURE)

Chaque agence ou point d'encaissement MSI dispose d'une **Caisse Physique** soumise à un protocole journalier strict et audité :

```text
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 1. OUVERTURE DE CAISSE (Matinée - Prise de Service)                     │
  │    Vérification du Fond de Roulement / Solde d'Ouverture                │
  │    (Saisie obligatoire du montant physique initial en coffre)          │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 2. OPÉRATIONS DE LA JOURNÉE (Flux en Direct)                           │
  │    • (+) Encaissements Clients (Reçus RCP- générés)                     │
  │    • (-) Dépenses Décaissements Menus (Bons de Caisse Dépense validés)  │
  │    • (-) Dépôts / Versements en Banque (Bordereaux de transfert)       │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 3. CLÔTURE DE CAISSE & COMPTAGE PHYSIQUE DES BILLETS (Fin de Journée)   │
  │    Comptage physique des coupures (10 000, 5 000, 2 000, 1 000, 500...) │
  │    Comparaison automatique : Solde Physique vs Solde Théorique Calculé  │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            │                                                     │
            ▼ (Si Solde Physique = Solde Théorique)               ▼ (Si Écart de Caisse != 0 FCFA)
  ┌────────────────────────────────────────┐            ┌────────────────────────────────────────┐
  │ PROCÈS-VERBAL DE CLÔTURE PARFAIT       │            │ PROTOCOLE DE JUSTIFICATION D'ÉCART     │
  │ Validation & Verrouillage de la session│            │ Justification écrite + Alerte Rouge PDG│
  └────────────────────────────────────────┘            └────────────────────────────────────────┘
```

---

## 2. 🧮 FORMULES DU SOLDE THÉORIQUE & TRAITEMENT DES ÉCARTS DE CAISSE

### 2.1. Calcul du Solde Théorique de Fin de Journée ($S_{\text{théorique}}$)
$$S_{\text{théorique}} = S_{\text{ouverture}} + \sum \text{Encaissements\_Jour} - \sum \text{Décaissements\_Jour} - \sum \text{Dépôts\_Banque}$$

### 2.2. Calcul de l'Écart de Caisse ($\Delta_{\text{caisse}}$) & Grille de Billetage
Soit $S_{\text{physique}}$ le résultat du comptage matériel des billets et pièces en caisse consigné dans la table `cash_session_denominations` :
$$S_{\text{physique}} = (N_{10000} \times 10\,000) + (N_{5000} \times 5\,000) + (N_{2000} \times 2\,000) + (N_{1000} \times 1\,000) + (N_{500} \times 500) + \text{Pièces}$$
$$\Delta_{\text{caisse}} = S_{\text{physique}} - S_{\text{théorique}}$$

- **Si $\Delta_{\text{caisse}} = 0\text{ FCFA}$** : Caisse équilibrée $\rightarrow$ Clôture validée.
- **Si $\Delta_{\text{caisse}} < 0\text{ FCFA}$ (Déficit de Caisse)** :
  - **Alerte immédiate** transmise au PDG et au Chef Comptable.
  - Saisie obligatoire d'un **Procès-Verbal de Justification d'Écart** par le caissier ($\ge 10$ caractères).
  - Enregistrement comptable de la créance / régularisation.
- **Si $\Delta_{\text{caisse}} > 0\text{ FCFA}$ (Excédent de Caisse)** :
  - Mise en réserve et enregistrement au compte d'attente avec justification obligatoire.

---

## 3. 🏦 GESTION MULTI-COMPTES BANCAIRES, DÉPÔTS D'ESPÈCES & TRÉSORERIE CONSOLIDÉE

MSI 2.0 gère la cartographie complète des avoirs bancaires et digitaux de l'entreprise :
- **Versements d'Espèces de la Caisse vers la Banque (`bank_deposits`)** :
  - Transfert scellé : Caisse d'agence ($5711$) $\rightarrow$ Banque ($5211$) via compte de virement interne ($5850$).
  - Bordereau de versement bancaire tamponné obligatoirement numérisé et rattaché à la transaction.
- **Comptes Bancaires Nationaux** :
  - Compte Principal SONIBANK (Opérations courantes, virements clients).
  - Compte BOA / BIA Niger (Dépôts des agences régionales, cautions, investissements).
- **Comptes Marchands Mobile Money** :
  - Compte Nita Pro, Al Izza Transfert, Airtel Money Entreprise.
- **Rapprochement Bancaire Périodique (`bank_reconciliations`)** :
  - Rapprochement entre les lignes du relevé bancaire (`bank_statements`) et les écritures du journal de banque.


---

## 4. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Session de Caisse Journalière
export interface CashRegisterSession {
  id: string;
  agency_id: string;
  session_number: string;         // ex: "CAISSE-NIA-2026-00084"
  cashier_user_id: string;        // Caissier responsable
  
  // Ouverture
  opened_at: string;
  opening_balance_xof: number;    // Solde d'ouverture physique constaté
  opening_notes?: string;
  
  // Flux de la session (Calculés en direct)
  total_inflows_cash_xof: number; // Somme des reçus espèces
  total_outflows_expense_xof: number; // Somme des dépenses décaissées
  total_bank_deposits_xof: number;    // Somme transférée à la banque
  theoretical_closing_balance_xof: number; // Solde théorique
  
  // Clôture
  closed_at?: string;
  physical_closing_balance_xof?: number; // Comptage physique réel
  cash_discrepancy_xof?: number; // physical - theoretical
  
  // Billetage détaillé (Dénombrement des coupures)
  denominations_count?: {
    bill_10000: number;
    bill_5000: number;
    bill_2000: number;
    bill_1000: number;
    bill_500: number;
    coins_total: number;
  };

  // Traitement d'écart
  has_discrepancy: boolean;
  discrepancy_reason?: string;
  discrepancy_approved_by_ceo: boolean;
  ceo_approval_notes?: string;

  status: 'OPEN' | 'CLOSING_PENDING_REVIEW' | 'CLOSED_BALANCED' | 'CLOSED_WITH_DISCREPANCY';
  created_at: string;
  updated_at: string;
}

// Entité Compte Bancaire / Mobile Money
export interface BankAccount {
  id: string;
  agency_id?: string;             // Null si compte Siège Global
  institution_name: string;       // ex: "SONIBANK", "BOA", "NITA TRANSFERT"
  account_type: 'BANK_CURRENT' | 'BANK_SAVINGS' | 'MOBILE_MONEY';
  account_number: string;         // RIB / N° Compte
  account_label: string;          // ex: "SONIBANK Compte Principal Recouvrement"
  current_balance_xof: number;    // Solde comptable
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 5. 🏦 MATRICE OFFICIELLE DES PERMISSIONS : CAISSE & TRÉSORERIE (MODULES 23 & 25)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 5.1. 🏦 Caisse Physique & Gestion des Écarts

| Action Caisse | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Ouverture de session de caisse** | 👁️ | ➕ (Responsable direct)| 🔒 (Pas d'écriture)| 🔒 | ➕ (Si caisse agence)| 🔒 |
| **Enregistrer entrées (Espèces)** | 💰 | 💰 (Opérationnel)| 🔒 | 🔒 | 💰 (Si caisse agence)| 🔒 |
| **Enregistrer sorties (Menus frais)** | 💰 | 💰 (Décaissements BDC)| 🔒 | 🔒 | 💰 (Selon délégation)| 🔒 |
| **Clôture & Billetage physique** | 👁️ / ✅ | ✅ (Comptage & clôture)| 🔒 | 🔒 | ✅ (Si caisse agence)| 🔒 |
| **Justifier un écart de caisse** | 👁️ / 👑 (Visa)| ✏️ (PV de justification)| 🔒 | 🔒 | ✏️ (PV agence local) | 🔒 |
| **Traitement anomalies & alertes**| 🔴 👑 (Arbitrage)| 👁️ (Signalement immédiat)| 🔒 | 🔒 | 👁️ (Son agence) | 🔒 |
| **Supervision de la trésorerie** | 👁️ (Consolidée 360°)| 👁️ (Complet)| 🔒 | 🔒 | 👁️ (Caisse agence) | 👁️ (Métriques) |

> **RÈGLE STRICTE SUR L'ADMIN TECHNIQUE :** L'administrateur technique a un **accès interdit (🔒)** sur les écritures comptables et financières métier pour empêcher tout « bricolage » des chiffres.

---

## 6. 🔄 RÈGLES DE SÉCURITÉ & AUDIT DU DOMAINE 11
- **Règle de Clôture Quotidienne Obligatoire** : Aucune session de caisse ne peut rester ouverte plus de **24 heures** ; le système bloque toute nouvelle saisie le lendemain matin tant que la caisse de la veille n'a pas été formellement clôturée.
- **Verrouillage Post-Clôture** : Une fois la session de caisse clôturée, **aucune opération ne peut y être rétroactivement ajoutée ou modifiée**. Tout ajustement doit être passé dans la session du jour ouvré suivant.
- **Audit des Transferts Inter-Comptes** : Tout virement de la Caisse physique vers la Banque génère une écriture double partie SYSCOHADA (Compte 585 - Virement interne).
