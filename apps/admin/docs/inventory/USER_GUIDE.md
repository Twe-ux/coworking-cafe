# Guide Utilisateur - Module Inventory

## Fournisseurs

### Ajouter un fournisseur
1. Inventory > Fournisseurs > "Ajouter fournisseur"
2. Remplir : Nom, Contact, Email, Telephone, Categories (food/cleaning)
3. Optionnel : Adresse, Conditions de paiement, Notes
4. Sauvegarder

### Modifier / Desactiver
- **Modifier** : Clic sur fournisseur > Modifier les champs > Sauvegarder
- **Desactiver** : Toggle "Actif" > Le fournisseur est masque de la liste par defaut

---

## Produits

### Ajouter un produit
1. Inventory > Produits > "Ajouter produit"
2. **Informations de base** : Nom, Categorie (food/cleaning), Unite (kg/L/unit/pack)
3. **Prix** : Prix unitaire HT, Taux TVA (%)
4. **Stock** : Stock minimum, Stock maximum, Stock actuel (initial)
5. **Fournisseur** : Selection (filtre par categorie)
6. **DLC courte** : Cocher si produit perissable (lait, oeufs, etc.)

### Alertes stock faible
- Badge rouge "Stock faible" sur les produits ou `currentStock < minStock`
- Visible sur la page Produits et le dashboard KPIs
- Taches automatiques creees via le systeme de taches

---

## Inventaires

### Inventaire Hebdomadaire (DLC courte)
- **Frequence** : Tous les lundis
- **Produits concernes** : Uniquement `hasShortDLC = true` (lait, oeufs, etc.)
- **Workflow** :
  1. Tache creee automatiquement (ou manuellement)
  2. Banniere "Inventaire planifie" sur le dashboard
  3. Clic "Demarrer" > Redirection vers saisie
  4. Saisir quantites reelles produit par produit
  5. Sauvegarde automatique (debounced)
  6. Finaliser > StockMovements crees, stock mis a jour, tache completee

### Inventaire Mensuel (tous produits)
- **Frequence** : 1er du mois
- **Produits concernes** : Tous les produits actifs
- **Workflow** : Identique a l'hebdomadaire

### Comprendre les ecarts
- **Positif (vert)** : quantite reelle > theorique = Surplus
- **Negatif (rouge)** : quantite reelle < theorique = Manquant
- **Valeur ecart** : ecart x prix unitaire HT

---

## Commandes Fournisseurs

### 1. Creer un brouillon
- **Suggestions auto** : Selectionner fournisseur > Les produits sous le stock minimum sont proposes avec quantite suggeree (maxStock - currentStock)
- **Manuel** : Ajouter produits et quantites manuellement

### 2. Valider (admin uniquement)
- Verifier quantites et totaux (HT/TTC)
- Cliquer "Valider" > Status passe a `validated`

### 3. Envoyer email (admin uniquement)
- Cliquer "Envoyer" > Email envoye au fournisseur avec liste produits + totaux
- Status passe a `sent`

### 4. Receptionner (staff ou admin)
- Saisir les quantites reellement recues (peuvent differer de la commande)
- Les StockMovements sont crees et le stock est mis a jour
- Status passe a `received`

### Numero de commande
Format : `PO-YYYYMMDD-XXX` (ex: PO-20260228-001)

---

## Analytics (admin uniquement)

### KPIs disponibles
- **Valeur stock** : Somme de (currentStock x unitPriceHT) par categorie et fournisseur
- **Ratio CA/Stock** : Chiffre d'affaires / Valeur stock (ideal 3-6 pour alimentaire)
- **Top 10 consommes** : Produits les plus utilises (basee sur StockMovements negatifs)
- **Repartition fournisseurs** : Part de chaque fournisseur dans la valeur stock

### Interpretation du taux de rotation
- **< 3** : Sur-stockage (capital immobilise inutilement)
- **3-6** : Optimal pour le secteur alimentaire
- **> 6** : Sous-stockage (risque de rupture)

---

## Best Practices

### Inventaires reguliers
- Hebdomadaire DLC courte : Ne jamais sauter
- Mensuel tous produits : Planifier en debut de mois

### Commandes anticipees
- Verifier les suggestions chaque semaine
- Commander avant epuisement total (garder marge de securite)

### Fournisseurs
- Maintenir emails et telephones a jour
- Desactiver les fournisseurs inactifs au lieu de supprimer

### Analytics
- Consulter le ratio CA/Stock mensuellement
- Ajuster minStock/maxStock si rotation anormale
