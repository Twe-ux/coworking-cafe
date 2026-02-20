# MongoDB Connections - Optimisation Vercel

Guide pour comprendre et optimiser les connexions MongoDB en production sur Vercel.

---

## 🔍 Problème : Pics de Connexions

### Symptômes
- Pics de connexions MongoDB en prod
- Personne connecté sur Vercel Dashboard
- Messages d'erreur "Too many connections"
- Timeouts sporadiques

### Causes Identifiées

#### 1. Vercel Serverless Architecture
```
Next.js sur Vercel = Serverless Functions
→ Chaque route API = 1 fonction indépendante
→ 181 routes API = 181 fonctions potentielles
→ Cold start = nouvelle connexion MongoDB
```

**Cycle de vie d'une fonction** :
```
Requête → Cold Start → Connexion DB → Exécution → Idle → Sleep (5-10min) → Destruction
         ↑
         Crée une nouvelle connexion à chaque fois !
```

#### 2. Cron Jobs Simultanés
```
apps/site/vercel.json :
- 10:00 UTC : /api/cron/send-reminders
- 19:00 UTC : /api/cron/daily-report

Chaque cron peut déclencher plusieurs API calls
→ Plusieurs fonctions démarrent simultanément
→ Pic de connexions
```

#### 3. Bots & Crawlers
```
Google Bot, Bing, Facebook, LinkedIn, etc.
→ Scannent le site 24/7
→ Déclenchent des cold starts fréquents
→ Pics de connexions aléatoires
```

#### 4. MongoDB M0 (Free Tier) Limits
```
Limites du cluster gratuit MongoDB Atlas :
- 500 connexions max simultanées
- Performance dégradée > 100 connexions
- Partage de ressources avec d'autres apps
```

---

## ✅ Solutions Appliquées

### 1. Augmentation du Pool Size ✅

**Avant** :
```typescript
maxPoolSize: 5  // TROP PETIT pour Vercel !
maxConnecting: 2
```

**Après** :
```typescript
maxPoolSize: 10      // Augmenté pour serverless
minPoolSize: 2       // Maintenir connexions de base
maxConnecting: 5     // Plus de connexions simultanées
maxIdleTimeMS: 60000 // Fermer connexions inactives après 1min
```

**Fichiers modifiés** :
- `packages/database/src/lib/mongodb.ts`
- `apps/admin/src/lib/mongodb.ts`

**Impact** :
- Moins de création/destruction de connexions
- Meilleure réutilisation du pool
- Réduction des timeouts

---

## 🚀 Optimisations Recommandées

### 2. Connection Warming (À Implémenter)

**Problème** : Cold starts créent de nouvelles connexions

**Solution** : Réchauffer les connexions avant qu'elles ne dorment

```typescript
// apps/site/src/app/api/cron/warm-connections/route.ts
export async function GET() {
  const { connectDB } = await import('@/lib/db');
  await connectDB();
  return Response.json({ status: 'warmed' });
}
```

**Ajouter dans vercel.json** :
```json
{
  "crons": [
    {
      "path": "/api/cron/warm-connections",
      "schedule": "*/5 * * * *"  // Toutes les 5 minutes
    }
  ]
}
```

**Avantages** :
- Maintient les connexions actives
- Évite les cold starts
- Réduit les pics

**Inconvénients** :
- Coût : ~8,640 exécutions/mois (gratuit jusqu'à 100k/mois sur Vercel)

### 3. Migrer vers MongoDB M2+ (Recommandé pour PROD)

**M0 (Gratuit)** :
- 500 connexions max
- RAM partagée
- Performances limitées

**M2 (9$/mois)** :
- 1,500 connexions max
- 2 GB RAM dédiée
- Meilleures performances

**M10 (57$/mois)** :
- 4,500 connexions max
- 10 GB RAM
- Auto-scaling

**Calculateur** : https://www.mongodb.com/pricing

### 4. Monitoring Connexions

**MongoDB Atlas Dashboard** :
```
Metrics → Connections
→ Voir pics en temps réel
→ Identifier les patterns
```

**Vercel Logs** :
```bash
vercel logs --prod
→ Filtrer par "MongoDB"
→ Identifier les cold starts
```

**Ajouter Logging Custom** :
```typescript
// packages/database/src/lib/mongodb.ts
console.log('[MongoDB] New connection created', {
  timestamp: new Date().toISOString(),
  poolSize: mongoose.connection.getMaxListeners(),
});
```

### 5. Optimiser les Cron Jobs

**Avant** :
```
10:00 UTC : send-reminders (peut déclencher 50+ API calls)
19:00 UTC : daily-report   (peut déclencher 30+ API calls)
```

**Optimisation** :
```typescript
// Grouper les opérations dans un seul endpoint
// Au lieu de 50 API calls, faire 1 seul avec batch processing
```

**Exemple** :
```typescript
// ❌ MAUVAIS - 50 API calls
for (const booking of bookings) {
  await fetch(`/api/send-email/${booking.id}`);
}

// ✅ BON - 1 API call avec batch
await fetch('/api/send-emails-batch', {
  body: JSON.stringify({ bookingIds: bookings.map(b => b.id) })
});
```

### 6. Rate Limiting pour Bots

**Problème** : Bots peuvent déclencher des centaines de requêtes/minute

**Solution** : Rate limiting avec Vercel Edge Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const RATE_LIMIT = 60; // 60 requêtes/minute
const rateLimitMap = new Map<string, number[]>();

export function middleware(request: NextRequest) {
  const ip = request.ip || 'anonymous';
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Garder uniquement les timestamps de la dernière minute
  const recentTimestamps = timestamps.filter(t => now - t < 60000);

  if (recentTimestamps.length >= RATE_LIMIT) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);

  return NextResponse.next();
}
```

---

## 📊 Comparaison Configurations

| Paramètre | Avant | Après | Impact |
|-----------|-------|-------|--------|
| maxPoolSize | 5 | 10 | +100% capacité |
| minPoolSize | 0/1 | 2 | Connexions toujours prêtes |
| maxConnecting | 2 | 5 | +150% simultanées |
| maxIdleTimeMS | 30s | 60s | Moins de reconnexions |

---

## 🧪 Tester les Optimisations

### En Local
```bash
# Surveiller les connexions
watch -n 1 'mongo --eval "db.serverStatus().connections"'
```

### En Production
```bash
# MongoDB Atlas Dashboard
→ Metrics → Connections
→ Observer pendant 24h après déploiement
```

### Load Testing
```bash
# Installer k6
brew install k6

# Tester
k6 run load-test.js
```

**load-test.js** :
```javascript
import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 50, // 50 utilisateurs virtuels
  duration: '60s',
};

export default function() {
  http.get('https://coworkingcafe.fr/api/booking/spaces');
  sleep(1);
}
```

---

## 🎯 Plan d'Action Recommandé

### Phase 1 : Immédiate ✅
- [x] Augmenter pool size (5 → 10)
- [x] Ajouter minPoolSize (2)
- [x] Ajuster timeouts

### Phase 2 : Court terme (cette semaine)
- [ ] Ajouter monitoring/logging connexions
- [ ] Observer patterns pendant 3-5 jours
- [ ] Identifier pics anormaux

### Phase 3 : Moyen terme (ce mois)
- [ ] Implémenter connection warming (cron /5min)
- [ ] Optimiser cron jobs (batch processing)
- [ ] Ajouter rate limiting bots

### Phase 4 : Long terme (si nécessaire)
- [ ] Migrer vers MongoDB M2+ si pics persistent
- [ ] Considérer Redis pour caching
- [ ] Analyser migration vers Vercel Edge Functions

---

## 📚 Ressources

- [MongoDB Connection Pooling Best Practices](https://www.mongodb.com/docs/manual/administration/connection-pool-overview/)
- [Vercel Serverless Functions Limits](https://vercel.com/docs/functions/serverless-functions/limits)
- [Next.js MongoDB Connection](https://github.com/vercel/next.js/tree/canary/examples/with-mongodb)
- [MongoDB Atlas Pricing](https://www.mongodb.com/pricing)

---

**Dernière mise à jour** : 2026-02-20
**Auteur** : Thierry + Claude
