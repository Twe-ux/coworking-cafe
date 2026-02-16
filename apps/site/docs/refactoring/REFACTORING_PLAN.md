# 📊 PLAN DE REFACTORISATION SITE - Analyse Complète

> **Date** : 2026-02-15
> **Status** : 📋 Planification
> **Objectif** : Refonte architecturale pour conformité CLAUDE.md
> **Durée estimée** : 3 semaines

---

## 🎯 RÉSUMÉ EXÉCUTIF

**Constat** : Le site souffre de fichiers monolithiques, composants dupliqués et logique non-externalisée.

| Métrique | Actuel | Cible | Gain Potentiel |
|----------|--------|-------|----------------|
| Pages > 150 lignes | **8 fichiers** | 0 | ✅ -42% lignes totales |
| Composants > 200 lignes | **25 fichiers** | 0 | ✅ -2,500 lignes |
| Duplication code | Élevée | Zéro | ✅ Maintenance ÷2 |

**Gain total estimé** : -3,500 lignes de code, 100% conformité limites CLAUDE.md

---

## 📋 TABLE DES MATIÈRES

1. [Problèmes Critiques Identifiés](#-problèmes-critiques-identifiés)
2. [Plan de Refactorisation (3 Phases)](#-plan-de-refactorisation-3-phases)
3. [Métriques Avant/Après](#-métriques-avantaprès)
4. [Priorités Recommandées](#-priorités-recommandées)
5. [Points d'Attention](#️-points-dattention)
6. [Checklist Détaillée](#-checklist-détaillée)

---

## 🔴 PROBLÈMES CRITIQUES IDENTIFIÉS

### 1. Pages Légales Monolithiques (2,395 lignes au total)

**Les 3 pires fichiers du projet** :

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `(site)/confidentiality/page.tsx` | **881** | Politique confidentialité hard-codée en JSX |
| `(site)/cgu/page.tsx` | **806** | CGU complètes inline |
| `(site)/mentions-legales/page.tsx` | **708** | Mentions légales inline |

**Pattern commun** :
- Structure identique (Hero + Sidebar ToC + Sections)
- Contenu HTML massif inline
- 0% réutilisation

**Impact** : Maintenance cauchemar (3 fichiers à modifier pour changer le layout)

**Solution** :
```tsx
// Créer composant réutilisable
<LegalPage content={confidentialityContent} />

// Externaliser contenu
/content/legal/confidentiality.ts
/content/legal/cgu.ts
/content/legal/mentions-legales.ts
```

---

### 2. Modales d'Annulation Dupliquées (692 lignes)

**Deux implémentations parallèles de la même logique** :

```
components/site/booking/CancelBookingModal.tsx            (469 lignes) - Client
components/site/booking/AdminCancelReservationModal.tsx   (223 lignes) - Admin
```

**Problème** : Logique quasi identique (calcul frais, preview, confirmation), mais **2 fichiers séparés** au lieu d'un composant flexible avec `variant="client" | "admin"`.

**Solution** :
```tsx
// Hook partagé
hooks/booking/useCancellation.ts

// Composant unique
<CancellationModal variant="client" | "admin" />
```

---

### 3. Dashboards Monolithiques

| Page | Lignes | Problème |
|------|--------|----------|
| `dashboard/[id]/reservations/page.tsx` | **382** | Dashboard réservations (logique + UI mixées) |
| `dashboard/[id]/settings/page.tsx` | **318** | Paramètres utilisateur |
| `dashboard/[id]/profile/page.tsx` | **252** | Profil utilisateur |

**Pattern** : Zéro extraction de hooks, logique métier inline, composants non-décomposés.

**Solution** :
- Extraire hooks : `useReservations()`, `useSettings()`, `useProfile()`
- Décomposer en sous-composants : Header, Filters, List, Stats
- Cible : < 150 lignes par page

---

### 4. Top 10 Composants Surdimensionnés

| Composant | Lignes | Problème | Solution |
|-----------|--------|----------|----------|
| `booking/CancelBookingModal.tsx` | 469 | Logique annulation massive | Hook + décomposition |
| `site/contactInfo.tsx` | 352 | Contact form + info merged | Séparer Form/Info |
| `booking/PriceBreakdownTable.tsx` | 347 | Calculs prix inline | Hook usePriceCalculation |
| `booking/PriceSummarySection.tsx` | 334 | Récap prix massif | Composants PriceRow |
| `blogs/blogArticleDetail.tsx` | 313 | Article + metadata + nav | Décomposer sections |
| `booking/TimeSelectionSection.tsx` | 293 | Sélection horaires complexe | Hook useTimeSlots |
| `site/footer.tsx` | 277 | Footer monolithe | Externaliser contenu |
| `banner/ExceptionalClosureBanner.tsx` | 234 | Banner fermetures | Simplifier |
| `booking/BookingDateContent.tsx` | 233 | Contenu date selection | Hook useBookingDate |
| `booking/AdminCancelReservationModal.tsx` | 223 | Admin cancel modal | Fusionner avec client |

---

### 5. Duplication de Composants

#### SpaceCard (2 versions)

```
/components/site/spaces/spaceCard.tsx       (43 lignes) - Simple, avec Link
/components/booking/selection/SpaceCard.tsx (211 lignes) - Complexe, avec prix
```

**Solution** : Fusionner en 1 seul composant flexible avec `variant` prop

#### Tables de Prix (3 versions)

```
booking/PriceBreakdownTable.tsx    (347 lignes)
booking/PriceSummarySection.tsx    (334 lignes)
booking/PriceDisplayCard.tsx       (152 lignes)
```

**Solution** : Créer composants atomiques `<PriceRow>` + hook `usePriceCalculation()`

#### Autres Duplications

- **Modales de formulaires** : 6+ modales avec structure identique
- **Pages "One/Two"** : `aboutOne`, `testimonialOne`, `projectsOne/Two` au lieu de composants flexibles

---

### 6. SCSS Monolithique et Dupliqué

#### Fichiers > 500 lignes

| Fichier | Lignes | Action |
|---------|--------|--------|
| `_components/_student-offers.scss` | **625** | Scinder en 3 fichiers |
| `_components/_spaces.scss` | **599** | Scinder en 3 fichiers |
| `dashboard/[id]/client-dashboard.scss` | **506** | Scinder en 3 fichiers |
| `_components/_members-program.scss` | **495** | Fusionner avec v2 |

#### Duplication CRITIQUE

```
_components/_members-program.scss   (495 lignes)
_components/_members-program2.scss  (296 lignes)  ← DUPLIQUÉ ?
```

**Action** : Vérifier si `_members-program2.scss` est du code mort, sinon fusionner

---

## 📋 PLAN DE REFACTORISATION (3 PHASES)

### 🔴 PHASE 1 : CRITIQUES (Gain Immédiat)

**Durée estimée** : 2-3 jours
**Gain** : -2,945 lignes (-49% du problème)

#### 1.1 Externaliser Pages Légales

**Gain** : -2,395 lignes → -90% de code

**Actions** :

1. **Créer composant réutilisable** :
   ```
   /components/legal/
     ├── LegalPage.tsx           (composant principal)
     ├── LegalHero.tsx           (hero section)
     ├── LegalSidebar.tsx        (table des matières)
     └── LegalContent.tsx        (contenu dynamique)
   ```

2. **Externaliser contenu** :
   ```
   /content/legal/
     ├── confidentiality.ts      (contenu structuré)
     ├── cgu.ts
     └── mentions-legales.ts
   ```

3. **Simplifier pages** :
   ```tsx
   // AVANT : confidentiality/page.tsx (881 lignes)
   export default function ConfidentialityPage() {
     return (
       <div>
         {/* 800+ lignes de JSX */}
       </div>
     );
   }

   // APRÈS : confidentiality/page.tsx (30 lignes)
   import { LegalPage } from '@/components/legal/LegalPage';
   import { confidentialityContent } from '@/content/legal';

   export default function ConfidentialityPage() {
     return <LegalPage content={confidentialityContent} />;
   }
   ```

**Fichiers impactés** :
- `(site)/confidentiality/page.tsx` : 881 → 30 lignes
- `(site)/cgu/page.tsx` : 806 → 30 lignes
- `(site)/mentions-legales/page.tsx` : 708 → 30 lignes

**Checklist** :
- [ ] Créer `/components/legal/LegalPage.tsx`
- [ ] Créer `/content/legal/confidentiality.ts`
- [ ] Créer `/content/legal/cgu.ts`
- [ ] Créer `/content/legal/mentions-legales.ts`
- [ ] Migrer `confidentiality/page.tsx`
- [ ] Migrer `cgu/page.tsx`
- [ ] Migrer `mentions-legales/page.tsx`
- [ ] Tester affichage 3 pages
- [ ] Vérifier conformité RGPD (contenu identique)
- [ ] Type-check + Build

---

#### 1.2 Unifier Modales Annulation

**Gain** : 692 → 200 lignes (-71%)

**Actions** :

1. **Créer hook partagé** :
   ```tsx
   // hooks/booking/useCancellation.ts
   export function useCancellation(
     bookingId: string,
     variant: 'client' | 'admin'
   ) {
     const [loading, setLoading] = useState(false);
     const [preview, setPreview] = useState<CancellationPreview | null>(null);

     const calculateFees = async () => {
       // Logique commune calcul frais
     };

     const handleCancel = async (reason?: string) => {
       // Logique commune annulation
     };

     return { preview, loading, calculateFees, handleCancel };
   }
   ```

2. **Créer composant unique** :
   ```tsx
   // components/booking/CancellationModal.tsx
   interface Props {
     variant: 'client' | 'admin';
     booking: Booking;
     onClose: () => void;
     onSuccess: () => void;
   }

   export function CancellationModal({ variant, booking, onClose, onSuccess }: Props) {
     const { preview, loading, handleCancel } = useCancellation(booking._id, variant);

     return (
       <Modal>
         {/* UI commune */}
         {variant === 'admin' && <AdminOnlyFields />}
       </Modal>
     );
   }
   ```

3. **Supprimer anciens fichiers** :
   ```bash
   rm components/site/booking/CancelBookingModal.tsx
   rm components/site/booking/AdminCancelReservationModal.tsx
   ```

**Checklist** :
- [ ] Créer `hooks/booking/useCancellation.ts`
- [ ] Créer `components/booking/CancellationModal.tsx`
- [ ] Migrer logique client depuis CancelBookingModal
- [ ] Migrer logique admin depuis AdminCancelReservationModal
- [ ] Tester annulation client
- [ ] Tester annulation admin
- [ ] Vérifier calcul frais (business logic critique)
- [ ] Supprimer anciens fichiers
- [ ] Mettre à jour imports
- [ ] Type-check + Build

---

#### 1.3 Unifier SpaceCard

**Gain** : 254 → 100 lignes (-60%)

**Actions** :

1. **Créer composant flexible** :
   ```tsx
   // components/cards/SpaceCard.tsx
   interface SpaceCardProps {
     space: Space;
     variant: 'gallery' | 'booking' | 'list';
     showPrice?: boolean;
     onSelect?: () => void;
     children?: React.ReactNode;
   }

   export function SpaceCard({
     space,
     variant,
     showPrice,
     onSelect,
     children
   }: SpaceCardProps) {
     return (
       <div className={`space-card space-card--${variant}`}>
         <SpaceCardImage src={space.image} />
         <SpaceCardContent>
           <SpaceCardTitle>{space.name}</SpaceCardTitle>
           {showPrice && <SpaceCardPrice price={space.price} />}
           {children}
         </SpaceCardContent>
         {onSelect && <SpaceCardAction onSelect={onSelect} />}
       </div>
     );
   }
   ```

2. **Supprimer duplicates** :
   ```bash
   rm components/site/spaces/spaceCard.tsx
   rm components/booking/selection/SpaceCard.tsx
   ```

**Checklist** :
- [ ] Créer `components/cards/SpaceCard.tsx`
- [ ] Migrer logique depuis `spaces/spaceCard`
- [ ] Migrer logique depuis `booking/SpaceCard`
- [ ] Créer variants (gallery, booking, list)
- [ ] Tester affichage page Espaces
- [ ] Tester affichage module Booking
- [ ] Supprimer anciens fichiers
- [ ] Mettre à jour imports (2 emplacements)
- [ ] Type-check + Build

---

### 🟠 PHASE 2 : MAJEURES (Architecture)

**Durée estimée** : 3-4 jours
**Gain** : -1,500 lignes + architecture saine

#### 2.1 Décomposer Dashboards

##### A. Dashboard Réservations (382 → 120 lignes)

**Structure cible** :
```
/components/dashboard/reservations/
  ├── ReservationsHeader.tsx       (titre + stats globales)
  ├── ReservationsFilters.tsx      (filtres date/statut)
  ├── ReservationsList.tsx         (liste avec pagination)
  └── ReservationsStats.tsx        (widgets stats)

/hooks/dashboard/
  └── useReservations.ts           (fetch + state)
```

**Page finale** :
```tsx
// [id]/reservations/page.tsx (< 120 lignes)
export default function ReservationsPage() {
  const { reservations, loading, filters, setFilters } = useReservations();

  return (
    <DashboardLayout>
      <ReservationsHeader />
      <ReservationsFilters filters={filters} onChange={setFilters} />
      {loading ? <Skeleton /> : <ReservationsList items={reservations} />}
      <ReservationsStats data={reservations} />
    </DashboardLayout>
  );
}
```

**Checklist** :
- [ ] Créer `hooks/dashboard/useReservations.ts`
- [ ] Créer `ReservationsHeader.tsx`
- [ ] Créer `ReservationsFilters.tsx`
- [ ] Créer `ReservationsList.tsx`
- [ ] Créer `ReservationsStats.tsx`
- [ ] Migrer logique depuis page
- [ ] Tester affichage + filtres
- [ ] Type-check

---

##### B. Dashboard Settings (318 → 100 lignes)

**Structure cible** :
```
/components/dashboard/settings/
  ├── SettingsNav.tsx              (navigation tabs)
  ├── ProfileSettings.tsx          (section profil)
  ├── NotificationSettings.tsx     (section notifications)
  └── SecuritySettings.tsx         (section sécurité)
```

**Checklist** :
- [ ] Créer composants sections
- [ ] Extraire logique formulaires
- [ ] Migrer depuis page
- [ ] Tester navigation tabs
- [ ] Type-check

---

##### C. Dashboard Profile (252 → 120 lignes)

**Actions** :
- Extraire `SecuritySection.tsx` (259 lignes) en sous-composants
- Créer `hooks/dashboard/useProfile.ts`
- Décomposer `ProfileClient.tsx` (247 lignes)

**Checklist** :
- [ ] Décomposer SecuritySection
- [ ] Créer useProfile hook
- [ ] Simplifier ProfileClient
- [ ] Tester affichage
- [ ] Type-check

---

#### 2.2 Extraire Logique en Hooks

**Hooks à créer** :

| Hook | Fichier | Remplace | Gain |
|------|---------|----------|------|
| `useCancellation()` | ✅ Fait Phase 1 | 2 modales | -300 lignes |
| `useFormState()` | `hooks/form/useFormState.ts` | 6+ formulaires | -200 lignes |
| `useTimeSlots()` | `hooks/booking/useTimeSlots.ts` | TimeSelectionSection | -100 lignes |
| `usePriceCalculation()` | `hooks/booking/usePriceCalculation.ts` | 3 composants prix | -150 lignes |
| `useBookingValidation()` | `hooks/booking/useBookingValidation.ts` | Validation répétée | -100 lignes |

**Total** : +5 hooks, -850 lignes de duplication

##### useFormState Hook

```tsx
// hooks/form/useFormState.ts
export function useFormState<T>(initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (onSubmit: (data: T) => Promise<void>) => {
    setLoading(true);
    setErrors({});
    try {
      await onSubmit(data);
      setSuccess(true);
    } catch (error) {
      setErrors({ _form: error.message });
    } finally {
      setLoading(false);
    }
  };

  return { data, setData, errors, loading, success, handleSubmit };
}
```

**Utilisable dans** :
- ContactDPOForm
- SubscribeForm
- CheckoutForm
- PaymentFormContent
- LoginForm
- RegisterForm

**Checklist** :
- [ ] Créer `hooks/form/useFormState.ts`
- [ ] Créer `hooks/booking/useTimeSlots.ts`
- [ ] Créer `hooks/booking/usePriceCalculation.ts`
- [ ] Créer `hooks/booking/useBookingValidation.ts`
- [ ] Migrer 6+ formulaires vers useFormState
- [ ] Tester tous les formulaires
- [ ] Type-check

---

#### 2.3 Créer Composants Génériques

**Composants manquants** :

##### A. FormField

```tsx
// components/form/FormField.tsx
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  required,
  helpText,
  children
}: FormFieldProps) {
  return (
    <div className="form-field">
      <label className="form-field__label">
        {label}
        {required && <span className="form-field__required">*</span>}
      </label>
      {children}
      {error && <span className="form-field__error">{error}</span>}
      {helpText && <span className="form-field__help">{helpText}</span>}
    </div>
  );
}
```

##### B. AlertBox

```tsx
// components/ui/AlertBox.tsx
interface AlertBoxProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  dismissible?: boolean;
}

export function AlertBox({
  variant,
  message,
  onClose,
  dismissible = true
}: AlertBoxProps) {
  return (
    <div className={`alert alert--${variant}`}>
      <span>{message}</span>
      {dismissible && <button onClick={onClose}>×</button>}
    </div>
  );
}
```

##### C. PriceRow

```tsx
// components/booking/PriceRow.tsx
interface PriceRowProps {
  label: string;
  amount: number;
  currency?: string;
  showTTC?: boolean;
  highlight?: boolean;
}

export function PriceRow({
  label,
  amount,
  currency = 'EUR',
  showTTC = true,
  highlight = false
}: PriceRowProps) {
  const symbol = currency === 'EUR' ? '€' : currency;

  return (
    <div className={`price-row ${highlight ? 'price-row--highlight' : ''}`}>
      <span className="price-row__label">{label}</span>
      <span className="price-row__amount">
        {amount.toFixed(2)} {symbol} {showTTC ? 'TTC' : 'HT'}
      </span>
    </div>
  );
}
```

##### D. ModalTemplate

```tsx
// components/ui/ModalTemplate.tsx
interface ModalTemplateProps {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function ModalTemplate({
  title,
  size = 'md',
  onClose,
  footer,
  children
}: ModalTemplateProps) {
  return (
    <div className={`modal modal--${size}`}>
      <div className="modal__header">
        <h3>{title}</h3>
        <button onClick={onClose}>×</button>
      </div>
      <div className="modal__body">{children}</div>
      {footer && <div className="modal__footer">{footer}</div>}
    </div>
  );
}
```

**Gain** : -500 lignes de duplication entre modales/forms

**Checklist** :
- [ ] Créer `components/form/FormField.tsx`
- [ ] Créer `components/ui/AlertBox.tsx`
- [ ] Créer `components/booking/PriceRow.tsx`
- [ ] Créer `components/ui/ModalTemplate.tsx`
- [ ] Migrer 10+ formulaires vers FormField
- [ ] Migrer 8+ alertes vers AlertBox
- [ ] Migrer 3 tables prix vers PriceRow
- [ ] Migrer 6+ modales vers ModalTemplate
- [ ] Type-check

---

#### 2.4 Nettoyer SCSS

##### A. Fusionner Duplicates

```bash
# Vérifier si _members-program2.scss est utilisé
grep -r "members-program2" apps/site/src/

# Si non utilisé, supprimer
rm apps/site/src/styles/_components/_members-program2.scss

# Sinon, fusionner
# Conserver _members-program.scss, intégrer styles de v2
```

##### B. Scinder Monolithes

**client-dashboard.scss (506 → 3 fichiers)** :
```
dashboard/[id]/styles/
  ├── _dashboard-layout.scss    (structure, grid)
  ├── _dashboard-widgets.scss   (cards, stats)
  └── _dashboard-tables.scss    (tableaux, listes)
```

**_student-offers.scss (625 → 3 fichiers)** :
```
_components/_student-offers/
  ├── _offers-layout.scss
  ├── _offers-cards.scss
  └── _offers-pricing.scss
```

**_spaces.scss (599 → 3 fichiers)** :
```
_components/_spaces/
  ├── _spaces-layout.scss
  ├── _spaces-gallery.scss
  └── _spaces-details.scss
```

##### C. Extraire Variables Communes

```scss
// styles/_variables/_booking.scss
$booking-primary-color: #3498db;
$booking-card-border: 1px solid #e0e0e0;
$booking-spacing-sm: 0.5rem;
$booking-spacing-md: 1rem;
$booking-spacing-lg: 2rem;
```

**Checklist** :
- [ ] Vérifier utilisation `_members-program2.scss`
- [ ] Fusionner ou supprimer duplicate
- [ ] Scinder `client-dashboard.scss`
- [ ] Scinder `_student-offers.scss`
- [ ] Scinder `_spaces.scss`
- [ ] Créer `_variables/_booking.scss`
- [ ] Extraire variables communes
- [ ] Tester affichage (aucun style cassé)
- [ ] Build réussi

---

### 🟡 PHASE 3 : OPTIMISATIONS (Polish)

**Durée estimée** : 2 jours
**Gain** : -800 lignes + code propre

#### 3.1 Réduire Composants 150-200 Lignes

##### A. contactInfo.tsx (352 → 150 lignes)

**Actions** :
- Extraire formulaire : `ContactForm.tsx`
- Extraire infos : `ContactDetails.tsx`
- Utiliser `useFormState()` hook (créé Phase 2)

**Structure cible** :
```tsx
// contactInfo.tsx (< 150 lignes)
export function ContactInfo() {
  return (
    <section className="section-contact">
      <ContactDetails />
      <ContactForm />
    </section>
  );
}
```

##### B. footer.tsx (277 → 150 lignes)

**Actions** :
- Externaliser contenu : `/content/footer.ts`
- Décomposer : `FooterLinks`, `FooterContact`, `FooterSocial`

##### C. blogArticleDetail.tsx (313 → 180 lignes)

**Actions** :
- Extraire metadata : `ArticleHeader.tsx`
- Extraire navigation : `ArticleNavigation.tsx`
- Extraire contenu : `ArticleContent.tsx`

**Checklist** :
- [ ] Décomposer contactInfo.tsx
- [ ] Décomposer footer.tsx
- [ ] Décomposer blogArticleDetail.tsx
- [ ] Tester affichage
- [ ] Type-check

---

#### 3.2 Normaliser Nommage

**Pattern "One/Two" à remplacer** :

```tsx
// ❌ AVANT
<AboutOne />
<TestimonialOne />
<ProjectsOne />
<ProjectsTwo />

// ✅ APRÈS
<About variant="default" />
<Testimonial variant="compact" />
<Projects variant="grid" />
<Projects variant="carousel" />
```

**Composants à migrer** :
- `about/aboutOne.tsx` → `about/About.tsx` (variant prop)
- `testimonial/testimonialOne.tsx` → `testimonial/Testimonial.tsx` (variant prop)
- `projects/projectsOne.tsx` + `projects/projectsTwo.tsx` → `projects/Projects.tsx` (variant prop)

**Checklist** :
- [ ] Fusionner aboutOne → About
- [ ] Fusionner testimonialOne → Testimonial
- [ ] Fusionner projectsOne + projectsTwo → Projects
- [ ] Mettre à jour imports
- [ ] Tester affichage toutes variantes
- [ ] Type-check

---

## 📊 MÉTRIQUES AVANT/APRÈS

### Lignes de Code

| Catégorie | Avant | Après | Gain |
|-----------|-------|-------|------|
| **Pages > 150 lignes** | 8 fichiers | 0 fichiers | ✅ -100% |
| **Composants > 200 lignes** | 25 fichiers | 0 fichiers | ✅ -100% |
| **Lignes totales pages** | ~6,000 | ~3,500 | **-42%** |
| **Lignes totales composants** | ~8,000 | ~5,500 | **-31%** |
| **Total général** | ~14,000 | ~9,000 | **-36%** |

### Architecture

| Métrique | Avant | Après | Évolution |
|----------|-------|-------|-----------|
| **Hooks réutilisables** | ~5 | ~13 | +160% ✅ |
| **Composants génériques** | 0 | 5 | ✅ Nouveau |
| **Duplication SCSS** | Élevée | Zéro | ✅ Clean |
| **Fichiers SCSS > 500 lignes** | 4 | 0 | ✅ -100% |
| **Code mort** | Présent | Zéro | ✅ Nettoyé |

### Maintenabilité

- ✅ **Conformité CLAUDE.md** : 100% (0 fichier hors limites)
- ✅ **Duplication code** : Éliminée (composants génériques)
- ✅ **Logique métier** : Externalisée (hooks)
- ✅ **Contenu** : Externalisé (pages légales, footer)
- ✅ **Tests** : Plus faciles (composants atomiques)

---

## 🎯 PRIORITÉS RECOMMANDÉES

### Top 5 Fichiers à Traiter D'Abord

| Ordre | Fichier | Lignes | Gain | Risque | Impact |
|-------|---------|--------|------|--------|--------|
| **1** | `confidentiality/page.tsx` | 881 | -851 | 🟢 Faible | 🔴 Critique |
| **2** | `cgu/page.tsx` | 806 | -776 | 🟢 Faible | 🔴 Critique |
| **3** | `mentions-legales/page.tsx` | 708 | -678 | 🟢 Faible | 🔴 Critique |
| **4** | `CancelBookingModal.tsx` | 469 | -269 | 🟡 Moyen | 🔴 Critique |
| **5** | `AdminCancelReservationModal.tsx` | 223 | -123 | 🟡 Moyen | 🔴 Critique |

**Gain combiné** : -3,188 lignes (-50% du problème résolu)

**Ratio Gain/Risque optimal** : Pages légales d'abord (gain max, risque min)

---

## ⚠️ POINTS D'ATTENTION

### Risques Identifiés

#### 1. Pages Légales (Risque Faible)

**Risque** : Contenu RGPD/légal modifié par erreur
**Mitigation** :
- ✅ Copier contenu exact (aucune modification)
- ✅ Vérifier diff avant/après
- ✅ Validation juridique si doute

#### 2. Modales Annulation (Risque Moyen)

**Risque** : Logique calcul frais cassée → perte revenue
**Mitigation** :
- ✅ Tests unitaires calcul frais
- ✅ Tests manuels scénarios edge (< 24h, > 48h, etc.)
- ✅ Validation admin avant déploiement

#### 3. Dashboards (Risque Moyen)

**Risque** : State/sessions utilisateurs perdus
**Mitigation** :
- ✅ Tester en environnement de staging
- ✅ Vérifier persistence state
- ✅ Tests utilisateurs réels

#### 4. SCSS (Risque Faible)

**Risque** : Styles custom perdus
**Mitigation** :
- ✅ Diff avant/après compilation
- ✅ Screenshots before/after
- ✅ Tests responsive (mobile/desktop)

---

### Tests Obligatoires par Phase

#### Phase 1

- [ ] **Type-check** : `pnpm type-check` (0 erreur)
- [ ] **Build** : `pnpm build` (réussi)
- [ ] **Pages légales** : Affichage identique before/after
- [ ] **Modales annulation** : Calcul frais correct (3 scénarios)
- [ ] **SpaceCard** : Affichage dans 2 contextes (gallery, booking)

#### Phase 2

- [ ] **Type-check** : `pnpm type-check` (0 erreur)
- [ ] **Build** : `pnpm build` (réussi)
- [ ] **Dashboards** : Navigation + filtres fonctionnels
- [ ] **Hooks** : Logique métier préservée (calculs, validation)
- [ ] **Composants génériques** : Utilisables dans 3+ contextes

#### Phase 3

- [ ] **Type-check** : `pnpm type-check` (0 erreur)
- [ ] **Build** : `pnpm build` (réussi)
- [ ] **SCSS** : Aucun style cassé (visual regression)
- [ ] **Composants** : Toutes variantes testées
- [ ] **Responsive** : Mobile + Desktop OK

---

### Validation Finale (Toutes Phases)

- [ ] **Build production** : Réussi sans warnings
- [ ] **Type-check** : 0 erreur, 0 `any`
- [ ] **Lighthouse** : Score maintenu (Performance, A11y, SEO)
- [ ] **Tests manuels** : Features critiques (booking, annulation, paiement)
- [ ] **Responsive** : Mobile + Tablet + Desktop
- [ ] **Cross-browser** : Chrome, Firefox, Safari
- [ ] **Documentation** : CHANGELOG.md mis à jour

---

## 🗓️ PLANNING DÉTAILLÉ

### Semaine 1 : Phase 1 (Critiques)

| Jour | Tâches | Durée | Livrables |
|------|--------|-------|-----------|
| **Lundi** | 1.1 Pages légales (structure) | 4h | Composants legal/ créés |
| | 1.1 Pages légales (contenu) | 4h | Contenu externalisé |
| **Mardi** | 1.1 Pages légales (migration) | 4h | 3 pages migrées |
| | 1.1 Tests + validation | 2h | Build OK |
| **Mercredi** | 1.2 Hook useCancellation | 3h | Hook créé + testé |
| | 1.2 CancellationModal | 4h | Modal unique créé |
| **Jeudi** | 1.2 Migration + tests | 4h | Anciens fichiers supprimés |
| | 1.3 SpaceCard unifié | 3h | Composant créé |
| **Vendredi** | 1.3 Tests + validation | 2h | Tests OK |
| | Documentation Phase 1 | 2h | CHANGELOG.md |
| | **Review finale Phase 1** | 2h | ✅ Phase 1 complète |

---

### Semaine 2 : Phase 2 (Architecture)

| Jour | Tâches | Durée | Livrables |
|------|--------|-------|-----------|
| **Lundi** | 2.1 Hooks dashboard | 4h | 3 hooks créés |
| | 2.1 Réservations (composants) | 4h | 4 composants créés |
| **Mardi** | 2.1 Settings + Profile | 6h | 2 dashboards refactorés |
| | 2.1 Tests dashboards | 2h | Tests OK |
| **Mercredi** | 2.2 Hooks métier | 6h | 4 hooks créés |
| | 2.2 Migration formulaires | 2h | 6+ formulaires migrés |
| **Jeudi** | 2.3 Composants génériques | 6h | 4 composants créés |
| | 2.3 Migration modales/forms | 2h | 10+ fichiers migrés |
| **Vendredi** | 2.4 Nettoyer SCSS | 4h | SCSS organisé |
| | Tests Phase 2 | 2h | Tests OK |
| | **Review finale Phase 2** | 2h | ✅ Phase 2 complète |

---

### Semaine 3 : Phase 3 (Polish) + Validation

| Jour | Tâches | Durée | Livrables |
|------|--------|-------|-----------|
| **Lundi** | 3.1 Optimiser composants | 6h | 3 composants < 150 lignes |
| | 3.2 Normaliser nommage | 2h | Pattern One/Two éliminé |
| **Mardi** | Tests complets | 6h | Tous scénarios testés |
| | Corrections bugs | 2h | Bugs résolus |
| **Mercredi** | Tests responsive | 4h | Mobile/Desktop OK |
| | Tests cross-browser | 2h | Chrome/Firefox/Safari OK |
| | Lighthouse audit | 2h | Scores maintenus |
| **Jeudi** | Documentation finale | 4h | CHANGELOG.md complet |
| | **Review finale globale** | 4h | Code review complète |
| **Vendredi** | **Déploiement staging** | 2h | Staging OK |
| | Tests utilisateurs réels | 4h | Feedback collecté |
| | **Déploiement production** | 2h | ✅ **PROJET TERMINÉ** |

---

## 📋 CHECKLIST DÉTAILLÉE

### 🔴 Phase 1 : Critiques

#### 1.1 Pages Légales

- [ ] Créer `/components/legal/LegalPage.tsx`
- [ ] Créer `/components/legal/LegalHero.tsx`
- [ ] Créer `/components/legal/LegalSidebar.tsx`
- [ ] Créer `/components/legal/LegalContent.tsx`
- [ ] Créer `/content/legal/confidentiality.ts`
- [ ] Créer `/content/legal/cgu.ts`
- [ ] Créer `/content/legal/mentions-legales.ts`
- [ ] Migrer `confidentiality/page.tsx` (881 → 30 lignes)
- [ ] Migrer `cgu/page.tsx` (806 → 30 lignes)
- [ ] Migrer `mentions-legales/page.tsx` (708 → 30 lignes)
- [ ] Vérifier contenu identique (diff)
- [ ] Tester affichage 3 pages
- [ ] Vérifier conformité RGPD
- [ ] Type-check + Build

#### 1.2 Modales Annulation

- [ ] Créer `hooks/booking/useCancellation.ts`
- [ ] Implémenter calcul frais
- [ ] Implémenter preview annulation
- [ ] Implémenter logique annulation
- [ ] Créer `components/booking/CancellationModal.tsx`
- [ ] Implémenter variant client
- [ ] Implémenter variant admin
- [ ] Migrer logique depuis CancelBookingModal
- [ ] Migrer logique depuis AdminCancelReservationModal
- [ ] Tester annulation client (3 scénarios)
- [ ] Tester annulation admin
- [ ] Vérifier calcul frais (business logic)
- [ ] Supprimer `CancelBookingModal.tsx`
- [ ] Supprimer `AdminCancelReservationModal.tsx`
- [ ] Mettre à jour imports
- [ ] Type-check + Build

#### 1.3 SpaceCard Unifié

- [ ] Créer `components/cards/SpaceCard.tsx`
- [ ] Implémenter variant gallery
- [ ] Implémenter variant booking
- [ ] Implémenter variant list
- [ ] Migrer logique `spaces/spaceCard`
- [ ] Migrer logique `booking/SpaceCard`
- [ ] Tester affichage page Espaces
- [ ] Tester affichage module Booking
- [ ] Supprimer `spaces/spaceCard.tsx`
- [ ] Supprimer `booking/SpaceCard.tsx`
- [ ] Mettre à jour imports (2+ emplacements)
- [ ] Type-check + Build

---

### 🟠 Phase 2 : Architecture

#### 2.1 Dashboards

**Réservations** :
- [ ] Créer `hooks/dashboard/useReservations.ts`
- [ ] Créer `components/dashboard/reservations/ReservationsHeader.tsx`
- [ ] Créer `components/dashboard/reservations/ReservationsFilters.tsx`
- [ ] Créer `components/dashboard/reservations/ReservationsList.tsx`
- [ ] Créer `components/dashboard/reservations/ReservationsStats.tsx`
- [ ] Migrer logique depuis `[id]/reservations/page.tsx`
- [ ] Réduire page à < 120 lignes
- [ ] Tester affichage + filtres
- [ ] Type-check

**Settings** :
- [ ] Créer `components/dashboard/settings/SettingsNav.tsx`
- [ ] Créer `components/dashboard/settings/ProfileSettings.tsx`
- [ ] Créer `components/dashboard/settings/NotificationSettings.tsx`
- [ ] Créer `components/dashboard/settings/SecuritySettings.tsx`
- [ ] Migrer logique depuis `[id]/settings/page.tsx`
- [ ] Réduire page à < 100 lignes
- [ ] Tester navigation tabs
- [ ] Type-check

**Profile** :
- [ ] Créer `hooks/dashboard/useProfile.ts`
- [ ] Décomposer `SecuritySection.tsx` (259 lignes)
- [ ] Simplifier `ProfileClient.tsx` (247 lignes)
- [ ] Réduire `page.tsx` à < 120 lignes
- [ ] Tester affichage
- [ ] Type-check

#### 2.2 Hooks Métier

- [ ] Créer `hooks/form/useFormState.ts`
- [ ] Créer `hooks/booking/useTimeSlots.ts`
- [ ] Créer `hooks/booking/usePriceCalculation.ts`
- [ ] Créer `hooks/booking/useBookingValidation.ts`
- [ ] Migrer ContactDPOForm vers useFormState
- [ ] Migrer SubscribeForm vers useFormState
- [ ] Migrer CheckoutForm vers useFormState
- [ ] Migrer PaymentFormContent vers useFormState
- [ ] Migrer LoginForm vers useFormState
- [ ] Migrer RegisterForm vers useFormState
- [ ] Tester tous les formulaires
- [ ] Type-check

#### 2.3 Composants Génériques

- [ ] Créer `components/form/FormField.tsx`
- [ ] Créer `components/ui/AlertBox.tsx`
- [ ] Créer `components/booking/PriceRow.tsx`
- [ ] Créer `components/ui/ModalTemplate.tsx`
- [ ] Migrer 10+ formulaires vers FormField
- [ ] Migrer 8+ alertes vers AlertBox
- [ ] Migrer PriceBreakdownTable vers PriceRow
- [ ] Migrer PriceSummarySection vers PriceRow
- [ ] Migrer PriceDisplayCard vers PriceRow
- [ ] Migrer 6+ modales vers ModalTemplate
- [ ] Tester tous les composants
- [ ] Type-check

#### 2.4 SCSS

- [ ] Vérifier utilisation `_members-program2.scss`
- [ ] Supprimer ou fusionner duplicate
- [ ] Scinder `client-dashboard.scss` (3 fichiers)
- [ ] Scinder `_student-offers.scss` (3 fichiers)
- [ ] Scinder `_spaces.scss` (3 fichiers)
- [ ] Créer `_variables/_booking.scss`
- [ ] Extraire variables communes
- [ ] Tester affichage (aucun style cassé)
- [ ] Build réussi

---

### 🟡 Phase 3 : Polish

#### 3.1 Optimisations

- [ ] Décomposer `contactInfo.tsx` (352 → 150 lignes)
- [ ] Créer `ContactForm.tsx`
- [ ] Créer `ContactDetails.tsx`
- [ ] Décomposer `footer.tsx` (277 → 150 lignes)
- [ ] Externaliser contenu footer
- [ ] Créer `FooterLinks`, `FooterContact`, `FooterSocial`
- [ ] Décomposer `blogArticleDetail.tsx` (313 → 180 lignes)
- [ ] Créer `ArticleHeader`, `ArticleNavigation`, `ArticleContent`
- [ ] Tester affichage
- [ ] Type-check

#### 3.2 Nommage

- [ ] Fusionner `aboutOne` → `About` (variant prop)
- [ ] Fusionner `testimonialOne` → `Testimonial` (variant prop)
- [ ] Fusionner `projectsOne` + `projectsTwo` → `Projects` (variant prop)
- [ ] Mettre à jour imports
- [ ] Tester toutes variantes
- [ ] Type-check

---

### ✅ Validation Finale

#### Tests Techniques

- [ ] Type-check : `pnpm type-check` (0 erreur)
- [ ] Build prod : `pnpm build` (réussi, 0 warning)
- [ ] Aucun `any` type restant
- [ ] Aucun fichier > 200 lignes (composants)
- [ ] Aucune page > 150 lignes
- [ ] Aucun SCSS > 500 lignes

#### Tests Fonctionnels

- [ ] Booking : Création réservation
- [ ] Booking : Annulation client
- [ ] Booking : Annulation admin
- [ ] Paiement : Stripe checkout
- [ ] Dashboard : Navigation
- [ ] Dashboard : Filtres réservations
- [ ] Forms : Contact, Newsletter, Login, Register
- [ ] Pages légales : Affichage correct

#### Tests UI/UX

- [ ] Responsive : Mobile (< 768px)
- [ ] Responsive : Tablet (768-1024px)
- [ ] Responsive : Desktop (> 1024px)
- [ ] Cross-browser : Chrome
- [ ] Cross-browser : Firefox
- [ ] Cross-browser : Safari
- [ ] Lighthouse : Performance > 80
- [ ] Lighthouse : Accessibility > 90
- [ ] Lighthouse : SEO > 90

#### Documentation

- [ ] `CHANGELOG.md` mis à jour
- [ ] `REFACTORING_SUMMARY.md` créé
- [ ] Documentation composants (JSDoc)
- [ ] README.md à jour si nécessaire

---

## 🚀 PROCHAINES ÉTAPES

### Démarrage Immédiat

1. **Créer branche Git** :
   ```bash
   git checkout -b refactor/site-components
   ```

2. **Commencer Phase 1.1** :
   - Créer `/components/legal/`
   - Créer `/content/legal/`
   - Migrer première page (confidentiality)

3. **Commit atomiques** :
   ```bash
   git commit -m "refactor: create LegalPage component"
   git commit -m "refactor: extract confidentiality content"
   git commit -m "refactor: migrate confidentiality page (881 → 30 lines)"
   ```

### Validation Continue

- Commit après chaque sous-tâche terminée
- Type-check avant chaque commit
- Tests manuels après chaque migration
- Review code en fin de phase

### Communication

- Daily update : Progression phases
- Blocker immediate : Si calcul frais/logique métier casse
- Review request : Fin de chaque phase

---

## 📚 RESSOURCES

### Documentation Interne

- [CLAUDE.md](../../CLAUDE.md) - Règles globales du projet
- [apps/site/CLAUDE.md](../CLAUDE.md) - Règles spécifiques site
- [MEMORY.md](~/.claude/projects/.../memory/MEMORY.md) - Learnings projet

### Patterns de Référence

- **Refactorisation** : [docs/refactoring/](./refactoring/)
- **Architecture** : [docs/guides/](./guides/)
- **Composants** : Exemples dans `/components/dashboard/` (admin)

### Outils

- **Type-check** : `pnpm type-check`
- **Build** : `pnpm build`
- **Dev** : `pnpm dev`

---

## 📝 NOTES

### Leçons Apprises (à documenter)

- Patterns de refactorisation efficaces
- Pièges à éviter (duplication SCSS, props excessives)
- Temps réel vs estimé
- Composants génériques les plus utiles

### Améliorations Futures

- Tests automatisés (Jest, Playwright)
- Storybook pour composants génériques
- Visual regression tests
- CI/CD pour validation automatique

---

**Dernière mise à jour** : 2026-02-15
**Status** : 📋 Planification
**Auteur** : Claude + Thierry
**Version** : 1.0

---

*Ce plan est un guide vivant. N'hésite pas à l'ajuster selon les découvertes en cours de refactorisation ! 🚀*
