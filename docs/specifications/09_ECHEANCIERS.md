# 💰 SPÉCIFICATION 09 : ÉCHÉANCIERS, PAIEMENTS PARTICULIERS & GESTION DES RETARDS
**Inventaire Fonctionnel Détaillé des Modules 15 (Moteur d'Échéancier), 18 (Paiements Particuliers) & 19 (Détection & Suivi des Retards)**

---

## 1. 🧮 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 15. MOTEUR D'ÉCHÉANCIER & IMPUTATION INTELLIGENTE

Le module **15. MOTEUR D'ÉCHÉANCIER** calcule les tableaux d'amortissement et ventile automatiquement les flux de paiement :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 15. MOTEUR D'ÉCHÉANCIER                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. GÉNÉRATION AUTOMATIQUE DU TABLEAU D'AMORTISSEMENT                                                                 ║
║    • Durées paramétrables :                                                                                          ║
║      - 15 Mois (Option accélérée)                                                                                    ║
║      - 20 Mois (Standard officiel contractuel - Article 1 & 5)                                                       ║
║      - Durée personnalisée autorisée (selon permissions et validation Direction)                                     ║
║    • Calcul du montant mensuel régulier : $M = \frac{S_{\text{restant}}}{N}$ arrondi au franc CFA                    ║
║    • Ajustement d'équilibrage de dernière échéance : Absorption automatique du reliquat d'arrondi sur l'échéance $N$ ║
║    • Calendrier des dates d'échéances calculé depuis le premier versement (ex: le 05 ou le 10 de chaque mois)        ║
║    • Période de tolérance paramétrable avant déclenchement des notifications de relance                              ║
║                                                                                                                      ║
║ 2. TRAITEMENT DES VARIATIONS DE PAIEMENT                                                                             ║
║    • Paiement anticipé : Règlement par avance d'échéances futures réduisant le solde global                          ║
║    • Paiement partiel : Règlement d'une fraction de mensualité avec calcul instantané du reste sur l'échéance        ║
║    • Paiement excédentaire : Versement supérieur à la mensualité courante se déversant sur les échéances suivantes    ║
║    • Suivi du solde global en temps réel à chaque micro-opération financière                                         ║
║                                                                                                                      ║
║ 3. 🌊 L'ALGORITHME D'IMPUTATION INTELLIGENTE À REÇUS DISTINCTS                                                       ║
║    Exemple concret de ventilation automatique par le moteur :                                                        ║
║    - Contexte : Échéance passée restant due = 40 000 FCFA                                                            ║
║    - Versement client reçu au guichet = 100 000 FCFA                                                                 ║
║    - Affectation automatique par MSI :                                                                               ║
║      • 40 000 FCFA ──► Imputés sur l'ancien mois impayé (Échéance passée soldée à 100%)                              ║
║      • 60 000 FCFA ──► Imputés sur le nouveau mois courant (Échéance courante partiellement couverte)                ║
║    - 🧾 Règle d'émission : Le système génère automatiquement DEUX (02) REÇUS DISTINCTS (`RCP-`) avec leurs          ║
║      mini-bilans respectifs pour une traçabilité comptable et juridique parfaite !                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🔄 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 18. GESTION DES PAIEMENTS PARTICULIERS

Le module **18. PAIEMENTS PARTICULIERS** gère automatiquement toutes les typologies et variations de versements acquéreurs :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 18. PAIEMENTS PARTICULIERS                                 ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. CAS DE PAIEMENTS TRAITÉS AUTOMATIQUEMENT                                                                          ║
║    • Paiement partiel : Règlement d'un montant inférieur à l'échéance exigible (mise à jour du solde de l'échéance)  ║
║    • Paiement anticipé : Règlement par avance d'échéances non encore échues                                          ║
║    • Paiement de plusieurs mois en un versement : Ventilation séquentielle automatique (Mois 1, Mois 2, Mois 3...)   ║
║    • Paiement supérieur à l'échéance : Extinction de l'échéance courante et report automatique de l'excédent         ║
║    • Paiement inférieur : Couverture partielle et maintien de l'échéance en statut PARTIALLY_PAID                  ║
║    • Paiement d'une ancienne échéance : Imputation prioritaire sur la dette la plus ancienne                         ║
║    • Paiement avec solde restant : Calcul et affichage immédiat du reliquat dû sur le reçu mini-bilan               ║
║    • Paiement exceptionnel : Versement libre hors tableau périodique (rachat partiel ou anticipation de capital)     ║
║    • Correction de paiement : Rectification traçable d'erreur de saisie (avec contrepassation et visa obligatoire)   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. ⚠️ INVENTAIRE FONCTIONNEL DÉTAILLÉ : 19. DÉTECTION & SUIVI DES RETARDS

Le module **19. RETARDS** assure la détection automatique des impayés, les alertes hiérarchiques et le suivi contractuel sans pénalité arbitraire :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 19. GESTION DES RETARDS                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. DÉTECTION AUTOMATIQUE GRADUÉE DU NIVEAU DE RETARD                                                                 ║
║    • Détection automatique à $J+1$ : Dès le lendemain de la date d'échéance sans versement (Retard débutant)         ║
║    • Retard prolongé (30 jours) : 1 mois complet d'impayé constaté                                                   ║
║    • Deux mois impayés (60 jours) : Seuil d'alerte contractuelle (Article 5 Convention de vente)                     ║
║    • Retard critique (90 jours et plus) : Risque de forclusion et d'engagement de la procédure de résiliation        ║
║                                                                                                                      ║
║ 2. NOTIFICATIONS & SUIVI HIÉRARCHIQUE                                                                                ║
║    • Notification Client proactive : Relance aimable par WhatsApp & SMS automatisé                                   ║
║    • Notification PDG & Direction : Remontée instantanée dans le cockpit décisionnel sur les dossiers critiques      ║
║    • Historique complet des rappels et relances adressés au client                                                   ║
║    • Suivi contractuel du dossier (Médiation, engagements écrits du client, promesses de versement)                  ║
║                                                                                                                      ║
║ 3. 🛡️ RÈGLE ABSOLUE SUR LES PÉNALITÉS                                                                                ║
║    « AUCUNE PÉNALITÉ FINANCIÈRE AUTOMATIQUE N'EST FACTURÉE AU CLIENT POUR RETARD,                                   ║
║      sauf si une règle contractuelle explicite future validée par la Direction générale l'impose. »                  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 4. 🧭 LE CADRE FINANCIER OFFICIEL DU CONTRAT DE VENTE

Conformément à la Convention Officielle de Vente de l'entreprise :

```text
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                           PARAMÈTRES FINANCIERS STANDARDS DE VENTE PROMOTIONNELLE                │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ 1. 💵 Acompte Initial Obligatoire : 30% du Montant Total au 1er versement (NB officiel)          │
  │ 2. 📅 Durée Contractuelle Standard : VINGT (20) MOIS sans interruption (Article 1 & 5)          │
  │ 3. 🏦 Mode de Paiement : Espèces / Chèque / Virement / Domiciliation & Prélèvement bancaire      │
  │ 4. 📜 Frais d'Acte de Cession : 35 000 FCFA exigibles à la fin pour le transfert (Article 7)    │
  │ 5. 🚨 Règle des Impayés : Non-versement de 2 mois ──► Régularisation avant fin du 3ème mois     │
  │    À défaut : Forclusion de plein droit ou nouveau délai accordé par la Direction (Article 8 & 9)│
  └──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 🧮 FORMULES MATHÉMATIQUES DU TABLEAU D'AMORTISSEMENT (20 MOIS)

### 2.1. Calcul de l'Acompte et de la Mensualité Constante ($M$)
Soit $P_{\text{total}}$ le prix total de la parcelle (hors frais d'acte de cession) :

1. **Acompte Minimal Obligatoire ($30\%$)** :
   $$A_{\text{init}} = P_{\text{total}} \times 0{,}30$$
2. **Solde Restant à Échelonner sur 20 Mois** :
   $$S_{\text{restant}} = P_{\text{total}} - A_{\text{init}} = P_{\text{total}} \times 0{,}70$$
3. **Mensualité Constante sur 20 Mois** :
   $$M = \frac{S_{\text{restant}}}{20}$$
4. **Frais d'Acte de Cession (Ligne Distincte Art. 7)** :
   $$F_{\text{acte}} = 35\,000\text{ FCFA (exigible à la délivrance du titre de cession)}$$

Si la division engendre un reste entier $R = S_{\text{restant}} \pmod{20}$ :
- Les 19 premières mensualités sont fixées à $\lfloor M \rfloor$.
- La 20-ième mensualité absorbe le solde exact :
  $$M_{20} = S_{\text{restant}} - \sum_{i=1}^{19} M_i$$

---

## 3. 🌊 L'ALGORITHME DE CASCADE D'IMPUTATION DES PAIEMENTS

Lorsqu'un acquéreur verse un montant quelconque $V$ (en agence ou par virement bancaire) :

```text
  Montant Versé V (FCFA)
         │
         ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 1. APUREMENT PRIORITAIRE DES ÉCHÉANCES ÉCHUES EN RETARD (DU PASSÉ)      │
  │    Comblement des impayés par ordre chronologique d'antériorité         │
  └─────────────────────────────────────────────────────────────────────────┘
         │ (S'il reste du reliquat V')
         ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 2. PAIEMENT DE L'ÉCHÉANCE COURANTE DU MOIS                              │
  └─────────────────────────────────────────────────────────────────────────┘
         │ (S'il reste du reliquat V'')
         ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ 3. PAIEMENT PAR AVANCE DES ÉCHÉANCES FUTURES (OU FRAIS D'ACTE 35 000 F) │
  │    Apurement partiel ou total des mois suivants ou provision acte       │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 🚦 CYCLE DES RETARDS & APPLICATION DE L'ARTICLE 8 (FORCLUSION FIN 3E MOIS)

```text
  ┌───────────────────────┐
  │ Échéance M Non Payée  │ ──► Relance amicale J+7 (WhatsApp / SMS) : Signalement comptabilité
  └───────────────────────┘
             │
             ▼
  ┌───────────────────────┐
  │ 2 Mensualités Impayées│ ──► Notification formelle M+2 (Article 8 Convention) :
  │ (Non-versement 2 mois)│     Mise en demeure de régulariser avant la fin du 3ème mois d'impayé
  └───────────────────────┘
             │
             ▼
  ┌───────────────────────┐
  │ FIN DU 3ÈME MOIS      │ ──► Absence de régularisation financière constatée :
  │ SANS RÉGULARISATION   │     1. Forclusion et résiliation de plein droit (Art. 8 & 9) OU
  └───────────────────────┘     2. Octroi d'un nouveau délai exceptionnel (Visa Souverain PDG)
```

### 4.1. Définition des Niveaux de Vigilance
- 🟢 **PAYÉE (`PAID`)** : Montant de l'échéance encaissé à $100\%$.
- 🔵 **DU JOUR (`DUE_TODAY`)** : Échéance arrivant à terme aujourd'hui.
- 🟡 **EN RETARD SIMPLE (`LATE_STANDARD`)** : Échéance impayée depuis $1$ à $30$ jours. Envoi de relance amicale (WhatsApp / SMS).
- 🟠 **RETARD MAJEUR (`LATE_MAJOR`)** : Échéance impayée entre $31$ et $59$ jours. Relance formelle et contact téléphonique.
- 🚨 **RETARD CRITIQUE (`LATE_CRITICAL`)** : **$\ge 2$ mensualités consécutives impayées ($\ge 60$ jours)**.
  - Bascule immédiate dans le **Radar Rouge du PDG**.
  - Déclenchement de la phase de médiation et de conciliation avant toute procédure de résiliation.

---

## 5. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Échéancier Global du Contrat
export interface PaymentSchedule {
  id: string;
  contract_id: string;
  client_id: string;
  total_contract_amount_xof: number;
  downpayment_amount_xof: number;
  total_financed_amount_xof: number; // Montant net à échelonner
  total_installments_count: number;  // 15, 20, 24...
  start_date: string;
  end_date: string;
  monthly_amount_xof: number;
  
  // Synthèse financière en direct
  total_paid_xof: number;
  total_remaining_xof: number;
  paid_installments_count: number;
  late_installments_count: number;
  critical_late_installments_count: number;
  is_fully_settled: boolean;
  
  created_at: string;
  updated_at: string;
}

// Entité Ligne d'Échéance Mensuelle
export interface ScheduleInstallment {
  id: string;
  schedule_id: string;
  contract_id: string;
  installment_number: number;     // 1, 2, 3... N
  due_date: string;              // Date limite exigible (ex: "2026-04-05")
  
  // Montants
  expected_amount_xof: number;
  paid_amount_xof: number;
  remaining_amount_xof: number;   // expected - paid
  
  // Statut
  status: 'PENDING' | 'DUE_TODAY' | 'PARTIALLY_PAID' | 'PAID' | 'LATE_STANDARD' | 'LATE_CRITICAL';
  days_overdue: number;          // Nombre de jours de retard calculé
  
  // Liens d'encaissements
  receipt_ids?: string[];        // Reçus RCP- ayant imputé cette échéance
  fully_paid_at?: string;
}
```

---

## 7. 💰 MATRICE OFFICIELLE DES PERMISSIONS : ÉCHÉANCIERS & PLANS DE PAIEMENT (MODULES 15, 18 & 19)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 7.1. 💰 Gestion des Échéanciers & Tableaux d'Amortissement

| Action Échéanciers | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consulter un échéancier** | 👁️ (Tout le réseau)| 👁️ (Tous échéanciers)| 👁️ (Selon habilitation)| 👁️ (Son portefeuille)| 👁️ (Clients agence)| 👁️ (Technique) | 👁️ (Son propre échéancier)|
| **Générer / Créer un échéancier** | 👑 / ✅ | ➕ / 🧮 (Gestionnaire)| 🔒 | 🔒 | 🔒 | ⚙️ | 🔒 |
| **Vérifier les calculs & dates** | 👁️ | ✅ (Contrôle exhaustif)| 🔒 | 👁️ | 👁️ (Vérification agence)| 👁️ | 🔒 |
| **Imputer les paiements (Cascade)** | 👁️ / 💰 | 💰 / ✅ (Exécution) | 🔒 | 🔒 | 👁️ (Consultation agence)| ⚙️ | 🔒 |
| **Modifier selon permissions normales** | 👑 | ✏️ (Ajustements techniques)| 🔒 | 🔒 | 🔒 | ⚙️ | 🔒 |
| **Modifier / Autoriser les exceptions** | 🔴 👑 (Visa Souverain)| 📤 (Demande arbitrage)| 🔒 | 🔒 | 📤 (Signalement) | 🔒 | 🔒 |
| **Suivre les retards & impayés** | 👁️ (Synthèse nationale)| 👁️ (Complet financier)| 👁️ (Relances) | 👁️ (Relances clients)| 👁️ (Suivi agence) | 👁️ | 👁️ (Sa propre situation)|

### 📌 Répartition Détaillée des Rôles sur les Échéanciers :
- **📊 Comptable (Maître d'Œuvre Financier) :** Créer l'échéancier, vérifier les montants, modifier selon les permissions strictement accordées, suivre les états d'encaissements et imputer les paiements via l'algorithme de cascade automatique.
- **👑 PDG :** Voir tous les échéanciers, modifier / autoriser souverainement les exceptions (reports, allongements, rééchelonnements) et superviser la solvabilité globale du portefeuille.
- **📣 Commercial :** Consulter l'échéancier de ses clients pour les accompagner et anticiper les échéances.
- **🧑💼 Secrétaire :** Consulter les échéances selon les permissions accordées pour renseigner les acquéreurs au guichet d'accueil.
- **🏢 Responsable d'agence :** Consulter et suivre rigoureusement les échéanciers des clients rattachés à son agence.
- **👤 Client (Espace Client PWA) :** Consulter en toute transparence **son propre échéancier**, son solde restant dû, ses prochaines échéances et l'historique de ses paiements.
- **🛠️ Admin technique :** Maintenance algorithmique et intégrité des données sans intervention dans les calculs financiers métier.

---

## 8. 🔄 RÈGLES DE CONTRÔLE INTERNE & PRÉVENTION DU DOMAINE 09
- **Calcul Déterministe Strict** : Aucune somme d'arrondi ne peut disparaître ; la somme des mensualités $\sum M_i + A_{\text{init}}$ doit être mathématiquement **égale au centime près** au prix total contractuel.
- **Rééchelonnement Exceptionnel** : Tout réaménagement de l'échéancier (allongement de durée ou suspension de mensualité) requiert un **Avenant juridique (`AVN-`)** visé par le PDG.
- **Transparence Totale** : Chaque paiement génère la mise à jour immédiate du reste à payer, visible en temps réel sur l'Espace Client PWA.
