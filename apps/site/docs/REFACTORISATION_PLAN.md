# 📋 Plan de Refactorisation Progressive - apps/site

> **Objectif** : Améliorer la qualité du code SANS casser les fonctionnalités existantes
> **Durée** : 7 jours
> **Approche** : Progressive, testée, prudente

---

## 🎯 Principes Directeurs

1. **✅ Stabilité > Pureté** - Ne rien casser
2. **🧪 Tester après chaque changement** - Vérifier que ça fonctionne
3. **📦 Petits changements** - Un fichier à la fois
4. **🔄 Commit fréquents** - Pouvoir revenir en arrière
5. **⚠️ Signaler si bloqué** - Demander avant de forcer

---

## 📊 État Actuel (Baseline)

### ✅ Ce qui fonctionne
- Site public complet (homepage, concept, spaces, pricing, blog)
- Dashboard client (/[id]/)
- Authentification (login, register, forgot/reset password)
- Système de réservation
- Tous les styles SCSS chargés
- Navigation Header + Footer

### ❌ Problèmes de Qualité
- Types `any` dispersés dans le code
- Fichiers > 200 lignes (difficiles à maintenir)
- Code dupliqué (Hero, Cards, etc.)
- Nommage incohérent
- Manque de composants réutilisables

---

## 📅 JOUR 1-2 : Corriger les `any` Types Critiques

### Objectif
Éliminer les `any` types dans les composants critiques SANS changer la structure

### Étapes

#### 1. Identifier les `any` types (30 min)
```bash
grep -r "any" src/components/ --include="*.tsx" --include="*.ts" | wc -l
grep -r "any" src/app/ --include="*.tsx" --include="*.ts" | wc -l
```

#### 2. Prioriser par criticité (30 min)
- **P1 (Critique)** : Props de composants principaux (Header, Footer, Booking)
- **P2 (Important)** : Hooks et utilitaires
- **P3 (Optionnel)** : Composants secondaires

#### 3. Corriger P1 - Props de composants (3h)
**Exemple** :
```typescript
// ❌ AVANT
interface CardProps {
  data: any;
  onClick?: any;
}

// ✅ APRÈS
interface CardData {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface CardProps {
  data: CardData;
  onClick?: (id: string) => void;
}
```

**Composants P1** :
- [ ] `src/components/site/header/header.tsx`
- [ ] `src/components/site/footer.tsx`
- [ ] `src/components/site/booking/*`
- [ ] `src/components/site/heros/*`

#### 4. Corriger P2 - Hooks et utilitaires (2h)
- [ ] `src/hooks/*` - Typer les retours
- [ ] `src/helpers/*` - Typer les paramètres
- [ ] `src/context/*` - Typer les contexts

#### 5. Créer types partagés (1h)
```typescript
// src/types/site.ts
export interface HeroData {
  title: string;
  subtitle?: string;
  image: string;
  cta?: {
    text: string;
    href: string;
  };
}

export interface NavMenuItem {
  label: string;
  href: string;
  children?: NavMenuItem[];
}
```

### ✅ Critères de Succès Jour 1-2
- [ ] 0 `any` types dans les composants P1
- [ ] Types partagés créés dans `/types/`
- [ ] Site fonctionne identiquement (test manuel)
- [ ] Build TypeScript réussit (`pnpm type-check`)
- [ ] Commit créé : "refactor: éliminer any types dans composants critiques"

---

## 📅 JOUR 3-4 : Découper Fichiers > 200 Lignes

### Objectif
Rendre le code plus maintenable en découpant les gros fichiers

### Étapes

#### 1. Identifier les fichiers longs (30 min)
```bash
find src/ -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20
```

#### 2. Analyser et planifier (1h)
Pour chaque fichier > 200 lignes, décider :
- Extraire hooks ? (logique métier)
- Extraire sous-composants ? (UI)
- Séparer en plusieurs fichiers ?

#### 3. Découper les pages longues (4h)
**Exemple** :
```
❌ AVANT : booking/page.tsx (350 lignes)

✅ APRÈS :
booking/
├── page.tsx (80 lignes) - Page principale
├── useBookingForm.ts (120 lignes) - Hook logique
├── BookingFormUI.tsx (100 lignes) - UI séparé
└── BookingSteps.tsx (50 lignes) - Steps component
```

**Pages à découper** :
- [ ] `src/app/(site)/booking/page.tsx`
- [ ] `src/app/(site)/[id]/page.tsx` (Dashboard)
- [ ] `src/app/(site)/blog/[slug]/page.tsx`

#### 4. Découper les composants longs (3h)
- [ ] `src/components/site/header/header.tsx`
- [ ] `src/components/site/footer.tsx`
- [ ] Autres composants > 200 lignes

#### 5. Extraire les hooks (2h)
```typescript
// ❌ AVANT : Tout dans le composant
function BookingPage() {
  const [formData, setFormData] = useState({...});
  const [errors, setErrors] = useState({});
  // 100 lignes de logique...
  return <form>...</form>;
}

// ✅ APRÈS : Hook séparé
// hooks/useBookingForm.ts
export function useBookingForm() {
  // Toute la logique
  return { formData, errors, handleSubmit };
}

// page.tsx
function BookingPage() {
  const { formData, errors, handleSubmit } = useBookingForm();
  return <form>...</form>;
}
```

### ✅ Critères de Succès Jour 3-4
- [ ] Tous fichiers < 200 lignes
- [ ] Logique extraite dans des hooks
- [ ] UI séparée de la logique
- [ ] Site fonctionne identiquement
- [ ] Commit : "refactor: découper fichiers > 200 lignes"

---

## 📅 JOUR 5-6 : Nettoyer la Duplication

### Objectif
Créer des composants réutilisables pour éliminer la duplication

### Étapes

#### 1. Identifier la duplication (1h)
```bash
# Chercher les patterns dupliqués
grep -r "export.*Hero" src/components/
grep -r "export.*Card" src/components/
```

**Patterns courants** :
- Heros (HeroOne, HeroTwo, HeroThree...)
- Cards (ProjectCard, BlogCard, SpaceCard...)
- Sections (AboutOne, AboutTwo...)

#### 2. Créer composants génériques (5h)

**Exemple Hero** :
```typescript
// ❌ AVANT : Duplication
<HeroOne />
<HeroTwo />
<HeroThree />

// ✅ APRÈS : Composant flexible
// components/shared/Hero.tsx
interface HeroProps {
  variant?: 'default' | 'full' | 'split';
  title: string;
  subtitle?: string;
  image: string;
  children?: ReactNode;
}

export function Hero({ variant = 'default', ...props }: HeroProps) {
  return (
    <section className={`hero hero--${variant}`}>
      {/* Structure flexible */}
    </section>
  );
}

// Usage
<Hero variant="full" title="..." image="...">
  <CustomContent />
</Hero>
```

**Composants à créer** :
- [ ] `Hero` (remplace HeroOne, HeroTwo, HeroThree)
- [ ] `Card` (remplace ProjectCard, BlogCard, SpaceCard)
- [ ] `Section` (remplace AboutOne, AboutTwo, etc.)

#### 3. Migrer progressivement (4h)
- [ ] Créer nouveau composant générique
- [ ] Migrer 1-2 usages pour tester
- [ ] Si OK, migrer tous les usages
- [ ] Supprimer anciens composants

#### 4. Nettoyer le code mort (1h)
```bash
# Identifier les fichiers non importés
npx ts-prune
```

### ✅ Critères de Succès Jour 5-6
- [ ] 3+ composants génériques créés
- [ ] Duplication réduite de 50%+
- [ ] Code mort supprimé
- [ ] Site fonctionne identiquement
- [ ] Commit : "refactor: créer composants réutilisables"

---

## 📅 JOUR 7 : Tests et Validation Finale

### Objectif
Vérifier que tout fonctionne parfaitement

### Étapes

#### 1. Tests Manuels Complets (3h)
- [ ] **Homepage** : Hero, sections, navigation
- [ ] **Concept** : Affichage correct
- [ ] **Spaces** : Cards, images, descriptions
- [ ] **Pricing** : Tables de prix
- [ ] **Blog** : Liste articles, détail, catégories
- [ ] **Contact** : Formulaire
- [ ] **Booking** : Flow complet (sélection → confirmation)
- [ ] **Auth** : Login, Register, Forgot/Reset password
- [ ] **Dashboard** : Réservations, Profil, Paramètres

#### 2. Tests Responsive (1h)
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1200px+)

#### 3. Tests Build (1h)
```bash
# Type-check
pnpm type-check
# → 0 errors

# Build
pnpm build
# → Build successful

# Lint
pnpm lint
# → 0 errors
```

#### 4. Performance (1h)
```bash
# Lighthouse
# → Score > 90
```

#### 5. Documentation (2h)
- [ ] Mettre à jour CLAUDE.md avec nouvelles conventions
- [ ] Documenter les composants génériques créés
- [ ] Mettre à jour TODO.md

### ✅ Critères de Succès Jour 7
- [ ] Tous les tests manuels passent
- [ ] Responsive OK sur tous devices
- [ ] Build TypeScript réussit
- [ ] Performance acceptable
- [ ] Documentation à jour
- [ ] Commit : "docs: mise à jour après refactorisation"

---

## 📊 Métriques de Succès Globales

### Code Quality
- ✅ 0 `any` types (ou < 5 justifiés)
- ✅ Tous fichiers < 200 lignes
- ✅ Duplication réduite de 50%+
- ✅ Build TypeScript réussit

### Fonctionnalité
- ✅ Site fonctionne identiquement à avant
- ✅ Aucune régression visuelle
- ✅ Toutes les pages accessibles
- ✅ Responsive OK

### Performance
- ✅ Lighthouse score > 85
- ✅ Build time < 2 min
- ✅ Pas de warnings TypeScript

---

## 🚨 Règles de Sécurité

### ❌ NE JAMAIS
- Changer les textes ou contenus
- Modifier les mises en page visuelles
- Supprimer des fonctionnalités
- Forcer des changements si bloqué

### ✅ TOUJOURS
- Tester après chaque changement
- Commit fréquents (toutes les 1-2h)
- Demander si incertain
- Revenir en arrière si problème

---

## 📝 Checklist Quotidienne

Chaque jour, avant de commencer :
- [ ] Pull latest changes
- [ ] Vérifier que le site fonctionne
- [ ] Lire la section du jour
- [ ] Créer une branche si expérimentation risquée

Chaque jour, avant de finir :
- [ ] Tester manuellement les changements
- [ ] Vérifier build TypeScript
- [ ] Commit avec message descriptif
- [ ] Push sur GitHub

---

**Date de création** : 21 janvier 2026
**Auteur** : Claude Sonnet 4.5
**Version** : 1.0
