# 🏷️ SPÉCIFICATION 06 : OFFRES COMMERCIALES, PRIX FONCIER, REMISES & RÈGLE DU PRIX HISTORIQUE
**Inventaire Fonctionnel Détaillé des Modules 08 (Tarification & Prix) & 09 (Offres Commerciales & Modalités)**

---

## 1. 💰 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 08. TARIFICATION & GESTION DES PRIX

Le module **08. PRIX** encadre la fixation des grilles tarifaires et protège les contrats existants contre toute hausse rétroactive :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 08. TARIFICATION & PRIX                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. GESTION DES PRIX CATALOGUE                                                                                        ║
║    • Définir le prix : Au mètre carré ($m^2$) ou prix forfaitaire global par parcelle                                ║
║    • Modifier le prix : Mise à jour des grilles tarifaires d'un lotissement par le PDG                               ║
║    • Historique des prix : Journal exhaustif de toutes les évolutions tarifaires                                     ║
║    • Date d'entrée en vigueur : Application programmée ou immédiate des nouveaux tarifs                              ║
║                                                                                                                      ║
║ 2. GESTION DES PRIX NÉGOCIÉS & REMISES CLIENT                                                                        ║
║    • Prix catalogue : Référence tarifaire de base                                                                    ║
║    • Réduction accordée : Montant en FCFA ou pourcentage (%)                                                         ║
║    • Prix final net : Montant net imputé au contrat de vente CTR-                                                    ║
║    • Motif obligatoire : Justification de la dérogation (Paiement cash, achat groupé, geste commercial)              ║
║    • Autorisation & Validateur : Visa souverain du PDG avec horodatage UTC+1 et ID validateur                       ║
║    • Date de décision & Historique inaltérable de la négociation                                                     ║
║                                                                                                                      ║
║ 3. 🛡️ LA RÈGLE FONDAMENTALE DU VERROUILLAGE DU PRIX HISTORIQUE                                                       ║
║    « Un contrat conserve STRICTEMENT son prix historique, même si le prix de la parcelle augmente ensuite. »         ║
║    Le moteur de base de données garantit l'immutabilité du montant contractuel scellé dans le CTR-.                 ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 📢 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 09. OFFRES COMMERCIALES & PACKS PROMOTIONNELS

Le module **09. OFFRES COMMERCIALES** permet de concevoir des campagnes promotionnelles, packs parcelles et conditions de vente attractives :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 09. OFFRES COMMERCIALES                                    ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. CRÉATION & GESTION DES OFFRES COMMERCIALES                                                                        ║
║    • Créer une offre commerciale : Titre attractif (ex: "Pack Résidentiel Maradi Tibiri"), code promotionnel        ║
║    • Modifier une offre : Ajustement des conditions, textes et parcelles éligibles                                   ║
║    • Publier une offre : Mise en ligne immédiate sur le portail public et l'Espace Client PWA                        ║
║    • Désactiver une offre : Retrait de la publication tout en conservant l'historique                                ║
║                                                                                                                      ║
║ 2. PARAMÉTRAGE FINANCIER & MODALITÉS DE PAIEMENT                                                                     ║
║    • Prix par superficie : Barème dégressif ou forfaitaire (ex: 300 m² à 2 500 000 F, 500 m² à 4 000 000 F)         ║
║    • Modalités de paiement autorisées : Comptant avec escompte, Échéancier 20 mois, Acompte min 30%                  ║
║    • Conditions particulières : Frais de dossier offerts, modalités de viabilisation incluses                        ║
║                                                                                                                      ║
║ 3. SUPPORTS MÉDIAS & DOCUMENTATION ASSOCIÉE                                                                          ║
║    • Texte commercial & Argumentaire de vente structuré                                                              ║
║    • Galerie d'images HD du site (Photos aériennes par drone, perspectives 3D)                                       ║
║    • Documents téléchargeables (Brochure PDF, plan de masse, arrêté ministériel d'approbation)                       ║
║    • Parcelles concernées : Association sélective d'une liste de parcelles ou d'un îlot entier à l'offre             ║
║                                                                                                                      ║
║ 4. CYCLE DE VIE, STATUT & VALIDITÉ                                                                                   ║
║    • Statut de l'offre : Brouillon, Active/Publiée, Suspendue, Clôturée, Archivée                                    ║
║    • Historique inaltérable des modifications de l'offre                                                             ║
║    • 🛡️ Règle de validité : Les prix d'une offre restent actifs jusqu'à modification formelle par MSI,               ║
║      sans expiration automatique obligatoire (sauf si une date de fin de campagne est expressément fixée).           ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. 🧭 MODÈLES DE TARIFICATION DU FONCIER CHEZ MSI

MSI 2.0 propose deux modes de calcul des prix de vente pour s'adapter à toutes les configurations de lotissements :

### 1.1. Tarification au Mètre Carré ($m^2$)
Le prix total de base est calculé dynamiquement à partir de la superficie exacte du lot :
$$P_{\text{base}} = \text{Superficie}(m^2) \times \text{Prix au } m^2 (\text{FCFA})$$

### 1.2. Tarification Forfaitaire au Lot
Prix fixe attribué globalement à une parcelle indépendamment de légères variations de surface (ex: *Parcelles standard 400 m² au prix forfaitaire de 2 500 000 FCFA*).

---

## 2. 🌟 SURCOÛTS TYPOLOGIQUES D'EMPLACEMENT (VALORISATION DES LOTS PREMIUM)

Pour valoriser les lots bénéficiant d'une attractivité géographique supérieure, le système permet d'appliquer un coefficient ou un forfait additionnel :

| Type d'Emplacement | Description / Caractéristiques | Majoration Tarifaire Type |
| :--- | :--- | :--- |
| 📍 **Standard** | Lot classique en intérieur d'îlot | $P_{\text{base}}$ (Prix catalogue standard) |
| 📐 **Angle de Rue (2 Façades)** | Parcelle à l'intersection de deux voies, double accès | $+10\%$ ou forfait $+250\,000\text{ FCFA}$ |
| 🛣️ **Bordure de Grande Voie** | Donnant directement sur un boulevard goudronné / voie principale | $+15\%$ à $+25\%$ |
| 🏪 **Emplacement Commercial** | Zone dédiée aux activités marchandes / bureaux | Tarif spécial zone commerciale |

---

## 3. 🎁 POLITIQUES PROMOTIONNELLES & REMISES ENCADRÉES

### 3.1. Types de Réductions Commerciales
1. **Campagne Promotionnelle Temporaire** :
   - Ex: *« Promo Tabaski / Fin d'année »* : Réduction de $5\%$ sur un lotissement spécifique pour une période définie.
2. **Remise Client au Comptant (Cash Discount)** :
   - Réduction accordée aux acquéreurs payant $100\%$ du prix à la souscription (au lieu d'un étalement sur 15/20 mois).
3. **Remise Volume (Multi-Acquisitions)** :
   - Réduction accordée à un client achetant plusieurs parcelles simultanément ($\ge 2$ parcelles).
4. **Remise Dérogatoire Exceptionnelle (Négociation)** :
   - Accordée au cas par cas lors d'une négociation commerciale.

---

## 4. 👑 LE WORKFLOW INVIOLABLE D'APPROBATION DES REMISES (VISA PDG)

> **Règle Fondamentale de Séparation des Pouvoirs :**  
> **Aucun Commercial, Chef d'Agence ou Comptable ne peut valider unilatéralement un rabais de prix non prévu par la grille officielle.**  
> Toute remise dérogatoire doit impérativement suivre le circuit d'arbitrage souverain du PDG.

```text
  ┌────────────────────────────────────────┐
  │ 1. DEMANDE INITIÉE PAR LE COMMERCIAL   │ ──► Saisie du montant sollicité + Justification
  └────────────────────────────────────────┘
                       │
                       ▼
  ┌────────────────────────────────────────┐
  │ 2. CONTRÔLE PAR LE DIRECTEUR D'AGENCE  │ ──► Avis consultatif (Favorable / Défavorable)
  └────────────────────────────────────────┘
                       │
                       ▼
  ┌────────────────────────────────────────┐
  │ 3. ARBITRAGE SOUVERAIN DU PDG          │ ──► VISA FORMEL (Accordé / Refusé / Modifié)
  └────────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼ (Si Validé)               ▼ (Si Refusé)
  ┌───────────────────────────┐ ┌───────────────────────────┐
  │ 4. APPLICATION AU CONTRAT │ │ 4. RETOUR AU PRIX INITIAL │
  │    Recalcul de l'échéancier│ │    Notification commercial │
  └───────────────────────────┘ └───────────────────────────┘
```

### 4.1. Audit Inaltérable de la Remise
Dès validation par le PDG, la remise est gravée dans le contrat avec les 4 attributs d'audit :
- Prix catalogue initial ($P_{\text{catalogue}}$).
- Montant de la réduction accordée ($R_{\text{xof}}$ ou $R_{\%}$).
- Prix net contractuel définitif ($P_{\text{net}} = P_{\text{catalogue}} - R_{\text{xof}}$).
- Identifiant du PDG approbateur, horodatage UTC+1 et texte de justification.

---

## 5. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Grille Tarifaire / Offre Commerciale
export interface PriceOffer {
  id: string;
  subdivision_id: string;
  agency_id: string;
  name: string;                   // ex: "Grille Standard Goudel 2026"
  pricing_model: 'PER_SQM' | 'FLAT_FEE';
  base_price_per_sqm_xof?: number;
  default_flat_price_xof?: number;
  
  // Coefficients de surcoût
  corner_premium_percentage: number;      // ex: 10
  boulevard_premium_percentage: number;   // ex: 15
  
  // Avantage paiement comptant
  cash_payment_discount_percentage: number; // ex: 5
  
  is_active: boolean;
  valid_from: string;
  valid_to?: string;
  created_at: string;
  updated_at: string;
}

// Entité Demande de Remise Dérogatoire
export interface DiscountRequest {
  id: string;
  contract_id?: string;
  parcel_id: string;
  prospect_client_id: string;
  requested_by_user_id: string;  // Commercial demandeur
  
  catalog_price_xof: number;
  discount_amount_xof: number;
  discount_percentage: number;
  final_proposed_price_xof: number;
  
  request_reason: string;        // Justification détaillée obligatoire
  
  agency_manager_review?: {
    reviewed_by_user_id: string;
    is_recommended: boolean;
    review_notes?: string;
    reviewed_at: string;
  };
  
  // Décision souveraine PDG
  ceo_decision: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  approved_discount_xof?: number;
  ceo_decision_notes?: string;
  ceo_user_id?: string;
  decided_at?: string;
  
  created_at: string;
  updated_at: string;
}
```

---

## 7. 🏷️ MATRICE OFFICIELLE DES PERMISSIONS : OFFRES COMMERCIALES & PRIX (MODULES 08 & 09)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 7.1. 🏷️ Tarification, Prix & Offres Commerciales (Zone Très Sensible)

| Action Offres & Tarifs | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consulter les grilles tarifaires** | 👁️ (Total) | 👁️ (Données financières)| 👁️ (Catalogue) | 👁️ (Catalogue) | 👁️ (Catalogue) | 👁️ (Technique) |
| **Créer une offre commerciale / pack** | 👑 (Souverain) / ➕ | 🔒 | 🔒 | 📤 (Proposer) | ➕ (Selon habilitation)| ⚙️ (Configuration)|
| **Modifier une offre / pack** | 👑 / ✏️ | 🔒 | 🔒 | 🔒 | ✏️ (Selon délégation)| ⚙️ (Paramétrage) |
| **Fixer / Modifier le prix catalogue** | 🔴 👑 (Exclusif) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Préparer une proposition d'offre client**| 👁️ | 🔒 | 🔒 | ➕ / ✏️ (Préparation) | 👁️ / ✏️ | 🔒 |
| **Soumettre une offre / réduction** | 👁️ | 🔒 | 🔒 | 📤 (Soumettre au PDG) | 📤 (Avis consultatif)| 🔒 |
| **Accorder une réduction / Remise** | 🔴 👑 (Visa Souverain)| 🔒 | 🔒 | 🔒 (Demande uniquement)| 🔒 | 🔒 |
| **Valider une exception tarifaire** | 🔴 👑 (Visa Souverain)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Consulter les conséquences financières** | 👁️ (Impact bilan/marge)| 👁️ (Complet rentabilité) | 🔒 | 🔒 | 👁️ (Local agence) | 🔒 |
| **Administration technique des tarifs** | 👁️ | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ (Structure DB) |

### 📌 Répartition Détaillée des Rôles sur les Offres & Prix :
- **📣 Commercial :** Consulter les prix catalogue, préparer une offre personnalisée, proposer au client et soumettre les demandes de rabais au circuit d'approbation.
- **🏢 Responsable d'agence :** Consulter, gérer les offres opérationnelles déléguées sur son périmètre selon autorisation formelle.
- **👑 PDG :** Autorité souveraine : créer, modifier, fixer les prix de base, accorder les réductions et valider souverainement toute exception.
- **📊 Comptable :** Consulter les prix et analyser en temps réel les conséquences financières (marge brute, seuil de rentabilité foncière).
- **🧑💼 Secrétaire :** Consultation simple du catalogue tarifaire pour renseigner les visiteurs à l'accueil.
- **🛠️ Admin technique :** Administration technique de la base de données sans jamais décider ou modifier un prix métier.

---

## 8. 🔄 RÈGLES DE CONTRÔLE & SÉCURITÉ DU DOMAINE 06
- **Verrouillage des Prix Catalogue** : Seul le profil PDG peut créer ou modifier les grilles tarifaires de base d'un lotissement.
- **Historisation des Tarifs** : Toute modification de prix d'un lotissement s'applique uniquement aux nouveaux contrats et ne modifie **jamais rétroactivement les contrats déjà signés**.
- **Contrôle Anti-Braderie** : Le système bloque toute tentative de saisie d'un prix de vente inférieur au coût de revient unitaire ($C_{\text{revient\_m2}}$) sans dérogation explicite motivée du PDG.
