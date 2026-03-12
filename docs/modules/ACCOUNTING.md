# ACCOUNTING Module - Architecture & Documentation

> **Module** : Accounting (Comptabilité & CA)
> **Apps** : admin
> **Status** : ✅ Production + 🚧 B2B Analytics en cours
> **Dernière mise à jour** : 2026-03-11

---

## 📋 Vue d'Ensemble

### Responsabilités

Le module Accounting gère la comptabilité complète du coworking café :

1. **Chiffre d'Affaires (CA)** : Suivi quotidien TTC/HT par taux de TVA
2. **Encaissements** : Détail paiements (espèces, CB, virement) + dépenses
3. **Fond de caisse** : Comptage physique quotidien
4. **Analytics B2B** : ⚠️ **NOUVEAU** - Tracking CA entreprises + comparaisons avancées
5. **Exports** : PDF contrôle de caisse, CSV pour comptabilité

### Flux Principal

```
Daily Operations          Accounting Data              Analytics
────────────────          ───────────────              ─────────
Bookings/Sales     ──>    Turnover (CA)        ──>    Dashboard
Cash Payments      ──>    CashEntry            ──>    Comparisons
Physical Count     ──>    CashRegister         ──>    Y vs Y-1
B2B Invoices       ──>    B2BRevenue (NEW)     ──>    M vs M-1
                                                       Export CSV/PDF
```

---

## 🗂️ Structure Fichiers

### apps/admin/src/

```
models/accounting/
├── Turnover.ts                        # CA quotidien (collection: turnovers)
├── CashEntry.ts                       # Encaissements (collection: cashentries)
└── B2BRevenue.ts (NEW)                # CA B2B (collection: accounting-b2b-revenue)

types/accounting.ts                    # Toutes les interfaces du module

app/admin/accounting/
├── cash-control/
│   └── page.tsx (146L)                # Contrôle de caisse mensuel
├── cash-register/
│   └── page.tsx (17L)                 # Historique comptages
├── captured-deposits/
│   └── page.tsx                       # Dépôts bancaires (no-show)
└── analytics/ (NEW)
    ├── page.tsx (< 150L)              # Analytics CA B2C + B2B
    └── components/
        ├── AnalyticsFilters.tsx       # Filtres période + comparaison
        ├── RevenueCards.tsx           # Cards comparaison
        ├── RevenueChart.tsx           # Graphique évolution
        ├── BreakdownChart.tsx         # Répartition par catégorie
        ├── B2BRevenueDialog.tsx       # Saisie manuelle CA B2B
        └── index.ts                   # Barrel exports

app/api/accounting/
├── turnovers/
│   ├── route.ts                       # GET/POST turnovers
│   └── [id]/route.ts                  # GET/PUT/DELETE specific
├── cash-entries/
│   ├── route.ts                       # GET/POST cash entries
│   └── [id]/route.ts                  # CRUD operations
├── analytics/
│   └── route.ts (NEW)                 # GET analytics data (B2C+B2B)
└── b2b-revenue/ (NEW)
    ├── route.ts                       # GET/POST B2B revenue
    └── [id]/route.ts                  # PUT/DELETE specific

hooks/
├── useCashControl.ts (156L)           # Cash control page logic
├── useTurnoverData.ts (44L)           # Fetch turnovers
├── useAccountingData.ts (39L)         # Fetch cash entries
├── useAnalyticsData.ts (NEW)          # Fetch analytics data
└── useB2BRevenue.ts (NEW)             # Manage B2B revenue

lib/accounting/
├── calculate-b2c-revenue.ts (NEW)     # Calculate CA B2C from Turnover
├── calculate-b2b-revenue.ts (NEW)     # Calculate CA B2B
├── calculate-comparison.ts (NEW)      # Period comparisons (M vs M-1, Y vs Y-1)
├── export-analytics.ts (NEW)          # CSV/Excel export
└── merge-cash-data.ts (116L)          # Merge Turnover + CashEntry

components/accounting/
├── CashControlForm.tsx                # Form saisie CA + encaissements
├── CashRegisterHistory.tsx            # Historique comptages
└── analytics/ (NEW)
    ├── AnalyticsFilters.tsx
    ├── RevenueCards.tsx
    ├── RevenueChart.tsx
    ├── BreakdownChart.tsx
    └── B2BRevenueDialog.tsx
```

---

## 📊 Base de Données

### Collections MongoDB

#### 1. Turnover (CA quotidien)

**Collection** : `turnovers` (⚠️ À renommer `accounting-turnovers` lors du refacto)

```typescript
{
  _id: "2026/03/11",              // String format YYYY/MM/DD (unique)

  // TVA 20% (espaces, services)
  "vat-20": {
    "total-ht": 2083.33,
    "total-ttc": 2500.00,
    "total-taxes": 416.67
  },

  // TVA 10% (produits alimentaires)
  "vat-10": {
    "total-ht": 454.54,
    "total-ttc": 500.00,
    "total-taxes": 45.46
  },

  // TVA 5.5% (produits alimentaires spécifiques)
  "vat-55": {
    "total-ht": 94.79,
    "total-ttc": 100.00,
    "total-taxes": 5.21
  },

  // TVA 0% (exonérations)
  "vat-0": {
    "total-ht": 50.00,
    "total-ttc": 50.00,
    "total-taxes": 0.00
  }
}
```

**Indexes** :
```typescript
// Aucun explicite actuellement
// À ajouter lors refacto : { _id: 1 } (unique automatique)
```

**Calculs** :
- Total HT jour = sum(vat-20.total-ht + vat-10.total-ht + vat-55.total-ht + vat-0.total-ht)
- Total TTC jour = sum(all vat-*.total-ttc)

---

#### 2. CashEntry (Encaissements quotidiens)

**Collection** : `cashentries` (⚠️ À renommer `accounting-cash-entries` lors du refacto)

```typescript
{
  _id: "2026/03/11",              // String format YYYY/MM/DD (unique)
  date: "2026/03/11",             // Duplicate de _id (compatibilité)

  // Prestations B2B (existant, ne pas toucher)
  prestaB2B: [
    { label: "Privatisation salle", value: 500 },
    { label: "Présence employé événement", value: 300 }
  ],

  // Dépenses
  depenses: [
    { label: "Achat café fournisseur", value: 150 },
    { label: "Maintenance machine", value: 80 }
  ],

  // Encaissements par mode de paiement
  especes: 350.50,           // Cash
  virement: 1200.00,         // Bank transfer
  cbClassique: 800.00,       // Classic card
  cbSansContact: 450.50,     // Contactless card

  // Audit
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes** :
```typescript
Schema.index({ _id: 1 }, { unique: true });
```

**Total encaissements** = especes + virement + cbClassique + cbSansContact
**Total prestaB2B** = sum(prestaB2B[].value)
**Total dépenses** = sum(depenses[].value)

---

#### 3. B2BRevenue (CA B2B) ⚠️ **NOUVEAU**

**Collection** : `accounting-b2b-revenue` (✅ Déjà avec préfixe refacto)

```typescript
{
  _id: ObjectId,

  // Période (flexible)
  period: {
    type: "month" | "week" | "custom",
    year: 2026,
    month: 3,                    // 1-12 (si type=month)
    week: 11,                    // 1-53 (si type=week)
    startDate: "2026-03-01",     // YYYY-MM-DD (toujours présent)
    endDate: "2026-03-31"        // YYYY-MM-DD (toujours présent)
  },

  // Revenue B2B (HT uniquement pour Phase 1)
  revenueHT: 5000.00,            // Montant HT saisi manuellement

  // Metadata
  description: "Privatisations + Employés Mars 2026",
  category: "privatisation" | "employe" | "prestation-ponctuelle" | "autre",
  notes?: string,

  // Audit trail
  createdBy: {
    userId: ObjectId,
    name: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes** :
```typescript
Schema.index({ 'period.type': 1, 'period.year': 1, 'period.month': 1 });
Schema.index({ 'period.startDate': 1, 'period.endDate': 1 });
Schema.index({ 'period.year': 1 });
```

**Queries courantes** :
```typescript
// CA B2B pour Mars 2026
B2BRevenue.find({
  'period.type': 'month',
  'period.year': 2026,
  'period.month': 3
});

// CA B2B pour période custom
B2BRevenue.find({
  'period.startDate': { $lte: '2026-03-31' },
  'period.endDate': { $gte: '2026-03-01' }
});
```

---

#### 4. CashRegister (Fond de caisse)

**Collection** : `cashregisters` (⚠️ À renommer `accounting-cash-registers` lors du refacto)

```typescript
{
  _id: ObjectId,
  date: "2026-03-11",        // YYYY-MM-DD
  amount: 500.00,            // Total compté

  countedBy: {
    userId: ObjectId,
    name: "John Doe"
  },

  countDetails: {
    bills: [
      { value: 50, quantity: 5 },   // 5 billets de 50€
      { value: 20, quantity: 10 }   // 10 billets de 20€
    ],
    coins: [
      { value: 2, quantity: 25 },   // 25 pièces de 2€
      { value: 1, quantity: 50 }    // 50 pièces de 1€
    ]
  },

  notes: "Fond de caisse normal",
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes** :
```typescript
Schema.index({ date: -1 });
Schema.index({ 'countedBy.userId': 1 });
```

---

## 🔌 API Routes

### Analytics API ⚠️ **NOUVEAU**

#### GET /api/accounting/analytics

**Description** : Récupère données analytics complètes (B2C + B2B + comparaisons)

**Auth** : `requireAuth(['admin', 'dev'])`

**Query Params** :
```typescript
{
  period: "day" | "week" | "month" | "year" | "custom",
  startDate: "2026-03-01",        // YYYY-MM-DD
  endDate?: "2026-03-31",         // YYYY-MM-DD (optionnel si period != custom)
  compareWith?: "previous" | "year-ago" | "month-year-ago",
  mode: "ht" | "ttc"              // Default: ttc
}
```

**Examples** :
```bash
# CA du mois en cours vs mois précédent
GET /api/accounting/analytics?period=month&compareWith=previous&mode=ttc

# CA Mars 2026 vs Mars 2025
GET /api/accounting/analytics?period=month&startDate=2026-03-01&compareWith=month-year-ago

# CA personnalisé
GET /api/accounting/analytics?period=custom&startDate=2026-01-01&endDate=2026-03-31
```

**Response** :
```typescript
{
  current: {
    period: {
      type: "month",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      label: "Mars 2026"
    },
    b2c: {
      ht: 15000.00,
      ttc: 18000.00,
      tva: 3000.00
    },
    b2b: {
      ht: 5000.00
    },
    total: {
      ht: 20000.00,
      ttc: 23000.00
    }
  },

  comparison: {
    period: {
      type: "month",
      startDate: "2026-02-01",
      endDate: "2026-02-29",
      label: "Février 2026"
    },
    b2c: { ht: 12000, ttc: 14400, tva: 2400 },
    b2b: { ht: 4000 },
    total: { ht: 16000, ttc: 18400 },

    variation: {
      b2c: { amount: 3600, percentage: 25.0, trend: "up" },
      b2b: { amount: 1000, percentage: 25.0, trend: "up" },
      total: { amount: 4600, percentage: 25.0, trend: "up" }
    }
  },

  breakdown: [
    {
      category: "bookings",
      label: "Réservations Espaces",
      ht: 12000,
      ttc: 14400,
      percentage: 60.0,
      color: "#3b82f6"
    },
    {
      category: "products",
      label: "Produits Café/Snacks",
      ht: 2500,
      ttc: 2750,
      percentage: 12.5,
      color: "#10b981"
    },
    {
      category: "services",
      label: "Services Additionnels",
      ht: 500,
      ttc: 600,
      percentage: 2.5,
      color: "#f59e0b"
    },
    {
      category: "b2b",
      label: "B2B (Entreprises)",
      ht: 5000,
      ttc: 5000,  // HT only pour Phase 1
      percentage: 25.0,
      color: "#8b5cf6"
    }
  ],

  chartData: [
    {
      date: "2026-03-01",
      displayDate: "1/3",
      current: 800,
      comparison: 650
    },
    // ... un point par jour du mois
  ]
}
```

**Logique** :
1. Calculer CA B2C depuis Turnover (sum all VAT rates)
2. Calculer CA B2B depuis B2BRevenue
3. Calculer période de comparaison
4. Calculer variations (amount + %)
5. Breakdown par catégorie (estimé proportionnellement pour Phase 1)

---

### B2B Revenue API ⚠️ **NOUVEAU**

#### GET /api/accounting/b2b-revenue

**Description** : Liste entrées CA B2B avec filtres

**Auth** : `requireAuth(['admin', 'dev'])`

**Query Params** :
```typescript
{
  year?: number,           // Filter by year
  month?: number,          // Filter by month (1-12)
  type?: "month" | "week" | "custom",
  startDate?: string,      // YYYY-MM-DD
  endDate?: string         // YYYY-MM-DD
}
```

**Response** :
```typescript
{
  b2bRevenues: Array<B2BRevenue>,
  total: number,
  totalHT: number
}
```

---

#### POST /api/accounting/b2b-revenue

**Description** : Créer nouvelle entrée CA B2B

**Auth** : `requireAuth(['admin', 'dev'])`

**Request** :
```typescript
{
  period: {
    type: "month",
    year: 2026,
    month: 3
  },
  revenueHT: 5000,
  description: "Privatisations + Employés Mars",
  category: "privatisation",
  notes?: "Détails supplémentaires"
}
```

**Validation** :
- period.type requis
- period.year requis (2020-2100)
- period.month requis si type=month (1-12)
- period.week requis si type=week (1-53)
- period.startDate/endDate requis si type=custom
- revenueHT requis, > 0
- description max 500 chars

**Response** :
```typescript
{
  b2bRevenue: {
    _id: "...",
    period: { ... },
    revenueHT: 5000,
    description: "...",
    createdBy: { userId, name },
    createdAt: "2026-03-11T10:00:00.000Z"
  }
}
```

**Status** : 201 Created

---

#### PUT /api/accounting/b2b-revenue/[id]

**Description** : Mettre à jour entrée CA B2B

**Auth** : `requireAuth(['admin', 'dev'])`

**Request** : Mêmes champs que POST (tous optionnels)

**Response** : B2BRevenue mis à jour

---

#### DELETE /api/accounting/b2b-revenue/[id]

**Description** : Supprimer entrée CA B2B

**Auth** : `requireAuth(['admin', 'dev'])`

**Response** : 204 No Content

---

### Existing APIs (Référence)

#### GET /api/accounting/turnovers

**Query** : `?startDate=2026-03-01&endDate=2026-03-31`
**Response** : Array<Turnover>

#### POST /api/accounting/turnovers

**Request** : Turnover object
**Response** : Created turnover

#### GET /api/accounting/cash-entries

**Query** : `?startDate=2026-03-01&endDate=2026-03-31`
**Response** : Array<CashEntry>

---

## 🎨 Composants Frontend

### AnalyticsFilters ⚠️ **NOUVEAU**

**Path** : `components/accounting/analytics/AnalyticsFilters.tsx`

**Props** :
```typescript
interface AnalyticsFiltersProps {
  filters: {
    period: PeriodType;
    startDate?: string;
    endDate?: string;
    compareWith?: ComparisonType;
    mode: "ht" | "ttc";
  };
  onFilterChange: (filters: Filters) => void;
}
```

**UI Elements** :
- Select période (Aujourd'hui, Cette semaine, Ce mois, Cette année, Personnalisé)
- Date pickers (si période = personnalisé)
- Select comparaison (vs Période précédente, vs Année passée, vs Mois année passée)
- Toggle HT/TTC
- Button "Réinitialiser"

---

### RevenueCards ⚠️ **NOUVEAU**

**Props** :
```typescript
interface RevenueCardsProps {
  current: RevenueData;
  comparison?: RevenueData;
  variation?: VariationData;
  mode: "ht" | "ttc";
}
```

**Display** :
- 3 cards : B2C, B2B, Total
- Chaque card : Montant actuel, Montant comparé, Variation (% + flèche)
- Colors : green (up), red (down), gray (stable)

---

### RevenueChart ⚠️ **NOUVEAU**

**Library** : Recharts

**Props** :
```typescript
interface RevenueChartProps {
  data: Array<{ date: string; current: number; comparison?: number }>;
  mode: "ht" | "ttc";
}
```

**Chart Type** : Line chart ou Area chart
**Features** : Tooltip, Legend, Grid, Responsive

---

### BreakdownChart ⚠️ **NOUVEAU**

**Props** :
```typescript
interface BreakdownChartProps {
  data: Array<{ category: string; label: string; value: number; percentage: number; color: string }>;
}
```

**Chart Type** : Pie chart ou Bar chart
**Features** : Labels avec %, Colors, Legend

---

### B2BRevenueDialog ⚠️ **NOUVEAU**

**Props** :
```typescript
interface B2BRevenueDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: B2BRevenueInput) => Promise<void>;
  initialData?: B2BRevenue;  // Pour édition
}
```

**Form Fields** :
- Period type (Radio: Mois, Semaine, Personnalisé)
- Year (Number input)
- Month (Select 1-12, si type=month)
- Week (Select 1-53, si type=week)
- Start/End dates (Date pickers, si type=custom)
- Revenue HT (Number input, required)
- Description (Textarea, max 500 chars)
- Category (Select: privatisation, employe, prestation-ponctuelle, autre)
- Notes (Textarea, optional)

**Validation** : react-hook-form + zod

---

## 📐 Calculs & Helpers

### calculate-b2c-revenue.ts

```typescript
export async function calculateB2CRevenue(
  startDate: string,
  endDate: string
): Promise<{ ht: number; ttc: number; tva: number }> {
  const turnovers = await Turnover.find({
    _id: { $gte: startDate.replace(/-/g, '/'), $lte: endDate.replace(/-/g, '/') }
  });

  let totalHT = 0;
  let totalTTC = 0;
  let totalTVA = 0;

  turnovers.forEach(turnover => {
    ['vat-20', 'vat-10', 'vat-55', 'vat-0'].forEach(vatKey => {
      if (turnover[vatKey]) {
        totalHT += turnover[vatKey]['total-ht'] || 0;
        totalTTC += turnover[vatKey]['total-ttc'] || 0;
        totalTVA += turnover[vatKey]['total-taxes'] || 0;
      }
    });
  });

  return { ht: totalHT, ttc: totalTTC, tva: totalTVA };
}
```

---

### calculate-b2b-revenue.ts

```typescript
export async function calculateB2BRevenue(
  startDate: string,
  endDate: string
): Promise<{ ht: number }> {
  const b2bEntries = await B2BRevenue.find({
    'period.startDate': { $lte: endDate },
    'period.endDate': { $gte: startDate }
  });

  const totalHT = b2bEntries.reduce((sum, entry) => sum + entry.revenueHT, 0);

  return { ht: totalHT };
}
```

---

### calculate-comparison.ts

```typescript
export function calculateComparison(
  current: number,
  previous: number
): { amount: number; percentage: number; trend: 'up' | 'down' | 'stable' } {
  const amount = current - previous;
  const percentage = previous > 0 ? (amount / previous) * 100 : 0;

  return {
    amount,
    percentage: Math.round(percentage * 100) / 100,  // 2 decimals
    trend: amount > 0 ? 'up' : amount < 0 ? 'down' : 'stable'
  };
}

export function getPreviousPeriod(
  type: 'day' | 'week' | 'month' | 'year',
  date: Date
): { startDate: string; endDate: string } {
  // Logic to calculate previous period
  // ...
}

export function getYearAgoPeriod(
  startDate: string,
  endDate: string
): { startDate: string; endDate: string } {
  // Logic to calculate same period last year
  // ...
}
```

---

## 🧪 Tests

### Tests Unitaires (à créer Phase 2)

```typescript
// tests/accounting/calculate-revenue.test.ts
describe('calculateB2CRevenue', () => {
  it('should sum all VAT rates correctly', async () => {
    // Mock Turnover data
    // Assert totals
  });
});

describe('calculateComparison', () => {
  it('should calculate percentage correctly', () => {
    const result = calculateComparison(1250, 1000);
    expect(result.percentage).toBe(25.0);
    expect(result.trend).toBe('up');
  });
});
```

---

## 🐛 Troubleshooting

### Problème : Dates Turnover format slash vs dash

**Cause** : Turnover._id utilise format "YYYY/MM/DD", API utilise "YYYY-MM-DD"

**Solution** : Toujours convertir avant query
```typescript
const turnoverDate = apiDate.replace(/-/g, '/');  // 2026-03-11 → 2026/03/11
```

---

### Problème : B2B Revenue période overlap

**Cause** : Plusieurs entrées B2B avec périodes qui se chevauchent

**Solution** : Validation côté API
```typescript
// Vérifier pas de overlap avant create
const existing = await B2BRevenue.findOne({
  'period.startDate': { $lt: newEndDate },
  'period.endDate': { $gt: newStartDate }
});

if (existing) {
  return errorResponse('Period overlaps with existing entry', 400);
}
```

---

## 📝 TODO / Roadmap

### Phase 1 (En cours)
- [x] Model B2BRevenue
- [x] API /accounting/analytics
- [x] API /accounting/b2b-revenue
- [ ] Composants UI
- [ ] Page /admin/accounting/analytics
- [ ] Export CSV/Excel
- [ ] Tests & deploy

### Phase 2 (Future)
- [ ] Facturation électronique (Factur-X)
- [ ] CRM B2B (clients, devis, factures)
- [ ] Auto-calcul CA depuis Payments
- [ ] Product sales tracking
- [ ] Profitability analysis (CA - COGS)

---

## 📚 Ressources

- [Turnover Model](/apps/admin/src/models/turnover/)
- [CashEntry Model](/apps/admin/src/models/cashEntry/)
- [Accounting Types](/apps/admin/src/types/accounting.ts)
- [Dashboard Services](/apps/admin/src/lib/services/dashboard/)

---

**Dernière mise à jour** : 2026-03-11
**Mainteneur** : Thierry
**Version** : 2.0 (with B2B Analytics)
