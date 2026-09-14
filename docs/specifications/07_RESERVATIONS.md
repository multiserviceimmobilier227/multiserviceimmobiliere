# 📅 SPÉCIFICATION 07 : RÉSERVATIONS, OPTIONS 15 JOURS & CHRONOMÈTRES D'EXPIRATION
**Inventaire Fonctionnel Détaillé du Module 10 (Réservations, Options Gratuites, Conversion & Libération)**

---

## 1. 📅 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 10. GESTION DES RÉSERVATIONS

Le module **10. RÉSERVATIONS** encadre la pose d'options gratuites, le cadencement temporel et la libération automatique :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 10. GESTION DES RÉSERVATIONS                               ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. CRÉATION & CONFIGURATION D'UNE RÉSERVATION                                                                        ║
║    • Créer une réservation : Génération du numéro unique (ex: RES-2026-00045)                                        ║
║    • Associer un client ou un prospect qualifié (Fiche KYC ou coordonnées)                                           ║
║    • Associer une parcelle disponible (Vérification de l'état DISPONIBLE 🟢)                                         ║
║    • Date de début : Horodatage précis de la pose d'option                                                           ║
║    • Date d'expiration & Durée : Calcul automatique à $J+15$ jours (à 23h59:59 heure locale)                         ║
║    • Statut de la réservation (Active 🟡, Confirmée/Attribuée 🔵, Expirée/Libérée 🟢, Annulée ⚪)                     ║
║    • Notes & Remarques du commercial (Modalités de paiement prévues, projet de construction)                         ║
║    • Fiche de confirmation de réservation imprimable / téléchargeable en PDF                                         ║
║                                                                                                                      ║
║ 2. CHRONOMÈTRE, RAPPELS & LIBÉRATION AUTOMATIQUE                                                                     ║
║    • Réservation gratuite d'une durée stricte de 15 jours calendaires (aucun frais exigé pour poser l'option)        ║
║    • Rappel avant expiration : Alerte proactive automatique à $J-2$ (Jour 13) via SMS / WhatsApp + Centre d'Alertes ║
║    • Expiration automatique : Traitement nocturne sans intervention humaine                                          ║
║    • Libération automatique : La parcelle repasse instantanément au statut DISPONIBLE (🟢) dans le catalogue          ║
║    • Historique inaltérable : Traçabilité conservée dans la fiche prospect et la fiche parcelle                     ║
║                                                                                                                      ║
║ 3. CONVERSION & ENTRÉE EN CONTRAT                                                                                    ║
║    • Conversion réservation ──► Attribution / Contrat : Dès enregistrement de l'acompte de 30%                       ║
║    • Génération immédiate de la Convention de Vente officielle (CTR- / CONV-)                                        ║
║    • Annulation anticipée sur demande du prospect avec libération immédiate du lot                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🧭 LE PRINCIPE DE LA RÉSERVATION D'OPTION GRATUITE DE 15 JOURS

Chez MSI, tout prospect qualifié manifestant un intérêt formel pour une parcelle disponible peut poser une **Option de Réservation Gratuite** d'une durée stricte de **15 jours calendaires**.

```text
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ JOUR 0 : POSE DE L'OPTION DE RÉSERVATION (15 Jours Calendaires)        │
  │ Parcelle bascule de DISPONIBLE (🟢) ──► RÉSERVÉE (🟡)                  │
  │ Émission de la Fiche de Réservation & Démarrage Chronomètre             │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ JOUR 13 (J-2) : ALERTE PROACTIVE D'EXPIRATION IMMINENTE                │
  │ Notification Commercial + SMS/WhatsApp bienveillant au Prospect         │
  └─────────────────────────────────────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            │                                                     │
            ▼ (CAS A : Acompte versé avant J+15)                  ▼ (CAS B : Aucun acompte à J+15)
  ┌────────────────────────────────────────┐            ┌────────────────────────────────────────┐
  │ CONFIRMATION & STATUT ATTRIBUÉE (🔵)   │            │ EXPIRATION AUTOMATIQUE (J+15 à 23h59)  │
  │ Validation financière de l'acompte     │            │ Parcelle libérée en DISPONIBLE (🟢)    │
  │ Préparation du Contrat de Vente CTR-   │            │ Archivage de l'option expirée          │
  └────────────────────────────────────────┘            └────────────────────────────────────────┘
```

---

## 2. ⏱️ RÈGLES MÉTIER & COMPORTEMENT DU CHRONOMÈTRE

### 2.1. Durée & Cadencement Temporel
- **Durée Standard** : $15$ jours calendaires complets (soit $360$ heures).
- **Date/Heure de début** : Instant exact de la validation de la réservation par le commercial.
- **Date/Heure de fin** : $J+15$ à $23\text{h}59\text{m}59\text{s}$ (heure locale Niamey `UTC+1`).
- **Verrouillage exclusif** : Pendant cette période, aucun autre commercial ou client ne peut poser une option ou acheter ce même lot.

### 2.2. Les Alertes Intelligentes du Radar d'Expiration
- **À $J-2$ (Jour 13)** :
  - **Alerte jaune prioritaire** dans le *Centre d'Alertes* du Commercial en charge et du Chef d'Agence.
  - Envoi d'un message WhatsApp / SMS de courtoisie au prospect :  
    *« Cher(e) [Nom], votre option sur la parcelle [Réf] expire dans 48 heures. Merci de contacter votre conseiller pour finaliser votre dossier. »*
- **À $J+15$ (Jour d'expiration)** :
  - Si aucun encaissement d'acompte n'est enregistré dans le système, le cronjob nocturne exécute la **libération automatique**.
  - La parcelle redevient instantanément **Disponible (🟢)** dans le catalogue sans intervention humaine nécessaire.
  - Notification d'archivage envoyée au commercial.

---

## 3. 💵 TRANSITION VERS L'ATTRIBUTION (VERSEMENT DE L'ACOMPTE)

La réservation se transforme en **Attribution Définitive** dès la comptabilisation effective d'un apport financier :
- **Taux d'apport initial standard recommandé** : $\ge 30\%$ du prix total du lot (ou montant forfaitaire convenu).
- **Enregistrement de l'encaissement** :
  - Saisie de la quittance d'apport initial par la caisse / comptabilité.
  - Émission du Reçu Officiel `RCP-AAAA-XXXXX`.
  - La parcelle bascule immédiatement au statut **Attribuée (🔵)**.
  - Génération automatique de la **Convention d'Attribution Préliminaire (`CONV-`)**.

---

## 4. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Réservation de Parcelle
export interface ParcelReservation {
  id: string;
  reservation_number: string;     // ex: "RES-2026-00045"
  agency_id: string;
  parcel_id: string;
  prospect_id?: string;
  client_id?: string;
  assigned_agent_id: string;      // Commercial ayant posé l'option
  
  // Dates du chronomètre
  reserved_at: string;            // Date/Heure ISO
  expires_at: string;             // Date/Heure ISO (reserved_at + 15 jours)
  alert_j_minus_2_sent: boolean;  // Drapeau anti-doublon d'alerte
  
  // Modalités envisagées
  quoted_price_xof: number;
  expected_payment_plan: 'CASH' | '15_MONTHS' | '20_MONTHS' | 'CUSTOM';
  expected_downpayment_xof: number;
  
  // Statut de la réservation
  status: 'ACTIVE' | 'CONFIRMED_ASSIGNED' | 'EXPIRED_RELEASED' | 'CANCELLED_BY_PROSPECT';
  
  // Clôture
  closed_at?: string;
  closed_reason?: string;
  generated_contract_id?: string; // Si convertie en contrat
  
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

---

## 6. 📅 MATRICE OFFICIELLE DES PERMISSIONS : RÉSERVATIONS & OPTIONS 15 JOURS (MODULE 10)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 6.1. 📅 Réservations & Options Gratuites

| Action Réservations | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consulter les réservations** | 👁️ (Tout le réseau) | 👁️ (Si paiement/acompte)| 👁️ (Accueil & suivi) | 👁️ (Son portefeuille)| 👁️ (Son agence) | 👁️ (Technique) |
| **Créer une réservation (Option 15j)** | ➕ | 🔒 | ➕ (Si autorisée) | ➕ (Gestionnaire clé)| ➕ (Sur son agence) | ⚙️ |
| **Modifier une réservation** | ✏️ | 🔒 | ✏️ (Données contact) | ✏️ (Selon règles 15j)| ✏️ (Supervision) | ⚙️ |
| **Suivre les chronomètres (Radar J-2)**| 👁️ | 👁️ (Si encaissement) | 👁️ | 👁️ (Relances actives)| 👁️ (Supervision) | 👁️ |
| **Valider une exception / prolongation**| 👑 (Souverain) | 🔒 | 🔒 | 🔒 (Demande) | ✅ (Valide selon règles)| 🔒 |
| **Préparer la transformation en vente** | 👁️ / ✅ | 👁️ / 💰 (Validation acompte)| 👁️ (Dossier KYC) | 📤 / ➕ (Création contrat)| 👁️ / ✅ | 🔒 |
| **Libérer une parcelle (Annulation anticipée)**| ❌ / ⚡ | 🔒 | 🔒 | ❌ (Demande client) | ✅ (Annulation locale)| ⚙️ |

### 📌 Répartition Détaillée des Rôles sur les Réservations :
- **📣 Commercial (Acteur Principal) :** Créer l'option, consulter, modifier selon les règles des 15 jours, suivre le décompte temporel et préparer la transformation en vente dès réception de l'accord.
- **🧑💼 Secrétaire :** Créer si autorisée (accueil physique), consulter le stock disponible et suivre l'état d'avancement des dossiers.
- **🏢 Responsable d'agence :** Superviser les flux de réservation locaux, contrôler les délais et valider certaines exceptions prévues par la gouvernance (ex: prolongation 7j).
- **👑 PDG :** Accès complet, arbitrage souverain et dérogations spéciales.
- **📊 Comptable :** Consultation directe et obligatoire dès qu'un versement financier / acompte intervient pour formaliser la vente.
- **⚡ Automatisation Système :** Le système gère de façon 100% autonome et sécurisée le cycle : **Expiration automatique à J+15 à 23h59 ──► Rappel préventif à J-2 (Jour 13) ──► Libération immédiate de la parcelle en Disponible (🟢)**.

---

## 7. 🔄 TRAÇABILITÉ & RÈGLES DE CONTRÔLE INTERNE DU DOMAINE 07
- **Plafonnement des options par prospect** : Un même prospect ne peut pas poser plus de **2 réservations simultanées** sans l'accord écrit du Directeur d'Agence (pour éviter le gel abusif du stock foncier).
- **Plafonnement des options par commercial (Anti-Monopolisation)** : Un commercial ne peut pas cumuler plus de **5 réservations actives simultanées** (`max_active_reservations_limit`), contrôlé directement par le trigger SQL `trg_enforce_commercial_reservations_quota`.
- **Prolongation exceptionnelle d'une réservation** : Une réservation peut être prolongée de $7$ jours additionnels **une seule fois**, exclusivement sur validation formelle du Directeur d'Agence ou du PDG avec motif consigné.
- **Zéro `DELETE`** : Toute réservation expirée ou annulée est conservée dans l'historique du prospect et de la parcelle pour les analyses de conversion commerciale.
- **Gestion des Apporteurs d'Affaires Externes** : Traçabilité des co-courtages via la table `external_brokers` avec scan de la CNI et quote-part de commission déduite dans `commercial_commissions`.

