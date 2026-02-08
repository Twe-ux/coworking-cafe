# Phase 3 : Découpage Fichiers > 200 lignes

> **Objectif** : Rendre le code plus maintenable en découpant les fichiers trop longs
> **Status** : 📋 Planifié - Pas encore commencé
> **Date création** : 2026-02-08

---

## 📊 État des Lieux

### Fichiers Critiques (> 200 lignes)

**Total identifié** : 19 fichiers à découper

| Fichier | Lignes | Priorité | Type |
|---------|--------|----------|------|
| `booking/[type]/new/page.tsx` | 1399 | 🔥 P0 | Page booking |
| `booking/details/page.tsx` | 1346 | 🔥 P0 | Page booking |
| `cgu/page.tsx` | 984 | 🟡 P2 | Page légale |
| `confidentiality/page.tsx` | 905 | 🟡 P2 | Page légale |
| `booking/summary/page.tsx` | 831 | 🔥 P0 | Page booking |
| `mentions-legales/page.tsx` | 716 | 🟡 P2 | Page légale |
| `lib/email/emailService.ts` | 675 | 🟠 P1 | Service |
| `hooks/useBookingForm.ts` | 644 | 🔥 P0 | Hook |
| `booking/confirmation/[id]/page.tsx` | 603 | 🔥 P0 | Page booking |
| `api/payments/webhook/route.ts` | 556 | 🟠 P1 | API |
| `lib/promo-service.ts` | 486 | 🟠 P1 | Service |
| `types/booking.ts` | 467 | 🟡 P2 | Types |
| `CancelBookingModal.tsx` | 436 | 🟠 P1 | Composant |
| `api/cron/daily-report/route.ts` | 432 | 🟡 P2 | API Cron |
| `store/api/blogApi.ts` | 396 | 🟡 P2 | API Store |
| `api/bookings/create-with-services/route.ts` | 394 | 🟠 P1 | API |
| `api/bookings/[id]/cancel/route.ts` | 377 | 🟠 P1 | API |
| `booking/page.tsx` | 371 | 🟠 P1 | Page booking |
| `horaires/page.tsx` | 364 | 🟡 P2 | Page |

### Priorisation

**P0 - Critique (6 fichiers)** : Pages booking + Hook principal
- Impact direct sur UX booking
- Code complexe, bugs potentiels
- **À traiter en premier**

**P1 - Important (7 fichiers)** : APIs + Services
- Logique métier critique
- Difficile à maintenir
- **À traiter après P0**

**P2 - Normal (6 fichiers)** : Pages légales + Autres
- Peu de logique
- Principalement du contenu statique
- **À traiter en dernier**

---

## 🎯 Objectifs Phase 3

### Règles Strictes

- ✅ **Pages** : < 150 lignes
- ✅ **Composants** : < 200 lignes
- ✅ **Hooks** : < 250 lignes
- ✅ **API Routes** : < 200 lignes
- ✅ **Services** : < 200 lignes

### Principes de Découpage

1. **Extraction de Hooks** : Logique métier dans hooks customs
2. **Sous-composants** : UI répétitive dans composants séparés
3. **Helpers** : Fonctions utilitaires dans `/lib/utils/`
4. **Validation** : Schémas de validation dans `/lib/validation/`

---

## 📋 Plan d'Action Détaillé

### Étape 1 : P0 - Pages Booking (Jours 1-3)

#### 1.1 booking/[type]/new/page.tsx (1399 lignes → ~100 lignes)

**Analyse** :
```typescript
// Actuellement tout dans page.tsx :
- State management (form, errors, loading)
- Validation logique
- Calculs de prix
- Appels API
- Rendu UI (formulaire + steps)
```

**Découpage proposé** :

```
booking/[type]/new/
├── page.tsx (100 lignes)              # Composant principal
├── hooks/
│   ├── useBookingPricing.ts (120)     # Calcul prix + promo
│   ├── useBookingValidation.ts (80)   # Validation form
│   └── useBookingSubmit.ts (100)      # Soumission + API
├── components/
│   ├── BookingSteps.tsx (60)          # Indicateur étapes
│   ├── SpaceSelector.tsx (100)        # Sélection espace
│   ├── DateTimeSelector.tsx (120)     # Date + heures
│   ├── PeopleSelector.tsx (60)        # Nombre personnes
│   ├── ServicesSelector.tsx (150)     # Services additionnels
│   └── PricingSummary.tsx (100)       # Récapitulatif prix
└── utils/
    └── booking-helpers.ts (80)        # Helpers calculs
```

**Résultat attendu** :
- Page principale : ~100 lignes (orchestration seulement)
- Logique extraite : 3 hooks + 6 composants
- Réutilisabilité : Composants réutilisables ailleurs

---

#### 1.2 booking/details/page.tsx (1346 lignes → ~100 lignes)

**Découpage proposé** :

```
booking/details/
├── page.tsx (100 lignes)
├── hooks/
│   ├── useContactForm.ts (120)        # Form contact + validation
│   ├── useAccountCreation.ts (100)    # Création compte optionnelle
│   └── useProfileUpdate.ts (80)       # Update profil user
├── components/
│   ├── ContactForm.tsx (150)          # Formulaire contact
│   ├── AccountCreationSection.tsx (120) # Section création compte
│   ├── NewsletterCheckbox.tsx (40)    # Checkbox newsletter
│   └── ProfileSection.tsx (100)       # Section profil
└── utils/
    └── contact-validation.ts (60)     # Validation contact
```

---

#### 1.3 booking/summary/page.tsx (831 lignes → ~120 lignes)

**Découpage proposé** :

```
booking/summary/
├── page.tsx (120 lignes)
├── hooks/
│   └── useBookingSummary.ts (100)     # Récupération données booking
├── components/
│   ├── BookingSummaryCard.tsx (150)   # Card récapitulatif
│   ├── ServicesList.tsx (80)          # Liste services
│   ├── PriceBreakdown.tsx (100)       # Détail prix
│   └── ConfirmButton.tsx (60)         # Bouton confirmation
└── utils/
    └── price-formatter.ts (40)        # Formatage prix
```

---

#### 1.4 hooks/useBookingForm.ts (644 lignes → ~150 lignes)

**Découpage proposé** :

```
hooks/
├── useBookingForm.ts (150)            # Hook principal (orchestration)
├── useFormValidation.ts (120)         # Validation séparée
├── useFormState.ts (100)              # State management
└── useFormSubmit.ts (100)             # Logique submit
```

**Principe** : Hook principal appelle les 3 hooks spécialisés

---

#### 1.5 booking/confirmation/[id]/page.tsx (603 lignes → ~120 lignes)

**Découpage proposé** :

```
booking/confirmation/[id]/
├── page.tsx (120 lignes)
├── hooks/
│   └── useBookingDetails.ts (80)      # Fetch détails
├── components/
│   ├── ConfirmationHeader.tsx (80)    # Header succès
│   ├── BookingDetailsCard.tsx (120)   # Détails booking
│   ├── NextSteps.tsx (80)             # Prochaines étapes
│   └── ActionsButtons.tsx (60)        # Boutons actions
```

---

#### 1.6 booking/page.tsx (371 lignes → ~100 lignes)

**Découpage proposé** :

```
booking/
├── page.tsx (100 lignes)
├── components/
│   ├── BookingTypeSelector.tsx (80)   # Sélection type booking
│   ├── SpaceTypeCards.tsx (100)       # Cards types espaces
│   └── BookingHero.tsx (60)           # Hero page booking
```

---

### Étape 2 : P1 - APIs + Services (Jours 4-6)

#### 2.1 api/payments/webhook/route.ts (556 lignes → ~150 lignes)

**Découpage proposé** :

```
api/payments/webhook/
├── route.ts (150 lignes)              # Endpoint principal
├── handlers/
│   ├── payment-succeeded.ts (120)     # Handler payment_intent.succeeded
│   ├── payment-failed.ts (80)         # Handler payment_intent.failed
│   └── setup-succeeded.ts (80)        # Handler setup_intent.succeeded
└── utils/
    ├── verify-signature.ts (40)       # Vérification signature Stripe
    └── webhook-logger.ts (60)         # Logging webhooks
```

---

#### 2.2 lib/promo-service.ts (486 lignes → ~150 lignes)

**Découpage proposé** :

```
lib/promo/
├── promo-service.ts (150)             # Service principal
├── validators/
│   ├── validate-code.ts (80)          # Validation code promo
│   ├── check-eligibility.ts (100)     # Éligibilité user
│   └── check-dates.ts (60)            # Validation dates
└── calculators/
    ├── calculate-discount.ts (80)     # Calcul réduction
    └── apply-promo.ts (60)            # Application promo
```

---

#### 2.3 api/bookings/create-with-services/route.ts (394 lignes → ~150 lignes)

**Découpage proposé** :

```
api/bookings/create-with-services/
├── route.ts (150 lignes)
├── validators/
│   ├── validate-booking.ts (80)       # Validation données
│   └── validate-services.ts (60)      # Validation services
└── handlers/
    ├── create-user.ts (100)           # Création/update user
    ├── create-booking.ts (80)         # Création booking
    └── send-confirmation.ts (60)      # Email confirmation
```

---

#### 2.4 api/bookings/[id]/cancel/route.ts (377 lignes → ~150 lignes)

**Découpage proposé** :

```
api/bookings/[id]/cancel/
├── route.ts (150 lignes)
├── handlers/
│   ├── calculate-fees.ts (80)         # Calcul frais annulation
│   ├── process-refund.ts (100)        # Traitement remboursement
│   └── update-booking.ts (60)         # Update statut booking
```

---

#### 2.5 components/CancelBookingModal.tsx (436 lignes → ~150 lignes)

**Découpage proposé** :

```
components/booking/cancel/
├── CancelBookingModal.tsx (150)       # Modal principal
├── CancellationPolicy.tsx (100)       # Affichage politique
├── RefundCalculator.tsx (80)          # Calcul remboursement
└── ConfirmCancellation.tsx (80)       # Confirmation finale
```

---

### Étape 3 : P2 - Pages Légales + Autres (Jours 7-8)

#### 3.1 Pages Légales (cgu, confidentiality, mentions-legales)

**Stratégie** : Extraction en Markdown + Composant Renderer

```
app/(site)/legal/
├── components/
│   └── LegalPageRenderer.tsx (80)     # Renderer Markdown
├── content/
│   ├── cgu.md                         # CGU en Markdown
│   ├── confidentiality.md             # Politique en Markdown
│   └── mentions-legales.md            # Mentions en Markdown
└── [slug]/
    └── page.tsx (60)                  # Page dynamique
```

**Avantages** :
- Pages réduites à ~60 lignes
- Contenu éditable sans toucher code
- SEO préservé (generateMetadata)

---

#### 3.2 lib/email/emailService.ts (675 lignes → ~200 lignes)

**Découpage proposé** :

```
lib/email/
├── emailService.ts (200)              # Service principal (dispatch)
├── senders/
│   ├── send-booking.ts (80)           # Emails booking
│   ├── send-cancellation.ts (80)      # Emails annulation
│   └── send-reminder.ts (60)          # Emails rappel
└── builders/
    ├── build-headers.ts (60)          # Construction headers
    └── build-content.ts (80)          # Construction contenu
```

---

#### 3.3 api/cron/daily-report/route.ts (432 lignes → ~150 lignes)

**Découpage proposé** :

```
api/cron/daily-report/
├── route.ts (150)
├── collectors/
│   ├── collect-bookings.ts (80)       # Récupération bookings
│   └── collect-stats.ts (60)          # Calcul stats
└── formatters/
    └── format-report.ts (100)         # Formatage rapport
```

---

## ✅ Méthodologie de Découpage (Template)

### Avant de Découper un Fichier

1. **Lire et comprendre** le fichier complet
2. **Identifier les responsabilités** (state, validation, API, UI)
3. **Dessiner l'architecture** cible (hooks, composants, utils)
4. **Vérifier les dépendances** (imports, exports)
5. **Planifier l'ordre** de création des nouveaux fichiers

### Workflow de Découpage

```bash
# 1. Créer branche
git checkout -b refactor/phase3-booking-pages

# 2. Pour CHAQUE fichier à découper :

# a) Créer structure dossiers
mkdir -p components/booking/new/hooks
mkdir -p components/booking/new/components
mkdir -p components/booking/new/utils

# b) Extraire hooks en premier
# Créer hooks/useBookingPricing.ts
# Créer hooks/useBookingValidation.ts
# etc.

# c) Extraire composants UI
# Créer components/SpaceSelector.tsx
# etc.

# d) Mettre à jour page.tsx
# Importer nouveaux hooks/composants
# Supprimer code extrait

# e) Tester
pnpm type-check
pnpm build

# f) Commit
git add .
git commit -m "refactor(booking): découper [type]/new/page.tsx (1399→100 lignes)"

# 3. Répéter pour chaque fichier

# 4. PR final
git push origin refactor/phase3-booking-pages
```

---

## 🧪 Validation et Tests

### Checklist Après Chaque Découpage

- [ ] ✅ Type-check passe (`pnpm type-check`)
- [ ] ✅ Build réussit (`pnpm build`)
- [ ] ✅ Fichier principal < limite (150-200 lignes)
- [ ] ✅ Nouveaux fichiers < limite
- [ ] ✅ Imports corrects (pas de circular dependencies)
- [ ] ✅ Fonctionnalité identique (tester manuellement)
- [ ] ✅ Pas de régression visuelle
- [ ] ✅ Commit descriptif

### Tests Manuels Requis

**Pour pages booking** :
- [ ] Flow complet : sélection → détails → summary → paiement
- [ ] Validation formulaire fonctionne
- [ ] Calcul prix correct
- [ ] Codes promo appliqués
- [ ] Responsive OK

**Pour APIs** :
- [ ] Postman/Thunder Client : tester endpoints
- [ ] Vérifier logs serveur
- [ ] Tester cas d'erreur

---

## 📊 Métriques de Succès

### Objectifs Chiffrés

| Métrique | Avant | Objectif | Success |
|----------|-------|----------|---------|
| **Fichiers > 200 lignes** | 19 | 0 | ✅ |
| **Fichier le plus long** | 1399 lignes | < 200 | ✅ |
| **Moyenne lignes/fichier** | ~450 | < 150 | ✅ |
| **Type-check** | 0 erreurs | 0 erreurs | ✅ |
| **Build** | Success | Success | ✅ |

### Documentation

- [ ] Créer `/docs/REFACTO_PHASE3_REPORT.md` avec :
  - Liste fichiers découpés
  - Avant/Après (lignes)
  - Architecture finale
  - Difficultés rencontrées

---

## 🚨 Règles de Sécurité

### Ne PAS Casser

- ❌ Ne pas changer la logique métier
- ❌ Ne pas modifier les types d'API
- ❌ Ne pas toucher aux webhooks Stripe sans tests
- ❌ Ne pas supprimer de validation

### Commits Fréquents

- ✅ Commit après chaque fichier découpé
- ✅ Messages descriptifs : `refactor(scope): découper file.tsx (XXX→YYY lignes)`
- ✅ Push régulier sur branche

### Rollback si Problème

```bash
# Si ça casse après découpage
git reset --hard HEAD~1
# Analyser le problème
# Re-découper différemment
```

---

## 📅 Timeline Estimée

| Jours | Tâches | Fichiers |
|-------|--------|----------|
| **J1-3** | P0 - Pages booking | 6 fichiers |
| **J4-6** | P1 - APIs + Services | 7 fichiers |
| **J7-8** | P2 - Pages légales + Autres | 6 fichiers |
| **J9** | Tests finaux + Documentation | - |
| **J10** | PR Review + Merge | - |

**Durée totale estimée** : 10 jours

---

## 🎯 Résultat Final Attendu

### Avant Phase 3
```
📊 Stats Code
- Fichiers > 200 lignes : 19
- Plus gros fichier : 1399 lignes
- Maintenabilité : ⚠️ Difficile
- Tests : ⚠️ Complexes
```

### Après Phase 3
```
📊 Stats Code
- Fichiers > 200 lignes : 0 ✅
- Plus gros fichier : < 200 lignes ✅
- Maintenabilité : ✅ Facile
- Tests : ✅ Simples
- Réutilisabilité : ✅ Composants modulaires
```

---

**Prêt à démarrer** : Suivre le plan étape par étape, commit fréquent, ne rien casser ! 🚀
