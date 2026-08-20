# Plan de Travail - Phase 14 : Performance & Bilans Stratégiques

Cette phase vise à transformer les données opérationnelles en outils de décision pour la Direction, en mettant l'accent sur la rentabilité réelle et les projections.

## Phase 14.1 : Moteur de Rentabilité par Lotissement
- **Backend (SQL)** :
    - Création de la vue `v_lotissement_profitability` pour calculer la rentabilité nette (Ventes encaissées - (Acquisition + Dépenses liées)).
    - Ajout de fonctions de calcul pour le ROI (Retour sur Investissement) par site.
- **Frontend** :
    - Nouvelle page `_authenticated/immobilier/bilans`.
    - Cartes KPI : Marge nette par site, Stock restant (valeur vénale), Cash-flow généré.

## Phase 14.2 : Analyse de la Performance Commerciale
- **Logique** :
    - Extraction des statistiques de vente par agent : volume de parcelles, montant total, taux de défaut de paiement des clients apportés.
- **UI** :
    - Graphiques de performance (Recharts) comparant les agences et les commerciaux.
    - Filtres par période (Date début/fin) et par agence.

## Phase 14.3 : Prévisions de Trésorerie (Cash Projections)
- **Logique** :
    - Agrégation des échéances futures (`payment_schedules` non payés).
    - Calcul du "pipe" financier à 3, 6 et 12 mois.
- **UI** :
    - Graphique de projection de trésorerie montrant les encaissements attendus vs les charges fixes estimées.

## Phase 14.4 : Rapports & Exportations
- **Fonctionnalité** :
    - Génération de rapports de synthèse pour le PDG.
    - Export CSV/PDF des bilans de lotissement pour les réunions de stratégie.

## Vérification & Qualité
- Validation des calculs financiers (somme des parcelles = total lotissement).
- Test des filtres de date pour assurer la cohérence des bilans périodiques.
- Vérification des droits d'accès (Seule la Direction/Compta voit les marges nettes).
