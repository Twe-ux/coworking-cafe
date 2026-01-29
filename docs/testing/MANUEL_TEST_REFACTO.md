# 📋 GUIDE DE TEST MANUEL - REFACTORISATION

**Date**: 2026-01-29
**Objectif**: Tester les pages refactorisées pour valider qu'aucune régression n'a été introduite

---

## 🎯 PAGES À TESTER

### 1. Booking Flow (Flux de Réservation)

#### Page 1: `/booking/details`
**Fichier**: `apps/site/src/app/(site)/booking/details/page.tsx`
**Refactorisation**: -231 lignes, -19 types `any`, utilise `useBookingForm` hook

##### ✅ Checklist de Test

**Chargement initial**
- [ ] La page se charge sans erreur
- [ ] Les données de sessionStorage sont restaurées si présentes
- [ ] Le formulaire de contact est pré-rempli si utilisateur connecté

**Formulaire de Contact**
- [ ] Les champs nom, email, téléphone s'affichent
- [ ] La validation fonctionne (champs requis)
- [ ] Les messages d'erreur s'affichent correctement
- [ ] Le checkbox "Créer un compte" affiche les champs password
- [ ] Les champs password ont l'icône œil pour show/hide
- [ ] La validation des mots de passe fonctionne (min 8 caractères, correspondance)

**Services Additionnels**
- [ ] Les services se chargent depuis l'API
- [ ] Les catégories de services s'affichent
- [ ] On peut ajouter un service (+)
- [ ] On peut retirer un service (-)
- [ ] On peut modifier la quantité
- [ ] Le prix total se met à jour automatiquement

**Navigation**
- [ ] Le bouton "Retour" ramène à l'étape précédente
- [ ] Le bouton "Suivant" valide le formulaire
- [ ] Si erreurs, le bouton "Suivant" n'avance pas
- [ ] Les données sont sauvegardées dans sessionStorage

**Console Browser**
- [ ] Aucune erreur JavaScript
- [ ] Aucun warning React (hooks, dependencies)

---

#### Page 2: `/booking/summary`
**Fichier**: `apps/site/src/app/(site)/booking/summary/page.tsx`
**Refactorisation**: -724 lignes (-48%), -10 types `any`, code dupliqué supprimé

##### ✅ Checklist de Test

**Chargement initial**
- [ ] La page se charge sans erreur
- [ ] Les données de réservation s'affichent correctement
- [ ] Le récapitulatif des services additionnels est correct
- [ ] Le tableau de prix s'affiche

**Récapitulatif**
- [ ] Date, heure de début/fin affichées
- [ ] Type d'espace affiché
- [ ] Nombre de personnes affiché
- [ ] Services additionnels listés avec quantités
- [ ] Prix de base correct
- [ ] Prix des services correct
- [ ] Prix total correct

**Switch TTC / HT**
- [ ] Le switch TTC/HT fonctionne
- [ ] Les prix se convertissent correctement
- [ ] Le calcul de TVA est correct
- [ ] Les prix des services se convertissent aussi

**Formulaire de Paiement**
- [ ] Le formulaire Stripe Elements se charge
- [ ] Les champs carte bancaire s'affichent
- [ ] Le checkbox "J'accepte les conditions" fonctionne
- [ ] Le bouton "Payer" est désactivé si conditions non acceptées

**Soumission**
- [ ] La soumission déclenche le Payment Intent
- [ ] Le loading s'affiche pendant le paiement
- [ ] En cas de succès, redirection vers page de confirmation
- [ ] En cas d'erreur, message d'erreur affiché
- [ ] Les données sont effacées de sessionStorage après succès

**Console Browser**
- [ ] Aucune erreur JavaScript
- [ ] Aucun warning React
- [ ] Les logs Stripe (si en mode test) sont normaux

---

### 2. Profile (Profil Utilisateur)

#### Page: `/[id]/profile`
**Fichier**: `apps/site/src/app/(site)/[id]/profile/ProfileClient.tsx`
**Refactorisation**: -67 lignes, -13 types `any`, utilise `useProfileForm` hook

##### ✅ Checklist de Test

**Chargement initial**
- [ ] La page se charge sans erreur
- [ ] Les données utilisateur sont pré-remplies
- [ ] Nom, email, téléphone, entreprise affichés

**Formulaire**
- [ ] On peut modifier le nom
- [ ] On peut modifier l'email
- [ ] On peut modifier le téléphone
- [ ] On peut modifier le nom d'entreprise
- [ ] Les validations fonctionnent (email valide, etc.)

**Soumission**
- [ ] Le bouton "Enregistrer" déclenche la soumission
- [ ] Un loading s'affiche pendant la requête
- [ ] En cas de succès, message "Profil mis à jour"
- [ ] En cas d'erreur, message d'erreur affiché
- [ ] La session NextAuth est mise à jour
- [ ] Le nom dans le header change après update

**API Route**: `/api/user/profile`
- [ ] GET retourne les bonnes données
- [ ] PUT met à jour correctement
- [ ] Les types TypeScript sont respectés (pas d'erreur compilation)

**Console Browser**
- [ ] Aucune erreur JavaScript
- [ ] Aucun warning React

---

### 3. Cron Jobs (Tests Backend)

**Fichiers refactorisés** (5 fichiers, -52 types `any`):
- `app/api/cron/daily-report/route.ts`
- `app/api/cron/send-reminders/route.ts`
- `app/api/cron/check-attendance/route.ts`
- `app/api/cron/create-holds/route.ts`
- `app/api/cron/capture-deposits/route.ts`

##### ✅ Checklist de Test

**Tests avec curl ou Postman**

**1. Daily Report** (`GET /api/cron/daily-report`)
```bash
curl http://localhost:3000/api/cron/daily-report \
  -H "Authorization: Bearer <CRON_SECRET>"
```
- [ ] Retourne 200 OK
- [ ] Le JSON contient `todayBookings`, `upcomingBookings`, `stats`
- [ ] Les bookings ont `user`, `space`, `time`, `people`, `price`
- [ ] Les stats contiennent `totalBookings`, `totalRevenue`, etc.
- [ ] Aucune erreur de type dans les logs

**2. Send Reminders** (`POST /api/cron/send-reminders`)
```bash
curl -X POST http://localhost:3000/api/cron/send-reminders \
  -H "Authorization: Bearer <CRON_SECRET>"
```
- [ ] Retourne 200 OK
- [ ] Le JSON contient `sent`, `failed`, `total`
- [ ] Les emails sont envoyés (vérifier logs)
- [ ] Aucune erreur MongoDB

**3. Check Attendance** (`POST /api/cron/check-attendance`)
```bash
curl -X POST http://localhost:3000/api/cron/check-attendance \
  -H "Authorization: Bearer <CRON_SECRET>"
```
- [ ] Retourne 200 OK
- [ ] Le JSON contient `checked`, `noShows`, `total`
- [ ] Les bookings sont marqués "no-show" si applicable
- [ ] Aucune erreur de type

**4. Create Holds** (`POST /api/cron/create-holds`)
```bash
curl -X POST http://localhost:3000/api/cron/create-holds \
  -H "Authorization: Bearer <CRON_SECRET>"
```
- [ ] Retourne 200 OK
- [ ] Le JSON contient `created`, `failed`, `total`
- [ ] Les PaymentIntents sont créés dans Stripe
- [ ] Aucune erreur Stripe

**5. Capture Deposits** (`POST /api/cron/capture-deposits`)
```bash
curl -X POST http://localhost:3000/api/cron/capture-deposits \
  -H "Authorization: Bearer <CRON_SECRET>"
```
- [ ] Retourne 200 OK
- [ ] Le JSON contient `captured`, `failed`, `total`
- [ ] Les dépôts sont capturés dans Stripe
- [ ] Les bookings sont mis à jour (`depositCaptured: true`)

**Console Server**
- [ ] Aucune erreur TypeScript runtime
- [ ] Aucun warning MongoDB (deprecated methods)
- [ ] Les logs sont clairs et typés

---

## 🔍 TESTS DE RÉGRESSION

### Tests Visuels (UI/UX)

**Design & Styles**
- [ ] Tous les styles CSS sont préservés
- [ ] Les classes SCSS BEM fonctionnent
- [ ] Les couleurs sont identiques
- [ ] Les espacements sont préservés
- [ ] Les animations fonctionnent
- [ ] Le responsive fonctionne (mobile, tablet, desktop)

**Navigation**
- [ ] Les liens fonctionnent
- [ ] Les redirections sont correctes
- [ ] Le breadcrumb s'affiche si applicable
- [ ] Le header/footer sont normaux

### Tests Fonctionnels

**SessionStorage**
- [ ] Les données sont bien sauvegardées
- [ ] Les données sont restaurées au reload
- [ ] Les données sont effacées après paiement réussi

**API Calls**
- [ ] `/api/additional-services` fonctionne
- [ ] `/api/booking/calculate-price` fonctionne
- [ ] `/api/booking/create` fonctionne
- [ ] `/api/user/profile` (GET et PUT) fonctionnent
- [ ] Tous les cron jobs fonctionnent

**TypeScript**
- [ ] Build réussit sans erreur: `pnpm build`
- [ ] Type-check réussit: `pnpm type-check` (si disponible)
- [ ] Lint réussit: `pnpm lint`

---

## 🐛 EN CAS DE BUG

### Informations à Noter

1. **Page concernée**:
2. **Action effectuée**:
3. **Comportement attendu**:
4. **Comportement observé**:
5. **Erreurs console**:
6. **Erreurs réseau** (onglet Network):

### Revenir en Arrière

Si un bug bloquant est détecté, les commits peuvent être annulés:

```bash
# Voir l'historique des commits
git log --oneline -10

# Revenir à un commit spécifique
git reset --hard <commit-sha>

# OU créer un revert commit
git revert <commit-sha>
```

**Commits de la refactorisation**:
- Création des types: `apps/site/src/types/booking.ts`, `types/user.ts`, `types/cron.ts`
- Création des hooks: `apps/site/src/hooks/useBookingForm.ts`, `hooks/useProfileForm.ts`
- Refactorisation booking/details, booking/summary
- Refactorisation ProfileClient, route.ts
- Refactorisation des 5 cron jobs

---

## ✅ VALIDATION FINALE

Avant de marquer la refactorisation comme réussie:

- [ ] **Tous les tests booking/details passent**
- [ ] **Tous les tests booking/summary passent**
- [ ] **Tous les tests profile passent**
- [ ] **Tous les 5 cron jobs fonctionnent**
- [ ] **Build réussit sans erreur**
- [ ] **Aucune régression visuelle**
- [ ] **Aucune régression fonctionnelle**
- [ ] **Console browser propre (pas d'erreurs)**
- [ ] **Console server propre (pas d'erreurs)**

---

## 📊 MÉTRIQUES DE SUCCÈS

### Avant Refactorisation
- **Types `any`**: 82+
- **Fichiers > 1,500 lignes**: 2
- **Code dupliqué**: Oui (321 lignes)
- **Hooks réutilisables**: 0
- **Types partagés**: 0

### Après Refactorisation
- **Types `any`**: 0 ✅
- **Fichiers > 1,500 lignes**: 0 ✅
- **Code dupliqué**: Non ✅
- **Hooks réutilisables**: 2 ✅
- **Types partagés**: 3 fichiers ✅

---

**Temps estimé de test**: 1-2 heures pour tous les tests manuels

**Prochaine étape**: Si tous les tests passent → Déploiement en production

---

_Créé le 2026-01-29 - Suite à la refactorisation apps/site_
