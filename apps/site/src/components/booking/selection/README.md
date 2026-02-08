# Booking Selection Components

Composants modulaires pour la page de sélection d'espaces (`/booking`).

## 📋 Vue d'Ensemble

Ce module contient tous les composants et logique pour la première étape du processus de réservation : la sélection du type d'espace.

### Structure

```
selection/
├── index.ts                    # Barrel exports
├── types.ts                    # Types TypeScript
├── useSpaceSelection.ts        # Hook logique métier (124 lignes)
├── SelectionHeader.tsx         # Header + toggle TTC/HT (61 lignes)
├── SpaceCard.tsx              # Carte d'espace (131 lignes)
└── SpaceGrid.tsx              # Grille de cartes (28 lignes)
```

## 🎯 Objectifs de la Refactorisation

**Avant** : `page.tsx` = 371 lignes
**Après** : `page.tsx` = 54 lignes ✅

Réduction de **85%** des lignes du fichier principal.

## 📦 Composants

### 1. `SelectionHeader`

Header de la page avec progress bar et toggle TTC/HT.

**Props :**
```typescript
interface SelectionHeaderProps {
  showTTC: boolean;
  onToggleTTC: (value: boolean) => void;
}
```

**Exemple :**
```tsx
<SelectionHeader showTTC={showTTC} onToggleTTC={setShowTTC} />
```

### 2. `SpaceCard`

Carte individuelle d'un espace avec image, prix et features.

**Props :**
```typescript
interface SpaceCardProps {
  space: DisplaySpace;
  showTTC: boolean;
  onConvertPrice: (price: string, toTTC: boolean) => string;
}
```

**Features :**
- Image avec fallback sur icône
- Overlay au hover
- Affichage capacité
- Liste de features
- Prix TTC/HT dynamiques

### 3. `SpaceGrid`

Grille responsive de cartes d'espaces.

**Props :**
```typescript
interface SpaceGridProps {
  spaces: DisplaySpace[];
  showTTC: boolean;
  onConvertPrice: (price: string, toTTC: boolean) => string;
}
```

## 🔧 Hook : `useSpaceSelection`

Hook personnalisé gérant toute la logique métier.

**Retour :**
```typescript
{
  spaces: DisplaySpace[];        // Espaces formatés pour l'UI
  loading: boolean;              // État de chargement
  showTTC: boolean;              // Mode TTC/HT
  setShowTTC: (v: boolean) => void;
  convertPrice: (price: string, toTTC: boolean) => string;
}
```

**Responsabilités :**
- Fetch des espaces depuis l'API
- Transformation des données pour l'affichage
- Conversion TTC/HT (10% hourly, 20% daily)
- Formatage capacité

## 📊 Types Principaux

### `DisplaySpace`

Espace formaté pour l'affichage dans l'UI.

```typescript
interface DisplaySpace {
  id: string;              // URL slug
  title: string;           // "Place"
  subtitle: string;        // "Open-space"
  description: string;
  icon: string;            // Bootstrap icon class
  image: string;           // URL image
  capacity: string;        // "1-6 personnes"
  features: string[];      // ["WiFi", "Café"]
  priceFrom: string;       // Legacy
  hourlyPrice: string;     // "10€/h"
  dailyPrice: string;      // "50€/jour"
  requiresQuote: boolean;
}
```

### `SpaceConfig`

Configuration brute depuis l'API.

```typescript
interface SpaceConfig {
  spaceType: string;
  name: string;
  slug: string;
  description?: string;
  pricing: {
    hourly: number;
    daily: number;
    weekly: number;
    monthly: number;
    perPerson: boolean;
  };
  requiresQuote: boolean;
  minCapacity: number;
  maxCapacity: number;
  imageUrl?: string;
  features?: string[];
}
```

## 🎨 Styles SCSS

Les styles sont dans `/styles/booking.scss` :

```scss
.booking-selection { }
.space-card { }
.card-image-container { }
.card-overlay { }
.card-content { }
.feature-badge { }
.tax-toggle { }
```

## 📖 Utilisation dans page.tsx

```tsx
import { SelectionHeader, SpaceGrid, useSpaceSelection } from "@/components/booking/selection";

export default function BookingPage() {
  const { spaces, loading, showTTC, setShowTTC, convertPrice } = useSpaceSelection();

  if (loading) return <LoadingSpinner />;

  return (
    <section className="booking-selection py__90">
      <div className="container">
        <SelectionHeader showTTC={showTTC} onToggleTTC={setShowTTC} />
        <SpaceGrid spaces={spaces} showTTC={showTTC} onConvertPrice={convertPrice} />
      </div>
    </section>
  );
}
```

## ✅ Conformité CLAUDE.md

- [x] Fichiers < 200 lignes
- [x] Composants réutilisables
- [x] Props TypeScript strictes (zéro `any`)
- [x] Logique extraite dans hook
- [x] Nommage explicite
- [x] Dates en format string (N/A ici)

## 🔄 Évolutions Futures

### Optimisations Possibles

1. **Images** : Utiliser `next/image` au lieu de `<img>`
2. **API** : Ajouter cache SWR/React Query
3. **SEO** : Ajouter metadata dynamiques
4. **A11y** : Améliorer ARIA labels

### Améliorations UX

1. Skeleton loader au lieu de spinner
2. Animations d'entrée des cartes
3. Filtres par capacité/prix
4. Mode comparaison espaces

---

**Créé le** : 2026-02-08
**Dernière mise à jour** : 2026-02-08
**Version** : 1.0
