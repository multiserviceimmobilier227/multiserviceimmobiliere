# 🤝 SPÉCIFICATION 08 : CONTRAT, CONDITIONS DE PAIEMENT, AVENANTS & TRANSFERTS
**Inventaire Fonctionnel Détaillé des Modules 13 (Contrats), 14 (Conditions de Paiement) & 22 (Changement de Parcelle / Transfert de Lot)**

---

## 1. 📄 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 13. GESTION DES CONTRATS & AVENANTS

Le module **13. CONTRATS** gère l'engagement juridique d'acquisition, le cycle de vie contractuel et les avenants sous visa PDG :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 13. GESTION DES CONTRATS                                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. CRÉATION & ÉMISSION DU CONTRAT DE VENTE                                                                           ║
║    • Numérotation automatique normalisée : Matricule unique inaltérable (CTR-AAAA-XXXXX / CONV-AAAA-XXXXX)            ║
║    • Association Client : Sélection ou création de la fiche client certifiée (CLT-)                                  ║
║    • Association Parcelle : Sélection d'une parcelle disponible ou réservée (Vérification de non-conflit)           ║
║    • Données financières scellées :                                                                                  ║
║      - Prix catalogue de référence                                                                                   ║
║      - Réduction accordée (montant FCFA ou %) avec visa préalable du PDG                                             ║
║      - Prix final net contractuel immuable                                                                           ║
║      - Apport initial versé (acompte 30% recommandé ou dérogé)                                                       ║
║      - Durée contractuelle (15 mois, 20 mois standard, ou durée personnalisée autorisée)                             ║
║      - Échéancier généré automatiquement & attaché au contrat                                                        ║
║      - Conditions particulières & Frais de cession (35 000 FCFA mentionnés distinctement)                            ║
║    • Date de signature & Prise d'effet juridique                                                                     ║
║    • Statut du contrat : En attente signature, Actif en cours de paiement, Soldé/Titre prêt, Résilié/Annulé, Forclos   ║
║    • Règle de Saisie Guichet (Secrétaire) : Statut initialement forcé à `DRAFT` (Brouillon) par trigger système       ║
║      avec interdiction stricte de modifier les montants financiers négociés ou d'activer le contrat sans visa hiérarchique║
║    • Documents associés (Coffre-fort WORM) : Convention 3 pages scellée, pièce d'identité client, PV de bornage      ║
║                                                                                                                      ║
║ 2. MODIFICATIONS CONTRACTUELLES & GESTION DES AVENANTS (AVN-)                                                        ║
║    • Changement de parcelle / Transfert de lot : Transfert des fonds versés vers un nouveau lot avec avenant          ║
║    • Réduction exceptionnelle en cours de vie du contrat : Arbitrage et visa souverain du PDG                        ║
║    • Substitution de bénéficiaire (Article 6 Convention) : Transfert officiel des droits à un membre de famille/tiers║
║    • Historique complet inaltérable de toute modification :                                                          ║
║      - Motif obligatoire et circonstancié de la modification                                                         ║
║      - Auteur de la saisie (Commercial / Directeur d'Agence)                                                         ║
║      - Validation & Visa obligatoire du PDG (Horodatage UTC+1, ID validateur, commentaire)                           ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 💵 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 14. CONDITIONS DE PAIEMENT & MODALITÉS

Le module **14. CONDITIONS DE PAIEMENT** encadre les formules financières d'acquisition et les règles d'apport :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 14. CONDITIONS DE PAIEMENT                                 ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. PAIEMENT COMPTANT (RÈGLEMENT TOTAL IMMÉDIAT)                                                                      ║
║    • Paiement total immédiat en un versement unique (ou sous 72h)                                                    ║
║    • Confirmation financière immédiate & Déblocage des formalités d'acte de cession (35 000 FCFA)                    ║
║    • Reçu libératoire officiel délivré immédiatement                                                                 ║
║                                                                                                                      ║
║ 2. PAIEMENT ÉCHELONNÉ (VENTE PROMOTIONNELLE PAR ÉCHÉANCES)                                                           ║
║    • Apport initial obligatoire : Standard recommandé à 30% du prix total de la parcelle                             ║
║    • Montant d'apport négociable : Dérogation possible avec autorisation/visa selon les permissions requises          ║
║    • Durée de l'échelonnement : 15 mois, 20 mois standard, ou durée négociée                                         ║
║    • Montant restant à échelonner calculé automatiquement : $S_{\text{restant}} = P_{\text{final}} - \text{Apport}$  ║
║    • Échéances périodiques : Mensualités régulières calculées au franc près                                          ║
║    • Dates d'échéances calendaires précises (ex: le 05 de chaque mois)                                               ║
║    • Tolérance & Période de grâce avant relance formelle                                                             ║
║    • Calcul automatique et instantané du solde restant dû après chaque versement                                     ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. 🔁 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 22. CHANGEMENT DE PARCELLE & TRANSFERT DE FONDS

Le module **22. CHANGEMENT DE PARCELLE** encadre la mutation d'un contrat vers un nouveau lot avec transfert sécurisé du capital versé :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 22. CHANGEMENT DE PARCELLE                                  ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. DONNÉES ET TRAÇABILITÉ DU CHANGEMENT DE PARCELLE                                                                  ║
║    • Ancienne parcelle A (Numéro, îlot, lotissement d'origine)                                                        ║
║    • Nouvelle parcelle B (Numéro, îlot, lotissement de destination - Vérifiée DISPONIBLE 🟢)                         ║
║    • Date et horodatage de l'opération                                                                               ║
║    • Motif circonstancié obligatoire (ex: Préférence d'angle, regroupement familial, changement de budget)            ║
║    • Utilisateur à l'initiative de la demande                                                                        ║
║    • Validation & Visa souverain du PDG (Avenant officiel AVN- généré)                                              ║
║    • Calcul automatique de la différence de prix :                                                                   ║
║      - Si Prix B > Prix A : Reliquat supplémentaire intégré dans le nouvel échéancier ou apport complémentaire       ║
║      - Si Prix B < Prix A : Avoir reporté réduisant les mensualités futures ou solde anticipé                         ║
║    • Historique complet inaltérable conservé dans le dossier client et le journal du contrat                         ║
║                                                                                                                      ║
║ 2. LIBÉRATION AUTOMATIQUE DE L'ANCIENNE PARCELLE                                                                     ║
║    • L'ancienne parcelle A repasse AUTOMATIQUEMENT au statut DISPONIBLE (🟢) dans le stock foncier,                   ║
║      sous réserve des règles applicables et du scellement de l'avenant.                                               ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 4. 📜 LA CONVENTION OFFICIELLE DE VENTE (TEXTE JURIDIQUE INTÉGRAL)

Toutes les ventes promotionnelles de parcelles souscrites auprès de l'entreprise sont régies par la **Convention Officielle de Vente de Terrain** (éditée sur trois (03) pages, en 1 exemplaire original avec mention *« Pour la légalisation »*) :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ CONVENTION DE VENTE DE TERRAIN — CONVENTION CLIENT N° : CONV-AAAA-XXXXX                                              ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ ENTRE LES SOUSSIGNÉS :                                                                                               ║
║                                                                                                                      ║
║ 1) La Société « AGENCE IMMOBILIERE MULTI-SERVICES » SARL, ayant son Siège social à Maradi / Quartier Ali Dan Sofo, ║
║    Immatriculée au RCCM de Maradi sous le N° NE/MAR/2023/B/502 du 12/07/2023,                                       ║
║    Représentée par son Directeur Général Monsieur Abdoul Aziz SALISSOU ADARE, agissant ès-qualités en vertu des     ║
║    pouvoirs qui lui ont été conférés ; de Nationalité Nigérienne ;                                                  ║
║    Ci-après dénommée « LE VENDEUR »                                                              D'UNE PART          ║
║                                                                                                                      ║
║ 2) Monsieur / Madame : [Nom & Prénoms de l'Acquéreur], demeurant à : [Adresse physique],                             ║
║    Né(e) le : [Date] à : [Lieu], Titulaire de la CNI ou Passeport N° : [Numéro Pièce],                               ║
║    Délivré(e) le : [Date Délivrance] par : [Autorité], de Nationalité : [Nationalité] ;                              ║
║    Ci-après dénommé(e) « LE BENEFICIAIRE »                                                       D'AUTRE PART        ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :                                                                            ║
║                                                                                                                      ║
║ • ARTICLE 1 : OBJET                                                                                                  ║
║   La présente convention est un acte de vente promotionnelle d’une ou des parcelle(s) moyennant le versement par    ║
║   échéance d’une somme d’argent par mois sur une période de VINGT (20) MOIS dont les termes sont détaillés.          ║
║                                                                                                                      ║
║ • ARTICLE 2 : DÉSIGNATION DE L'IMMEUBLE                                                                              ║
║   La vente promotionnelle objet de ce contrat concerne l’immeuble non-bâti sis à Guidan Kaji / TIBIRI (cf. arrêté),  ║
║   Parcelle N° [Numéro Lot], d’une superficie de [Surface] m², Îlot N° [Îlot], Lotissement : [Nom Lotissement].      ║
║                                                                                                                      ║
║ • ARTICLE 3 : ORIGINE DE PROPRIÉTÉ                                                                                   ║
║   Le terrain présentement vendu est la propriété de la société « AGENCE IMMOBILIERE MULTI-SERVICES » SARL pour      ║
║   l’avoir acquis de leurs propres deniers.                                                                           ║
║                                                                                                                      ║
║ • ARTICLE 4 : PRIX DE VENTE                                                                                          ║
║   Le prix de la vente promotionnelle de ladite parcelle est de : [Montant Total en FCFA] FRANCS CFA                 ║
║   hors frais d'acte de cession.                                                                                      ║
║                                                                                                                      ║
║ • ARTICLE 5 : MODE DE PAIEMENT & DOMICILIATION                                                                       ║
║   Le paiement du prix de vente se fera par le versement d’un montant de [Mensualité] Francs CFA par mois,            ║
║   sans interruption, sur une période de VINGT (20) MOIS.                                                             ║
║   Toutefois, le BÉNÉFICIAIRE qui est titulaire d’un compte bancaire peut faire l’objet d’une domiciliation de son     ║
║   compte afin d’être directement débité du montant au profit de la société « AGENCE IMMOBILIERE MULTI-SERVICES » SARL║
║                                                                                                                      ║
║ • ARTICLE 6 : CLAUSE DE SUBSTITUTION (FAMILLE OU TIERS)                                                              ║
║   En cas d'incapacité à honorer ses engagements, Le BÉNÉFICIAIRE peut se faire substituer par un membre de sa        ║
║   famille ou toute autre personne de son choix afin d'assurer le respect de la continuité des engagements restant    ║
║   dans le but de ne pas perdre la parcelle. Cette procédure doit faire l’objet d’un acte écrit et signé.             ║
║                                                                                                                      ║
║ • ARTICLE 7 : DÉLIVRANCE DE L'ACTE DE CESSION & FRAIS DE TRANSFERT (35 000 FCFA)                                    ║
║   À la fin du versement de la totalité du montant (Article 4), le BÉNÉFICIAIRE a le droit de réclamer l’Acte de      ║
║   cession de l'immeuble non bâti moyennant le paiement de la somme de 35 000 FRANCS CFA pour le transfert en son nom║
║                                                                                                                      ║
║ • ARTICLE 8 : OBLIGATIONS DES PARTIES & GESTION DES RETARDS                                                          ║
║   LE BÉNÉFICIAIRE s’engage à :                                                                                       ║
║   - Respecter le délai de versement et de prévenir la comptabilité de la société pour signaler un retard de          ║
║     versement indépendant de sa volonté, que la société se réserve le droit d’en apprécier la portée ;               ║
║   - Respecter les termes du contrat et à n’y apporter aucun grief pour justifier un défaut de versement ;            ║
║   - En cas de non versement de deux (2) mensualités successives, le BÉNÉFICIAIRE doit régulariser sa situation       ║
║     avant la fin du troisième (3ème) mois d’impayés, à défaut de quoi, la société se réserve le droit de rendre     ║
║     forclos le BÉNÉFICIAIRE ou lui accorder un nouveau délai.                                                        ║
║   La société « AGENCE IMMOBILIERE MULTI-SERVICES » SARL s’engage :                                                  ║
║   - Au respect des termes de la convention ;                                                                         ║
║   - À garantir au BÉNÉFICIAIRE la disponibilité réelle de la parcelle jusqu’au jour de la remise du titre ;          ║
║   - À remettre au BÉNÉFICIAIRE tous documents nécessaires à l’établissement de la preuve de sa propriété.           ║
║                                                                                                                      ║
║ • ARTICLE 9 : CLAUSE DE RÉSILIATION DE PLEIN DROIT & INDEMNISATION                                                   ║
║   - À défaut pour le BÉNÉFICIAIRE d’effectuer régulièrement ses versements, le contrat sera résilié de plein droit ; ║
║   - À défaut pour la société d’honorer ses engagements, le contrat sera résilié de plein droit ;                     ║
║   - Par contre, une résiliation abusive sans aucun motif lié aux termes des présentes obligerait son auteur à        ║
║     dédommager l’autre partie des pertes que cette résiliation aura occasionnées.                                    ║
║                                                                                                                      ║
║ • ARTICLE 10 : RÈGLEMENT DES LITIGES & JURIDICTION                                                                   ║
║   En cas de litige, recherche obligatoire d'un règlement amiable. À défaut, attribution exclusive de juridiction     ║
║   aux Tribunaux compétents (Tribunal de Commerce / Grande Instance de Maradi).                                       ║
║                                                                                                                      ║
║ • ARTICLE 11 : ÉLECTION DE DOMICILE                                                                                  ║
║   Élection de domicile aux adresses respectives énoncées aux présentes.                                              ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ ⚠️ NB OBLIGATOIRE : Munissez-vous de 30% du montant Total au premier versement (Acompte d'entrée).                  ║
║ Établi à Maradi, en Un (01) exemplaire original sur trois (03) pages — Pour la légalisation.                        ║
║                                                                                                                      ║
║            Pour la Société « AIMS » SARL                                      Le Bénéficiaire (Client)               ║
║         M. Abdoul Aziz SALISSOU ADARE                                         M. / Mme .....................         ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🧩 LES 4 RÈGLES D'OR DE GESTION MÉTIER DÉCOULANT DU TEXTE OFFICIEL

1. **Acompte Obligatoire de 30% au Premier Versement** :
   Le système interdit la validation d'une vente si le premier encaissement est strictement inférieur à $30\%$ du prix total du lot (sauf dérogation expresse accordée par le PDG).
2. **Durée Standard de 20 Mois & Prélèvements Bancaires** :
   Le plan d'amortissement standard est calé sur 20 échéances mensuelles régulières, avec support de la domiciliation bancaire directe.
3. **Frais d'Acte de Cession de 35 000 FCFA (Article 7)** :
   Une ligne distincte de facturation de $35\,000$ FCFA est automatiquement adossée au dossier lors de la dernière échéance pour le transfert notarié/administratif du titre au nom de l'acquéreur.
4. **Protocole de Substitution (Article 6)** :
   En cas de difficulté financière, le client peut formaliser un acte de substitution (conjoint, enfant, tiers) via un Avenant `AVN-` afin de transférer ses droits et de ne pas perdre la parcelle.
5. **Règle des 2 Impayés avec Délai au 3ème Mois (Article 8)** :
   Le système déclenche les alertes à $M+1$ et $M+2$, et positionne le dossier en **Forclusion / Résiliation** uniquement à l'échéance du $3^{\text{ème}}$ mois d'impayé consécutif.

---

## 3. 🗄️ SCHÉMAS DE DONNÉES TECHNIQUES (TYPESCRIPT / POSTGRESQL)

```typescript
// Entité Contrat / Convention de Vente Officielle
export interface SalesContract {
  id: string;
  contract_number: string;        // "CTR-2026-00089"
  convention_number: string;      // "CONV-2026-00089"
  agency_id: string;
  client_id: string;
  parcel_id: string;
  sales_agent_id: string;
  
  // Données Juridiques & Cadastrales
  location_subdivision_name: string; // ex: "Guidan Kaji / TIBIRI"
  ministerial_decree_reference: string;
  island_number: string;
  parcel_number: string;
  surface_area_sqm: number;
  
  // Données Financières Officielles
  total_sale_price_xof: number;   // Prix total de la parcelle
  downpayment_required_30_percent_xof: number; // 30% obligatoire
  downpayment_paid_xof: number;
  transfer_deed_fee_xof: number;  // Frais d'acte : 35 000 FCFA (Art. 7)
  
  // Plan de Paiement
  payment_plan_months: number;    // 20 mois par défaut (Art. 1 & 5)
  monthly_installment_xof: number;
  has_bank_direct_debit: boolean; // Domiciliation bancaire (Art. 5)
  bank_name?: string;
  
  // Gestion de la Substitution (Art. 6)
  is_substituted: boolean;
  substituted_to_person_name?: string;
  substitution_act_scan_url?: string;
  
  // Suivi des Impayés & Forclusion (Art. 8)
  consecutive_unpaid_months_count: number; // 0, 1, 2 ou 3
  is_in_grace_period_month_3: boolean;
  is_foreclosed: boolean;         // Rendu forclos si non régularisé à la fin du 3e mois
  
  // Validations & Signatures
  ceo_name: string;               // "Abdoul Aziz SALISSOU ADARE"
  ceo_signature_date: string;
  status: 'DRAFT' | 'ACTIVE_IN_PAYMENT' | 'GRACE_PERIOD_OVERDUE' | 'FORECLOSED' | 'FULLY_PAID_TITLE_READY' | 'SUBSTITUTED' | 'TERMINATED';
  
  created_at: string;
  updated_at: string;
}
```

---

## 5. 🤝 MATRICE OFFICIELLE DES PERMISSIONS : CONTRATS & CONVENTIONS (MODULES 13, 14 & 22)

```text
LÉGENDE DE LA MATRICE :
👁️ Voir | ➕ Créer | ✏️ Modifier | 📤 Soumettre | ✅ Valider | ❌ Annuler | 💰 Opération financière | 📄 Générer | 📥 Exporter | ⚙️ Administrer | 🔒 Accès interdit
RÈGLE FONDAMENTALE : « VOIR ≠ MODIFIER ≠ VALIDER »
```

### 5.1. 🤝 Gestion des Contrats & Engagements Juridiques (Zone Extrêmement Sensible)

| Action sur les Contrats | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consulter les contrats** | 👁️ (Tout le réseau) | 👁️ (Tous contrats) | 👁️ (Lecture/Dossiers)| 👁️ (Son portefeuille)| 👁️ (Son agence) | 👁️ (Technique) |
| **Préparer un contrat (Saisie données)**| 👁️ | 🔒 | ➕ / ✏️ (Dossiers simples)| ➕ / ✏️ (Saisie dossier)| 👁️ / ✏️ | 🔒 |
| **Vérifier les éléments administratifs**| 👁️ | 🔒 | 👁️ (Contrôle pièces KYC)| 👁️ | ✅ (Contrôle agence)| 🔒 |
| **Vérifier les éléments financiers** | 👁️ | ✅ (Vérification stricte)| 🔒 | 🔒 | 👁️ | 🔒 |
| **Soumettre pour validation** | 👁️ | 📤 (Avis financier) | 📤 (Dossier complet) | 📤 (Soumettre contrat)| 📤 (Transmission) | 🔒 |
| **Validation finale & Visa souverain** | 🔴 👑 (Signature souveraine)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Générer le PDF officiel (3 pages)** | 📄 | 📄 | 📄 (Impression/Remise)| 📄 (Téléchargement) | 📄 | ⚙️ |
| **Avenant (Changement lot/transfert)** | 🔴 👑 (Visa Souverain)| 👁️ (Impacts financiers)| 🔒 | 📤 (Demande avenant) | 📤 (Avis agence) | 🔒 |
| **Résilier / Annuler un contrat** | 🔴 👑 (Décision exclusive)| 👁️ / 💰 (Calcul retenue 20%)| 🔒 | 🔒 | 📤 (Signalement) | 🔒 |
| **Administration technique du système** | 👁️ | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ (Accès DB/Sécu)|

### 📌 Répartition Détaillée des Rôles sur les Contrats :
- **📣 Commercial :** Préparer le dossier, saisir les informations d'identité et de choix du lot, déclarer les éventuels apporteurs d'affaires externes (`external_brokers`), et soumettre le projet de contrat à la chaîne d'approbation. Le contrat validé déclenche automatiquement le calcul de sa commission (`commercial_commissions`).
- **🧑💼 Secrétaire :** Préparer certains dossiers administratifs, vérifier la complétude des scans KYC et imprimer les exemplaires physiques pour légalisation.
- **🏢 Responsable d'agence :** Vérifier minutieusement la cohérence du dossier, du lot et des pièces avant transmission.
- **📊 Comptable :** Contrôler et certifier impérativement les éléments financiers (respect de l'acompte 30%, conformité de l'échéancier, vérification du compte d'encaissement).
- **👑 PDG :** Validation finale et signature souveraine de chaque contrat de vente et de ses avenants.
- **🛠️ Admin technique :** ❌ **Ne décide JAMAIS du contenu métier ou juridique d'un contrat** ; assure uniquement la disponibilité technique et la sécurité des données.

---

## 6. 🔄 RÈGLES DE CONTRÔLE INTERNE & AUDIT DU DOMAINE 08
- **Édition Conforme sur 3 Pages** : Le module d'impression PDF génère obligatoirement les 3 pages normées avec les 11 articles et l'en-tête RCCM `NE/MAR/2023/B/502`.
- **Verrouillage des 35 000 FCFA** : L'Attestation de Solde et l'Acte de Cession ne peuvent être délivrés tant que les $35\,000$ FCFA de frais d'acte n'ont pas été acquittés.
- **Historique de Substitution** : Tout changement de bénéficiaire conserve l'historique complet du premier souscripteur et des montants qu'il avait réglés.
