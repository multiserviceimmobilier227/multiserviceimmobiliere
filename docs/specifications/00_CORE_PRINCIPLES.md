# 🛡️ SPÉCIFICATION 00 : DOCTRINE CENTRALE, IDENTITÉ LÉGALE & PRINCIPE FONDATEUR DE MSI 2.0
**Inventaire Fonctionnel Détaillé des Modules 46 (Moteur de Règles Configurable), 47 (Intelligence Automatisée & Moteur Métier), 48 (Matrice des Cas Exceptionnels), 49 (Séparation Stricte des Responsabilités) & 50 (Principe Central & Chaîne Métier Complète)**

---

## 1. 🏛️ IDENTITÉ JURIDIQUE & STATUTAIRE OFFICIELLE

Toutes les pièces contractuelles, financières et cadastrales de la plateforme sont émises sous l'identité légale inaltérable :

```text
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                              IDENTITÉ STATUTAIRE OFFICIELLE DE L'ENTREPRISE                      │
  ├──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ • Dénomination Sociale  : AGENCE IMMOBILIERE MULTI-SERVICES SARL                                 │
  │ • Forme Juridique       : Société à Responsabilité Limitée (SARL)                                │
  │ • Siège Social          : Maradi / Quartier Ali Dan Sofo (République du Niger)                   │
  │ • Immatriculation RCCM  : N° NE/MAR/2023/B/502 du 12/07/2023 (Tribunal de Commerce de Maradi)  │
  │ • Direction Générale    : M. Abdoul Aziz SALISSOU ADARE, Directeur Général (Nationalité Nigérienne)│
  │ • Objet Statutaire      : Vente promotionnelle de parcelles, aménagements fonciers, immobilier   │
  └──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 🧠 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 46. MOTEUR DE RÈGLES CONFIGURABLE (ZÉRO HARDCODING)

Le module **46. MOTEUR DE RÈGLES** permet d'administrer dynamiquement tous les paramètres de gestion de l'entreprise sans jamais modifier le code source :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 46. MOTEUR DE RÈGLES CONFIGURABLE                          ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. PARAMÈTRES COMMERCIAUX & RÉSERVATIONS :                                                                           ║
║    • Durée standard de réservation gratuite (défaut : 15 jours calendaires)                                          ║
║    • Pourcentage d'apport initial recommandé / acompte à la signature (défaut : 30%, configurable de 0% à 100%)      ║
║    • Durées standards des plans d'échéancier (15 mois, 20 mois, au comptant, personnalisable)                        ║
║    • Tolérance de retard d'échéance avant première relance (défaut : 5 jours de grâce)                              ║
║    • Taux standard de retenue contractuelle sur annulation / résiliation (défaut : 20% du montant versé)             ║
║                                                                                                                      ║
║ 2. SEUILS D'ALERTES, DÉLAIS & NOTIFICATIONS :                                                                        ║
║    • Délais de notification préventive WhatsApp / SMS (J-7, J-2, Jour J, J+5, J+15)                                  ║
║    • Seuil d'impayé critique pour saisine du Comité de Médiation (défaut : 2 mensualités consécutives / 60 jours)    ║
║    • Seuil de tolérance d'écart de caisse nécessitant PV justificatif obligatoire (défaut : > 0 FCFA)                ║
║    • Plafond de décaissement de dépenses agence sans visa PDG (défaut : 250 000 FCFA)                                ║
║                                                                                                                      ║
║ 3. NUMÉROTATION, CATÉGORIES & COMPTABILITÉ :                                                                         ║
║    • Préfixes et masques de numérotation séquentielle annuelle (CTR-AAAA-XXXX, RCP-, DEV-, RES-, RMB-, DECH-)        ║
║    • Nomenclature et catégories de dépenses d'exploitation (Classe 6 SYSCOHADA)                                      ║
║    • Paramètres comptables (Comptes de tiers 4111, Trésorerie 5211/5711, Ventes de terrains 7011, Pénalités 7078)  ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. 🤖 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 47. INTELLIGENCE DU LOGICIEL (CALCULS AUTOMATISÉS SANS DÉVIATION)

Le module **47. INTELLIGENCE DU LOGICIEL** assure le calcul instantané et mathématiquement exact de l'ensemble des grandeurs financières et foncières de MSI SARL :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 47. MOTEUR DE CALCULS MÉTIER AUTOMATISÉS                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. CALCULS CONTRATS & ÉCHÉANCIERS :                                                                                  ║
║    • Solde total du contrat = Prix convenu net après remise - Total des versements validés (RCP-)                    ║
║    • Reste à payer par échéance et mensualité restante due                                                           ║
║    • Ventilation automatique des paiements par imputation chronologique stricte (Échéance 1 → Échéance N)           ║
║    • Détection et calcul dynamique du nombre de jours de retard par rapport aux dates limites d'exigibilité          ║
║    • Taux de progression du paiement (en % du prix total contracté)                                                  ║
║                                                                                                                      ║
║ 2. CALCULS DE RÉSILIATION & REMBOURSEMENT :                                                                          ║
║    • Montant de la retenue contractuelle = $\text{Versements cumulés} \times 20\%$ (ou taux dérogatoire PDG)          ║
║    • Montant net remboursable = $\text{Versements cumulés} - \text{Retenue}$                                         ║
║    • Solde restant à rembourser sur échéancier de remboursement ordonnancé                                           ║
║                                                                                                                      ║
║ 3. CALCULS DE RENTABILITÉ & TRÉSORERIE :                                                                             ║
║    • Coût de revient d'une parcelle = $\text{Coût d'acquisition au m²} \times \text{Superficie} + \text{Quote-part VRD}$║
║    • Marge brute contractée = $\text{Prix de vente HT} - \text{Coût d'acquisition}$                                  ║
║    • Marge nette réelle encaissée = $\text{Total cash encaissé} - \text{Dépenses d'aménagement imputées}$             ║
║    • Trésorerie consolidée = $\sum \text{Soldes Banques} + \sum \text{Soldes Caisses}$                               ║
║    • Écart de caisse = $\text{Billetage physique réel} - \text{Solde théorique système}$                             ║
║    • 💡 POSITIONNEMENT DE L'IA : L'IA vient au-dessus du système pour l'assistance contextuelle, l'analyse prédictive ║
║      et les synthèses, mais NE REMPLACE JAMAIS ni ne contourne les règles métier strictes.                           ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 4. 🧪 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 48. MATRICE DE GESTION DES CAS EXCEPTIONNELS

Le module **48. CAS EXCEPTIONNELS** confère à MSI 2.0 la robustesse nécessaire pour traiter nativement toutes les situations complexes de terrain :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 48. MATRICE DES CAS EXCEPTIONNELS                          ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. AVANT-VENTE & PAIEMENTS :                                                                                         ║
║    • Réservation expirée : Libération automatique du lot en statut DISPONIBLE 🟢 et notification au commercial.      ║
║    • Paiement partiel : Imputation sur l'échéance en cours, ajustement du reliquat dû sans blocage.                  ║
║    • Paiement anticipé / Plusieurs mois payés : Cascade d'imputation sur les échéances futures dans l'ordre.        ║
║    • Paiement excédentaire (surpaiement) : Création automatique d'un crédit client reportable ou remboursable.       ║
║    • Retard prolongé (>= 60j) : Blocage d'attribution définitive et transfert au Comité de Médiation.               ║
║                                                                                                                      ║
║ 2. MODIFICATIONS DE CONTRAT & FONCIER :                                                                              ║
║    • Changement de parcelle (Transfert de lot) : Clôture du contrat A, transfert intégrale des fonds sur lot B.      ║
║    • Réduction tarifaire après premier paiement : Avenant contractuel AVN-, recalibrage des mensualités restantes.   ║
║    • Annulation & Révocation : Application retenue 20%, émission décharge DECH-, libération du lot en vente.         ║
║    • Remboursement intégral (Dérogation PDG sans retenue), partiel ou échelonné sur plusieurs mois.                  ║
║    • Parcelle revendue alors que le remboursement de l'ancien client est encore en cours : Traitement comptable       ║
║      déconnecté (le nouvel acquéreur paye normalement, la dette de remboursement suit son propre ordonnancement).    ║
║                                                                                                                      ║
║ 3. GOUVERNANCE, ERREURS & ORGANISATION :                                                                             ║
║    • Correction financière / Erreur de saisie : Contre-passation avec motif obligatoire (zéro DELETE).               ║
║    • Écart de caisse : Déclaration PV d'écart justifié scellé dans l'audit.                                          ║
║    • Dépense sans justificatif fiscal immédiat : Bon de décharge provisoire avec obligation de régularisation.       ║
║    • PDG absent : Délégation temporaire de signature paramétrée sur le Chef Comptable pour la gestion courante.      ║
║    • Comptable agissant seule : Exécution autonome strictement circonscrite aux plafonds et permissions de son rôle. ║
║    • Opération sensible : Blocage automatique et mise en attente de visa souverain du PDG.                          ║
║    • Croissance multi-agences : Cloisonnement strict des données agences avec consolidation automatique Siège.       ║
║    • Multi-contrats client : Un compte client unique consolidant plusieurs contrats et parcelles distinctes.         ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 5. 🔒 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 49. PRINCIPE DE SÉPARATION STRICTE DES RESPONSABILITÉS

Le module **49. SÉPARATION DES RESPONSABILITÉS** brise tout cumul de rôles non sécurisé selon la chaîne rigoureuse des 5 étapes :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 49. CHAÎNE DES 5 MAILLONS DU CONTRÔLE INTERNE              ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                                                      ║
║   1. ✍️ SAISIE            2. 🔍 CONTRÔLE           3. 👑 VALIDATION         4. ⚡ EXÉCUTION          5. 🛡️ AUDIT       ║
║  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐      ║
║  │ Commercial /   │ ──► │ Chef Comptable │ ──► │ Directeur      │ ──► │ Caissier /     │ ──► │ Master Log     │      ║
║  │ Assistant      │     │ ou Resp Agence │     │ Général (PDG)  │     │ Comptable      │     │ Inaltérable    │      ║
║  └────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘      ║
║   Initiation de la       Vérification des       Décision d'octroi      Décaissement,          Journalisation  ║
║   demande (devis,        pièces, calculs        (remise de prix,       encaissement,          automatique des ║
║   réservation, etc.)     et conformité          résiliation, etc.)     émission du reçu       9 attributs     ║
║                                                                                                                      ║
║ 🛡️ RÈGLE ABSOLUE :                                                                                                   ║
║ « UNE MÊME PERSONNE NE PEUT PAS CRÉER → MODIFIER → VALIDER → EXÉCUTER LA MÊME OPÉRATION SENSIBLE. »                   ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 6. 🧭 INVENTAIRE FONCTIONNEL DÉTAILLÉ : 50. PRINCIPE CENTRAL & CHAÎNE MÉTIER UNIFIÉE DE MSI 2.0

Le module **50. CHAÎNE MÉTIER CENTRALE** est la colonne vertébrale qui structure l'intégralité du cycle de vie immobilier de MSI 2.0 :

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                          INVENTAIRE FONCTIONNEL DU MODULE 50. LE GRAND CYCLE DE VIE MÉTIER MSI 2.0                   ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 1. 🏗️ LA BRANCHE PRINCIPALE DU CYCLE DE VIE (DU FONCIER À LA CLÔTURE) :                                              ║
║                                                                                                                      ║
║    🗺️ Acquisition Foncière (Terrain Mère)                                                                            ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    📐 Lotissement & Bornage Géomètre                                                                                 ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    🧱 Découpage en Îlots                                                                                             ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    📍 Délimitation des Parcelles (8 Statuts Cadastraux)                                                              ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    🏷️ Grille Tarifaire / Offres de Prix au m²                                                                        ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    👥 Prospect & Qualification CRM                                                                                   ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    ⏱️ Réservation Gratuite (Option 15 Jours)                                                                         ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    🎯 Attribution du Lot (Option Levée / Acompte)                                                                    ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    📜 Contrat de Vente / Convention Officielle (CTR-)                                                                ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    📅 Moteur d'Échéancier Personnalisé (ECH-)                                                                        ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    💳 Encaissement Multi-Canaux (Caisse / Banque / Mobile Money)                                                     ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    🧾 Émission du Reçu Officiel Certifié QR Code (RCP-)                                                              ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    💰 Supervision Caisse & Trésorerie                                                                                ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    🧮 Intégration Comptable SYSCOHADA (Partie Double)                                                                ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    🟣 Paiement Complet (100% Soldé)                                                                                  ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    📑 Génération des Documents Finaux (Attestation de Solde ATTS-, Acte de Cession)                                  ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    🏁 Cession Notariée, Mutation & Clôture Définitive                                                                ║
║                                                                                                                      ║
║ 2. ↩️ LA DEUXIÈME BRANCHE (RÉSILIATION, RETENUE & REMBOURSEMENT) :                                                   ║
║                                                                                                                      ║
║    ❌ Demande d'Annulation / Résiliation de Contrat                                                                  ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    📄 Signature de la Décharge d'Annulation Préliminaire (DECH-)                                                     ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    ⚖️ Calcul & Application de la Retenue Contractuelle (20% ou Dérogation PDG)                                      ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    💸 Ordonnancement & Exécution du Remboursement Net (RMB-)                                                         ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    📑 Signature de la Décharge Finale de Règlement Total                                                             ║
║         │                                                                                                            ║
║         ▼                                                                                                            ║
║    🟢 Remise Immédiate de la Parcelle en Statut DISPONIBLE                                                           ║
║                                                                                                                      ║
║ 3. 🌐 LES MODULES TRANSVERSAUX INTÉGRÉS :                                                                            ║
║    👥 Clients (Multi-Lots) + 📁 Documents WORM + 📲 Notifications WhatsApp/SMS +                                    ║
║    🛡️ Audit Total (9 Attributs) + 🔐 Matrice RBAC (18 Familles) + 📊 Rapports Multidimensionnels                     ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 7. 🧭 LE MANIFESTE DES 3 RÈGLES D'OR DE MSI 2.0

Le système MSI 2.0 repose sur trois piliers doctrinaux non négociables :

```text
  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
  │                                    LES 3 PILIERS DOCTRINAUX                                      │
  ├─────────────────────────────────┬─────────────────────────────────┬──────────────────────────────┤
  │ 1. LE PRINCIPE DES 4 QUESTIONS  │ 2. LE ZÉRO SUPPRESSION (DELETE) │ 3. LA SÉPARATION STRICTE     │
  │    Aucun événement ne survient  │    Aucune donnée financière ou   │    DES POUVOIRS              │
  │    sans QUI, QUOI, QUAND et     │    métière ne disparaît jamais  │    L'admin technique n'a     │
  │    AUTORISATION inaltérables.   │    du système d'information.    │    aucun pouvoir financier.  │
  └─────────────────────────────────┴─────────────────────────────────┴──────────────────────────────┘
```

---

## 8. 🔍 LE PRINCIPE DIRECTEUR DES 4 QUESTIONS (L'AUDIT TOTAL)

Chaque action, enregistrement, modification, encaissement, remise de prix ou changement d'état d'un lotissement/contrat doit obligatoirement répondre en temps réel aux 4 questions fondamentales :

```text
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                    LE QUADRILATÈRE D'AUDIT SCELLÉ                       │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ 1. 👤 QUI ? (L'Auteur de l'action)                                      │
  │    • Identifiant unique de l'utilisateur (`user_id`)                    │
  │    • Nom, Prénom, Profil métier et Rôle actif                           │
  │    • Agence d'affectation (`agency_id`) & Rôle de rattachement          │
  │    • Empreinte technique (Adresse IP, Navigateur / Device)              │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ 2. 📝 QUOI ? (La Mutation exacte des données)                           │
  │    • Table ciblée et Identifiant de l'enregistrement (`record_id`)      │
  │    • Nature de l'opération (`CREATE`, `UPDATE_FIELD`, `CANCEL`...)      │
  │    • Snapshot JSON complet de l'état AVANT (`old_values`)               │
  │    • Snapshot JSON complet de l'état APRÈS (`new_values`)               │
  │    • Motif / Justification circonstanciée obligatoire                   │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ 3. ⏱️ QUAND ? (L'Horodatage Inaltérable)                                 │
  │    • Horodatage précis à la microseconde (Format ISO 8601 UTC+1)        │
  │    • Séquence temporelle certifiée non modifiable                       │
  ├─────────────────────────────────────────────────────────────────────────┤
  │ 4. 🛡️ AVEC QUELLE AUTORISATION ? (Le Titre Habilitant)                   │
  │    • Famille de permission exacte requise (ex: `FAM_I_PAYMENTS_WRITE`)  │
  │    • Périmètre d'application vérifié (`GLOBAL`, `AGENCE`, `PERSO`)      │
  │    • Visa d'approbation si délégation hiérarchique (ex: `Visa_PDG_ID`)  │
  └─────────────────────────────────────────────────────────────────────────┘
```

---

## 9. 🚫 LA RÈGLE ABSOLUE : "ZÉRO DISPARITION SILENCIEUSE" (`ZERO DELETE`)

> **Règle Fondamentale :**  
> *« Aucune opération financière, commerciale ou patrimoniale importante ne doit pouvoir disparaître silencieusement. »*  
> **Le bouton `Supprimer` (`DELETE`) est proscrit sur toutes les tables opérationnelles.**

En cas d'erreur de saisie, de double saisie, de rétractation ou de changement de décision, on utilise **exclusivement l'une des 6 actions contrôlées de traçabilité** :

```text
  ┌───────────────────────┬──────────────────────────────────────────────────────────────────────────┐
  │ Action Contrôlée      │ Comportement Système & Conséquence Comptable                             │
  ├───────────────────────┼──────────────────────────────────────────────────────────────────────────┤
  │ 1. ↩️ ANNULER         │ Neutralise une écriture erronée par contre-passation comptable inverse   │
  │                       │ avec saisie obligatoire d'un motif audité. L'écriture d'origine reste.   │
  ├───────────────────────┼──────────────────────────────────────────────────────────────────────────┤
  │ 2. ✏️ CORRIGER        │ Rectifie une coquille matérielle (ex: nom mal orthographié) en conservant│
  │                       │ la valeur précédente dans le journal d'historique.                       │
  ├───────────────────────┼──────────────────────────────────────────────────────────────────────────┤
  │ 3. 🔄 REMPLACER       │ Substitue une entité par une autre (ex: mutation d'une parcelle A vers   │
  │                       │ une parcelle B dans le cadre d'un avenant contractuel AVN-).             │
  ├───────────────────────┼──────────────────────────────────────────────────────────────────────────┤
  │ 4. 📦 ARCHIVER        │ Désactive la visibilité opérationnelle directe d'une entité obsolète     │
  │                       │ tout en conservant son intégrité relationnelle et financière.            │
  ├───────────────────────┼──────────────────────────────────────────────────────────────────────────┤
  │ 5. 🚫 RÉVOQUER        │ Retire formellement un droit, une procuration ou une option de           │
  │                       │ réservation arrivée à terme avec notification aux parties.               │
  ├───────────────────────┼──────────────────────────────────────────────────────────────────────────┤
  │ 6. ⚖️ JUSTIFIER       │ Consigne un procès-verbal officiel pour expliquer un écart matériel      │
  │                       │ (ex: écart de caisse physique vs théorique, dérogation exceptionnelle).  │
  └───────────────────────┴──────────────────────────────────────────────────────────────────────────┘
```

---

## 10. ⚖️ SÉPARATION STRICTE DES POUVOIRS (LA MATRICE DE GOUVERNANCE)

L'architecture de sécurité de MSI 2.0 empêche tout cumul de fonctions incompatible avec le contrôle interne :

```text
                                  ┌─────────────────────────────────────────┐
                                  │      👑 DIRECTION GÉNÉRALE (PDG)        │
                                  │   Autorité Souveraine de Décision       │
                                  └─────────────────────────────────────────┘
                                                       │
         ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
         ▼                                             ▼                                             ▼
  ┌──────────────────────────────┐              ┌──────────────────────────────┐              ┌──────────────────────────────┐
  │ 🧮 CHEF COMPTABLE / DAF      │              │ 🏢 DIRECTEUR D'AGENCE        │              │ 🛠️ ADMINISTRATEUR SYSTÈME    │
  │ • Certification flux distants│              │ • Supervision des ventes     │              │ • Gestion des comptes users  │
  │ • Écritures SYSCOHADA        │              │ • Options & Visites locales  │              │ • Maintien de l'infra IT     │
  │ • Rapprochement bancaire     │              │ • Dépenses agence <= 250k    │              │ • Surveillance logs RLS      │
  │ ❌ Aucun pouvoir de remise   │              │ ❌ Aucun pouvoir de remise   │              │ ❌ AUCUN POUVOIR FINANCIER   │
  │    ou modification de prix   │              │    ou modification de prix   │              │    OU COMMERCIAL             │
  └──────────────────────────────┘              └──────────────────────────────┘              └──────────────────────────────┘
```

---

## 11. 🗄️ SCHÉMA POSTGRESQL DU LOG D'AUDIT MAÎTRE (9 ATTRIBUTS)

```sql
-- Table d'Audit Append-Only Inaltérable (Aucun UPDATE, Aucun DELETE permis)
CREATE TABLE msi_master_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp_utc1 TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'Africa/Niamey'),
    
    -- 1. QUI ?
    user_id UUID NOT NULL REFERENCES msi_users(id),
    user_full_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    agency_id UUID REFERENCES msi_agencies(id),
    ip_address INET NOT NULL,
    user_agent TEXT,
    
    -- 2. QUOI ?
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('CREATE', 'UPDATE', 'CANCEL', 'CORRECT', 'REPLACE', 'ARCHIVE', 'REVOKE', 'JUSTIFY', 'APPROVE', 'REJECT')),
    entity_table VARCHAR(60) NOT NULL,
    entity_id UUID NOT NULL,
    entity_reference VARCHAR(60), -- ex: 'RCP-2026-00342', 'CTR-2026-00089'
    old_values JSONB,             -- État complet avant modification
    new_values JSONB,             -- État complet après modification
    change_reason TEXT NOT NULL,  -- Motif circonstancié obligatoire
    
    -- 3. AUTORISATION ?
    permission_code VARCHAR(80) NOT NULL, -- ex: 'FAM_F_PRICING_OVERRIDE_CEO'
    validator_user_id UUID REFERENCES msi_users(id),
    
    -- 4. INTÉGRITÉ CRYPTOGRAPHIQUE
    hash_signature VARCHAR(64) NOT NULL -- SHA-256 (user_id + entity_id + timestamp + new_values)
);

-- Règle d'inviolabilité absolue : Bloquer toute tentative d'UPDATE ou de DELETE sur l'audit
CREATE OR REPLACE RULE prevent_audit_update AS ON UPDATE TO msi_master_audit_logs DO INSTEAD NOTHING;
CREATE OR REPLACE RULE prevent_audit_delete AS ON DELETE TO msi_master_audit_logs DO INSTEAD NOTHING;
```
