# 🔒 Système de Sécurité Interface Staff

**Date**: 18 janvier 2026
**Version**: 1.0
**Status**: ✅ Implémenté

---

## 📋 Vue d'Ensemble

L'interface staff (pointage employés) est **publique** mais sécurisée avec 3 couches de protection :

1. **IP Whitelist** (optionnelle)
2. **Rate Limiting** (obligatoire)
3. **Logging & Monitoring** (obligatoire)

---

## 🏗️ Architecture

### Routes Publiques Sécurisées
```
✅ /staff/clocking                     → Interface de pointage
✅ /api/hr/employees?status=active      → Liste employés actifs
✅ /api/hr/employees/verify-pin         → Vérification PIN
✅ /api/time-entries/clock-in           → Pointage entrée
✅ /api/time-entries/clock-out          → Pointage sortie
```

### Routes Protégées (NextAuth)
```
🔒 /admin/*                             → Dashboard admin
🔒 Toutes les autres APIs
```

---

## 🔒 Sécurité 1: IP Whitelist (Optionnelle)

### Configuration

```env
# .env.local

# Laisser vide = accès depuis toutes IPs (avec rate limiting)
STAFF_ALLOWED_IPS=

# OU définir les IPs autorisées (séparées par virgules)
STAFF_ALLOWED_IPS=192.168.1.10,82.65.123.45
```

### Exemples d'Usage

**Cas 1 : Café avec poste fixe uniquement**
```env
STAFF_ALLOWED_IPS=192.168.1.10
```
→ Seul le poste de pointage du café peut accéder

**Cas 2 : Poste café + IP fixe commerce**
```env
STAFF_ALLOWED_IPS=192.168.1.10,82.65.123.45
```
→ Poste café + accès depuis l'IP du commerce

**Cas 3 : Accès flexible (recommandé au début)**
```env
STAFF_ALLOWED_IPS=
```
→ Accès depuis n'importe où (avec rate limiting strict)

### Détection d'IP

Le système détecte automatiquement l'IP réelle même derrière un proxy (Northflank, Vercel, etc.) en vérifiant ces headers :
- `x-real-ip`
- `x-forwarded-for`
- `cf-connecting-ip` (Cloudflare)
- Et autres...

---

## 🔒 Sécurité 2: Rate Limiting

### Limites Configurables

```env
# .env.local

# Nombre max de tentatives PIN par minute (par IP)
MAX_PIN_ATTEMPTS_PER_MINUTE=5

# Durée de blocage après échecs répétés (en minutes)
PIN_LOCKOUT_DURATION_MINUTES=15
```

### Règles

| Type | Limite | Durée Fenêtre | Blocage |
|------|--------|---------------|---------|
| **Par IP** | 5 tentatives | 1 minute | 15 minutes |
| **Par employé** | 10 tentatives | 1 minute | 15 minutes |

### Comportement

1. **Tentative 1-5** : Autorisées
2. **Tentative 6+** : Bloquée avec message "Trop de tentatives. Réessayez plus tard."
3. **Après 15 min** : Compteur réinitialisé automatiquement
4. **PIN correct** : Compteur réinitialisé immédiatement

### Codes HTTP

| Code | Raison |
|------|--------|
| `200` | PIN valide ✅ |
| `401` | PIN incorrect ❌ |
| `403` | IP non autorisée 🚫 |
| `429` | Rate limit dépassé ⏱️ |

---

## 🔒 Sécurité 3: Logging & Monitoring

### Logs Automatiques

Chaque tentative de PIN est enregistrée avec :
- ✅ Timestamp
- ✅ IP du client
- ✅ ID + nom employé
- ✅ Succès/échec
- ✅ Action (verify, clock-in, clock-out)
- ✅ Raison d'échec
- ✅ User-Agent

### Alertes de Sécurité

Le système détecte automatiquement :

**🚨 Alerte 1 : Bruteforce Employé**
```
5+ tentatives échouées consécutives pour un employé
→ Log console + TODO: notification email/Slack
```

**🚨 Alerte 2 : Scan d'Employés**
```
Une IP tente d'accéder à 5+ employés différents
→ Log console + TODO: blocage IP automatique
```

### Consultation des Logs

```typescript
import { getRecentPINLogs, getPINStats } from '@/lib/security/pin-logger'

// Dernières tentatives
const logs = getRecentPINLogs(100)

// Statistiques
const stats = getPINStats()
// {
//   total: 1234,
//   successful: 1100,
//   failed: 134,
//   last24h: 45,
//   topIPs: [...]
// }
```

### Nettoyage Automatique

- Logs conservés : **7 jours**
- Nettoyage automatique : **quotidien**
- Rate limit entries : **24 heures**

---

## 📝 Logs Console

### Format

```bash
# Succès
✅ [PIN VERIFY] Jean Dupont | IP: 192.168.1.10

# Échec
❌ [PIN VERIFY FAILED] Marie Martin | IP: 82.65.123.45 | Reason: PIN incorrect

# Alerte
🚨 [ALERTE SÉCURITÉ] 5+ tentatives PIN échouées pour employé 65a1b2c3d4e5f6g7h8i9j0k1 depuis IP 10.0.0.100
```

---

## 🛠️ Maintenance

### Activer IP Whitelist (Production)

1. Obtenir l'IP fixe du poste de pointage du café
2. (Optionnel) Obtenir l'IP du commerce
3. Modifier `.env.local` sur Northflank :
   ```env
   STAFF_ALLOWED_IPS=192.168.1.10,82.65.123.45
   ```
4. Redémarrer l'app
5. Tester depuis le poste autorisé ✅
6. Tester depuis une autre IP → Doit être bloqué ❌

### Débloquer une IP/Employé

Si un employé est bloqué par erreur :

**Option 1 : Attendre**
- Le blocage expire automatiquement après 15 minutes

**Option 2 : Redémarrage**
- Redémarrer l'app vide le cache mémoire

**Option 3 : Code (TODO)**
```typescript
import { resetAttempts } from '@/lib/security/rate-limiter'

// Débloquer IP
resetAttempts('192.168.1.10')

// Débloquer employé
resetAttempts('192.168.1.10', 'employeeId123')
```

### Monitoring Recommandé

**TODO : Intégrer avec** :
- [ ] Sentry (error tracking)
- [ ] LogFlare / Datadog (logs centralisés)
- [ ] Slack webhook (alertes sécurité)
- [ ] Email notifications (échecs répétés)

---

## ⚙️ Configuration Recommandée

### Développement Local
```env
STAFF_ALLOWED_IPS=
MAX_PIN_ATTEMPTS_PER_MINUTE=10
PIN_LOCKOUT_DURATION_MINUTES=5
```

### Staging
```env
STAFF_ALLOWED_IPS=
MAX_PIN_ATTEMPTS_PER_MINUTE=5
PIN_LOCKOUT_DURATION_MINUTES=10
```

### Production
```env
# Définir les IPs une fois identifiées
STAFF_ALLOWED_IPS=192.168.1.10,82.65.123.45
MAX_PIN_ATTEMPTS_PER_MINUTE=5
PIN_LOCKOUT_DURATION_MINUTES=15
```

---

## 🧪 Tests

### Tester Rate Limiting

```bash
# Faire 6 tentatives rapides avec mauvais PIN
curl -X POST http://localhost:3001/api/hr/employees/verify-pin \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"123","pin":"9999"}'

# 6ème requête doit retourner 429 (Too Many Requests)
```

### Tester IP Whitelist

```bash
# 1. Définir STAFF_ALLOWED_IPS=127.0.0.1
# 2. Tester depuis localhost → ✅ OK
# 3. Tester depuis autre IP → ❌ 403
```

---

## ⚠️ Limitations Actuelles

### Stockage en Mémoire

⚠️ **Important** : Les logs et rate limits sont stockés **en mémoire**.

**Conséquences** :
- ❌ Perdus au redémarrage de l'app
- ❌ Ne fonctionnent pas avec plusieurs instances (scaling horizontal)

**Solution pour Production** :
- [ ] Migrer vers **Redis** pour rate limiting
- [ ] Migrer vers **PostgreSQL/MongoDB** pour logs

### Rate Limiting Multi-Instance

Si l'app tourne sur plusieurs serveurs (Northflank auto-scaling), le rate limiting ne sera pas partagé entre instances.

**Solution** : Utiliser **Redis** comme cache partagé.

---

## 📚 Ressources

- Code rate limiter : `/src/lib/security/rate-limiter.ts`
- Code IP whitelist : `/src/lib/security/ip-whitelist.ts`
- Code logger : `/src/lib/security/pin-logger.ts`
- Routes sécurisées :
  - `/src/app/api/hr/employees/verify-pin/route.ts`
  - `/src/app/api/time-entries/clock-in/route.ts` (TODO)
  - `/src/app/api/time-entries/clock-out/route.ts` (TODO)

---

**Dernière mise à jour** : 18 janvier 2026
**Auteur** : Claude + Thierry
