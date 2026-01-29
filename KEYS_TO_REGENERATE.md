# 🔐 CLÉS API À RÉGÉNÉRER AVANT DÉPLOIEMENT

**Date**: 2026-01-29  
**Status**: ⚠️ CRITIQUETOUS LES SECRETS ACTUELS SONT COMPROMIS

⚠️ **URGENT**: Toutes les clés API listées ci-dessous ont été exposées dans le code et DOIVENT être régénérées immédiatement avant tout déploiement en production.

---

## 📋 CHECKLIST COMPLÈTE

### 1. MongoDB 🗄️

**Pourquoi régénérer?** Password exposé dans .env.local (compromis)

**Actions requises**:
- [ ] Créer un nouveau user MongoDB pour la production
- [ ] Générer un nouveau password fort (min 32 caractères)
- [ ] Restreindre les permissions (read/write sur DB uniquement)
- [ ] Créer des users séparés pour `site` et `admin`

**Où configurer**:
```bash
# apps/site/.env.local
MONGODB_URI=mongodb+srv://<PROD_USER>:<PASSWORD>@your-cluster.mongodb.net/coworking-site

# apps/admin/.env.local
MONGODB_URI=mongodb+srv://<PROD_USER>:<PASSWORD>@your-cluster.mongodb.net/coworking-admin
```

**Commandes**:
```bash
# Dans MongoDB Atlas
1. Security > Database Access
2. Créer nouveau user
3. Générer password fort
4. Limiter permissions à la DB spécifique
```

---

### 2. NextAuth Secret 🔑

**Pourquoi régénérer?** Secret exposé dans .env.local (compromis)

**Actions requises**:
- [ ] Générer nouveaux secrets pour site et admin (différents)
- [ ] Minimum 32 caractères chacun

**Commandes**:
```bash
# Générer 2 secrets différents
openssl rand -base64 32
# Copier dans apps/site/.env.local → NEXTAUTH_SECRET

openssl rand -base64 32
# Copier dans apps/admin/.env.local → NEXTAUTH_SECRET
```

**Où configurer**:
```bash
# apps/site/.env.local
NEXTAUTH_SECRET=<nouveau_secret_site>

# apps/admin/.env.local  
NEXTAUTH_SECRET=<nouveau_secret_admin>
```

---

### 3. Stripe 💳

**Pourquoi régénérer?** Clés test exposées (OK en dev, mais régénérer webhook secret)

**Actions requises**:
- [ ] Régénérer le webhook secret (actuellement `whsec_...` placeholder)
- [ ] Créer webhooks séparés pour site et admin
- [ ] Configurer les endpoints webhook en production
- [ ] ⚠️ NE PAS passer en mode LIVE avant tests complets

**Pour le SITE**:
```bash
# 1. Dashboard Stripe > Webhooks
# 2. Create endpoint: https://site.yourdomain.com/api/stripe/webhook
# 3. Events à écouter:
#    - payment_intent.succeeded
#    - payment_intent.payment_failed
#    - charge.refunded
# 4. Copier le webhook signing secret

# apps/site/.env.local
STRIPE_WEBHOOK_SECRET=whsec_NOUVEAU_SECRET_SITE
```

**Pour l'ADMIN**:
```bash
# 1. Dashboard Stripe > Webhooks
# 2. Create endpoint: https://admin.yourdomain.com/api/stripe/webhook
# 3. Copier le webhook signing secret

# apps/admin/.env.local
STRIPE_WEBHOOK_SECRET=whsec_NOUVEAU_SECRET_ADMIN
```

**Test avec Stripe CLI** (avant production):
```bash
# Site
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Admin
stripe listen --forward-to http://localhost:3001/api/stripe/webhook
```

---

### 4. Resend (Email) 📧

**Pourquoi régénérer?** Clé API exposée dans .env.local (compromise)

**Actions requises**:
- [ ] Régénérer clé API Resend
- [ ] Configurer domaine professionnel (SPF, DKIM)
- [ ] Changer email FROM (pas onboarding@resend.dev)

**Commandes**:
```bash
# 1. https://resend.com/api-keys
# 2. Créer nouvelle clé
# 3. Copier la clé

# apps/site/.env.local ET apps/admin/.env.local
RESEND_API_KEY=re_NOUVELLE_CLE_API
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Configuration domaine**:
```bash
# 1. Resend > Domains > Add Domain
# 2. Ajouter votre domaine (ex: yourdomain.com)
# 3. Configurer DNS records:
#    - SPF: v=spf1 include:_spf.resend.com ~all
#    - DKIM: [Valeur fournie par Resend]
# 4. Vérifier le domaine
```

---

### 5. Cloudinary 🖼️

**Pourquoi régénérer?** API Key et Secret exposés dans .env.local (compromis)

**Actions requises**:
- [ ] Rotate API Secret dans Cloudinary
- [ ] Vérifier restrictions d'upload

**Commandes**:
```bash
# 1. https://cloudinary.com/console/settings/security
# 2. Reset API Secret
# 3. Copier nouveau secret

# apps/site/.env.local ET apps/admin/.env.local
CLOUDINARY_API_SECRET=NOUVEAU_SECRET
```

**Sécurité recommandée**:
```bash
# Cloudinary Console > Settings > Upload
- Limiter types de fichiers: jpg, jpeg, png, webp
- Taille max: 5MB
- Activer modération (si disponible)
```

---

### 6. Secrets Inter-Services 🔗

**Pourquoi régénérer?** Secrets exposés dans .env.local (compromis)

**Actions requises**:
- [ ] Régénérer `NOTIFICATIONS_SECRET` (site → admin)
- [ ] Régénérer `REVALIDATE_SECRET` (admin → site)
- [ ] ⚠️ Les secrets doivent être IDENTIQUES dans site et admin

**Commandes**:
```bash
# Générer NOTIFICATIONS_SECRET
openssl rand -hex 32

# Copier dans SITE et ADMIN
# apps/site/.env.local
NOTIFICATIONS_SECRET=<même_secret>

# apps/admin/.env.local
NOTIFICATIONS_SECRET=<même_secret>

# ---

# Générer REVALIDATE_SECRET
openssl rand -hex 32

# Copier dans SITE et ADMIN
# apps/site/.env.local
REVALIDATE_SECRET=<même_secret>

# apps/admin/.env.local
REVALIDATE_SECRET=<même_secret>
```

---

### 7. VAPID Keys (Push Notifications) 🔔

**Pourquoi régénérer?** Clés exposées dans .env.local (compromis)

**Actions requises**:
- [ ] Générer nouvelles clés VAPID pour production
- [ ] Différentes des clés de dev

**Commandes**:
```bash
# Générer nouvelles clés
npx web-push generate-vapid-keys

# Output:
# Public Key: BI2GWyFd107SN3NjeGrHWUB...
# Private Key: j5RBcEOoxwvFcd79g7Tmnq_...

# apps/admin/.env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<nouvelle_cle_publique>
VAPID_PRIVATE_KEY=<nouvelle_cle_privee>
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

---

### 8. Hiboutik API (Optionnel) 🏪

**Pourquoi régénérer?** Clé API exposée dans .env.local (compromise)

**Actions requises**:
- [ ] Régénérer clé API Hiboutik (si utilisé)

**Commandes**:
```bash
# 1. https://your-account.hiboutik.com/settings/api
# 2. Regenerate API Key
# 3. Copier nouvelle clé

# apps/site/.env.local
HIBOUTIK_API_KEY=NOUVELLE_CLE_API
```

---

## ✅ VALIDATION FINALE

Avant de déployer en production, vérifier:

### Checklist Sécurité
- [ ] TOUTES les clés API ont été régénérées
- [ ] Aucun secret dans le code Git
- [ ] `.env.local` dans `.gitignore`
- [ ] Webhooks Stripe testés avec CLI
- [ ] Domaine email configuré (SPF, DKIM)
- [ ] MongoDB users avec permissions restreintes
- [ ] Secrets inter-services identiques (site + admin)
- [ ] VAPID keys différentes de dev

### Checklist Configuration Northflank
- [ ] Toutes variables configurées dans Northflank
- [ ] URLs de production configurées:
  - NEXTAUTH_URL (site + admin)
  - NEXT_PUBLIC_ADMIN_API_URL (site)
  - NEXT_PUBLIC_SITE_URL (admin)
- [ ] Webhooks Stripe pointent vers URLs de production
- [ ] MongoDB accessible depuis IPs Northflank

### Test Final
```bash
# 1. Vérifier qu'aucun secret n'est en dur
grep -r "sk_test_\|mongodb+srv://dev:" apps/ --include="*.ts" --include="*.tsx"
# → Doit retourner 0 résultats

# 2. Vérifier build
pnpm build
# → Doit réussir sans erreur

# 3. Vérifier types
pnpm type-check
# → 0 errors
```

---

## 📞 CONTACTS & RESSOURCES

### Dashboards
- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Stripe**: https://dashboard.stripe.com/
- **Resend**: https://resend.com/
- **Cloudinary**: https://cloudinary.com/console
- **Hiboutik**: https://[account].hiboutik.com/

### Documentation
- **MongoDB Security**: https://www.mongodb.com/docs/manual/security/
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Resend Domains**: https://resend.com/docs/send-with-nodejs
- **VAPID Keys**: https://github.com/web-push-libs/web-push

---

## 🚨 EN CAS DE COMPROMISSION EN PRODUCTION

Si des clés sont compromises **après** le déploiement en production:

1. **Rotation immédiate** de TOUTES les clés
2. **Audit des logs** (MongoDB, Stripe, Cloudinary)
3. **Notification utilisateurs** si données sensibles exposées
4. **Changement mots de passe** utilisateurs si nécessaire
5. **Revue complète sécurité** avant redéploiement

---

**Dernière mise à jour**: 2026-01-29  
**Auteur**: Claude (review pré-déploiement)
