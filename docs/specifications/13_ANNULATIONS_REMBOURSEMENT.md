# ⚖️ SPÉCIFICATION 13 : RÉSILIATIONS, CLAUSE DE SUBSTITUTION, RETENUES & DÉDOMMAGEMENTS
**Inventaire Fonctionnel Détaillé des Modules 20 (Annulations & Retenues Modulables) & 21 (Plans de Remboursements & Traçabilité Comptable)**

---

## 1. 🔄 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 20. GESTION DES ANNULATIONS & RÉSILIATIONS

Le module **20. ANNULATIONS** régit les demandes de désistement, l'arbitrage du taux de retenue et la libération du stock :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 20. GESTION DES ANNULATIONS                                 ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. PROCESSUS D'INSTRUCTION DE LA DEMANDE D'ANNULATION                                                                ║
║    • Demande d'annulation formelle : Saisie du motif circonstancié (Difficulté financière, cas de force majeure...)   ║
║    • Analyse préalable & tentative de médiation : Proposition de substitution (Article 6 Convention)                  ║
║    • Validation souveraine du PDG : Acceptation formelle ou Refus motivé                                             ║
║    • Calcul de la Retenue Compensatoire :                                                                            ║
║      - Retenue standard contractuelle : 20% des sommes effectivement versées                                         ║
║      - Dérogations & Accords personnalisés du PDG : 15%, 10%, 5% ou 0% (remboursement intégral gracieux)             ║
║    • Génération de la Décharge Juridique (DECH-AAAA-XXXXX) signée et légalisée                                       ║
║    • Libération immédiate de la parcelle : Retour instantané en statut DISPONIBLE (🟢) pour revente                   ║
║    • Création de la Créance de Remboursement au passif : Numéro unique RMB-AAAA-XXXXX                                ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 💸 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 21. GESTION DES REMBOURSEMENTS & DÉCAISSEMENTS

Le module **21. REMBOURSEMENTS** organise le décaissement ordonnancé des fonds et la transparence comptable :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 21. GESTION DES REMBOURSEMENTS                              ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. LIQUIDATION FINANCIÈRE & CALENDRIER DE DÉCAISSEMENT                                                               ║
║    • Montant total versé par l'acquéreur (Cumul exact des reçus RCP-)                                                ║
║    • Retenue déduite ($R_{\text{retenue}}$) validée par le PDG                                                       ║
║    • Montant net remboursable ($M_{\text{net}} = \text{Total versé} - \text{Retenue}$)                               ║
║    • Plan de remboursement paramétré :                                                                               ║
║      - Paiement immédiat unique (Trésorerie disponible)                                                              ║
║      - Paiement échelonné (ex: 2 à 3 tranches programmées à J+15, J+45, J+75)                                        ║
║    • Exécution des décaissements : Remboursement partiel, Remboursement final soldé                                   ║
║    • Reçus de décaissement & Suivi du solde de créance restant en direct                                             ║
║    • Décharge finale signée et Clôture définitive du dossier                                                         ║
║                                                                                                                      ║
║ 2. 📊 TRAÇABILITÉ COMPTABLE SYSCOHADA DE LA RETENUE                                                                  ║
║    « La retenue prélevée doit être rigoureusement identifiable dans la comptabilité MSI comme un PRODUIT / REVENU     ║
║      DISTINCT (Compte SYSCOHADA 7078 / 758 Autres produits exceptionnels), et non absorbée silencieusement. »         ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. 🧭 LE PROTOCOLE EN 4 PHASES DE RÉSILIATION D'UN CONTRAT

La gestion des difficultés de paiement ou des demandes d'annulation suit un protocole juridique rigoureux en 4 étapes adossé aux Articles 6, 8, 9 et 10 de la Convention de Vente :

```text
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 1. ÉTAPE 1 : PROPOSITION DE SUBSTITUTION (ARTICLE 6 DE LA CONVENTION)   │
  │    Le client peut se faire substituer par un membre de sa famille ou un │
  │    tiers de son choix (acte écrit et signé) pour ne pas perdre le lot.   │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            │ (Substitution acceptée / Avenant)                   │ (Refus ou impossibilité)
            ▼                                                     ▼
  ┌────────────────────────────────────────┐            ┌────────────────────────────────────────┐
  │ ACTE DE SUBSTITUTION (AVN-)            │            │ 2. ÉTAPE 2 : ARBITRAGE DU TAUX DE      │
  │ Le repreneur poursuit les versements   │            │ RETENUE SOUVERAIN PAR LE PDG           │
  └────────────────────────────────────────┘            │ (Application du 20% ou dérogation PDG) │
                                                        └────────────────────────────────────────┘
                                                                      │
                                                                      ▼
                                                        ┌────────────────────────────────────────┐
                                                        │ 3. ÉTAPE 3 : ÉMISSION DE LA CRÉANCE    │
                                                        │ DE REMBOURSEMENT (Réf : RMB-AAAA-XXXXX)│
                                                        │ PV de Résiliation scellé + Calendrier  │
                                                        └────────────────────────────────────────┘
                                                                      │
                                                                      ▼
                                                        ┌────────────────────────────────────────┐
                                                        │ 4. ÉTAPE 4 : LIBÉRATION DE LA PARCELLE │
                                                        │ & DÉCAISSEMENT PROGRAMMÉ DU CASH       │
                                                        │ Signature Décharge DECH- + Revente (🟢)│
                                                        └────────────────────────────────────────┘
```

---

## 2. 🧮 LES FORMULES FINANCIÈRES DE CALCUL DU REMBOURSEMENT & DE LA RETENUE

### 2.1. Calcul de la Retenue Réglementaire ($R_{\text{retenue}}$)
Conformément aux conditions générales contractuelles de vente immobilière, une retenue forfaitaire compensatoire pour frais de gestion de dossier, immobilisation foncière et démarches commerciales est applicable sur le **total des montants effectivement versés** :

$$R_{\text{retenue}} = \text{Total\_Versé\_Client} \times \tau_{\text{retenue}}$$

Où :
- $\text{Total\_Versé\_Client}$ : Cumul exact des encaissements enregistrés sur le contrat ($A_{\text{init}} + \sum \text{Mensualités}$).
- $\tau_{\text{retenue}}$ : Taux de retenue contractuel standard fixé à **$20\%$ ($0.20$)**.

### 2.2. L'Arbitrage Souverain du PDG (Dérogation & Modulation du Taux)
> **Pouvoir Exclusif du PDG :**  
> Seul le PDG a l'autorité légale de moduler ce taux :
> - **Maintien du taux standard** : $\tau_{\text{retenue}} = 20\%$ (Cas général).
> - **Réduction exceptionnelle de bienveillance** : $\tau_{\text{retenue}} = 10\%$ ou $5\%$ (ex: motif de santé grave, décès d'un proche).
> - **Exonération totale gracieuse** : $\tau_{\text{retenue}} = 0\%$ (Remboursement intégral de $100\%$ des sommes versées).

### 2.3. Calcul du Montant Net à Rembourser au Client ($M_{\text{net\_remboursement}}$)
$$M_{\text{net\_remboursement}} = \text{Total\_Versé\_Client} - R_{\text{retenue}}$$

---

## 3. 📄 LA CRÉANCE DE REMBOURSEMENT (`RMB-AAAA-XXXXX`) & LA DÉCHARGE LÉGALISÉE (`DECH-AAAA-XXXXX`)

Pour préserver la trésorerie opérationnelle de l'entreprise sans léser le client sortant :

```text
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ ÉTAT DE LIQUIDATION DU CONTRAT N° CTR-2025-00042                                                     ║
║ Client : M. OUMAROU MOCTAR | Parcelle : GOUDEL-I02-L08 (Libérée en Vente 🟢)                          ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ Total des Sommes Versées par le Client :             1 800 000 FCFA                                   ║
║ Retenue Réglementaire Appliquée (20%) :            -   360 000 FCFA (Audit Visa PDG OK)               ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ NET DE CRÉANCE À REMBOURSER AU CLIENT (RMB-2026-00008) : 1 440 000 FCFA                              ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ ÉCHÉANCIER DE DÉCAISSEMENT PROGRAMMÉ :                                                               ║
║ • Tranche 1 (J+15 après résiliation) : 720 000 FCFA (Virement Bancaire / Chèque)                     ║
║ • Tranche 2 (J+45 après résiliation) : 720 000 FCFA (Virement Bancaire / Chèque)                     ║
╠═══════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ DÉCHARGE CLIENT SCELLÉE (DECH-2026-00008) : Renonciation définitive de propriété signée & légalisée ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 4. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Dossier de Résiliation & Remboursement
export interface ContractTermination {
  id: string;
  termination_number: string;     // ex: "RESIL-2026-00015"
  refund_credit_number: string;   // ex: "RMB-2026-00015"
  discharge_reference: string;    // ex: "DECH-2026-00015"
  contract_id: string;
  client_id: string;
  parcel_id: string;
  agency_id: string;
  
  // Phase 1 : Médiation
  mediation_notes: string;        // Résumé obligatoire des échanges préalables
  mediation_held_at: string;
  mediation_agent_id: string;
  client_agreed_to_terminate: boolean;
  
  // Données financières
  total_paid_by_client_xof: number; // Somme des reçus RCP-
  standard_penalty_rate_percent: number; // 20%
  applied_penalty_rate_percent: number;  // Taux après décision PDG (0 à 20%)
  penalty_amount_deducted_xof: number;
  net_refund_amount_xof: number;
  
  // Décision Souveraine PDG
  ceo_approval_user_id: string;
  ceo_decision_timestamp: string;
  ceo_justification_notes: string;
  
  // Décaissement et exécution du remboursement
  disbursement_plan_type: 'SINGLE_PAYMENT' | 'INSTALLMENTS_2' | 'INSTALLMENTS_3';
  total_disbursed_xof: number;
  remaining_to_disburse_xof: number;
  is_fully_refunded: boolean;
  
  // PV officiel et décharge
  termination_letter_scan_url?: string;
  signed_client_discharge_url?: string; // PV Décharge DECH- signé et légalisé
  
  status: 'MEDIATION_FAILED' | 'PENDING_CEO_APPROVAL' | 'APPROVED_SCHEDULED' | 'PARTIALLY_REFUNDED' | 'FULLY_REFUNDED_CLOSED';
  created_at: string;
  updated_at: string;
}

// Entité Ligne de Décaissement de Remboursement
export interface TerminationDisbursement {
  id: string;
  termination_id: string;
  tranche_number: number;
  due_date: string;
  amount_xof: number;
  paid_date?: string;
  payment_method?: 'BANK_TRANSFER' | 'CHECK' | 'CASH_DESK';
  payment_ref?: string;
  is_executed: boolean;
  accountant_user_id?: string;
  created_at: string;
}
```

---

## 5. ⚖️ MATRICE OFFICIELLE DES PERMISSIONS : ANNULATIONS & REMBOURSEMENTS (MODULES 20 & 21)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 5.1. 🔄 Annulations & Résiliations de Contrats (Zone Très Sensible)

| Action Annulations | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Demander / Initier une annulation** | 👁️ | 👁️ | 📤 (Dossier/Demande)| 📤 (Demande client)| 📤 (Recommander/Préparer)| 🔒 |
| **Vérifier l'historique financier** | 👁️ | ✅ (Contrôle sommes versées)| 🔒 | 🔒 | 👁️ (Données agence)| 🔒 |
| **Arbitrer le taux de retenue (20% / Dérog)**| 🔴 👑 (Exclusif)| 🔒 (Calcule selon décision)| 🔒 | 🔒 | 🔒 (Avis consultatif)| 🔒 |
| **Décision finale d'annulation** | 🟢 👑 (Souverain)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Exécution automatique système :** | | | | | | |
| • *Contrat annulé & archivé* | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) |
| • *Parcelle libérée en Disponible (🟢)* | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) |
| • *Calcul retenue & Création créance (RMB-)*| ⚡ (Auto) | ⚡ (Auto) | 🔒 | 🔒 | ⚡ (Auto) | ⚡ (Auto) |
| • *Génération PV Décharge (DECH-)* | ⚡ (Auto) | ⚡ (Auto) | 📄 | 📄 | ⚡ (Auto) | ⚡ (Auto) |
| • *Audit trail complet de l'opération* | ⚡ (Auto) | ⚡ (Auto) | 🔒 | 🔒 | ⚡ (Auto) | ⚡ (Auto) |

### 5.2. 💰 Remboursements Acquéreurs & Décaissements

| Action Remboursements | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Préparer l'échéancier de remboursement**| 👁️ | ➕ / 🧮 (Préparation)| 🔒 | 🔒 | 👁️ | 🔒 | 🔒 |
| **Autoriser le remboursement / Échéancier**| 🔴 👑 (Visa Souverain)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Modifier / Accorder une exception** | 🔴 👑 (Visa Souverain)| 📤 (Demande)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Enregistrer le paiement (Décaissement)**| 👑 / 💰 | 💰 / ✅ (Exécution)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Suivre les tranches restant dues** | 👁️ (Synthèse passif)| 👁️ (Complet)| 🔒 | 🔒 | 👁️ (Agence)| 👁️ | 👁️ (Sa créance)|
| **Clôturer le dossier lorsque soldé** | 👑 / ✅ | ✅ (Clôture après décharge)| 🔒 | 🔒 | 👁️ | 🔒 | 🔒 |

---

## 6. 🔄 RÈGLES DE SÉCURITÉ, RECLASSEMENT DU STOCK & AUDIT
- **Libération Immédiate de la Parcelle** : Dès que le visa du PDG est scellé sur la résiliation, la parcelle repasse **instantanément en statut DISPONIBLE (🟢)** dans le catalogue commercial.
- **Enregistrement Obligatoire de la Décharge DECH-** : Lors de la remise de la dernière tranche de remboursement, la signature d'une **Décharge Légalisée de Renonciation de Propriété (`DECH-`)** est obligatoire et scannée dans le coffre-fort client.
- **Écritures Comptables SYSCOHADA** :
  - Constatation de la retenue au crédit du compte *7078 - Autres produits accessoires / Pénalités sur résiliation*.
  - Solde du compte client *4111 - Clients acquéreurs*.
- **Zéro `DELETE`** : L'intégralité du contrat résilié, des reçus d'origine et du journal de remboursement reste consultable à vie.
