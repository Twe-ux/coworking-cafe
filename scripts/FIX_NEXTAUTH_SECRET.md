# 🔧 FIX: Session client OK mais serveur KO

## 🎯 Symptôme Exact

- ✅ Sidebar dev visible (session client fonctionne)
- ✅ Routes staff accessibles (/, /clocking, /my-schedule)
- ❌ Clic sur route /admin/... → redirect /login (session serveur échoue)

## 🔍 Cause Racine

Le JWT est créé lors du login mais ne peut pas être validé côté serveur.

**Raison**: `NEXTAUTH_SECRET` manque ou est incorrect en production Vercel.

---

## ✅ SOLUTION (2 minutes)

### Étape 1: Vérifier NEXTAUTH_SECRET

1. Aller sur **Vercel Dashboard**:
   👉 https://vercel.com/dashboard

2. Cliquer sur ton projet **coworking-cafe-admin**

3. Onglet **Settings** → **Environment Variables**

4. Chercher `NEXTAUTH_SECRET` dans la liste

### Étape 2a: Si NEXTAUTH_SECRET existe

**Vérifier qu'il est activé pour Production:**

```
NEXTAUTH_SECRET
├── ✅ Production (doit être coché)
├── ⚪ Preview
└── ⚪ Development
```

**Si non coché** → Cocher "Production" → Save

### Étape 2b: Si NEXTAUTH_SECRET n'existe PAS

**Le créer:**

1. Cliquer sur **Add New**

2. **Key**: `NEXTAUTH_SECRET`

3. **Value**: Générer un secret fort
   ```bash
   # Sur ton Mac, exécuter:
   openssl rand -base64 32
   ```
   Exemple de résultat: `Ab3dF5gH7jK9mN2pQ4sT6vX8yZ0bC1eD2fG3hI4jK5lM6nO7pQ8rS9tU0vW1xY2z`

4. **Environments**: Cocher **Production** uniquement

5. Cliquer **Save**

### Étape 3: Redéployer

**Option A - Redéploiement automatique (recommandé)**:

Dans Vercel Dashboard → **Deployments** → Cliquer sur le dernier déploiement → **Redeploy**

**Option B - Push un commit vide**:
```bash
git commit --allow-empty -m "redeploy: trigger after NEXTAUTH_SECRET fix"
git push origin main
```

### Étape 4: Attendre et Tester (2-3 min)

1. Attendre que le déploiement finisse (🟢 vert dans Vercel)

2. **Vider le cache navigateur**:
   - Chrome/Edge: `Cmd + Shift + R` (macOS) ou `Ctrl + Shift + R` (Windows)
   - Safari: `Cmd + Option + R`

3. Aller sur https://coworking-cafe-admin.vercel.app/login

4. Entrer ton PIN

5. ✅ Tu devrais maintenant pouvoir accéder aux routes /admin/...

---

## 🔍 Vérifier les Logs Vercel (si problème persiste)

1. Vercel Dashboard → **Logs** (onglet)

2. Se connecter sur le site

3. Chercher dans les logs:
   ```
   [IP CHECK]
   [next-auth][error]
   JWT
   ```

4. Partager les logs trouvés

---

## ⚠️ IMPORTANT: NEXTAUTH_URL

Pendant que tu es dans Environment Variables, vérifie aussi:

**NEXTAUTH_URL** doit être exactement:
```
https://coworking-cafe-admin.vercel.app
```

**PAS**:
- ❌ `https://coworking-cafe-admin.vercel.app/`  (pas de trailing slash)
- ❌ `http://...` (doit être https)
- ❌ Autre domaine

Si incorrect → Corriger → Redéployer

---

## 🎯 Checklist Finale

Avant de tester:

- [ ] NEXTAUTH_SECRET existe en Production
- [ ] NEXTAUTH_SECRET fait au moins 32 caractères
- [ ] NEXTAUTH_URL = `https://coworking-cafe-admin.vercel.app` (sans slash final)
- [ ] Redéploiement terminé (🟢 vert)
- [ ] Cache navigateur vidé (Cmd+Shift+R)

---

## 💡 Pourquoi ça marche côté client mais pas serveur?

**Côté client** (useSession() dans la sidebar):
- Lit le cookie `next-auth.session-token.admin`
- Le décode SANS vérifier la signature (pas de NEXTAUTH_SECRET requis)
- → Affiche les données (nom, rôle, etc.)

**Côté serveur** (middleware, getServerSession()):
- Lit le cookie `next-auth.session-token.admin`
- Le décode ET vérifie la signature avec NEXTAUTH_SECRET
- Si NEXTAUTH_SECRET manque/incorrect → signature invalide → rejet
- → Redirect vers /login

C'est pour ça que tu vois la sidebar (client) mais ne peux pas accéder aux pages (serveur).
