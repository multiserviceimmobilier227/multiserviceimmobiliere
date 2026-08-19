# MSI 2.0 — Plan de travail en 20 phases

Logiciel de gestion immobilière (ERP + PWA client) pour Multi Services Immobilière, Maradi (Niger). Interface en français, montants en FCFA, architecture multi-agences dès la base.

Principes non négociables tirés du cahier des règles : traçabilité totale (le moindre 1 FCFA justifiable), aucune suppression destructive, toute correction crée une nouvelle trace, opérations sensibles validées par le PDG, historisation des prix et contrats.

Nous avancerons **phase par phase** : rien n'est développé hors de la phase en cours, rien du cahier n'est ignoré ou inventé.

---

## Phase 1 — Fondations, identité visuelle et backend

1. Activation de Lovable Cloud (base de données, comptes, fichiers, code serveur)
2. Design system MSI : rose/magenta du logo, blanc, gris anthracite, typographie lisible
3. Logo MSI intégré comme ressource officielle de l'application
4. Structure de navigation back-office (menu latéral par domaine métier)
5. Page de connexion et coquille applicative
6. Paramètres globaux : devise FCFA, fuseau Niamey, format des dates

## Phase 2 — Sécurité, rôles et audit (socle)

1. Table des rôles séparée : pdg, comptable, secretaire, commercial, responsable_agence, informaticien, client
2. Permissions granulaires : voir, créer, préparer, valider, modifier, rembourser, administrer
3. Règle : seul l'informaticien crée/modifie les rôles système
4. Journal d'audit universel (qui, quoi, quand, où, ancienne valeur → nouvelle valeur, motif)
5. Mécanisme générique « opération sensible » : préparée par un profil, validée par le PDG
6. Écrans : gestion des utilisateurs, consultation de l'audit

## Phase 3 — Référentiels et administration

1. Agences et rattachement des utilisateurs
2. Catégories de dépenses (liste extensible : loyer, carburant, salaires, impôts…)
3. Moyens de paiement (espèces, Nita transfert, autre)
4. Numérotation automatique des documents et pièces
5. Paramètres métier configurables (apport recommandé 30 %, durées 15/20 mois, retenue 20 %, réservation 15 jours, règle d'imputation)

## Phase 4 — Portefeuille foncier

1. Lotissements et zones
2. Îlots
3. Parcelles : identification îlot + parcelle, superficie, plan communal
4. Statuts : Disponible · Réservée · Attribuée · En cours de paiement · Entièrement payée · Vendue · Bloquée · Annulée
5. Historique de statut horodaté
6. Cartes/plans et pièces jointes du lotissement
7. Vue liste + vue plan/grille des parcelles

## Phase 5 — Acquisitions foncières et coûts de revient

1. Acquisition globale (lotissement) et acquisition à l'unité
2. Coûts d'acquisition et frais complémentaires rattachés au bien
3. Calcul du coût par parcelle quand il est calculable
4. Comparaison coût total / prix de vente potentiel
5. Écran de rentabilité par opération foncière

## Phase 6 — Clients et CRM

1. Fiche personne : identité, contacts, pièces d'identité
2. Dossier client regroupant plusieurs acquisitions sans mélanger les soldes
3. Archivage numérique des documents du client
4. Recherche et filtres rapides
5. Historique des interactions

## Phase 7 — Offres, prix et réductions

1. Prix catalogue par parcelle ou par gabarit (200/300/400 m²)
2. Réduction enregistrée comme donnée distincte : catalogue → réduction → prix final
3. Négociation du prix final avec recalcul automatique
4. Historique complet des prix ; un prix modifié ne touche jamais un contrat signé
5. Validation PDG pour les modifications importantes de prix

## Phase 8 — Réservations

1. Réservation gratuite de 15 jours, sans encaissement
2. Compte à rebours et statut de la réservation
3. Rappels avant expiration
4. Libération automatique de la parcelle si aucun engagement
5. Transformation réservation → attribution au premier paiement

## Phase 9 — Contrats et ventes

1. Contrat : parties, parcelle, prix, conditions, dates, mode (comptant ou échelonné)
2. Gel historique des données du contrat signé
3. Apport initial obligatoire, 30 % recommandé, montant négociable enregistré
4. Changement de parcelle : A → validation → B, motif, auteur, différence, A redevient disponible
5. Modification de prix après paiement : prix initial, réduction, prix final, déjà payé, nouveau solde, validation PDG
6. Passage à « Attribuée / En cours de paiement »

## Phase 10 — Moteur d'échéancier

1. Génération à partir de la date du premier versement
2. Durées 15 ou 20 mois, durée exceptionnelle documentée
3. Échéances à montants souples (ex. 94 000 FCFA × 14 mois puis 84 000 FCFA)
4. Suivi par mois : payé / dû / reste
5. Garantie du paiement intégral sur la durée convenue
6. Recalcul après toute modification validée

## Phase 11 — Encaissements, imputation et reçus

1. Saisie du paiement par PDG ou comptable, moyen d'origine conservé
2. Confirmation, puis effet en caisse et sur l'échéancier
3. Imputation : reliquat de retard d'abord, puis mois courant
4. Paiement couvrant plusieurs mois, paiement anticipé, paiement excédentaire selon règle configurable
5. Reçu officiel « mini-bilan » : montant, affectation, total payé, reste à payer, espace cachet manuscrit
6. Reçus distincts quand les affectations le nécessitent
7. Aucune suppression : correction historisée avec motif
8. Notification PDG lorsque la comptable confirme en son absence

## Phase 12 — Retards et relances

1. Calcul automatique des retards
2. Rappels J-7, J-2, jour J, après échéance
3. Aucune pénalité automatique
4. Retard critique à partir de 2 mois : alerte PDG + avertissement fort côté client
5. Tableau de suivi des impayés

## Phase 13 — Annulations

1. Demande d'annulation avec motif légitime
2. Validation PDG obligatoire
3. Calcul de la retenue standard 20 %, modulable au cas par cas jusqu'à 0 %
4. Retenue comptabilisée comme produit distinct de MSI
5. Décharge d'annulation générée depuis les données du contrat
6. Libération de la parcelle même si le remboursement reste dû

## Phase 14 — Remboursements

1. Créance de remboursement créée à l'annulation
2. Remboursement immédiat, intégral, partiel ou échelonné
3. Plan de remboursement et suivi des versements
4. Reçus de remboursement
5. Alerte persistante : parcelle remise en vente avec remboursement encore dû
6. Décharge finale et clôture à solde zéro

## Phase 15 — Caisse quotidienne

1. Ouverture avec solde initial
2. Entrées et sorties du jour
3. Solde théorique en temps réel
4. Comptage réel et clôture
5. Écart : clôture avec anomalie + justification obligatoire + notification PDG + audit
6. Journal de caisse consultable et non modifiable

## Phase 16 — Dépenses

1. Dépense complète : date, montant, catégorie, description, bénéficiaire, moyen, agence/projet
2. Justificatif joint, ou justification obligatoire en son absence
3. Circuit de validation et commentaires
4. Historique de chaque dépense
5. Rattachement au projet/lotissement pour la rentabilité

## Phase 17 — Comptabilité et rentabilité

1. Séparation stricte : ventes contractuelles, encaissements réels, créances, dépenses, remboursements, trésorerie, résultat
2. Coûts d'acquisition et coûts complémentaires par bien
3. Marge potentielle et marge réelle
4. Rapports périodiques exportables
5. Structure prête à accueillir un plan comptable formel (aucune règle comptable inventée)

## Phase 18 — Générateur documentaire

1. Modèles MSI : convention, échéancier, reçu, reçu de remboursement, décharge d'annulation, attestation de solde, acte de cession, documents de clôture
2. Remplissage automatique des données du dossier
3. Numérotation, archivage et versions
4. Impression PDF prête pour signature et cachet manuscrits
5. Règles de publication vers l'espace client
6. Documents fonciers/cession accessibles seulement après paiement finalisé

## Phase 19 — Espace client PWA

1. Connexion client sécurisée
2. Accueil visuel : progression, total payé, reste à payer, prochaine échéance
3. Acquisitions séparées les unes des autres
4. Historique des paiements et reçus téléchargeables
5. Échéancier, contrat et documents publiés
6. Notifications et avertissement fort en cas de retard critique
7. Emplacement de la parcelle et contact MSI
8. Installation mobile (PWA) et usage hors-ligne léger

## Phase 20 — Notifications, tableau de bord PDG et mise en service

1. Moteur de notifications sans doublon ni envoi simultané massif
2. Événements : paiement confirmé, échéance proche/dépassée, remboursement, nouveau document, contrat modifié
3. Tableau de bord PDG : trésorerie disponible, encaissements, créances, retards, marges, alertes en moins de 10 secondes
4. Contrôles de sécurité finaux et revue des permissions
5. Reprise des données existantes de MSI
6. Formation des profils et mise en production

---

## Notes techniques

- Base de données PostgreSQL via Lovable Cloud, sécurité par rôles au niveau des lignes, rôles dans une table dédiée.
- Tables financières en écriture seule logique : annulation par contre-écriture, jamais de suppression.
- Toutes les tables sensibles écrivent dans un journal d'audit unique.
- Documents générés en PDF côté serveur à partir des modèles MSI.
- Espace client servi par la même application, en mode PWA mobile-first.

## Démarrage

Après validation de ce plan, nous commençons par la **Phase 1** uniquement. 

&nbsp;

Oui nous pourrions le faire mais si on est d'accord pour ce travail, répond moi par un message cour, " on commence si t'es prêt' ensuite je te donnerai le feu vert pour commencer le développement de ce logiciel.