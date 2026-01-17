# Composants Promo

Composants React pour le module de gestion des codes promotionnels.

## Vue d'ensemble

Ce module permet de gérer et visualiser les statistiques du système de codes promo accessible via QR code sur le site client.

## Composants

### PromoStatsCards

Affiche 4 cartes de statistiques principales :
- Total Scans (nombre de scans QR)
- Total Reveals (nombre de révélations du code)
- Total Copies (nombre de copies du code)
- Temps moyen pour révéler (en secondes)

```tsx
import { PromoStatsCards } from '@/components/promo'
import type { ScanStats } from '@/types/promo'

<PromoStatsCards scanStats={scanStats} />
```

### PromoCurrentCode

Affiche le code promo actuellement actif avec tous ses détails :
- Code et description
- Type de réduction et montant
- Utilisations (actuel / max)
- Dates de validité
- Statut (actif/inactif)

```tsx
import { PromoCurrentCode } from '@/components/promo'
import type { PromoCode } from '@/types/promo'

<PromoCurrentCode promoCode={currentCode} />
```

### PromoHistory

Table de l'historique des anciens codes promo désactivés.

```tsx
import { PromoHistory } from '@/components/promo'
import type { PromoHistory } from '@/types/promo'

<PromoHistory history={historyData} maxItems={10} />
```

Props :
- `history` : Liste des codes désactivés
- `maxItems` (optionnel) : Nombre max d'items à afficher

### PromoWeeklyChart

Graphique en barres des scans des 7 derniers jours.

```tsx
import { PromoWeeklyChart } from '@/components/promo'

const weeklyStats = [
  { date: '2026-01-10', scans: 12 },
  { date: '2026-01-11', scans: 15 },
  // ...
]

<PromoWeeklyChart weeklyStats={weeklyStats} />
```

### PromoTopHours

Liste des heures de pic avec barres de progression.

```tsx
import { PromoTopHours } from '@/components/promo'

const topHours = [
  { hour: '14', count: 25, percentage: 100 },
  { hour: '10', count: 18, percentage: 72 },
  // ...
]

<PromoTopHours topHours={topHours} />
```

## Dépendances

- **shadcn/ui** : Card, Badge, Progress, Table, Form, Input, Select, Textarea, Button
- **lucide-react** : Icônes
- **recharts** : Graphiques
- **react-hook-form** : Gestion des formulaires
- **zod** : Validation des schémas
- **@hookform/resolvers** : Intégration Zod + react-hook-form
- **sonner** : Toast notifications
- **@/types/promo** : Types TypeScript

### PromoCreateForm

Formulaire de création d'un nouveau code promo avec validation Zod.

```tsx
import { PromoCreateForm } from '@/components/promo'
import type { CreatePromoCodeRequest } from '@/types/promo'

const handleCreate = async (data: CreatePromoCodeRequest) => {
  const response = await fetch('/api/promo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  // ...
}

<PromoCreateForm onSubmit={handleCreate} loading={isCreating} />
```

Props :
- `onSubmit` : Callback de soumission (async)
- `loading` (optionnel) : État de chargement

Champs :
- Code (text, uppercase, 3-20 caractères)
- Token (text, 8-50 caractères)
- Description (text, min 10 caractères)
- Type de réduction (select: percentage, fixed, free_item)
- Valeur (number)
- Dates de validité (YYYY-MM-DD)
- Utilisations max (number, 0 = illimité)

### PromoMarketingForm

Formulaire d'édition du contenu marketing de la page scan.

```tsx
import { PromoMarketingForm } from '@/components/promo'
import type { MarketingContent } from '@/types/promo'

const handleUpdate = async (data: MarketingContent) => {
  const response = await fetch('/api/promo/marketing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  // ...
}

<PromoMarketingForm
  initialData={promoConfig.marketing}
  onSubmit={handleUpdate}
  loading={isUpdating}
/>
```

Props :
- `initialData` : Données initiales (pre-fill)
- `onSubmit` : Callback de soumission (async)
- `loading` (optionnel) : État de chargement

Champs :
- Titre (text, 5-100 caractères)
- Message (textarea, 10-1000 caractères, HTML autorisé)
- URL image (url, optionnel)
- Texte du bouton (text, 3-50 caractères)

## Structure

```
/components/promo/
├── PromoStatsCards.tsx       (< 80 lignes)
├── PromoCurrentCode.tsx      (< 100 lignes)
├── PromoHistory.tsx          (< 80 lignes)
├── PromoWeeklyChart.tsx      (< 100 lignes)
├── PromoTopHours.tsx         (< 80 lignes)
├── PromoCreateForm.tsx       (< 150 lignes) - Formulaire création
├── PromoMarketingForm.tsx    (< 150 lignes) - Formulaire marketing
├── PromoFormsExample.tsx     (< 150 lignes) - Exemple d'intégration
├── index.ts                  (exports)
└── README.md                 (ce fichier)
```

## Conformité

Tous les composants respectent les conventions de `/apps/admin/CLAUDE.md` :
- ✅ Zéro `any` types
- ✅ Props typées avec interface
- ✅ JSDoc pour documentation
- ✅ Fichiers < 100 lignes
- ✅ Tailwind CSS + shadcn/ui
- ✅ Format dates en strings (YYYY-MM-DD)
