# Protocol de Test des Stocks - Step by Step

> **Objectif** : Identifier la source des stocks négatifs et commandes erronées

---

## 🎯 Principe

On va tester **chaque opération** qui modifie les stocks de manière isolée pour identifier précisément où le problème se produit.

---

## 📋 Checklist Avant de Commencer

- [ ] Environnement DEV uniquement
- [ ] Backup de la DB (si nécessaire)
- [ ] Stocks reset à zéro via script
- [ ] Console ouverte pour voir les logs

---

## 🧪 Tests Étape par Étape

### Phase 1 : Inventaire Initial (Baseline)

**Objectif** : Établir un stock de départ propre

#### Test 1.1 : Créer un Inventaire

1. **Action** : Créer un nouvel inventaire
   - `/admin/inventory/entries` → Nouveau
   - Date : Aujourd'hui

2. **Vérifications** :
   - [ ] Inventaire créé avec statut `draft`
   - [ ] Aucun StockMovement créé (normal en draft)

#### Test 1.2 : Saisir Stocks Réels

1. **Action** : Saisir stock pour 3 produits tests
   ```
   Produit A: 10 unités
   Produit B: 5 unités
   Produit C: 0 unités (rupture)
   ```

2. **Vérifications** :
   - [ ] `actualQty` enregistré correctement
   - [ ] Variance calculée = `actualQty - currentStock` (devrait être = actualQty car currentStock = 0)
   - [ ] Aucun StockMovement encore (draft)

#### Test 1.3 : Finaliser Inventaire

1. **Action** : Finaliser l'inventaire

2. **Vérifications CRITIQUES** :
   ```
   Pour chaque produit avec variance !== 0:
   ```
   - [ ] **StockMovement créé ?**
     - Type : `inventory_adjustment`
     - Quantity : **Doit être = variance**
     - UnitPriceHT : CUMP ou prix produit

   - [ ] **Product.currentStock mis à jour ?**
     ```
     Avant: currentStock = 0
     Variance: +10 (Produit A)
     Après: currentStock = 0 + 10 = 10 ✅

     SI NÉGATIF = 🐛 BUG ICI !
     ```

3. **Commandes auto-générées ?**
   - [ ] Produit A (stock=10, max=20) → Commande 10 unités ? ✅
   - [ ] Produit B (stock=5, max=20) → Commande 15 unités ? ✅
   - [ ] Produit C (stock=0, max=20) → Commande 20 unités ? ✅

4. **Logs à vérifier** :
   ```bash
   [finalize] Product A: actualQty=10, minStock=5, maxStock=20, orderQty=10
   [finalize] Product B: actualQty=5, minStock=3, maxStock=20, orderQty=15
   [finalize] Product C: actualQty=0, minStock=3, maxStock=20, orderQty=20
   ```

---

### Phase 2 : Réception Commande

**Objectif** : Vérifier que la réception augmente bien le stock

#### Test 2.1 : Créer et Envoyer Commande

1. **Action** :
   - Créer commande pour Produit A : 10 unités
   - Valider → Envoyer

2. **Vérifications** :
   - [ ] Statut : `draft` → `validated` → `sent`
   - [ ] **currentStock INCHANGÉ** (normal, pas encore reçu)

#### Test 2.2 : Réceptionner Commande (Partiel)

1. **Action** :
   - Réceptionner 7 unités sur 10 commandées

2. **Vérifications CRITIQUES** :
   - [ ] **StockMovement créé ?**
     - Type : `purchase_receipt`
     - Quantity : **+7** (positif)
     - ProductId : Produit A

   - [ ] **Product.currentStock mis à jour ?**
     ```
     Avant: 10
     Mouvement: +7
     Après: 10 + 7 = 17 ✅

     SI < 10 = 🐛 BUG ICI !
     SI NÉGATIF = 🐛 BUG CRITIQUE !
     ```

#### Test 2.3 : Réceptionner Complètement

1. **Action** :
   - Réceptionner les 3 unités restantes

2. **Vérifications** :
   - [ ] StockMovement : +3
   - [ ] currentStock : 17 + 3 = 20 ✅
   - [ ] Statut commande : `received`

---

### Phase 3 : Inventaire Suivant (Ajustements)

**Objectif** : Vérifier les ajustements positifs ET négatifs

#### Test 3.1 : Inventaire avec Stock Supérieur

1. **Setup** :
   ```
   Produit A: currentStock = 20
   ```

2. **Action** :
   - Créer inventaire
   - Saisir : 25 unités (trouvé 5 de plus)
   - Finaliser

3. **Vérifications** :
   - [ ] Variance : 25 - 20 = +5
   - [ ] StockMovement : +5
   - [ ] currentStock : 20 + 5 = 25 ✅

#### Test 3.2 : Inventaire avec Stock Inférieur (CRITIQUE)

1. **Setup** :
   ```
   Produit B: currentStock = 20
   ```

2. **Action** :
   - Créer inventaire
   - Saisir : 15 unités (manque 5)
   - Finaliser

3. **Vérifications CRITIQUES** :
   - [ ] Variance : 15 - 20 = **-5** (négatif)
   - [ ] StockMovement : **-5** (négatif)
   - [ ] currentStock : 20 + (-5) = **15** ✅

   **🚨 ATTENTION** :
   ```
   SI currentStock = 20 - (-5) = 25 → BUG !
   SI currentStock < 15 → BUG !
   SI currentStock devient NÉGATIF → BUG CRITIQUE !
   ```

---

### Phase 4 : Ventes/Sorties (Si applicable)

#### Test 4.1 : Sortie Stock Manuel

1. **Action** :
   - Créer mouvement de sortie : -3 unités (Produit A)

2. **Vérifications** :
   - [ ] StockMovement : -3 (négatif)
   - [ ] currentStock : 25 - 3 = 22 ✅

---

## 🐛 Points de Vigilance (Bugs Potentiels)

### 1. Double Signe Négatif
```typescript
// ❌ BUG POTENTIEL
currentStock = currentStock - variance  // Si variance = -5
// → 20 - (-5) = 25 au lieu de 15 !

// ✅ CORRECT
currentStock = currentStock + variance  // variance peut être + ou -
// → 20 + (-5) = 15 ✓
```

### 2. Calcul Variance Inversé
```typescript
// ❌ BUG POTENTIEL
variance = currentStock - actualQty  // INVERSÉ !
// → 20 - 15 = +5 (devrait être -5)

// ✅ CORRECT
variance = actualQty - currentStock
// → 15 - 20 = -5 ✓
```

### 3. Réception avec Signe Inversé
```typescript
// ❌ BUG POTENTIEL
StockMovement.create({ quantity: -receivedQty })  // NÉGATIF !

// ✅ CORRECT
StockMovement.create({ quantity: receivedQty })  // POSITIF
```

### 4. $inc MongoDB avec Mauvais Signe
```typescript
// ❌ BUG POTENTIEL
Product.updateOne({ $inc: { currentStock: -variance } })  // Double négatif !

// ✅ CORRECT
Product.updateOne({ $inc: { currentStock: variance } })  // variance déjà signé
```

---

## 📊 Template de Rapport

Pour chaque test, noter :

```markdown
### Test X.Y : [Nom du test]

**Stock avant** : Produit A = 10

**Action** : [Description]

**Stock attendu** : 10 + 7 = 17

**Stock réel** : _____

**StockMovement** :
- ID : _____
- Type : _____
- Quantity : _____
- Date : _____

**Résultat** : ✅ OK / ❌ FAIL

**Si FAIL** :
- Description du problème : _____
- Code suspect : _____
- Fichier : _____
```

---

## 🔍 Commandes Utiles pour Debugging

### Vérifier Stock d'un Produit
```bash
# Via MongoDB Compass ou mongo shell
db.getCollection('inventory-products').findOne({ name: "Produit A" })
# Regarder: currentStock
```

### Lister StockMovements d'un Produit
```bash
db.getCollection('inventory-movements').find({
  productId: ObjectId("...")
}).sort({ date: -1 })
# Vérifier: quantity (+ ou -)
```

### Calculer Stock Théorique
```bash
# Somme de tous les mouvements pour un produit
db.getCollection('inventory-movements').aggregate([
  { $match: { productId: ObjectId("...") } },
  { $group: { _id: null, total: { $sum: "$quantity" } } }
])
# Doit correspondre à currentStock !
```

---

## 🎯 Objectif Final

Identifier **EXACTEMENT** à quelle étape le stock devient incorrect :
1. ❌ Finalisation inventaire ?
2. ❌ Réception commande ?
3. ❌ Ajustement inventaire suivant ?
4. ❌ Autre opération ?

Une fois identifié → On corrige le code spécifique ! 🔧

---

**Dernière mise à jour** : 2026-04-05
