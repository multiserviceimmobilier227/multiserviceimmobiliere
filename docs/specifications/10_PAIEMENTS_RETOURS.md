# 💵 SPÉCIFICATION 10 : PAIEMENTS, ENCAISSEMENTS MULTI-CANAUX & REÇUS OFFICIELS
**Inventaire Fonctionnel Détaillé des Modules 16 (Paiements & Origines Trésorerie) & 17 (Reçus Mini-Bilan & Sécurité)**

---

## 1. 💳 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 16. GESTION DES PAIEMENTS & ENCAISSEMENTS

Le module **16. PAIEMENTS** centralise l'enregistrement, la sécurisation et la validation comptable des versements :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 16. GESTION DES PAIEMENTS                                  ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. ENREGISTREMENT & PARAMÈTRES DU PAIEMENT                                                                           ║
║    • Montant du versement : Montant net en FCFA (avec conversion en toutes lettres)                                  ║
║    • Date & Horodatage précis (Heure locale Niger UTC+1)                                                             ║
║    • Client associé (Fiche CLT-) & Contrat ciblé (CTR- / CONV-)                                                      ║
║    • Échéance(s) concernée(s) : Imputation automatique ou ciblée par le moteur financier                             ║
║    • Moyen / Origine de paiement :                                                                                   ║
║      - Espèces au guichet (Caisse physique d'agence)                                                                 ║
║      - Nita Transfert d'argent                                                                                       ║
║      - Airtel Money Niger                                                                                            ║
║      - Al Izza Transfert                                                                                             ║
║      - Virement Bancaire (SONIBANK, BOA, BIA, Banque Atlantique, BSIC)                                               ║
║      - Chèque certifié / à encaisser                                                                                 ║
║      - Autres moyens configurables dynamiquement                                                                     ║
║    • Référence de transaction externe : N° de bordereau bancaire, ID de transaction mobile money                     ║
║    • Commentaire & Justificatif obligatoire (Scan de bordereau, capture SMS certifiée)                               ║
║    • Statut du paiement : En attente de vérification, Confirmé/Validé, Rejeté, Annulé & Audité                       ║
║    • Validateur comptable : Identification stricte de la caissière/comptable ayant certifié les fonds                ║
║                                                                                                                      ║
║ 2. 🏛️ PRINCIPE MÉTIER DE CONSERVATION DE L'ORIGINE & INTÉGRATION TRÉSORERIE                                         ║
║    « Le moyen de paiement initial est rigoureusement conservé comme ORIGINE de traçabilité, tandis que les fonds    ║
║      retirés ou reçus sont automatiquement intégrés dans la trésorerie / caisse centrale MSI avec contrepartie       ║
║      comptable SYSCOHADA (Comptes 571 Caisse, 521 Banques, 512 Mobile Money). »                                      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🧾 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 17. REÇUS OFFICIELS & MINI-BILANS PATRIMONIAUX

Le module **17. REÇUS** délivre les quittances certifiées et garantit la transparence patrimoniale :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 17. REÇUS & MINI-BILANS                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. GÉNÉRATION AUTOMATIQUE & ÉLÉMENTS DE QUITTANCE                                                                    ║
║    • Numéro unique inaltérable : Séquentiel chronologique certifié (ex: RCP-2026-00342)                              ║
║    • Client & Contrat rattachés : Coordonnées complètes, lotissement, numéro d'îlot et de parcelle                   ║
║    • Montant encaissé : En chiffres et en toutes lettres                                                             ║
║    • Origine du paiement : Moyen utilisé et référence bancaire/transfert                                             ║
║    • Date, heure exacte et Utilisateur émetteur (Caissière / Comptable)                                              ║
║    • Signature numérique, cachet électronique officiel MSI & QR Code cryptographique de vérification               ║
║                                                                                                                      ║
║ 2. 📊 FONCTION DU REÇU COMME « MINI-BILAN FINANCIER COMPRÉHENSIBLE »                                                 ║
║    Chaque reçu délivré par MSI fonctionne comme un état patrimonial instantané et affiche obligatoirement :          ║
║    ┌────────────────────────────────────────────────────────────────────────────────────────┐                        ║
║    │ • Montant total du contrat :                    3 000 000 FCFA                         │                        ║
║    │ • Cumul payé avant ce reçu :                    1 200 000 FCFA                         │                        ║
║    │ • Montant du présent règlement :                + 200 000 FCFA                         │                        ║
║    │ • NOUVEAU CUMUL TOTAL PAYÉ :                    1 400 000 FCFA (46.6%)                 │                        ║
║    │ • NOUVEAU SOLDE RESTANT DÛ :                    1 600 000 FCFA                         │                        ║
║    │ • Échéance(s) concernée(s) :                    Mensualité N°07 (Soldée)               │                        ║
║    │ • Prochaine échéance :                          Mensualité N°08 le 05 du mois suivant  │                        ║
║    └────────────────────────────────────────────────────────────────────────────────────────┘                        ║
║                                                                                                                      ║
║ 3. CANAUX DE DIFFUSION & SÉCURITÉ                                                                                    ║
║    • Impression thermique ou A4 / Téléchargement instantané au format PDF vectoriel sécurisé                         ║
║    • Publication immédiate sur l'Espace Client PWA du bénéficiaire                                                   ║
║    • Envoi automatique de la quittance PDF par WhatsApp & SMS au client et à son mandataire                          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. 🧭 LES 4 CANAUX D'ENCAISSEMENT OFFICIELS DE MSI

MSI 2.0 prend en charge tous les modes de paiement en vigueur au Niger et dans la sous-région :

```text
                                  ┌─────────────────────────────────────────┐
                                  │      VERSEMENT EFFECTUÉ PAR L'ACQUÉREUR │
                                  └─────────────────────────────────────────┘
                                                       │
         ┌─────────────────────────┬───────────────────┴───────────────────┬─────────────────────────┐
         ▼                         ▼                                       ▼                         ▼
  ┌──────────────┐          ┌──────────────┐                        ┌──────────────┐          ┌──────────────┐
  │  1. ESPÈCES  │          │ 2. VIREMENT  │                        │ 3. MOBILE    │          │  4. CHÈQUE   │
  │   GUICHET    │          │   BANCAIRE   │                        │    MONEY     │          │   BANCAIRE   │
  │ (Caisse Phys)│          │ (SONIBANK /  │                        │ (NITA, AL    │          │ (Certifié /  │
  │              │          │  BOA / BIA)  │                        │ IZZA, AIRTEL)│          │  À encaisser)│
  └──────────────┘          └──────────────┘                        └──────────────┘          └──────────────┘
         │                         │                                       │                         │
         ▼                         ▼                                       ▼                         ▼
  ┌──────────────┐          ┌────────────────────────────────────────────────────────────────────────────────┐
  │ QUITTANCE    │          │ CONTRÔLE COMPTABLE & RAPPROCHEMENT DU BORDEREAU / TRANSACTION                  │
  │ DIRECTE      │          │ (Validation par la Comptable avant émission officielle du Reçu Définitif)      │
  └──────────────┘          └────────────────────────────────────────────────────────────────────────────────┘
         │                                                         │
         └─────────────────────────┬───────────────────────────────┘
                                   ▼
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ÉMISSION DU REÇU OFFICIEL INALTÉRABLE (Réf : RCP-AAAA-XXXXX)                                             │
  │ Avec Mini-Bilan Financier Intégré + QR Code Sécurisé + Écritures Automatiques SYSCOHADA (571 / 521 / 512)│
  └──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 🧾 LE REÇU OFFICIEL MSI (`RCP-`) AVEC MINI-BILAN FINANCIER INTÉGRÉ

Chaque versement donne lieu à l'émission immédiate d'un **Reçu Officiel Sécurisé** qui ne se contente pas d'indiquer la somme versée, mais affiche la **situation patrimoniale actualisée en temps réel** de l'acquéreur.

### 2.1. Anatomie Normée du Reçu de Caisse (`RCP-`)
1. **En-tête Institutionnel** : Logo MSI, Coordonnées du Siège, NIF, RCCM, Téléphones, Nom de l'Agence émettrice.
2. **Numéro de Pièce Inaltérable** : `RCP-AAAA-XXXXX` (Séquentiel unique certifié).
3. **Identification Client & Contrat** : Nom complet, Matricule `CLI-`, Réf Contrat `CTR-`, Réf Parcelle.
4. **Détails de l'Encaissement** :
   - Montant encaissé en chiffres : `200 000 FCFA`.
   - Montant en toutes lettres : *Deux cent mille Francs CFA*.
   - Mode de paiement : *Espèces / Virement SONIBANK / Nita Transfert*.
   - Référence externe : Numéro de transaction / N° de bordereau bancaire.
5. **Le Mini-Bilan Financier Intégré (Transparence Absolue)** :
   - Prix Total du Contrat : `3 000 000 FCFA`
   - Total Déjà Payé Avant ce Reçu : `1 200 000 FCFA`
   - Montant du Présent Règlement : `+ 200 000 FCFA`
   - **Nouveau Cumul Payé : `1 400 000 FCFA` ($46.6\%$)**
   - **NOUVEAU SOLDE RESTANT DÛ : `1 600 000 FCFA`**
   - Échéance suivante : *Mensualité N°8 exigible le 05 du mois prochain*.
6. **Sécurité & Signatures** :
   - **QR Code de Vérification Cryptographique** (Permet de scanner le reçu papier pour afficher sa version certifiée serveur).
   - Nom et signature de la Caissière / Comptable.
   - Mention légale : *« Les paiements ne sont libératoires que contre remise d'un reçu officiel généré par le système informatique MSI. »*

---

## 3. 🛡️ CONTRÔLE DES PAIEMENTS ÉLECTRONIQUES & BANCAIRES

Pour les paiements distants (Diaspora, Virements, Mobile Money) :
- **Dépôt d'Avis / Notification** : Le client ou le commercial transmet la photo du bordereau de versement ou la capture du SMS de transfert.
- **Statut Temporaire** : `PENDING_VERIFICATION` (En attente de validation). Le montant n'est pas encore crédité sur le contrat.
- **Certification Comptable** : La Comptable vérifie sur le relevé bancaire ou l'application Mobile Money professionnelle la réception effective des fonds.
- **Validation** : La Comptable valide l'opération $\rightarrow$ Bascule en `CONFIRMED` $\rightarrow$ Imputation automatique sur l'échéancier $\rightarrow$ Envoi instantané du reçu PDF par WhatsApp / Email au client.

---

## 4. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Encaissement / Transaction de Paiement
export interface PaymentTransaction {
  id: string;
  receipt_number: string;         // ex: "RCP-2026-00342"
  agency_id: string;
  contract_id: string;
  client_id: string;
  installment_id?: string;        // Échéance principale ciblée
  
  // Données financières
  amount_xof: number;             // Montant net encaissé
  amount_in_words: string;        // "Deux cent mille Francs CFA"
  payment_method: 'CASH_DESK' | 'BANK_TRANSFER' | 'MOBILE_MONEY_NITA' | 'MOBILE_MONEY_AL_IZZA' | 'MOBILE_MONEY_AIRTEL' | 'CHECK';
  
  // Références externes
  bank_name?: string;             // ex: "SONIBANK", "BOA", "BIA"
  external_transaction_ref?: string; // N° Bordereau ou ID Transaction Mobile Money
  bank_slip_scan_url?: string;
  
  // Situation avant / après (Mini-Bilan)
  contract_total_amount_xof: number;
  previous_paid_total_xof: number;
  new_paid_total_xof: number;
  new_remaining_balance_xof: number;
  new_progress_percentage: number;
  
  // Traçabilité & Validation
  cashier_user_id: string;        // Opérateur ayant saisi
  validated_by_accountant_id?: string; // Comptable ayant certifié
  is_validated: boolean;
  validated_at?: string;
  
  // Journal de Caisse / Banque
  cash_register_id?: string;      // ID de la session de caisse physique
  bank_account_id?: string;       // ID du compte bancaire récepteur
  accounting_entry_id?: string;   // Écriture SYSCOHADA générée
  
  // Sécurité
  qr_code_verification_url: string;
  receipt_pdf_url: string;
  
  status: 'PENDING_VERIFICATION' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED_AUDITED';
  created_at: string;
  updated_at: string;
}
```

---

## 5. 💵 MATRICE OFFICIELLE DES PERMISSIONS : PAIEMENTS & REÇUS (MODULES 16 & 17)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 5.1. 💵 Paiements & Encaissements Multi-Canaux (Zone Stratégique)

| Action Paiements | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Enregistrer un paiement** | 💰 / ➕ | 💰 / ➕ (Opérationnel clé)| 🔒 (Pas d'encaissement)| 🔒 (Pas d'encaissement)| 💰 (Si caisse locale)| 🔒 (Interdit)| 🔒 |
| **Vérifier / Rapprocher bordereau** | 👁️ | ✅ (Contrôle exhaustif)| 👁️ (Vérif dossier)| 🔒 | 👁️ (Local agence)| 👁️ (Technique)| 🔒 |
| **Confirmer / Valider paiement** | 👑 / ✅ | ✅ (Certification fonds)| 🔒 | 🔒 | ✅ (Si habilité local)| 🔒 | 🔒 |
| **Générer le reçu officiel (RCP-)** | 📄 | 📄 (Émission directe)| 🔒 | 🔒 | 📄 (Si habilité)| 🔒 | 🔒 |
| **Corriger selon procédure d'audit**| 👑 / ✏️ | ✏️ (Contre-passation)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Consulter l'historique financier**| 👁️ (Total réseau)| 👁️ (Complet)| 👁️ (Consultation/Prépa)| 👁️ (Portefeuille)| 👁️ (Son agence)| 👁️ (Audit DB)| 👁️ (Ses paiements)|

### 5.2. 🧾 Reçus Officiels (RCP-) & Mini-Bilans Patrimoniaux

| Action Reçus Officiels | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Générer un reçu officiel** | 📄 | 📄 (Quittance directe)| 🔒 | 🔒 | 📄 (Si habilité)| 🔒 | 🔒 |
| **Imprimer un reçu** | 🖨️ | 🖨️ | 🖨️ (Si autorisée)| 🖨️ (Si autorisée)| 🖨️ | 🔒 | 🖨️ (Télécharger PDF)|
| **Consulter les reçus émis** | 👁️ (National)| 👁️ (Tous reçus)| 👁️ (Accueil)| 👁️ (Son portefeuille)| 👁️ (Son agence)| 👁️ (Logs)| 👁️ (Ses reçus)|
| **Rééditer selon règles de sécurité**| 📄 | 📄 (Duplicata certifié)| 🔒 | 🔒 | 📄 (Si habilité)| 🔒 | 🔒 |
| **Supprimer un reçu** | ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)|

---

## 6. 🔄 RÈGLES DE CONTRÔLE INTERNE DU DOMAINE 10
- **Règle Zéro Reçu Manuel** : L'utilisation de carnets de reçus papier manuels est formellement interdite. Seul le reçu numérique issu du système fait foi.
- **Règle des Duplicatas Certifiés (`DUPLICATA N°X`)** :
  - Tout retirage d'une quittance existante incrémente le compteur `duplicate_count` de la table `receipts`.
  - Enregistrement immédiat dans `receipt_duplicate_logs` : identité du demandeur, motif circonstancié, horodatage et identifiant de l'agent ayant procédé à l'impression.
- **Règle de Contre-Passation d'Erreur (`payment_reversals` / Zéro `DELETE`)** :
  - L'encaissement erroné ne peut pas être supprimé.
  - Saisie obligatoire d'une demande d'extourne dans `payment_reversals` (`REV-YYYY-XXXXX`) avec motif $\ge 20$ caractères et validation du PDG.
  - Génération de l'écriture d'extourne comptable et basculement du statut à `CANCELLED_AND_COUNTERPASSED`.
- **Règle de Gestion des Chèques & Virements Impayés (`BOUNCED_REJECTED`)** :
  - En cas de rejet bancaire (provision insuffisante, vice de forme), le statut du paiement bascule en `BOUNCED_REJECTED` avec mention de la date et du motif `bounced_reason`.
  - Rétablissement automatique des échéances associées en impayées (`OVERDUE`).
- **Gestion des Frais Opérateurs (`fee_amount`)** :
  - Enregistrement explicite des commissions et frais de transfert prélevés par les opérateurs (Airtel, Nita, Al-Izza, banques) pour réconciliation comptable nette.
- **Notification Instantanée** : Tout reçu validé déclenche un envoi WhatsApp/SMS automatique avec le reçu PDF certifié joint.
