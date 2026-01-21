# MONITORING.md - Guide de Surveillance

> Documentation pour monitorer l'application admin en production
> **Version** : 1.0
> **Dernière mise à jour** : 2026-01-21

---

## Table des matières

1. [Logs à surveiller](#logs-à-surveiller)
2. [Métriques importantes](#métriques-importantes)
3. [Alertes à configurer](#alertes-à-configurer)
4. [Dashboard de santé](#dashboard-de-santé)

---

## Logs à surveiller

### 1. Logs Vercel

**Accès** : [Vercel Dashboard](https://vercel.com/dashboard) → Projet → Logs

#### Types de logs

**Serverless Functions** (API Routes)

```bash
# Filtrer par niveau
Error    # Erreurs critiques à traiter immédiatement
Warning  # Warnings à surveiller
Info     # Logs informatifs

# Filtrer par endpoint
/api/hr/employees
/api/auth/[...nextauth]
/api/time-entries/clock-in
```

**Exemples de logs importants** :

```bash
# ✅ Normal - Requête réussie
[API] GET /api/hr/employees - 200 OK - 45ms

# ⚠️ Warning - Requête lente
[API] GET /api/hr/employees - 200 OK - 2500ms

# ❌ Erreur - À investiguer
[API Error] GET /api/hr/employees - 500
MongoServerError: Connection timeout
```

#### Patterns d'erreurs à surveiller

**Erreur 1 : MongoDB Connection timeout**

```bash
# Pattern dans les logs
MongoServerError: connection timed out
# ou
MongooseError: buffering timed out after 10000ms

# Action immédiate
1. Vérifier MongoDB Atlas status
2. Vérifier Network Access (IP whitelisting)
3. Vérifier connexions actives (max pool size)
```

**Erreur 2 : NextAuth session errors**

```bash
# Pattern
[next-auth][error][SESSION_ERROR]
# ou
[next-auth][error][JWT_SESSION_ERROR]

# Action immédiate
1. Vérifier NEXTAUTH_SECRET (pas changé)
2. Vérifier NEXTAUTH_URL (correct)
3. Consulter docs/TROUBLESHOOTING.md section NextAuth
```

**Erreur 3 : API Rate limiting**

```bash
# Pattern
Error: Too many requests
# ou
429 Too Many Requests

# Action immédiate
1. Identifier l'endpoint concerné
2. Vérifier si attaque DDoS
3. Ajouter rate limiting si nécessaire
```

---

### 2. Logs MongoDB

**Accès** : [MongoDB Atlas](https://cloud.mongodb.com/) → Cluster → Metrics

#### Logs à surveiller

**Slow Queries** (> 100ms)

```bash
# MongoDB Atlas > Performance Advisor
# → Liste des requêtes lentes

# Exemple
db.employees.find({ email: "test@example.com" }).explain()
# executionTimeMillis: 1500ms ❌ TROP LENT

# Action
1. Créer un index sur le champ filtré
db.employees.createIndex({ email: 1 })

2. Re-tester
# executionTimeMillis: 5ms ✅ OK
```

**Connection Errors**

```bash
# MongoDB Atlas > Logs
# Filtrer: "connection refused" ou "authentication failed"

# Action
1. Vérifier credentials (username/password)
2. Vérifier Network Access (IP whitelisting)
3. Vérifier Database Access (user permissions)
```

---

### 3. Logs Application (Console)

**En développement** :

```typescript
// Utiliser des logs structurés
console.log('[Component] EmployeeList mounted')
console.error('[API Error] Failed to fetch employees:', error)

// Éviter
console.log('test') // ❌ Pas assez descriptif
```

**En production** :

```typescript
// Logs conditionnels (seulement en dev)
if (process.env.NODE_ENV === 'development') {
  console.log('[Debug]', data)
}

// Logs d'erreur (toujours)
console.error('[Critical Error]', {
  endpoint: '/api/hr/employees',
  error: error.message,
  timestamp: new Date().toISOString()
})
```

---

## Métriques importantes

### 1. Performance Vercel

**Accès** : Vercel Dashboard → Analytics

#### Métriques clés

**Time to First Byte (TTFB)**
- **Cible** : < 600ms
- **Alerte si** : > 2000ms
- **Causes** : Requêtes MongoDB lentes, API lourdes

**First Contentful Paint (FCP)**
- **Cible** : < 1.8s
- **Alerte si** : > 3s
- **Causes** : Bundle JS trop gros, images non optimisées

**Largest Contentful Paint (LCP)**
- **Cible** : < 2.5s
- **Alerte si** : > 4s
- **Causes** : Images lourdes, pas de lazy loading

**Cumulative Layout Shift (CLS)**
- **Cible** : < 0.1
- **Alerte si** : > 0.25
- **Causes** : Images sans dimensions, fonts qui chargent tard

---

### 2. Métriques MongoDB

**Accès** : MongoDB Atlas → Metrics

#### Métriques clés

**Connexions actives**
- **Cible** : < 50
- **Max** : 100 (selon tier)
- **Alerte si** : > 80
- **Action** : Optimiser pool size, fermer connexions

**Requêtes par seconde**
- **Normal** : 10-100 req/s
- **Alerte si** : > 500 req/s (pic inhabituel)
- **Action** : Vérifier si attaque, optimiser cache

**Stockage utilisé**
- **Surveiller** : Croissance mensuelle
- **Alerte si** : > 80% du quota
- **Action** : Nettoyer données anciennes, upgrader tier

**Index hit ratio**
- **Cible** : > 95%
- **Alerte si** : < 80%
- **Action** : Créer indexes manquants

---

### 3. Métriques Application

**Users actifs**
- **Source** : NextAuth sessions
- **Requête** :
  ```javascript
  // API: GET /api/stats/active-users
  const activeSessions = await Session.countDocuments({
    expires: { $gte: new Date() }
  })
  ```

**Taux d'erreur API**
- **Cible** : < 1%
- **Calcul** : (Erreurs 5xx / Total requêtes) * 100
- **Alerte si** : > 5%

**Pages les plus visitées**
- **Source** : Vercel Analytics
- **Utilité** : Identifier les features critiques

---

## Alertes à configurer

### 1. Alertes Vercel

**Configuration** : Vercel Dashboard → Settings → Notifications

#### Alertes recommandées

**Build Failed**
- **Déclencheur** : Build échoue
- **Action** : Notification immédiate → Slack/Email
- **Priorité** : 🔴 Critique

**Deployment Failed**
- **Déclencheur** : Déploiement échoue après build
- **Action** : Notification immédiate
- **Priorité** : 🔴 Critique

**High Error Rate**
- **Déclencheur** : > 5% requêtes en erreur (5xx)
- **Action** : Investigation immédiate
- **Priorité** : 🔴 Critique

**Slow Response Time**
- **Déclencheur** : TTFB > 3s pendant > 5 min
- **Action** : Investigation
- **Priorité** : 🟡 Important

---

### 2. Alertes MongoDB Atlas

**Configuration** : MongoDB Atlas → Alerts

#### Alertes recommandées

**Connections > 80%**
- **Déclencheur** : Connexions actives > 80 (sur max 100)
- **Action** : Optimiser pool, fermer connexions
- **Priorité** : 🟡 Important

**Slow Queries Detected**
- **Déclencheur** : Requêtes > 100ms détectées
- **Action** : Créer indexes
- **Priorité** : 🟡 Important

**Storage > 80%**
- **Déclencheur** : Stockage > 80% quota
- **Action** : Nettoyer ou upgrader
- **Priorité** : 🟢 Info

**Replica Set Member Down**
- **Déclencheur** : Un node du cluster est down
- **Action** : MongoDB va auto-recover, surveiller
- **Priorité** : 🟡 Important

---

### 3. Alertes Custom (à implémenter)

**Configuration** : Créer endpoints de monitoring

#### Exemple : Health Check Endpoint

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/mongodb'

export async function GET() {
  try {
    // 1. Check DB connection
    await connectMongoose()

    // 2. Check DB query
    const startTime = Date.now()
    await mongoose.connection.db.admin().ping()
    const dbLatency = Date.now() - startTime

    // 3. Return status
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'up',
          latency: dbLatency
        },
        server: {
          status: 'up',
          uptime: process.uptime()
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
```

**Utilisation avec UptimeRobot** :

1. Créer un monitor sur https://admin.coworkingcafe.fr/api/health
2. Interval : 5 minutes
3. Alert si : Status != 200 ou response.status != 'healthy'

---

### 4. Alertes Email/Slack

**Webhook Slack** :

```typescript
// src/lib/notifications/slack.ts
export async function sendSlackAlert(message: string, severity: 'info' | 'warning' | 'error') {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  const colors = {
    info: '#36a64f',
    warning: '#ff9900',
    error: '#ff0000'
  }

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color: colors[severity],
        title: `[Admin App] ${severity.toUpperCase()}`,
        text: message,
        ts: Math.floor(Date.now() / 1000)
      }]
    })
  })
}

// Utilisation
if (errorRate > 5) {
  await sendSlackAlert(
    `⚠️ High error rate detected: ${errorRate.toFixed(2)}%`,
    'warning'
  )
}
```

---

## Dashboard de santé

### 1. Dashboard Vercel (Built-in)

**Accès** : Vercel Dashboard → Analytics

**Métriques disponibles** :
- ✅ Requests per day/hour
- ✅ Error rate (4xx, 5xx)
- ✅ Response time (p50, p75, p99)
- ✅ Bandwidth usage
- ✅ Build time history

**Limitation** : Données agrégées, pas de détails par endpoint

---

### 2. Dashboard MongoDB Atlas (Built-in)

**Accès** : MongoDB Atlas → Metrics

**Métriques disponibles** :
- ✅ Connexions actives
- ✅ Requêtes par seconde
- ✅ Stockage utilisé
- ✅ Index usage
- ✅ Slow queries

---

### 3. Dashboard Custom (à créer)

**Option A : Page Admin `/admin/monitoring`**

```typescript
// src/app/(dashboard)/(admin)/monitoring/page.tsx
import { connectMongoose } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function MonitoringPage() {
  const session = await getServerSession()
  if (!session || session.user.role.name !== 'dev') {
    redirect('/403')
  }

  // Fetch metrics
  await connectMongoose()

  const metrics = {
    users: {
      total: await User.countDocuments(),
      active: await Session.countDocuments({ expires: { $gte: new Date() } })
    },
    employees: {
      total: await Employee.countDocuments(),
      active: await Employee.countDocuments({ isActive: true })
    },
    timeEntries: {
      today: await TimeEntry.countDocuments({
        date: new Date().toISOString().split('T')[0]
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Monitoring</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Users"
          value={metrics.users.total}
          subtitle={`${metrics.users.active} active sessions`}
        />
        <MetricCard
          title="Employees"
          value={metrics.employees.total}
          subtitle={`${metrics.employees.active} active`}
        />
        <MetricCard
          title="Time Entries Today"
          value={metrics.timeEntries.today}
          subtitle="Clock ins/outs"
        />
      </div>

      {/* Health checks */}
      <HealthChecks />

      {/* Recent errors */}
      <RecentErrors />
    </div>
  )
}
```

**Option B : Grafana + Prometheus (avancé)**

Si besoin de monitoring avancé :

1. Setup Prometheus pour collecter métriques
2. Setup Grafana pour visualiser
3. Exporter métriques depuis l'app

---

### 4. Checklist quotidienne

**Chaque matin (5 min)** :

- [ ] Vérifier Vercel Dashboard
  - [ ] Build status (✅ tous verts)
  - [ ] Error rate < 1%
  - [ ] Response time < 1s (p99)

- [ ] Vérifier MongoDB Atlas
  - [ ] Connexions < 50
  - [ ] Pas de slow queries nouvelles
  - [ ] Stockage OK (< 80%)

- [ ] Vérifier Logs Vercel
  - [ ] Pas d'erreurs critiques dans dernières 24h
  - [ ] Pas de patterns d'erreurs répétés

- [ ] Vérifier Alertes
  - [ ] Slack/Email : Pas d'alertes non résolues

---

### 5. Checklist hebdomadaire

**Chaque lundi (15 min)** :

- [ ] Review métriques semaine passée
  - [ ] Trafic (tendance)
  - [ ] Error rate (pic inhabituel ?)
  - [ ] Performance (dégradation ?)

- [ ] Review MongoDB
  - [ ] Slow queries à optimiser
  - [ ] Index usage (< 95% ? Créer indexes)
  - [ ] Stockage (croissance prévue)

- [ ] Review Logs
  - [ ] Erreurs récurrentes à fixer
  - [ ] Warnings à investiguer

- [ ] Documentation
  - [ ] Mettre à jour BUGS.md si bugs résolus
  - [ ] Mettre à jour TROUBLESHOOTING.md si nouveaux patterns

---

## Scripts de monitoring

### 1. Check DB Connection

```bash
# scripts/check-db.ts
import mongoose from 'mongoose'

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('✅ MongoDB connected')

    const ping = await mongoose.connection.db.admin().ping()
    console.log('✅ MongoDB ping:', ping)

    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('✅ Collections:', collections.map(c => c.name))

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('❌ MongoDB error:', error)
    process.exit(1)
  }
}

checkDB()
```

**Exécution** :

```bash
pnpm tsx scripts/check-db.ts
```

---

### 2. Check API Endpoints

```bash
# scripts/check-api.ts
const endpoints = [
  '/api/health',
  '/api/hr/employees',
  '/api/time-entries',
]

async function checkAPI() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

  for (const endpoint of endpoints) {
    try {
      const start = Date.now()
      const response = await fetch(`${baseUrl}${endpoint}`)
      const duration = Date.now() - start

      console.log(`${endpoint}: ${response.status} (${duration}ms)`)
    } catch (error) {
      console.error(`${endpoint}: ❌ ${error.message}`)
    }
  }
}

checkAPI()
```

---

### 3. Cron Job (Monitoring automatique)

**Option A : Vercel Cron**

```javascript
// src/app/api/cron/monitoring/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Vérifier authorization header (Vercel Cron secret)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Run health checks
  const checks = await runHealthChecks()

  // Send alerts if needed
  if (checks.some(c => !c.healthy)) {
    await sendSlackAlert('⚠️ Health check failed', 'error')
  }

  return NextResponse.json({ checks })
}
```

**Configuration** : `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/monitoring",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Outils recommandés

### Monitoring

- **[UptimeRobot](https://uptimerobot.com/)** - Uptime monitoring (free)
- **[Sentry](https://sentry.io/)** - Error tracking (free tier)
- **[Grafana Cloud](https://grafana.com/)** - Dashboards avancés

### Logs

- **[LogRocket](https://logrocket.com/)** - Session replay + logs
- **[BetterStack](https://betterstack.com/)** - Log management

### Performance

- **[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)** - Performance tracking
- **[WebPageTest](https://www.webpagetest.org/)** - Performance audit

---

## Checklist finale monitoring

**Configuration minimale en production** :

- [ ] Vercel notifications activées (build/deploy errors)
- [ ] MongoDB Atlas alerts configurées (connections, storage)
- [ ] Health check endpoint créé (`/api/health`)
- [ ] UptimeRobot configuré (ping toutes les 5 min)
- [ ] Slack webhook configuré pour alertes critiques
- [ ] Dashboard monitoring accessible (`/admin/monitoring`)
- [ ] Scripts de check DB/API créés
- [ ] Documentation monitoring lue par l'équipe

---

## Ressources

- **Vercel Analytics** : https://vercel.com/docs/analytics
- **MongoDB Monitoring** : https://www.mongodb.com/docs/atlas/monitoring-alerts/
- **Next.js Monitoring** : https://nextjs.org/docs/advanced-features/measuring-performance
- **Guide TROUBLESHOOTING** : [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

_Documentation maintenue par l'équipe CoworKing Cafe_
