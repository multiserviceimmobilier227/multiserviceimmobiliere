# Phase 15 — Moteur documentaire PDF (MSI 2.0)

Objectif : transformer chaque acte métier (vente, encaissement, échéancier, remboursement, mise en demeure) en document officiel MSI, généré côté serveur, numéroté, archivé, vérifiable par QR, et identique à l'écran comme à l'impression.

## Principes non négociables

- Un document n'est jamais recalculé à l'affichage : il est figé (snapshot) au moment de l'émission. Rééditer = nouvelle version, jamais d'écrasement.
- Numérotation officielle continue par type, par agence et par année : `MSI/{AGENCE}/{TYPE}/{ANNÉE}/{séquence}`.
- Tout PDF émis est enregistré (qui, quand, quelle version, quel hash) dans le journal d'audit.
- Montants en entiers FCFA, textes en français, dates au fuseau Niamey, montants aussi écrits en toutes lettres sur les reçus et contrats.
- Un QR code sur chaque document pointe vers une page publique de vérification qui confirme uniquement : numéro, type, date, statut (valide / annulé) — jamais de données personnelles ni de montants.

## Sous-phases (une par session)

### 15.1 — Socle documentaire (base de données)
- Table `document_templates` : type, version, en-tête/pied, mentions légales, actif.
- Table `documents` : type, numéro officiel, agence, entité liée (vente / paiement / échéancier / remboursement / relance), `payload` JSON figé, version de gabarit, hash, statut (émis / annulé / remplacé), émetteur, date.
- Table `document_sequences` + fonction d'attribution atomique du numéro (verrou par agence/type/année, aucun trou, aucun doublon).
- RLS : lecture réservée au personnel, émission réservée aux rôles autorisés, annulation réservée PDG/super admin. GRANT explicites, aucune suppression physique.

### 15.2 — Moteur de rendu serveur
- Server function `emitDocument` : vérifie les droits, construit le payload figé depuis les données réelles, réserve le numéro, calcule le hash, enregistre, retourne le PDF.
- Rendu PDF côté serveur compatible runtime edge (bibliothèque pure JS, polices Unicode embarquées pour les accents français), pas de binaire natif.
- Charte MSI appliquée : logo, magenta de marque, typographie, filigrane « COPIE » sur les rééditions.
- Montant en lettres (français, FCFA) implémenté et testé sur les cas limites.

### 15.3 — Reçu d'encaissement
- Remplace l'impression navigateur actuelle de `ReceiptGenerator` par le PDF officiel numéroté.
- Contenu : client, vente, parcelle, montant versé, imputation FIFO détaillée (quelles échéances soldées), reste dû, mode de paiement, caissier, QR.
- Réédition possible : même numéro, marquée « DUPLICATA », tracée.

### 15.4 — Contrat de vente et échéancier
- Contrat généré depuis le snapshot de contrat existant : parties, parcelle, lotissement, prix, conditions, clauses, signatures.
- Échéancier officiel annexé : tableau des échéances, dates, montants, état (payé / dû / en retard).
- Avenant en cas de mutation ou de changement de prix : nouveau document lié au précédent, chaîne de versions visible.

### 15.5 — Documents de recouvrement et remboursement
- Lettre de relance (J-7, J+15, J+30), mise en demeure (PDG uniquement), attestation de remboursement, attestation de solde / quitus.
- Chaque émission alimente l'historique client et le journal d'arriérés.

### 15.6 — Vérification publique et coffre documentaire
- Route publique `/verification/{numéro}` : réponse minimale (valide / annulé / inconnu), sans donnée sensible, protégée contre l'énumération.
- Onglet « Documents » dans la fiche client et la fiche vente : liste, filtres par type et période, téléchargement, statut, réédition tracée.
- Stockage des PDF dans un bucket privé avec accès par lien signé à durée limitée.

### 15.7 — Durcissement et recette
- Tests : unicité et continuité des numéros sous concurrence, immuabilité du payload, montant en lettres, accents, pagination longue (échéanciers 60 lignes), cohérence FCFA.
- Contrôle visuel page par page de chaque type de document avant validation.
- Audit sécurité : personne ne peut émettre un document pour une agence dont il ne dépend pas, ni lire les PDF d'autrui.

## Détails techniques

- Génération PDF serveur via une bibliothèque pure JavaScript compatible Cloudflare Workers (pas de Puppeteer, pas de moteur natif), polices embarquées au build.
- Server functions dans `src/lib/documents.functions.ts` (fichier fin : uniquement les déclarations), logique dans `documents.server.ts`, gabarits typés dans un module partagé.
- Numérotation garantie par verrou PostgreSQL au niveau de la fonction, jamais côté application.
- Composant `DocumentsPanel` réutilisable (client, vente, finances) + `DocumentActions` pour émettre / rééditer / annuler selon le rôle.
- Aucune nouvelle dépendance en dehors du moteur PDF et du générateur QR, tous deux introduits en 15.2 et 15.6.

## Livraison

Une sous-phase par session, chacune vérifiée (base, rendu, écran) avant de passer à la suivante. Démarrage proposé : 15.1 + 15.2 ensemble, car le socle sans moteur n'est pas testable.
