# Plan de Finalisation - Phase 11 : Excellence Financière & Sorties Documents

Ce plan vise à combler les 12% restants de la Phase 11, en se concentrant sur l'expérience utilisateur (UI), les notifications pour le PDG et la qualité des documents de sortie (reçus).

## 1. Centre de Notifications PDG (Phase 11.2 bis)
- **Interface de lecture** : Créer un composant `NotificationCenter` dans la barre de navigation ou le dashboard PDG.
- **Actions rapides** : Permettre au PDG de marquer comme "Lu" ou de cliquer pour voir le détail d'une vente directement depuis la notification.
- **Badge temps réel** : Afficher un compteur de notifications non lues.

## 2. Optimisation UI "Annule et Remplace" (Phase 11.3 bis)
- **Accessibilité** : Rendre le bouton de correction plus visible dans l'historique des paiements (icône dédiée).
- **Dialogue de confirmation** : Améliorer le formulaire de motif pour qu'il rappelle clairement que l'ancienne transaction sera barrée et non supprimée.
- **Trace visuelle** : Dans la liste des paiements, afficher les transactions annulées avec un style "barré" pour renforcer la notion de non-suppression.

## 3. Reçu « Mini-Bilan » Professionnel & Impression (Phase 11.4 bis)
- **Optimisation CSS Print** : Créer des styles `@media print` spécifiques pour garantir un rendu parfait sur imprimantes thermiques (ticket) et imprimantes de bureau (A5/A4).
- **Design "Authenticité"** : Ajouter les zones visuelles pour le cachet MSI et la signature manuscrite avec des bordures élégantes.
- **Export PDF natif** : Intégrer une fonction `window.print()` optimisée ou un bouton "Télécharger PDF" propre.

## 4. Finalisation RLS & Sécurité
- **Audit des permissions** : Vérifier que toutes les fonctions `SECURITY DEFINER` ont bien un `search_path` défini pour éviter toute faille.
- **Nettoyage Linter** : Résoudre les derniers avertissements de sécurité dans les migrations SQL.

## Détails Techniques
- **Fichiers concernés** :
    - `src/components/layout/NotificationCenter.tsx` (Nouveau)
    - `src/components/ventes/ReceiptGenerator.tsx` (Mise à jour styles & print)
    - `src/routes/_authenticated/ventes/$saleId.tsx` (Intégration UI correction)
- **Backend** :
    - Nouvelle fonction serveur `getNotifications` et `markNotificationAsRead`.
    - Migration SQL pour les derniers ajustements de `search_path`.
