# CLAUDE.md - Admin App Development Guide

> **App** : `/apps/admin/` - Dashboard Admin du Coworking Café
> **Version** : 1.2
> **Status** : ✅ Production Ready

---

## 📋 Vue d'Ensemble

Dashboard Next.js 14 pour gérer :
- 👥 **HR** : Employés, contrats, onboarding, disponibilités
- ⏰ **Pointage** : Time tracking, shifts, planning
- 💰 **Comptabilité** : Caisse, chiffre d'affaires, PDF
- 📊 **Analytics** : Stats et rapports
- 📝 **Actualités** : Blog & Événements (contenu site public)

**Stack** : Next.js 14 · TypeScript · Tailwind · shadcn/ui · MongoDB · NextAuth

### 📧 Emails

**IMPORTANT** : N'utilisez **JAMAIS Resend** pour l'envoi d'emails.

✅ **Utiliser** : Package partagé `@coworking-cafe/email` avec SMTP
```typescript
import { sendEmail } from "@/lib/email/emailService";

await sendEmail({
  to: "user@example.com",
  subject: "Sujet",
  html: "<p>Contenu HTML</p>",
  attachments: [{ filename: "file.pdf", content: buffer }]
});
```

❌ **Ne PAS utiliser** : Resend, SendGrid, ou autres services tiers

---

## 🎨 Styles de Boutons (shadcn/ui)

**TOUJOURS** utiliser `variant="outline"` avec les classes de couleur appropriées selon le type d'action.

### 🔗 **Navigation/Liens** (gris → vert au hover)
```typescript
<Button
  variant="outline"
  className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
>
  <Icon className="mr-2 h-4 w-4" />
  Texte
</Button>
```
**Exemples** : Planning, Voir détails, Aller à...

### ➕ **Actions Principales** (vert)
```typescript
<Button
  variant="outline"
  className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
>
  <Icon className="mr-2 h-4 w-4" />
  Texte
</Button>
```
**Exemples** : Ajouter, Créer, Nouveau, Valider

### 📄 **Export/Génération** (bleu)
```typescript
<Button
  variant="outline"
  className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
>
  <Icon className="mr-2 h-4 w-4" />
  Texte
</Button>
```
**Exemples** : Générer PDF, Exporter, Télécharger, Importer

### 🔵 **Modification** (bleu)
```typescript
<Button
  variant="outline"
  className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
>
  <Icon className="mr-2 h-4 w-4" />
  Texte
</Button>
```
**Exemples** : Modifier, Éditer, Mettre à jour

### ❌ **Suppression/Reset** (rouge)
```typescript
<Button
  variant="outline"
  className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
>
  <Icon className="mr-2 h-4 w-4" />
  Texte
</Button>
```
**Exemples** : Effacer, Supprimer, Annuler, Réinitialiser

### 🔘 **Boutons d'Actions (Listes/Tableaux)**

Pour les boutons d'actions dans les listes de produits, tableaux, cards, etc., utiliser `size="sm"` avec **SEULEMENT l'icône** (pas de texte).

**Pattern standard** :
```typescript
// Modifier (bleu)
<Button
  variant="outline"
  size="sm"
  className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
  onClick={() => onEdit(item)}
  title="Modifier"
>
  <Edit className="h-4 w-4" />
</Button>

// Supprimer/Désactiver (rouge)
<Button
  variant="outline"
  size="sm"
  className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
  onClick={() => onDelete(item)}
  title="Supprimer"
>
  <Trash2 className="h-4 w-4" />
</Button>

// Réactiver/Activer (vert)
<Button
  variant="outline"
  size="sm"
  className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
  onClick={() => onActivate(item)}
  title="Réactiver"
>
  <RefreshCw className="h-4 w-4" />
</Button>

// Toggle status (gris)
<Button
  variant="outline"
  size="sm"
  className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50 hover:text-gray-700"
  onClick={() => onToggle(item)}
  title="Changer statut"
>
  <Eye className="h-4 w-4" />
</Button>
```

**Où l'appliquer** :
- ProductCard (inventory)
- ArticlesTable (blog)
- EventsTable (events)
- Toutes les listes avec actions inline

**Règles spécifiques** :
- ✅ Toujours `size="sm"` (pas `icon`)
- ✅ Icône seule (pas de texte)
- ✅ `title` pour tooltip
- ✅ La couleur du texte **reste identique au hover** (pas de changement)
- ✅ Groupe de boutons : `flex gap-2`

### ⚠️ **Important**
- ✅ **TOUJOURS** `variant="outline"` (jamais `default`, `ghost`, etc.)
- ✅ **TOUJOURS** ajouter l'icône avec `className="mr-2 h-4 w-4"` (boutons avec texte) ou `className="h-4 w-4"` (boutons icon-only)
- ✅ **TOUJOURS** utiliser les couleurs appropriées selon le type d'action
- ❌ **JAMAIS** de boutons sans couleur ou avec des couleurs aléatoires

---

## 🔢 Inputs Numériques - Pattern Obligatoire

**RÈGLE CRITIQUE** : TOUS les inputs de type `number` doivent suivre ce pattern exact pour une UX optimale.

### ❌ Comportement par défaut (MAUVAIS)
```
Input avec valeur 0 affichée
User focus → tape "1"
Résultat : 01 ❌
```

### ✅ Comportement souhaité (BON)
```
Input vide au chargement (undefined en interne)
User tape "0.5"
Résultat : 0.5 ✅

User tape "1.20"
Résultat : 1.20 ✅
```

### 📝 Pattern COMPLET à appliquer PARTOUT

**Utiliser le hook personnalisé `useNumberInput`** pour gérer la saisie flexible :

```tsx
import { useNumberInput } from "@/hooks/inventory/useNumberInput";

<FormField
  control={control}
  name="unitPriceHT"
  render={({ field }) => {
    const numberInputProps = useNumberInput({ field, min: 0 });
    return (
      <FormItem>
        <FormLabel>Prix unitaire HT (€) *</FormLabel>
        <FormControl>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...numberInputProps}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }}
/>
```

### 🎯 Règles Essentielles

**1. Utiliser le hook `useNumberInput`**
```tsx
import { useNumberInput } from "@/hooks/inventory/useNumberInput";

const numberInputProps = useNumberInput({
  field,      // React Hook Form field
  min: 0,     // Minimum value (default: 0)
});
```

**Avantages du hook** :
- ✅ Gère une valeur locale pendant la saisie
- ✅ Permet de taper ".5", "0.", etc. librement
- ✅ Permet de supprimer le "0" dans "0.5" → ".5" ✓
- ✅ **Accepte virgule ET point** : "1,5" ou "1.5" → converti en 1.5 ✓
- ✅ Conversion automatique virgule → point (UX française)
- ✅ Conversion en number seulement au blur (quand on quitte le champ)
- ✅ Auto-sélection Safari-compatible intégrée
- ✅ Validation min/max automatique

**2. Champ vide au chargement**
```tsx
// Dans defaultValues
unitPriceHT: undefined as unknown as number
minStock: undefined as unknown as number
```
- ✅ Champ vide au chargement
- ✅ User peut taper "0.5", ".5", "0." normalement
- ✅ Conversion en 0 si champ vide à la soumission

**3. Step adapté au contexte**
```tsx
// Prix en euros avec centimes
step="0.01"

// Quantités avec décimales (1.5 kg)
step="0.1"

// Quantités entières uniquement
step="1"
```

**Note** : Le hook `useNumberInput` gère automatiquement la conversion, la validation min/max, et l'auto-sélection Safari. Plus besoin de gérer manuellement onChange/onBlur/onFocus.

### 🎯 Où appliquer

**TOUS les formulaires avec inputs numériques** :
- ✅ Prix (unitPriceHT, prices, amounts) → step="0.01"
- ✅ Quantités (stock, quantity, count) → step="0.1" ou step="1"
- ✅ Pourcentages (TVA, discounts) → step="0.01"
- ✅ Durées (minutes, hours, days) → step="1"
- ✅ Ordre d'affichage (order field) → step="1"
- ✅ TOUT champ de type `number`

### ⚠️ Important

- ✅ **TOUJOURS** utiliser le hook `useNumberInput` pour les inputs number
- ✅ **TOUJOURS** `defaultValues: undefined as unknown as number` pour champs vides au chargement
- ✅ **TOUJOURS** step approprié (0.01 pour prix, 0.1 pour quantités décimales, 1 pour entiers)
- ✅ **TOUJOURS** placeholder pour indiquer le format attendu
- ✅ Le hook gère automatiquement : valeur locale, auto-sélection Safari, conversion au blur
- ✅ Permet de taper librement ".5", "0.", "0.5" et de supprimer le "0" dans "0.5"
- ❌ **JAMAIS** gérer manuellement onChange/onBlur/onFocus (le hook s'en charge)
- ❌ **JAMAIS** `value={field.value === 0 ? '' : field.value}` (le hook gère ça)

### 💡 Exemple Complet (Produit Inventory)

```tsx
import { useNumberInput } from "@/hooks/inventory/useNumberInput";

// Dans ProductDialog.tsx - defaultValues
const defaultFormValues: ProductFormData = {
  unitPriceHT: undefined as unknown as number,  // ← Champ vide au chargement
  minStock: undefined as unknown as number,
  maxStock: undefined as unknown as number,
  // ... autres champs
};

const form = useForm<ProductFormData>({
  resolver: zodResolver(productSchema),
  defaultValues: defaultFormValues,
});

// Dans le composant - Prix unitaire HT
<FormField
  control={control}
  name="unitPriceHT"
  render={({ field }) => {
    const numberInputProps = useNumberInput({ field, min: 0 });
    return (
      <FormItem>
        <FormLabel>Prix unitaire HT (€) *</FormLabel>
        <FormControl>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...numberInputProps}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }}
/>

// Stock minimum (décimales autorisées : 0.5, 1.5, etc.)
<FormField
  control={control}
  name="minStock"
  render={({ field }) => {
    const numberInputProps = useNumberInput({ field, min: 0 });
    return (
      <FormItem>
        <FormLabel>Stock minimum (unités) *</FormLabel>
        <FormControl>
          <Input
            type="number"
            step="0.1"
            min="0"
            placeholder="0"
            {...numberInputProps}
          />
        </FormControl>
        <FormDescription>Seuil d'alerte</FormDescription>
        <FormMessage />
      </FormItem>
    );
  }}
/>
```

**Avantages de cette approche** :
- ✅ Code beaucoup plus court et lisible
- ✅ Comportement cohérent sur tous les navigateurs
- ✅ Permet de taper "0.5" puis supprimer le "0" → ".5" naturellement
- ✅ **Accepte "1,5" ET "1.5"** → converti automatiquement en 1.5
- ✅ Auto-sélection Safari-compatible automatique
- ✅ Réutilisable partout

**Exemples de saisie supportée** :
```
User tape "1,5"  → Converti en "1.5" → Sauvegardé comme 1.5 ✓
User tape "1.5"  → Reste "1.5"      → Sauvegardé comme 1.5 ✓
User tape "0,25" → Converti en "0.25" → Sauvegardé comme 0.25 ✓
User tape ".5"   → Reste ".5"       → Sauvegardé comme 0.5 ✓
User tape ",5"   → Converti en ".5" → Sauvegardé comme 0.5 ✓
```

---

## ⚠️ CONVENTION CRITIQUE : Structure des routes Admin vs Staff

**IMPORTANT** : Il existe DEUX dossiers distincts pour les routes avec sidebar :

### 📁 Structure

```
apps/admin/src/app/
├── (dashboard)/         # Routes STAFF (accès basique)
│   ├── layout.tsx       # Layout avec sidebar
│   ├── page.tsx         # "/" - Accueil Staff
│   ├── planning/        # "/planning"
│   ├── agenda/          # "/agenda"
│   ├── cash-register/   # "/cash-register"
│   └── produits/        # "/produits"
│
└── admin/               # Routes ADMIN (accès admin/dev)
    ├── layout.tsx       # Hérite du layout (dashboard)
    ├── page.tsx         # "/admin" - Dashboard Admin
    ├── hr/              # "/admin/hr"
    ├── accounting/      # "/admin/accounting"
    ├── booking/         # "/admin/booking"
    ├── messages/        # "/admin/messages"
    ├── blog/            # "/admin/blog"
    └── events/          # "/admin/events"
```

### ✅ CORRECT

**Routes Staff (accès basique)** → `app/(dashboard)/`
```
app/(dashboard)/planning/page.tsx        → /planning
app/(dashboard)/agenda/page.tsx          → /agenda
app/(dashboard)/cash-register/page.tsx   → /cash-register
```

**Routes Admin (accès admin/dev)** → `app/admin/`
```
app/admin/hr/page.tsx                    → /admin/hr
app/admin/blog/articles/page.tsx         → /admin/blog/articles
app/admin/events/page.tsx                → /admin/events
```

### ❌ INCORRECT

```
app/(dashboard)/admin/blog/              # ❌ NE PAS mettre admin dans (dashboard)
app/(protected)/events/                  # ❌ (protected) n'existe pas
app/blog/                                # ❌ Sans (dashboard) = pas de sidebar
```

### 🎯 Règle simple

- **Staff** (planning, agenda, produits...) → `app/(dashboard)/`
- **Admin** (hr, blog, events, booking...) → `app/admin/`
- Les deux héritent du layout avec sidebar
- Les deux sont protégés par auth (via middleware)

---

## 🎯 Contexte Important

### Historique

L'app a été **entièrement refactorisée** (Janvier 2026) :
- ✅ Sécurité : 100% routes protégées
- ✅ Types : 0 `any`, interfaces partagées
- ✅ Architecture : APIs consolidées, fichiers < 200 lignes
- ✅ Build : Réussi (27/27 pages)

### Prochaine Étape

Migration progressive de modules depuis `/apps/site/src/app/dashboard/` :
- 📅 Booking (réservations, calendrier)
- 💬 Messages (chat, notifications)
- ⚙️ Settings (espaces, horaires)
- 📊 Analytics avancées

**✅ NOTE** : L'architecture est maintenant stable. Les composants validés ne doivent pas être recréés différemment sans raison.

---

## 🚨 Règles CRITIQUES (À Respecter Absolument)

### 1. TypeScript - ZÉRO `any`

```typescript
// ❌ INTERDIT
function handleData(data: any) { }

// ✅ CORRECT
import type { Employee } from '@/types/hr'
function handleData(data: Employee) { }
```

### 2. Dates - TOUJOURS des Strings

```typescript
// ❌ INTERDIT
{ date: new Date().toISOString() }

// ✅ CORRECT
{ date: "2026-01-16", time: "09:00" } // YYYY-MM-DD, HH:mm
```

### 3. Taille Fichiers - Max 200 Lignes

| Type | Max | Action si dépassé |
|------|-----|-------------------|
| Composants React | 200 | Extraire hooks/sous-composants |
| API Routes | 200 | Extraire validation/logique |
| Models | 150 | Structure modulaire (5 fichiers) |

### 4. Sécurité - Auth OBLIGATOIRE

```typescript
// ✅ TOUJOURS en première ligne
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin', 'staff'])
  if (!authResult.authorized) return authResult.response
  // ...
}
```

### 5. Secrets - JAMAIS en Dur

```typescript
// ❌ INTERDIT
const mongoUri = "mongodb+srv://admin:PASSWORD@..."

// ✅ CORRECT
const mongoUri = process.env.MONGODB_URI!
```

### 6. Date Picker - Composant Unifié

**TOUJOURS** utiliser le composant `DatePicker` de shadcn/ui pour la saisie de dates.

```typescript
// ❌ INTERDIT
<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

// ✅ CORRECT
import { DatePicker } from '@/components/ui/date-picker';

<DatePicker
  date={formData.startDate}
  onDateChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
  placeholder="Sélectionner la date"
/>
```

**Pourquoi** :
- ✅ Interface cohérente dans toute l'app
- ✅ Meilleure UX (calendrier visuel)
- ✅ Gestion locale FR automatique
- ✅ Validation intégrée

**Exemples d'utilisation** :
- Onboarding employé : dates de contrat
- Création d'absence : dates de début/fin
- Formulaires RH : dates diverses

### 7. Collections MongoDB - Nomenclature avec Préfixe

**RÈGLE** : TOUTES les collections MongoDB par module doivent utiliser un préfixe.

### ❌ Nomenclature par défaut (MAUVAIS)
```typescript
// Sans préfixe - risque de collision et mauvaise organisation
export const Supplier = mongoose.model('Supplier', SupplierSchema)
export const Product = mongoose.model('Product', ProductSchema)
// → Collections : suppliers, products (ambiguë)
```

### ✅ Nomenclature avec préfixe (BON)
```typescript
// Avec préfixe module - organisation claire
export const Supplier = mongoose.model('Supplier', SupplierSchema, 'inventory-suppliers')
export const Product = mongoose.model('Product', ProductSchema, 'inventory-products')
// → Collections : inventory-suppliers, inventory-products (clair)
```

### 📋 Convention de Nommage

**Collections globales** : Pas de préfixe
```
users
sessions
employees
```

**Collections par module** : Préfixe `module-`
```
inventory-suppliers
inventory-products
inventory-entries
inventory-orders
inventory-movements

booking-reservations
booking-payments
booking-promotions

hr-contracts
hr-absences
hr-timesheets
```

### 🎯 Pattern à appliquer

```typescript
// 3ème paramètre = nom de collection explicite
export const Model = mongoose.models.ModelName ||
  mongoose.model<DocumentType>(
    'ModelName',           // Nom du modèle (pour mongoose.models)
    Schema,                // Schema Mongoose
    'module-collection'    // ← Nom explicite de la collection
  )
```

### 🔄 Migration Progressive

**Modules avec préfixe** : ✅
- `inventory-*` (suppliers, products, entries, orders, movements)

**Modules à migrer** : ⏳
- HR (contracts, absences, timesheets)
- Booking (reservations, payments)
- Autres modules

**Migration à faire module par module** pour éviter les régressions.

### ⚠️ Important

- ✅ **TOUJOURS** utiliser préfixe pour nouveaux modules
- ✅ Améliore l'organisation dans MongoDB Compass/Atlas
- ✅ Évite collisions entre modules
- ✅ Facilite backups/restore par module
- ❌ **JAMAIS** créer collection sans préfixe (sauf globales)

---

## 📚 Documentation Détaillée

**Toute la documentation est dans `/docs/`** :

### 🏗️ Architecture & Structure
→ **[ARCHITECTURE.md](./docs/guides/ARCHITECTURE.md)**
- Structure des dossiers
- Organisation des models (pattern modulaire)
- Où placer les fichiers
- Flux de données

### ✅ Conventions de Code
→ **[CONVENTIONS.md](./docs/guides/CONVENTIONS.md)**
- TypeScript strict (zéro `any`)
- Formats dates/heures (strings)
- Taille des fichiers (limites)
- Nommage (fichiers, variables, fonctions)
- Composants réutilisables
- Imports & gestion d'erreurs

### 🔒 Sécurité & Authentification
→ **[SECURITY.md](./docs/guides/SECURITY.md)**
- Pattern `requireAuth()` obligatoire
- Rôles & permissions (dev/admin/staff)
- Distinction rôles système vs métier
- Routes publiques (exceptions)
- Secrets (JAMAIS en dur)
- Checklist sécurité

### 🌐 API Routes
→ **[API_GUIDE.md](./docs/guides/API_GUIDE.md)**
- Structure d'une route API
- Helpers (requireAuth, successResponse, errorResponse)
- Status codes appropriés
- Gestion d'erreurs
- Query params & body parsing
- Routes dynamiques ([id])

### 🎨 Composants React
→ **[COMPONENTS_GUIDE.md](./docs/guides/COMPONENTS_GUIDE.md)**
- Pattern Skeleton Loading (obligatoire)
- Pattern Page d'Index (sections avec sous-menus)
- Structure d'un composant
- Hooks personnalisés
- Checklist composant

### 🔄 Migration depuis /apps/site
→ **[MIGRATION_GUIDE.md](./docs/guides/MIGRATION_GUIDE.md)**
- Philosophie : réécriture, pas copier-coller
- Workflow migration (8 étapes)
- APIs partagées (site public + admin)
- Renommage de models
- Préservation structure models
- Nettoyage assets (SCSS, images)
- Checklist migration complète

### 📦 Types Partagés
→ **[TYPES_GUIDE.md](./docs/guides/TYPES_GUIDE.md)**
- Single Source of Truth (`/types/`)
- Types principaux disponibles (hr, timeEntry, accounting)
- Créer un nouveau type
- Patterns utiles (Extend, Omit, Pick, Generics)
- Conventions nommage
- Type guards & validation

### 🧪 Tests
→ **[TESTING.md](./docs/guides/TESTING.md)**
- Tests manuels obligatoires (checklist)
- Vérifications techniques (TypeScript, build, console)
- Tests par feature (auth, CRUD, UI/UX)
- Tests d'intégration (scénarios)
- Debugging (logs, DevTools, Network)
- Checklist avant commit

### 💡 Questions Fréquentes
→ **[FAQ.md](./docs/guides/FAQ.md)**
- Organisation & structure
- TypeScript & types
- Sécurité & auth
- Dates & heures
- Taille des fichiers
- Composants & UI
- API Routes
- Migration
- Debugging
- Performance
- Secrets

### 📦 Module Inventory
→ **[docs/inventory/](./docs/inventory/)**
- [ARCHITECTURE.md](./docs/inventory/ARCHITECTURE.md) - Structure, flows, relations models
- [USER_GUIDE.md](./docs/inventory/USER_GUIDE.md) - Workflows par module
- [DEV_GUIDE.md](./docs/inventory/DEV_GUIDE.md) - API routes, types, hooks, helpers
- [FAQ.md](./docs/inventory/FAQ.md) - Questions, troubleshooting, patterns
- [PERMISSIONS.md](./docs/inventory/PERMISSIONS.md) - Roles et permissions detaillees

---

## 🎯 Checklist Avant de Coder

**Avant de commencer une feature** :

- [ ] J'ai lu ce CLAUDE.md
- [ ] J'ai consulté la doc pertinente dans `/docs/`
- [ ] Je connais les types à utiliser (`/types/`)
- [ ] Je connais les helpers disponibles (`/lib/api/`)
- [ ] Je sais où placer mes fichiers
- [ ] Je respecterai les limites de lignes (200 max)
- [ ] Je n'utiliserai pas `any`
- [ ] J'utiliserai des strings pour dates/heures
- [ ] Je protégerai mes APIs avec `requireAuth()`
- [ ] Je testerai manuellement avant de commit

---

## 💡 En Cas de Doute

**Questions rapides** :

| Question | Réponse |
|----------|---------|
| Où mettre ce fichier ? | → [ARCHITECTURE.md](./docs/guides/ARCHITECTURE.md) |
| Comment typer ? | → [TYPES_GUIDE.md](./docs/guides/TYPES_GUIDE.md) |
| Cette API doit être protégée ? | → OUI (sauf auth/verify-pin/clock-in/out) |
| 300 lignes c'est grave ? | → OUI, découper ([CONVENTIONS.md](./docs/guides/CONVENTIONS.md)) |
| Date ou string ? | → TOUJOURS string (YYYY-MM-DD, HH:mm) |
| Comment migrer un module ? | → [MIGRATION_GUIDE.md](./docs/guides/MIGRATION_GUIDE.md) |

**Plus de réponses** : [FAQ.md](./docs/guides/FAQ.md)

---

## ✅ Status Actuel

**Version** : 1.1
**Status** : ✅ Production Ready

### Modules Implémentés

- ✅ Auth (NextAuth avec rôles)
- ✅ HR (Employés, Planning, Disponibilités, Onboarding)
- ✅ Pointage (Time tracking, Shifts manuels)
- ✅ Comptabilité (Caisse, CA, PDF)
- ✅ Dashboard (Stats, Navigation)
- ✅ Pages d'erreur (404, 403, 401, 500)
- ✅ Inventory (Fournisseurs, Produits, Inventaires, Commandes, Analytics)

### Qualité

- ✅ Sécurité : 100% routes protégées
- ✅ Types : 0 `any`, types partagés
- ✅ Architecture : Fichiers < 200 lignes
- ✅ Build : Réussi
- ✅ Documentation : Complète

### À Migrer

- [ ] Booking (réservations, calendrier) - 2 jours
- [ ] Messages (chat, notifications) - 3 jours
- [ ] Settings (espaces, horaires) - 1 jour
- [ ] Analytics avancées - 2 jours

**Suivi détaillé** : `/docs/MIGRATION_STATUS.md`

---

## 🚀 Workflow Recommandé

### Nouvelle Feature

```
1. Lire ce CLAUDE.md
2. Consulter docs/ pertinents
3. Analyser code existant (patterns)
4. Créer types → models → APIs → composants
5. Tester manuellement (TESTING.md)
6. Type-check + Build
7. Commit
```

### Migration Module

```
1. Analyser module source (30 min)
2. Classifier APIs (partagée/dashboard/site)
3. Créer types (1h)
4. Créer models (1-2h)
5. Créer APIs (2-3h)
6. Créer composants (3-4h)
7. Créer hooks (1h)
8. Créer pages (2h)
9. Tests manuels (1h)
10. Documentation (30 min)

Total : 1-2 jours/module
```

**Guide complet** : [MIGRATION_GUIDE.md](./docs/guides/MIGRATION_GUIDE.md)

---

## 📖 Liens Rapides

### Documentation
- [ARCHITECTURE.md](./docs/guides/ARCHITECTURE.md) - Structure & organisation
- [CONVENTIONS.md](./docs/guides/CONVENTIONS.md) - Règles de code
- [SECURITY.md](./docs/guides/SECURITY.md) - Auth & sécurité
- [API_GUIDE.md](./docs/guides/API_GUIDE.md) - Patterns API
- [COMPONENTS_GUIDE.md](./docs/guides/COMPONENTS_GUIDE.md) - Composants React
- [MIGRATION_GUIDE.md](./docs/guides/MIGRATION_GUIDE.md) - Migration depuis site
- [TYPES_GUIDE.md](./docs/guides/TYPES_GUIDE.md) - Types partagés
- [TESTING.md](./docs/guides/TESTING.md) - Tests manuels
- [FAQ.md](./docs/guides/FAQ.md) - Questions fréquentes

### Module Inventory
- [ARCHITECTURE.md](./docs/inventory/ARCHITECTURE.md) - Structure et flows
- [USER_GUIDE.md](./docs/inventory/USER_GUIDE.md) - Workflows utilisateur
- [DEV_GUIDE.md](./docs/inventory/DEV_GUIDE.md) - API, types, hooks
- [FAQ.md](./docs/inventory/FAQ.md) - Questions et troubleshooting

### Fichiers Importants
- `/TESTING_CHECKLIST.md` - Checklist tests détaillée
- `/docs/refactoring/REFACTORING_SUMMARY.txt` - Historique refactoring
- `/docs/migration/MIGRATION_STATUS.md` - Suivi des migrations

### Documentation Externe
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 📝 Commandes Utiles

```bash
# Développement
pnpm dev                      # Lancer serveur dev
pnpm type-check               # Vérifier TypeScript
pnpm build                    # Builder l'app

# Tests
pnpm exec tsc --noEmit        # Type check complet

# Base de données (si besoin)
# Voir /docs/ARCHITECTURE.md pour connexion MongoDB
```

---

**Dernière mise à jour** : 2026-02-28
**Auteur** : Thierry + Claude
**Version** : 1.2

---

*Ce fichier est le point d'entrée de la documentation. Consulte `/docs/` pour les guides détaillés ! 🚀*
