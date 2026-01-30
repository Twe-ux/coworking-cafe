# Sécurité IP - Admin Dashboard

## 🎯 Logique de Protection

### Structure des Routes

```
apps/admin/src/app/
│
├── (dashboard)/              ← 🔒 PROTÉGÉ PAR IP
│   ├── page.tsx              (/)
│   ├── clocking/             (/clocking)
│   ├── my-schedule/          (/my-schedule)
│   └── produits/             (/produits)
│
└── admin/                    ← 🔐 PROTÉGÉ PAR AUTH (dev/admin)
    ├── hr/                   (/admin/hr)
    ├── accounting/           (/admin/accounting)
    ├── blog/                 (/admin/blog)
    ├── messages/             (/admin/messages)
    └── ...
```

### Règles d'Accès

| Route | IP autorisée | IP non autorisée |
|-------|--------------|------------------|
| **`/` (dashboard home)** | ✅ Accès OK | ❌ Redirect `/403` |
| **`/clocking`** | ✅ Accès OK | ❌ Redirect `/403` |
| **`/my-schedule`** | ✅ Accès OK | ❌ Redirect `/403` |
| **`/produits`** | ✅ Accès OK | ❌ Redirect `/403` |
| **`/admin/*`** | ✅ Accès OK (si auth dev/admin) | ✅ Accès OK (si auth dev/admin) |

---

## ⚙️ Configuration

### Variable d'Environnement

```bash
# .env.local ou Vercel
ALLOWED_STAFF_IPS=
```

### Format Supporté

#### 1. IP Unique

```bash
ALLOWED_STAFF_IPS=192.168.1.100
```

#### 2. Plusieurs IPs (séparées par virgules)

```bash
ALLOWED_STAFF_IPS=192.168.1.100,192.168.1.101,10.0.0.50
```

#### 3. Range CIDR

```bash
# Toutes les IPs de 192.168.1.0 à 192.168.1.255
ALLOWED_STAFF_IPS=192.168.1.0/24

# Toutes les IPs de 10.0.0.0 à 10.0.0.255
ALLOWED_STAFF_IPS=10.0.0.0/24
```

#### 4. Combinaison (IP + Range)

```bash
ALLOWED_STAFF_IPS=192.168.1.100,10.0.0.0/24,172.16.0.50
```

#### 5. Désactivé (développement)

```bash
# Vide = Protection IP désactivée
ALLOWED_STAFF_IPS=
```

⚠️ **En local, les IPs locales sont toujours autorisées** :
- `127.0.0.1`
- `::1`
- `localhost`
- `::ffff:127.0.0.1`

---

## 🧪 Tests

### 1. Tester avec IP Autorisée

**Scénario** : Accéder à `/clocking` depuis IP autorisée

```bash
# .env.local
ALLOWED_STAFF_IPS=192.168.1.100

# Depuis navigateur à 192.168.1.100
# → Accès autorisé ✅
```

**Logs attendus** :
```
[IP CHECK] ✅ IP autorisée: 192.168.1.100 → /clocking
```

### 2. Tester avec IP Non Autorisée

**Scénario** : Accéder à `/clocking` depuis IP non autorisée

```bash
# .env.local
ALLOWED_STAFF_IPS=192.168.1.100

# Depuis navigateur à 192.168.1.200 (différente)
# → Redirect vers /403 ❌
```

**Logs attendus** :
```
[IP CHECK] ❌ IP refusée: 192.168.1.200 → /clocking (IPs autorisées: 192.168.1.100)
```

### 3. Tester /admin (Pas de Vérification IP)

**Scénario** : Accéder à `/admin/hr` depuis n'importe quelle IP

```bash
# N'importe quelle IP
# → Vérifie seulement l'auth (dev/admin) ✅
# → Pas de vérification IP
```

---

## 🔍 Comment Connaître Ton IP ?

### En Production (Vercel)

1. **Créer une API route de test** :

```typescript
// apps/admin/src/app/api/my-ip/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = forwardedFor?.split(',')[0].trim() || realIP || 'unknown';

  return NextResponse.json({ ip: clientIP });
}
```

2. **Accéder à** : `https://admin.coworkingcafe.fr/api/my-ip`

3. **Résultat** :
```json
{ "ip": "203.0.113.45" }
```

4. **Ajouter cette IP** dans Vercel :
```bash
ALLOWED_STAFF_IPS=203.0.113.45
```

### En Local

```bash
# macOS/Linux
curl ifconfig.me

# Windows
curl ifconfig.me
```

---

## 📋 Configuration Production (Vercel)

### Étape 1 : Identifier les IPs Autorisées

- IP du café (box internet)
- IP de ton domicile (si télétravail)
- IP VPN (si utilisé)

### Étape 2 : Ajouter sur Vercel

1. Aller sur Vercel → Project admin → Settings → Environment Variables
2. Ajouter :
   ```
   Name: ALLOWED_STAFF_IPS
   Value: 203.0.113.45,203.0.113.46
   Environment: Production
   ```
3. Save
4. Redeploy

### Étape 3 : Tester

1. Accéder à `https://admin.coworkingcafe.fr/clocking` depuis IP autorisée → ✅ OK
2. Accéder à `https://admin.coworkingcafe.fr/clocking` depuis IP non autorisée → ❌ Redirect /403
3. Accéder à `https://admin.coworkingcafe.fr/admin/hr` depuis n'importe quelle IP → ✅ OK (si auth)

---

## 🐛 Troubleshooting

### Problème : Toujours redirect vers /403

**Cause 1** : IP mal configurée

```bash
# ❌ MAUVAIS (avec espaces)
ALLOWED_STAFF_IPS=192.168.1.100, 192.168.1.101

# ✅ BON (sans espaces)
ALLOWED_STAFF_IPS=192.168.1.100,192.168.1.101
```

**Cause 2** : IP dynamique (change régulièrement)

**Solution** : Utiliser un range CIDR
```bash
# Au lieu de 192.168.1.100 (qui peut changer)
ALLOWED_STAFF_IPS=192.168.1.0/24
```

**Cause 3** : IP derrière proxy/VPN

**Solution** : Vérifier l'IP réelle avec `/api/my-ip`

### Problème : Logs ne s'affichent pas

**Vercel** : Aller dans Deployments → Latest → Functions → Logs

### Problème : Veux désactiver temporairement

```bash
# Vider la variable
ALLOWED_STAFF_IPS=

# Ou la supprimer complètement de Vercel
```

---

## 🔐 Sécurité Avancée

### IP Fixe Recommandée

Pour la production, demander à ton FAI une **IP fixe** pour :
- Le café (connexion principale)
- VPN entreprise (si besoin accès distant)

### Multi-Couches

```
┌─────────────────────────────────────┐
│  1. IP Check (middleware)           │  ← /(dashboard)
├─────────────────────────────────────┤
│  2. NextAuth (session)              │  ← /admin
├─────────────────────────────────────┤
│  3. Role Check (dev/admin/staff)    │  ← APIs
└─────────────────────────────────────┘
```

### Logs de Sécurité

Tous les accès refusés sont loggés :
```
[IP CHECK] ❌ IP refusée: 203.0.113.99 → /clocking
```

→ Surveiller ces logs dans Vercel pour détecter tentatives d'accès.

---

## ✅ Checklist Déploiement

Avant de déployer en production :

- [ ] Identifier les IPs autorisées (café + remote si besoin)
- [ ] Tester avec `/api/my-ip` pour confirmer les IPs
- [ ] Configurer `ALLOWED_STAFF_IPS` sur Vercel
- [ ] Tester accès depuis IP autorisée → ✅ OK
- [ ] Tester accès depuis IP non autorisée → ❌ /403
- [ ] Vérifier que `/admin` fonctionne sans IP check
- [ ] Surveiller les logs Vercel pour tentatives d'accès

---

**Dernière mise à jour** : 2026-01-30
