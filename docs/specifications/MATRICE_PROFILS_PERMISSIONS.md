# 🛡️ MSI 2.0 — MATRICE OFFICIELLE COMPLÈTE DES PROFILS, PAGES & PERMISSIONS (RBAC MATRICIEL)

Ce document constitue la **référence doctrinale unique et exhaustive** de la matrice des profils, pages, actions et permissions de MSI 2.0. Il est conçu selon la règle fondamentale : **« Voir ≠ Modifier ≠ Valider »** et sans aucun rôle codé en dur.

---

## 1. 👥 LES PROFILS DE RÉFÉRENCE ET LEURS ROLES RESPECTIFS

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                        LES 6 PROFILS BACK-OFFICE MSI 2.0                                             ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 👑 PDG                               │ Direction générale, décisions souveraines, visas stratégiques, supervision   ║
║ 📊 Comptable                         │ Finance, caisses, trésorerie, paiements, dépenses, remboursements, SYSCOHADA ║
║ 🧑💼 Secrétaire / Agent Administratif │ Opérations administratives de base, accueil, conformité dossiers KYC, tâches ║
║ 📣 Commercial                        │ Prospection active, CRM, portefeuille clients, catalogue d'offres, options 15j║
║ 🏢 Responsable d'Agence              │ Gestion et supervision opérationnelle de son agence, stock agence, visas loc.║
║ 🛠️ Informaticien / Admin Technique   │ Administration technique, gestion des utilisateurs, rôles & permissions, sécu║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║                                         APPLICATION CLIENT EXTERNE DÉDIÉE                                            ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 👤 Client (PWA Espace Client)        │ Ne se connecte JAMAIS au back-office. Dispose d'une PWA mobile autonome      ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. 🔣 LÉGENDE UNIFIÉE DES 12 SYMBOLES D'ACTION

| Symbole | Intitulé | Définition Métier |
| :---: | :--- | :--- |
| **👁️** | **Voir** | Consultation simple en lecture seule dans le périmètre autorisé. |
| **➕** | **Créer** | Saisie et enregistrement initial d'une donnée ou d'un dossier. |
| **✏️** | **Modifier** | Rectification ou mise à jour de champs éditables (avec audit trail). |
| **📤** | **Soumettre** | Transmission d'un dossier ou d'une demande pour avis ou visa hiérarchique. |
| **✅** | **Valider** | Visa formel ou approbation obligatoire d'un niveau d'autorisation. |
| **❌** | **Annuler** | Annulation traçable d'un processus ou libération avec justification. |
| **💰** | **Opération financière** | Encaissement, décaissement, imputation, versement ou remboursement. |
| **📄** | **Générer** | Création d'un document officiel scellé (PDF avec QR Code). |
| **📥** | **Exporter** | Extraction sécurisée de données au format Excel / CSV (logguée). |
| **⚙️** | **Administrer** | Configuration technique du système, des tables et de l'infrastructure. |
| **⚡** | **Automatique** | Tâche planifiée exécutée par le moteur système (ex: libération à J+15). |
| **🔒** | **Accès interdit** | Restriction absolue d'accès sans dérogation possible. |

---

## 3. 🏠 MATRICE SYNTHÉTIQUE PAR ÉCRAN / MODULE MAJEUR

### 3.1. 🏠 Dashboard & Cockpits de Pilotage
| Fonctionnalité Dashboard | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard global** | 👁️ (Total) | 👁️ (Limité finance) | 👁️ (Limité accueil) | 👁️ (Commercial) | 👁️ (Son agence) | 👁️ (Système) |
| **KPI financiers** | 👁️ (Trésorerie/Marges)| 👁️ (Soldes/Dépenses) | 🔒 | 🔒 | 👁️ (Limité agence) | 👁️ (Métriques) |
| **KPI immobiliers** | 👁️ (Stock national) | 👁️ (Valeur/Acomptes) | 👁️ (Disponibilités) | 👁️ (Disponibles/Rés.)| 👁️ (Stock agence) | 👁️ (Intégrité) |
| **Alertes métier** | 👁️ (Visas/Critiques) | 👁️ (Écarts/Paiements)| 👁️ (Dossiers/15j) | 👁️ (Relances/Options)| 👁️ (Alertes agence)| 👁️ (Sécurité/Logs)|
| **Activité récente** | 👁️ (National direct) | 👁️ (Flux financiers) | 👁️ (Accueil/Flux) | 👁️ (Visites/Contacts)| 👁️ (Flux agence) | 👁️ (Logs système) |
| **Audit rapide** | 👁️ (9 attributs) | 👁️ (Audit financier) | 🔒 | 🔒 | 👁️ (Restreint agence)| 👁️ (Audit global) |

---

### 3.2. 🏢 Organisation (Entreprise & Réseau des Agences)
| Action Organisation | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Voir informations MSI** | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ |
| **Modifier informations** | 📤 | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ |
| **Documents légaux & statuts** | 👁️ | 👁️ | 👁️ | 🔒 | 👁️ | ⚙️ |
| **Voir toutes les agences** | 👁️ (National) | 👁️ (Données finance)| 🔒 (Son agence) | 🔒 (Son agence) | 🔒 (Son agence) | 👁️ (Toutes) |
| **Créer une agence** | 👑 (Décision) / ➕ | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ (Configuration)|
| **Modifier une agence** | 👑 / ✏️ | 🔒 | 🔒 | 🔒 | ✏️ (Infos locales) | ⚙️ (Paramètres) |
| **Activer / Désactiver agence**| 👑 (Décision) | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ (Exécution) |
| **Consulter performances** | 👁️ (Consolidé) | 👁️ (Financier) | 🔒 | 🔒 | 👁️ (Son agence) | 👁️ (Système) |

---

### 3.3. 👥 Clients, CRM & Fiche Client 360°
| Action Client / CRM | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Liste des clients** | 👁️ (Tout le réseau) | 👁️ (Tous clients) | 👁️ (Clients de base) | 👁️ (Portefeuille CRM)| 👁️ (Clients agence)| 👁️ (Technique) |
| **Recherche multicritère** | 👁️ (Globale) | 👁️ (Financière) | 👁️ (Simple) | 👁️ (Commerciale) | 👁️ (Agence) | 👁️ (Index & logs) |
| **Créer un client** | ➕ | 🔒 | ➕ | ➕ | ➕ | ⚙️ (Si besoin) |
| **Modifier données client** | ✏️ (Tout) | 🔒 | ✏️ (Infos administratives simples) | ✏️ (Infos commerciales) | ✏️ (Clients agence) | ⚙️ (Structure) |
| **Gérer les prospects CRM** | 👁️ / ✏️ | 🔒 | 👁️ (Accueil) | ➕ / ✏️ (Prospection) | 👁️ / ✏️ (Pipeline agence) | 👁️ (Système) |
| **Réattribuer un prospect** | 👑 / ✏️ (Arbitrage) | 🔒 | 🔒 | 🔒 (Pas d'auto-réattribution)| ✏️ (Équipe agence) | ⚙️ (WORM log) |
| **Apporteurs d'affaires / Courtiers** | 👁️ / ✅ | 👁️ / 💰 (Paiement) | 🔒 | ➕ / 👁️ (Co-courtage) | 👁️ / ✅ (Validation agence) | ⚙️ |
| **Visites Terrain & Mandataires** | 👁️ | 🔒 | 👁️ (Planning) | ➕ / ✏️ (Guidage GPS / Notes) | 👁️ (Supervision) | 👁️ |
| **Registre Accueil des Visiteurs & Courriers** | 👁️ (Réseau) | 🔒 | ➕ / 👁️ (Guichet agence) | 👁️ (Visites reçues) | 👁️ (Agence) | 👁️ (Système) |
| **Fiche Client : Identité / Contact**| 👁️ / ✏️ | 👁️ | 👁️ / ✏️ | 👁️ / ✏️ | 👁️ / ✏️ | 👁️ |
| **Fiche Client : Documents & KYC** | 👁️ / ✅ | 👁️ / ✅ (Conformité)| 👁️ / ➕ (Upload) | 👁️ / ➕ (Upload) | 👁️ / ✅ | 👁️ / ⚙️ |
| **Fiche Client : Contrats & Lots** | 👁️ / ✅ | 👁️ (Contrats) | 👁️ (Lecture) | 👁️ / ➕ (Préparation) | 👁️ / ✏️ | 👁️ |
| **Fiche Client : Paiements & Échéances**| 👁️ / 💰 | 👁️ / 💰 / ✅ | 🔒 (Pas de finance) | 🔒 (Pas d'encaissement)| 👁️ (Consultation agence)| 👁️ |
| **Fiche Client : Reçus Officiels (RCP-)**| 👁️ / 📄 | 👁️ / 📄 / 💰 | 👁️ (Téléchargement) | 👁️ (Téléchargement) | 👁️ / 📄 | 👁️ |
| **Fiche Client : Notifications & Activité**| 👁️ | 👁️ (Relances) | 👁️ / ➕ | 👁️ / ➕ | 👁️ / ➕ | 👁️ |
| **Fiche Client : Historique & Audit** | 👁️ (9 attributs) | 👁️ (Historique financier)| 🔒 | 🔒 | 👁️ (Son agence) | 👁️ (Système) |

---

### 3.4. 🗺️ Patrimoine Immobilier & Parcelles
| Action Foncier & Parcelles | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Portefeuille foncier & Lotissements** | 👁️ (Total) | 👁️ (Coûts & valeur) | 👁️ (Consultation) | 👁️ (Disponibilités) | 👁️ (Son agence) | 👁️ (Accès technique)|
| **Créer un lotissement** | 👑 (Décision) / ➕ | 🔒 | 🔒 | 🔒 | 📤 (Propose) | ⚙️ (Configuration)|
| **Voir les parcelles** | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ | 👁️ |
| **Créer des parcelles** | ➕ | 🔒 | 🔒 | 🔒 | ➕ (Si habilité) | ⚙️ (Import SIG/Lots)|
| **Modifier informations simples** | ✏️ | 🔒 | 🔒 | 🔒 | ✏️ (Son agence) | ⚙️ |
| **Modifier le prix catalogue / m²**| 🔴 👑 (Souverain) | 🔒 | 🔒 | 🔒 | 🔒 (Sauf délégation)| 🔒 |
| **Bloquer parcelle (Litige/Réserve)**| 🔴 👑 / 🔒 | 🔒 | 🔒 | 🔒 | 🔒 (Si habilité) | ⚙️ (Technique) |
| **Attribuer / Lier au contrat** | 👑 / ✅ | 👁️ / 💰 | 👁️ (Lecture) | 📤 / ➕ (Workflow) | ✅ (Validation vente)| 👁️ |
| **Libérer une parcelle** | 👑 / ⚡ (Auto) | ⚡ (Auto résiliation) | 🔒 | 🔒 | ⚡ (Auto à J+15) | ⚙️ |
| **Supprimer une parcelle** | ❌ (Interdit) | ❌ (Interdit) | ❌ (Interdit) | ❌ (Interdit) | ❌ (Interdit) | ❌ (Interdit) |

---

### 3.5. 🏷️ Offres Commerciales, Prix & Promotions
| Action Offres & Tarifs | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consulter les grilles tarifaires** | 👁️ (Total) | 👁️ (Données financières)| 👁️ (Catalogue) | 👁️ (Catalogue) | 👁️ (Catalogue) | 👁️ (Technique) |
| **Créer une offre / pack commercial** | 👑 (Souverain) / ➕ | 🔒 | 🔒 | 📤 (Proposer) | ➕ (Selon habilitation)| ⚙️ (Configuration)|
| **Modifier une offre / pack** | 👑 / ✏️ | 🔒 | 🔒 | 🔒 | ✏️ (Selon délégation)| ⚙️ (Paramétrage) |
| **Fixer / Modifier prix catalogue** | 🔴 👑 (Exclusif) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Préparer une proposition d'offre** | 👁️ | 🔒 | 🔒 | ➕ / ✏️ (Préparation) | 👁️ / ✏️ | 🔒 |
| **Soumettre offre / réduction** | 👁️ | 🔒 | 🔒 | 📤 (Soumettre au PDG)| 📤 (Avis consultatif)| 🔒 |
| **Accorder réduction / Remise** | 🔴 👑 (Visa Souverain)| 🔒 | 🔒 | 🔒 (Demande uniquement)| 🔒 | 🔒 |
| **Valider une exception tarifaire** | 🔴 👑 (Visa Souverain)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Consulter conséquences financières** | 👁️ (Impact bilan/marge)| 👁️ (Complet rentabilité)| 🔒 | 🔒 | 👁️ (Local agence) | 🔒 |
| **Administration technique des tarifs** | 👁️ | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ (Structure DB) |

---

### 3.6. 📅 Réservations (Options 15 Jours)
| Action Réservations | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consulter les réservations** | 👁️ (Tout le réseau) | 👁️ (Si paiement/acompte)| 👁️ (Accueil & suivi) | 👁️ (Son portefeuille)| 👁️ (Son agence) | 👁️ (Technique) |
| **Créer une réservation (Option 15j)** | ➕ | 🔒 | ➕ (Si autorisée) | ➕ (Quota max 5 actif)| ➕ (Sur son agence) | ⚙️ |
| **Dérogation Quota d'Options** | 👑 (Souverain) | 🔒 | 🔒 | 🔒 (Demande) | ✅ (Plafond agence) | ⚙️ |
| **Modifier une réservation** | ✏️ | 🔒 | ✏️ (Données contact) | ✏️ (Selon règles 15j)| ✏️ (Supervision) | ⚙️ |
| **Suivre chronomètre (Radar J-2)** | 👁️ | 👁️ (Si encaissement) | 👁️ | 👁️ (Relances actives)| 👁️ (Supervision) | 👁️ |
| **Valider exception / prolongation** | 👑 (Souverain) | 🔒 | 🔒 | 🔒 (Demande) | ✅ (Valide selon règles)| 🔒 |
| **Préparer transformation en vente** | 👁️ / ✅ | 👁️ / 💰 (Validation acompte)| 👁️ (Dossier KYC) | 📤 / ➕ (Création contrat)| 👁️ / ✅ | 🔒 |
| **Libérer une parcelle (Annulation)** | ❌ / ⚡ | 🔒 | 🔒 | ❌ (Demande client) | ✅ (Annulation locale)| ⚙️ |

---

### 3.7. 🤝 Contrats & Conventions Juridiques
| Action Contrats | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consulter les contrats** | 👁️ (Tout le réseau) | 👁️ (Tous contrats) | 👁️ (Lecture/Dossiers)| 👁️ (Son portefeuille)| 👁️ (Son agence) | 👁️ (Technique) |
| **Préparer contrat (Saisie données)** | 👁️ | 🔒 | ➕ / ✏️ (Dossiers simples)| ➕ / ✏️ (Saisie dossier)| 👁️ / ✏️ | 🔒 |
| **Vérifier éléments administratifs** | 👁️ | 🔒 | 👁️ (Contrôle KYC) | 👁️ | ✅ (Contrôle agence)| 🔒 |
| **Vérifier éléments financiers** | 👁️ | ✅ (Vérification stricte)| 🔒 | 🔒 | 👁️ | 🔒 |
| **Soumettre pour validation** | 👁️ | 📤 (Avis financier) | 📤 (Dossier complet) | 📤 (Soumettre contrat)| 📤 (Transmission) | 🔒 |
| **Validation finale & Visa souverain** | 🔴 👑 (Signature souveraine)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Générer le PDF officiel (3 pages)** | 📄 | 📄 | 📄 (Impression/Remise)| 📄 (Téléchargement) | 📄 | ⚙️ |
| **Avenant (Changement lot/fonds)** | 🔴 👑 (Visa Souverain)| 👁️ (Impacts financiers)| 🔒 | 📤 (Demande avenant) | 📤 (Avis agence) | 🔒 |
| **Résilier / Annuler un contrat** | 🔴 👑 (Décision exclusive)| 👁️ / 💰 (Calcul retenue 20%)| 🔒 | 🔒 | 📤 (Signalement) | 🔒 |
| **Administration technique système** | 👁️ | 🔒 | 🔒 | 🔒 | 🔒 | ⚙️ (Accès DB/Sécu)|

---

### 3.8. 💰 Échéanciers & Plans d'Amortissement
| Action Échéanciers | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consulter un échéancier** | 👁️ (National) | 👁️ (Tous) | 👁️ (Selon droits) | 👁️ (Son portefeuille)| 👁️ (Clients agence)| 👁️ (Technique) | 👁️ (Son propre échéancier)|
| **Générer / Créer un échéancier** | 👑 / ✅ | ➕ / 🧮 (Gestionnaire)| 🔒 | 🔒 | 🔒 | ⚙️ | 🔒 |
| **Vérifier calculs & échéances** | 👁️ | ✅ (Contrôle complet)| 🔒 | 👁️ | 👁️ (Vérification local)| 👁️ | 🔒 |
| **Imputer les paiements (Cascade)** | 👁️ / 💰 | 💰 / ✅ (Exécution) | 🔒 | 🔒 | 👁️ (Consultation) | ⚙️ | 🔒 |
| **Modifier selon règles standard** | 👑 | ✏️ (Ajustements) | 🔒 | 🔒 | 🔒 | ⚙️ | 🔒 |
| **Autoriser / Valider exceptions** | 🔴 👑 (Visa Souverain)| 📤 (Arbitrage) | 🔒 | 🔒 | 📤 (Signalement) | 🔒 | 🔒 |
| **Suivre les retards & impayés** | 👁️ (Synthèse nationale)| 👁️ (Complet financier)| 👁️ (Relances) | 👁️ (Relances clients)| 👁️ (Suivi agence) | 👁️ | 👁️ (Sa propre situation)|

---

### 3.9. 💵 Paiements & Encaissements Multi-Canaux (Zone Stratégique)
| Action Paiements | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Enregistrer un paiement** | 💰 / ➕ | 💰 / ➕ (Opérationnel clé)| 🔒 (Pas d'encaissement)| 🔒 (Pas d'encaissement)| 💰 (Si caisse locale)| 🔒 (Interdit)| 🔒 |
| **Vérifier / Rapprocher bordereau** | 👁️ | ✅ (Contrôle exhaustif)| 👁️ (Vérif dossier)| 🔒 | 👁️ (Local agence)| 👁️ (Technique)| 🔒 |
| **Confirmer / Valider paiement** | 👑 / ✅ | ✅ (Certification fonds)| 🔒 | 🔒 | ✅ (Si habilité local)| 🔒 | 🔒 |
| **Générer le reçu officiel (RCP-)** | 📄 | 📄 (Émission directe)| 🔒 | 🔒 | 📄 (Si habilité)| 🔒 | 🔒 |
| **Corriger selon procédure d'audit**| 👑 / ✏️ | ✏️ (Contre-passation)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Consulter l'historique financier**| 👁️ (Total réseau)| 👁️ (Complet)| 👁️ (Consultation/Prépa)| 👁️ (Portefeuille)| 👁️ (Son agence)| 👁️ (Audit DB)| 👁️ (Ses paiements)|

---

### 3.10. 🧾 Reçus Officiels (RCP-) & Mini-Bilans Patrimoniaux
| Action Reçus Officiels | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Générer un reçu officiel** | 📄 | 📄 (Quittance directe)| 🔒 | 🔒 | 📄 (Si habilité)| 🔒 | 🔒 |
| **Imprimer un reçu** | 🖨️ | 🖨️ | 🖨️ (Si autorisée)| 🖨️ (Si autorisée)| 🖨️ | 🔒 | 🖨️ (Télécharger PDF)|
| **Consulter les reçus émis** | 👁️ (National)| 👁️ (Tous reçus)| 👁️ (Accueil)| 👁️ (Son portefeuille)| 👁️ (Son agence)| 👁️ (Logs)| 👁️ (Ses reçus)|
| **Rééditer selon règles de sécurité**| 📄 | 📄 (Duplicata certifié)| 🔒 | 🔒 | 📄 (Si habilité)| 🔒 | 🔒 |
| **Supprimer un reçu** | ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)| ❌ (Interdit)|

> **RÈGLE INVIOLABLE :** Un reçu généré ne peut JAMAIS disparaître ni être supprimé physiquement de la base de données.

---

### 3.11. 🏦 Caisse Physique & Gestion des Écarts
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

### 3.12. 💸 Dépenses & Charges d'Exploitation
| Action Dépenses | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Créer / Enregistrer une dépense** | ➕ | ➕ (Gestionnaire clé)| 🔒 (Pas d'écriture)| 🔒 | ➕ (Selon budget agence)| 🔒 |
| **Joindre une pièce justificative** | 👁️ / 📎 | 📎 (Scan facture/décharge)| 🔒 | 🔒 | 📎 (Justificatif local)| 🔒 |
| **Corriger selon workflow d'audit** | 👑 / ✏️ | ✏️ (Rectification auditée)| 🔒 | 🔒 | 🔒 | 🔒 |
| **Suivre les engagements & charges** | 👁️ (Analytique global)| 👁️ (Complet SYSCOHADA)| 🔒 | 🔒 | 👁️ (Charges agence) | 👁️ (Système)|
| **Valider une dépense standard** | 👑 | ✅ (Selon seuils)| 🔒 | 🔒 | ✅ (Seuil $\le 50k$ FCFA)| 🔒 |
| **Autoriser exception / Dépense lourde**| 🔴 👑 (Visa Souverain)| 📤 (Demande arbitrage)| 🔒 | 🔒 | 📤 (Transmission) | 🔒 |

---

### 3.13. 🔄 Annulations & Résiliations de Contrats (Zone Très Sensible)
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

---

### 3.14. 💰 Remboursements Acquéreurs & Décaissements
| Action Remboursements | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Préparer l'échéancier de remboursement**| 👁️ | ➕ / 🧮 (Préparation)| 🔒 | 🔒 | 👁️ | 🔒 | 🔒 |
| **Autoriser le remboursement / Échéancier**| 🔴 👑 (Visa Souverain)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Modifier / Accorder une exception** | 🔴 👑 (Visa Souverain)| 📤 (Demande)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Enregistrer le paiement (Décaissement)**| 👑 / 💰 | 💰 / ✅ (Exécution)| 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| **Suivre les tranches restant dues** | 👁️ (Synthèse passif)| 👁️ (Complet)| 🔒 | 🔒 | 👁️ (Agence)| 👁️ | 👁️ (Sa créance)|
| **Clôturer le dossier lorsque soldé** | 👑 / ✅ | ✅ (Clôture après décharge)| 🔒 | 🔒 | 👁️ | 🔒 | 🔒 |

---

### 3.15. 📚 Comptabilité Générale & Analytique (SYSCOHADA Révisé)
| Action Comptabilité | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Plan comptable & Paramétrage comptes** | 👁️ | ➕ / ✏️ (Maître du plan)| 🔒 | 🔒 | 🔒 | ⚙️ (Structure DB) |
| **Journaux & Saisie écritures (Partie double)**| 👁️ | ➕ / 💰 (Opérationnel clé)| 🔒 | 🔒 | 🔒 | 🔒 (Pas d'écriture)|
| **Rapprochements bancaires & caisse** | 👁️ | ✅ (Exécution mensuelle)| 🔒 | 🔒 | 👁️ (Caisse locale)| 🔒 |
| **Clôtures périodiques & Arrêtés** | 👑 / ✅ | ✅ (Opérationnel)| 🔒 | 🔒 | 🔒 | ⚙️ (Verrouillage DB)|
| **Rapports & États financiers (Bilan, CR)**| 👁️ (Stratégique)| 👁️ / 📄 / 📥 (Complet)| 🔒 | 🔒 | 👁️ (Rapports limités agence)| 👁️ (Logs)|
| **Analyse analytique par lotissement** | 👁️ (Marges/Rentabilité)| 👁️ (Complet)| 🔒 | 🔒 | 👁️ (Son agence) | 🔒 |

---

### 3.16. 📄 Documents Officiels, Modèles & Coffre-Fort Documentaire
| Action Documents & Coffre-Fort | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Générer des documents officiels** | 📄 (Tout type) | 📄 (Quittances, factures)| 📄 (Si autorisée)| 📄 (Selon droits) | 📄 (Selon droits) | ⚙️ (Test) | 🔒 |
| **Administrer les modèles (Templates PDF)**| 🔴 👑 (Validation texte)| 👁️ (Modèles finance)| 🔒 | 🔒 | 🔒 | ⚙️ / ✏️ (Admin tech)| 🔒 |
| **Workflow contractuel :** | | | | | | | |
| • *1. Préparation du document* | 👁️ | ➕ / ✏️ (Financier) | ➕ / ✏️ (Administratif)| ➕ / ✏️ (Commercial)| 👁️ / ✏️ | 🔒 | 🔒 |
| • *2. Validation formelle* | 🔴 👑 (Signature souveraine)| ✅ (Contrôle fonds)| 🔒 | 🔒 | ✅ (Contrôle agence)| 🔒 | 🔒 |
| • *3. Génération & Scellement QR* | 📄 | 📄 | 📄 (Impression)| 📄 (Téléchargement)| 📄 | ⚙️ | 🔒 |
| • *4. Signature & Numérisation KYC* | 👁️ | 👁️ | 📎 (Scan/Upload)| 📎 (Scan/Upload)| 👁️ / ✅ | 🔒 | 🔒 |
| • *5. Émargement / Décharge remise physique* | 👁️ (Tout) | 👁️ | ➕ / ✍️ (Remise guichet)| 👁️ | 👁️ / ✅ | 🔒 | 🔒 |
| • *6. Archivage inaltérable (Vault WORM)* | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) | ⚡ (Auto) |
| **Consulter le coffre-fort client** | 👁️ (Tout le réseau)| 👁️ (Dossiers)| 👁️ (Dossiers)| 👁️ (Son portefeuille)| 👁️ (Son agence)| 👁️ (Technique)| 👁️ (Ses documents publiés)|

---

### 3.17. 📱 Espace Client PWA (Application Mobile Autonome)
| Module / Écran Espace Client PWA | 👤 Client Acquéreur (Accès Sécurisé par OTP) |
| :--- | :--- |
| **1. 🏠 Accueil & Tableau de bord** | Synthèse consolidée de ses acquisitions, jauge de progression globale et solde restant dû. |
| **2. 🗺️ Mes Acquisitions & Localisation GPS** | Fiche détaillée de chaque lot souscrit, plan de masse, guidage GPS vers les 4 bornes ($B_1, B_2, B_3, B_4$). |
| **3. 🤝 Mes Contrats** | Consultation et téléchargement des contrats de vente (`CTR-`) et avenants (`AVN-`) visés. |
| **4. 💳 Mes Paiements** | Historique certifié des versements, déclaration de virement/mobile money avec upload de preuve. |
| **5. 📅 Mes Échéanciers** | Calendrier en temps réel des mensualités dues, dates limites et reste à payer par lot. |
| **6. 🧾 Mes Reçus** | Téléchargement instantané au format PDF de toutes les quittances officielles scellées (`RCP-`). |
| **7. 📁 Mes Documents (Coffre-Fort)** | Accès à tous les documents publiés (Attestations `ATTS-`, décharges, plans parcellaires). |
| **8. 💰 Mes Remboursements** | Suivi de l'état d'avancement des tranches de remboursement (en cas de résiliation de contrat). |
| **9. 🔔 Notifications & Historique** | Relevé des alertes WhatsApp / SMS reçues, rappels de paiement et messages du service client. |
| **10. 📞 Contact & Support MSI** | Contact direct WhatsApp et téléphone avec le commercial référent et le support du Siège. |

---

### 3.18. 🔔 Hub de Notifications & Alertes Multi-Canaux (WhatsApp, SMS, Push)
| Profil Destinataire | Périmètre des Alertes & Notifications Reçues |
| :--- | :--- |
| **👑 PDG** | 🚨 **Toutes les alertes majeures et critiques du réseau** : dépassements de caisse, litiges, demandes de dérogations tarifaires, résiliations en attente de visa souverain, gros encaissements et indicateurs d'anomalies. |
| **📊 Comptable** | 💰 **Alertes financières & comptables** : déclarations de paiement client à pointer, échéances impayées à J+15/J+30, écarts de caisse constatés, justificatifs de dépenses manquants et rapprochements en attente. |
| **📣 Commercial** | 🎯 **Alertes commerciales & relationnelles** : relances prospects, expiration imminente d'option 15j (Radar J-2), nouveaux versements effectués par ses clients et rappels d'échéances à J-7/J-3. |
| **🏢 Responsable d'Agence** | 🏢 **Alertes de son agence** : sessions de caisse ouvertes/non clôturées, retards de paiement locaux, anomalies de stock parcellaire et demandes de prolongation de réservation. |
| **🧑💼 Secrétaire** | 📋 **Alertes opérationnelles & d'accueil** : pièces KYC manquantes sur un dossier en cours de constitution, rendez-vous d'accueil et relances de complétude administrative. |
| **👤 Client (PWA)** | 📱 **Ses propres événements uniquement** : reçu de paiement émis, rappel d'échéance amical (J-7, J-3, Jour J), avis de mise à disposition d'un nouveau document et notification de prolongation d'option. |

---

### 3.19. 🔐 Administration Technique, Gouvernance & Séparation des Pouvoirs (Zone Inviolable)

```text
╔══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                               PRINCIPEcardinal DE SÉPARATION DES POUVOIRS                                           ║
╠══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ 🛠️ L'INFORMATICIEN EST LE GARDIEN TECHNIQUE DU SYSTÈME — IL N'EST PAS LE PATRON MÉTIER.                            ║
║ ❌ IL NE PEUT PAS MODIFIER DISCRÈTEMENT UNE TRANSACTION FINANCIÈRE OU UNE DÉCISION COMMERCIALE SANS TRACE.          ║
╚══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
```

| Domaine de Gestion Technique | Habilitations de l'Informaticien / Admin Tech | Restrictions Inviolables Métier |
| :--- | :--- | :--- |
| **👥 Gestion des Utilisateurs** | ➕ Créer des comptes, désactiver des utilisateurs, réinitialiser des accès sécurisés. | 🔒 Ne peut pas usurper l'identité d'un signataire (PDG/Comptable). |
| **🛡️ Rôles & Permissions** | ➕ Créer des rôles, configurer les permissions des 18 familles, affecter des périmètres. | 🔒 Toute modification de rôle est journalisée avec l'ancien et le nouvel état. |
| **⚙️ Paramètres & Configuration** | ⚙️ Configurer l'infrastructure, les templates techniques, les endpoints d'API et SMS/WhatsApp. | 🔒 Ne peut pas modifier le montant d'un contrat ou effacer un reçu `RCP-`. |
| **🖥️ Supervision & Disponibilité**| 👁️ Surveiller les temps de réponse, la disponibilité de la base de données, les sauvegardes. | 🔒 Aucune action directe sur les écritures comptables sans passer par les API auditées. |
| **📜 Consultation des Logs** | 👁️ Consulter les logs techniques, les erreurs de connexion, les métriques d'infrastructure. | 🔒 **Interdiction absolue de modifier ou purger la table `msi_master_audit_logs`.** |
| **🔌 Intégrations & Maintenance**| ⚙️ Gérer les clés d'API (WhatsApp Business, SMS Gateway, Storage Cloud), maintenir les versions. | 🔒 Les accès aux secrets sont chiffrés et audités à chaque lecture. |

---

---

## 4. 👑 PÉRIMÈTRE & AUDIT SOUVERAIN DU PDG (DIRECTION GÉNÉRALE)

Le **PDG** est le profil décisionnel central et l'autorité souveraine de MSI 2.0.

### 4.1. Habilitations Souveraines du PDG
- **Tarification & Offres** : Gérer les grilles de prix catalogue, fixer les remises exceptionnelles et valider les packs promotionnels.
- **Engagements Juridiques** : Apposer la signature souveraine sur les contrats de vente (`CTR-`) et avenants (`AVN-`).
- **Régulation des Conflits & Annulations** : Valider définitivement les résiliations et statuer sur le taux de retenue dérogatoire.
- **Supervision & Exécution Financière** : Superviser toutes les caisses physiques, autoriser les remboursements lourds, valider les clôtures comptables SYSCOHADA.
- **Vision Consolidée Nationale** : Consulter en temps réel l'intégralité des agences, des clients, des contrats, du stock parcellaire et des flux de trésorerie.

### 4.2. La Règle Inviolable de l'Audit Souverain
> **AUCUN « SUPER-UTILISATEUR INVISIBLE » N'EXISTE DANS MSI 2.0.**
> Même le PDG laisse une trace inaltérable et opposable pour chaque action.
> Chaque validation, remise accordée, annulation ou dépense opérée par le PDG répond aux 4 questions fondamentales : **QUI ? QUOI ? QUAND ? AVEC QUELLE JUSTIFICATION ?**

---

## 5. 📊 MATRICE SYNTHÉTIQUE DES DROITS (RÉCAPITULATIF GLOBAL)

```text
LÉGENDE :
🟢 = Accès principal opérationnel
🟡 = Accès limité au périmètre assigné
👁️ = Consultation / Lecture seule
📤 = Demande / Soumission / Préparation
🔒 = Accès interdit
⚙️ = Administration technique
```

| Domaine / Module MSI 2.0 | 👑 PDG | 📊 Comptable | 🧑💼 Secrétaire | 📣 Commercial | 🏢 Resp. Agence | 🛠️ Admin Tech | 👤 Client (PWA) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **🏠 Dashboard** | 🟢 | 🟢 | 🟡 | 🟡 | 🟢 | 🟢 | 🔒 |
| **👥 Clients & CRM** | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟡 | 🔒 |
| **🗺️ Parcelles & Foncier** | 🟢 | 🟡 | 🟡 | 🟢 | 🟢 | 🟡 | 🔒 |
| **🏷️ Prix & Grilles** | 🟢 | 👁️ | 👁️ | 👁️ | 🟡 | ⚙️ | 🔒 |
| **🎁 Offres & Packs** | 🟢 | 👁️ | 👁️ | 🟢 | 🟢 | ⚙️ | 🔒 |
| **📅 Réservations (15j)** | 🟢 | 👁️ | 🟢 | 🟢 | 🟢 | 🟡 | 🔒 |
| **🤝 Contrats & Actes** | 🟢 | 🟢 | 🟡 | 🟡 | 🟢 | 🔒 | 🔒 |
| **💰 Échéanciers** | 🟢 | 🟢 | 👁️ | 👁️ | 👁️ | 🔒 | 👁️ *(Les siens)*|
| **💵 Paiements** | 🟢 | 🟢 | 🔒 | 🔒 | 🟡 | 🔒 | 🔒 |
| **🧾 Reçus (RCP-)** | 🟢 | 🟢 | 🟡 | 🔒 | 🟡 | 🔒 | 👁️ *(Les siens)*|
| **🏦 Caisse & Trésorerie** | 🟢 | 🟢 | 🔒 | 🔒 | 🟡 | 🔒 | 🔒 |
| **💸 Dépenses & Charges** | 🟢 | 🟢 | 🔒 | 🔒 | 🟡 | 🔒 | 🔒 |
| **🔄 Annulations** | 🟢 | 🟡 | 📤 | 📤 | 📤 | 🔒 | 🔒 |
| **💰 Remboursements** | 🟢 | 🟢 | 🔒 | 🔒 | 🟡 | 🔒 | 👁️ *(Les siens)*|
| **📚 Comptabilité SYSCOHADA**| 🟢 | 🟢 | 🔒 | 🔒 | 👁️ | ⚙️ | 🔒 |
| **📄 Documents & Coffre-Fort**| 🟢 | 🟢 | 🟡 | 🟡 | 🟢 | ⚙️ | 👁️ *(Les siens)*|
| **🔔 Notifications & Alertes**| 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | ⚙️ | 👁️ *(Les siens)*|
| **📊 Rapports & Synthèses** | 🟢 | 🟢 | 🟡 | 🟡 | 🟢 | 🟡 | 🔒 |
| **📜 Audit Trail** | 🟢 *(National)*| 🟢 *(Financier)*| 🔒 | 🔒 | 🟡 *(Agence)*| 🟢 *(Technique)*| 🔒 |
| **🛡️ Rôles & Permissions** | 🔒 *(Gouvernance)*| 🔒 | 🔒 | 🔒 | 🔒 | 🟢 *(Technique)*| 🔒 |

---

## 6. 🧠 LA RÈGLE CARDINALE QUI STRUCTURE TOUT LE LOGICIEL MSI 2.0

> **AUCUNE PERMISSION NE SERA BASÉE UNIQUEMENT SUR LE NOM DU PROFIL.**
> La chaîne de contrôle et d'autorisation dynamique s'établit strictement comme suit :
>
> $$\text{Utilisateur} \longrightarrow \text{Rôle} \longrightarrow \text{Permission} \longrightarrow \text{Périmètre} \longrightarrow \text{Action} \longrightarrow \text{Validation} \longrightarrow \text{Audit}$$

### Exemple d'instanciation concrète :
```text
Utilisateur : Fatou Oumarou
│
├── Rôle : Comptable
│
├── Périmètre : Agence Maradi (ID: AGC_MARADI)
│
├── Permission : Enregistrer paiement (PAYMENT_CREATE)
├── Permission : Confirmer paiement (PAYMENT_CONFIRM)
├── Permission : Générer reçu (RECEIPT_GENERATE)
│
└── Audit Trail inaltérable (Automatique) :
    ├── QUI ?       : Fatou Oumarou (UID: usr_89234)
    ├── QUAND ?     : 2026-08-22 14:32:05 GMT
    ├── QUOI ?      : Encaissement 150 000 FCFA sur Contrat CTR-2026-0042
    ├── CLIENT ?    : Ibrahim Mamane (CLT-0012)
    ├── CAISSE ?    : Caisse Principale Maradi (CSH_MARADI_01)
    └── EMPREINTE ? : SHA-256 HMAC scellée
```

### Puissance d'évolution métier :
Cette modélisation permet sans réécrire le code :
- **Comptable A** $\longrightarrow$ Périmètre : `GLOBAL` (Toutes les agences nationales)
- **Comptable B** $\longrightarrow$ Périmètre : `AGENCE_MARADI` (Uniquement l'agence de Maradi)
- **Super-Auditeur externe** $\longrightarrow$ Périmètre : `GLOBAL` en `VIEW_ONLY` (Lecture seule sur tous les modules)

---

## 7. 🗄️ IMPLÉMENTATION TECHNIQUE DE CONTRÔLE D'ACCÈS (TYPESCRIPT & RLS)

```typescript
export type MsiRoleCode =
  | 'PDG'
  | 'CHEF_COMPTABLE'
  | 'COMPTABLE'
  | 'RESPONSABLE_AGENCE'
  | 'COMMERCIAL'
  | 'SECRETAIRE'
  | 'ADMIN_TECHNIQUE';

export type MsiPermissionScope =
  | 'GLOBAL'
  | 'AGENCE'
  | 'MULTI_AGENCES'
  | 'PROJET'
  | 'PERSONNEL';

export type MsiActionType =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'SUBMIT'
  | 'VALIDATE'
  | 'CANCEL'
  | 'FINANCIAL_OP'
  | 'GENERATE_DOC'
  | 'EXPORT'
  | 'ADMIN';

export interface UserPermissionContext {
  userId: string;
  role: MsiRoleCode;
  agencyId: string;
  allowedAgencies: string[];
  permissions: Record<string, MsiActionType[]>;
  scope: MsiPermissionScope;
}
```
