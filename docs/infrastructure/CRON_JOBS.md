# Cron Jobs - Tâches Planifiées Vercel

> **Plateforme** : Vercel Cron Jobs
> **Configuration** : `apps/site/vercel.json`

---

## 📋 Liste des Cron Jobs Actifs

| Cron Job | Schedule | Endpoint | Description |
|----------|----------|----------|-------------|
| **Send Reminders** | `0 10 * * *` (10h00) | `/api/cron/send-reminders` | Rappels 24h avant réservation |
| **Check Attendance** | `0 10 * * *` (10h00) | `/api/cron/check-attendance` | Traitement des no-shows (J-1) |
| **Daily Report** | `0 19 * * *` (19h00) | `/api/cron/daily-report` | Rapport quotidien admin |

⚠️ **Note** : Les horaires sont **fixes** et configurés dans `vercel.json`. Ils ne peuvent pas être modifiés dynamiquement via l'interface admin.

---

## ⚙️ Configuration Vercel

### 1. Fichier `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/check-attendance",
      "schedule": "0 10 * * *"
    },
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 19 * * *"
    }
  ]
}
```

### 2. Variables d'Environnement Vercel

**Project Settings → Environment Variables** :

```env
CRON_SECRET=your-secure-random-secret
```

⚠️ **Important** : Vercel ajoute automatiquement le header `Authorization: Bearer ${CRON_SECRET}` à chaque requête cron.

---

## 🔒 Sécurité

Chaque endpoint vérifie le header d'autorisation :

```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## 📊 Monitoring

### Dashboard Vercel

1. Aller sur **Vercel Dashboard**
2. Sélectionner le projet
3. Onglet **Cron Jobs**
4. Voir les exécutions, logs, et erreurs

### Logs

Chaque cron job log son exécution :

```typescript
logger.info("Cron job completed", {
  component: "Cron /send-reminders",
  data: { sent: 5, failed: 0 }
});
```

---

## 🚀 Déploiement

Les cron jobs sont automatiquement déployés avec l'application :

```bash
# Push sur main
git push origin main

# Vercel déploie automatiquement
# Les cron jobs sont activés après déploiement
```

---

## ❌ Cron Jobs Obsolètes

| Cron Job | Raison | Statut |
|----------|--------|--------|
| `create-holds` | Remplacé par capture automatique Stripe (90 jours) | ❌ Supprimé |
| `capture-deposits` | Remplacé par capture automatique Stripe (90 jours) | ❌ Supprimé |

**Fichiers conservés pour référence** :
- `/api/cron/create-holds/route.ts` (code désactivé)
- `/api/cron/capture-deposits/route.ts` (code désactivé)

---

## 🆕 Ajouter un Nouveau Cron Job

### Étape 1 : Créer l'endpoint API

```typescript
// apps/site/src/app/api/cron/mon-job/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // Vérification sécurité
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Logique du cron job
    logger.info("Mon job started");

    // ... votre code ...

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Mon job failed", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Étape 2 : Ajouter dans `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/mon-job",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Étape 3 : Tester localement

```bash
# Tester l'endpoint
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  http://localhost:3000/api/cron/mon-job
```

### Étape 4 : Déployer

```bash
git add .
git commit -m "feat: add mon-job cron"
git push origin main
```

---

## 📖 Ressources

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru/)

---

**Dernière mise à jour** : 2026-02-07
