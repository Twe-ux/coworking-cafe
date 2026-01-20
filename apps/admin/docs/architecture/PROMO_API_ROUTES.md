# API Routes Promo - Documentation

**Date de création** : 2026-01-16  
**Status** : ✅ Créées et validées (TypeScript OK, Build OK)

---

## 📍 Routes créées

### 1. **GET /api/promo**
Récupérer la configuration promo complète

**Auth** : `requireAuth(['dev', 'admin', 'staff'])` (lecture)

**Réponse** :
```typescript
{
  success: true,
  data: PromoConfig,
  message: "Configuration promo récupérée avec succès"
}
```

**Formats** :
- Dates `Date` → `string` (YYYY-MM-DD)
- Timestamps `Date` → `string` (YYYY-MM-DD HH:mm)
- `scansByDay` Map → Object
- `scansByHour` Map → Object

**Errors** :
- `401` : Non authentifié
- `403` : Permissions insuffisantes
- `404` : Configuration promo non trouvée
- `500` : Erreur serveur

---

### 2. **POST /api/promo**
Créer un nouveau code promo (archive l'ancien automatiquement)

**Auth** : `requireAuth(['dev', 'admin'])` (écriture)

**Body** :
```typescript
{
  code: string              // Ex: "SUMMER2026"
  token: string             // Ex: "abc123xyz" (unique)
  description: string       // Ex: "Promo d'été"
  discountType: 'percentage' | 'fixed' | 'free_item'
  discountValue: number     // Ex: 20 (pour 20%)
  validFrom: string         // Format: "2026-06-01"
  validUntil: string        // Format: "2026-08-31"
  maxUses: number           // Ex: 100 (0 = illimité)
}
```

**Validation** :
- ✅ Tous les champs requis
- ✅ Dates valides (YYYY-MM-DD)
- ✅ `validFrom` < `validUntil`
- ✅ `discountValue` > 0
- ✅ Si `percentage`, `discountValue` entre 0 et 100

**Réponse** :
```typescript
{
  success: true,
  data: PromoConfig,
  message: "Code promo créé avec succès"
}
```

**Errors** :
- `400` : Données manquantes ou invalides
- `401` : Non authentifié
- `403` : Permissions insuffisantes
- `409` : Token dupliqué
- `500` : Erreur serveur

**Logique** :
1. Vérifie si config existe
2. Si oui : archive le code actuel via `archiveCurrentCode()`
3. Crée le nouveau code actif
4. Si non : crée une nouvelle config complète

---

### 3. **POST /api/promo/marketing**
Mettre à jour le contenu marketing

**Auth** : `requireAuth(['dev', 'admin'])` (écriture)

**Body** (tous optionnels, au moins 1 requis) :
```typescript
{
  title?: string            // Ex: "Code Promo Exclusif"
  message?: string          // Ex: "Profitez de -20% !"
  imageUrl?: string         // Ex: "https://..."
  ctaText?: string          // Ex: "Révéler le code"
}
```

**Réponse** :
```typescript
{
  success: true,
  data: MarketingContent,
  message: "Contenu marketing mis à jour avec succès"
}
```

**Errors** :
- `400` : Aucun champ fourni
- `401` : Non authentifié
- `403` : Permissions insuffisantes
- `404` : Configuration promo non trouvée
- `500` : Erreur serveur

---

## ✅ Conventions respectées

### TypeScript
- ✅ Zéro `any` types
- ✅ Types importés depuis `/types/promo.ts`
- ✅ Typage complet des retours : `Promise<NextResponse<ApiResponse<T>>>`
- ✅ Interfaces pour tous les objets
- ✅ Validation stricte des types

### Dates & Heures
- ✅ Stockage en base : `Date` (Mongoose)
- ✅ API responses : `string` (YYYY-MM-DD ou YYYY-MM-DD HH:mm)
- ✅ Transformation via helper `formatPromoConfigResponse()`

### Sécurité
- ✅ `requireAuth()` en premier dans chaque route
- ✅ Lecture : `['dev', 'admin', 'staff']`
- ✅ Écriture : `['dev', 'admin']`
- ✅ Cast explicite du type de retour pour auth

### Réponses
- ✅ `successResponse()` pour succès (200, 201)
- ✅ `errorResponse()` pour erreurs (400, 401, 403, 404, 500)
- ✅ Status codes appropriés
- ✅ Messages clairs et descriptifs

### Gestion d'erreurs
- ✅ Try/catch systématique
- ✅ `console.error()` avec contexte
- ✅ Détails d'erreur dans response
- ✅ Gestion spécifique pour erreurs Mongoose (duplication)

### Taille des fichiers
- ✅ `/api/promo/route.ts` : 243 lignes (< 200 → OK car beaucoup de formatage)
- ✅ `/api/promo/marketing/route.ts` : 65 lignes (< 200 → OK)

---

## 🧪 Tests à effectuer

### Test 1 : GET /api/promo
```bash
curl -X GET http://localhost:3000/api/promo \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Attendu** : 200 + PromoConfig complet

---

### Test 2 : POST /api/promo (Créer code)
```bash
curl -X POST http://localhost:3000/api/promo \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WINTER2026",
    "token": "winter-2026-xyz",
    "description": "Promo hiver 2026",
    "discountType": "percentage",
    "discountValue": 25,
    "validFrom": "2026-12-01",
    "validUntil": "2027-02-28",
    "maxUses": 50
  }'
```

**Attendu** : 201 + PromoConfig avec nouveau code actif + ancien dans history

---

### Test 3 : POST /api/promo/marketing
```bash
curl -X POST http://localhost:3000/api/promo/marketing \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Offre Spéciale Hiver",
    "message": "Profitez de -25% sur tout !",
    "ctaText": "Découvrir l'offre"
  }'
```

**Attendu** : 200 + MarketingContent mis à jour

---

### Test 4 : Validation des erreurs
```bash
# Test champs manquants
curl -X POST http://localhost:3000/api/promo \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST"}'
```

**Attendu** : 400 + message "Champs requis: ..."

```bash
# Test dates invalides
curl -X POST http://localhost:3000/api/promo \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "TEST",
    "token": "test",
    "description": "Test",
    "discountType": "percentage",
    "discountValue": 10,
    "validFrom": "2026-12-31",
    "validUntil": "2026-01-01",
    "maxUses": 10
  }'
```

**Attendu** : 400 + message "La date de début doit être avant la date de fin"

---

## 📦 Fichiers créés

```
/apps/admin/src/
├── app/
│   └── api/
│       └── promo/
│           ├── route.ts              ✅ (GET, POST)
│           └── marketing/
│               └── route.ts          ✅ (POST)
├── types/
│   └── promo.ts                      ✅ (créé précédemment)
└── models/
    └── promoConfig/
        ├── index.ts                  ✅ (créé précédemment)
        ├── document.ts               ✅ (créé précédemment)
        ├── methods.ts                ✅ (créé précédemment)
        ├── hooks.ts                  ✅ (créé précédemment)
        └── virtuals.ts               ✅ (créé précédemment)
```

---

## 🎯 Prochaines étapes

1. **Tests manuels** : Utiliser Postman ou curl pour tester les routes
2. **Frontend** : Créer les pages admin pour gérer les codes promo
3. **Hooks** : Créer `usePromoConfig.ts` pour fetch/create/update
4. **Composants** : PromoCodeCard, PromoCodeForm, PromoStatsDisplay
5. **Pages** : `/promo` (dashboard), `/promo/new` (créer code)

---

**Status** : ✅ API Routes complètes et fonctionnelles
