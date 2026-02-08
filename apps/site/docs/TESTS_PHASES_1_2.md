# Plan de Tests - Phases 1 & 2

**Date** : 2026-02-08  
**Objectif** : Valider que les refactorisations TypeScript n'ont pas introduit de régressions

---

## ✅ Tests Techniques

### 1. Type Check
```bash
cd apps/site
pnpm type-check
```
**Résultat attendu** : ✅ 0 erreur

### 2. Build
```bash
pnpm build
```
**Résultat attendu** : ✅ Build réussi, toutes les pages compilées

### 3. Linter
```bash
pnpm lint
```
**Résultat attendu** : Aucune erreur critique

---

## 🧪 Tests Fonctionnels (Dev Mode)

### Démarrage
```bash
pnpm dev
```

### 1. Site Public (/)

**Pages à tester** :
- [ ] `/` - Homepage
- [ ] `/concept` - Page concept
- [ ] `/spaces` - Espaces
- [ ] `/pricing` - Tarifs
- [ ] `/blog` - Liste articles
- [ ] `/blog/[slug]` - Article détail
- [ ] `/contact` - Formulaire contact

**Vérifications** :
- [ ] Pas d'erreur console (F12)
- [ ] Pas d'erreur de rendu
- [ ] Images chargent correctement
- [ ] Navigation fonctionne

---

### 2. Système de Réservation

**Flow complet** :
- [ ] `/booking/[type]/new` - Sélection espace
  - [ ] Formulaire affiche correctement
  - [ ] Sélection date/heure fonctionne
  - [ ] Validation côté client OK
  
- [ ] Étape 2 : Services additionnels
  - [ ] Liste services charge
  - [ ] Ajout/retrait services fonctionne
  - [ ] Calcul prix TTC correct
  
- [ ] Étape 3 : Informations contact
  - [ ] Formulaire validation OK
  - [ ] Création compte optionnelle fonctionne
  
- [ ] Étape 4 : Paiement Stripe
  - [ ] Stripe Elements charge
  - [ ] Payment Intent créé
  
**Vérifications critiques** :
- [ ] Pas d'erreur `any is not defined`
- [ ] Dates affichées au bon format (YYYY-MM-DD)
- [ ] Prix calculés correctement
- [ ] Pas d'erreur dans la console

---

### 3. Dashboard Client (/dashboard)

**Pages** :
- [ ] `/dashboard` - Vue d'ensemble
- [ ] `/dashboard/bookings` - Mes réservations
- [ ] `/dashboard/profile` - Mon profil
- [ ] `/dashboard/messages` - Messagerie
- [ ] `/dashboard/settings` - Paramètres

**Tests spécifiques** :
- [ ] Liste réservations charge (`ReservationData` bien typé)
- [ ] Filtrage réservations fonctionne
- [ ] Formulaire profil valide
- [ ] Pas d'erreur TypeScript visible

---

### 4. API Routes (Tests avec curl/Postman)

**Email Templates** (corrigés en Phase 2) :
```bash
# Test email de rappel (ReminderEmailData)
curl -X POST http://localhost:3000/api/test/reminder-email \
  -H "Content-Type: application/json"

# Test email caution (EmailWithDepositData)
curl -X POST http://localhost:3000/api/test/deposit-email \
  -H "Content-Type: application/json"
```

**Réservations** :
```bash
# GET /api/bookings (BookingWithSpace typé)
curl http://localhost:3000/api/bookings

# GET /api/additional-services
curl http://localhost:3000/api/additional-services
```

**Vérifications** :
- [ ] Réponses JSON bien formées
- [ ] Pas d'erreur 500
- [ ] Types retournés cohérents
- [ ] Propriétés `contactEmail`, `numberOfPeople` présentes

---

### 5. Cron Jobs (Si applicable)

**Tests manuels** :
```bash
# Test send-reminders
curl -X GET http://localhost:3000/api/cron/send-reminders \
  -H "Authorization: Bearer $CRON_SECRET"

# Test check-attendance
curl -X GET http://localhost:3000/api/cron/check-attendance \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Vérifications** :
- [ ] Pas d'erreur ObjectId conversion
- [ ] Emails envoyés avec tous les champs requis
- [ ] Logs propres (pas d'undefined)

---

## 🎨 Tests Visuels

### Composants Modifiés

**MarkdownRenderer** (`CodeComponentProps` ajouté) :
- [ ] `/blog/[slug]` - Blocs de code inline OK
- [ ] Blocs de code multilignes OK
- [ ] Pas de régression visuelle

**Booking Pages** (`StoredBookingData` ajouté) :
- [ ] Formulaire booking affiche bien les données
- [ ] sessionStorage sauvegarde/restaure correctement
- [ ] Pas de perte de données entre étapes

**Menu Page** (`MenuCategory` ajouté) :
- [ ] `/menu` - Comptage items correct
- [ ] Affichage catégories OK

---

## 🔍 Vérifications Console (DevTools)

Ouvrir la console (F12) et vérifier :

**Pas d'erreurs** :
- [ ] ❌ `Cannot read property 'X' of undefined`
- [ ] ❌ `X is not a function`
- [ ] ❌ `Type error: ...`

**Warnings acceptables** :
- ⚠️ Warnings React hydration (préexistants)
- ⚠️ Warnings dépendances (préexistants)

**Interdits** :
- ❌ AUCUNE erreur liée aux types
- ❌ AUCUNE erreur liée aux emails
- ❌ AUCUNE erreur ObjectId

---

## 📊 Checklist de Validation

### Tests Réussis
- [ ] `pnpm type-check` : 0 erreur ✅
- [ ] `pnpm build` : Success ✅
- [ ] `pnpm lint` : Pas d'erreur critique ✅
- [ ] Site public : Toutes pages OK ✅
- [ ] Booking flow : Complet sans erreur ✅
- [ ] Dashboard client : Fonctionnel ✅
- [ ] API Routes : Réponses correctes ✅
- [ ] Console : Propre (pas d'erreur TS) ✅

### Tests Échoués
Si **UN SEUL test échoue** :
1. Noter le problème dans un fichier `ISSUES_PHASE_1_2.md`
2. Identifier la cause (régression du refacto ?)
3. Corriger avant de merger
4. Re-tester

---

## 🚀 Si Tous les Tests Passent

**Étapes suivantes** :
1. ✅ Valider que tout fonctionne
2. 📝 Documenter les tests réussis
3. 🔀 Merger `refactor/site-phase1-types` → `main`
4. 🎯 Planifier Phase 3 (découpage fichiers > 200 lignes)

---

## 🐛 Si Tests Échouent

**Process de correction** :
1. Identifier le problème précis
2. Créer un agent pour corriger
3. Re-tester
4. Répéter jusqu'à ce que tous les tests passent

---

**Temps estimé de test** : 30-45 minutes

