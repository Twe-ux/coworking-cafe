# Guide de Vérification Variables Environnement Vercel

## Problème Identifié

Erreur 500 sur `/api/auth/session` et `/api/auth/providers` :
- NextAuth retourne HTML au lieu de JSON
- Indique une erreur de configuration des variables d'environnement

## Variables à Vérifier sur Vercel

### 1. Aller sur Vercel Dashboard

```
https://vercel.com/dashboard
→ Sélectionner le projet "coworking-cafe-admin" (ou nom du projet admin)
→ Settings → Environment Variables
```

### 2. Vérifier MONGODB_URI

**CRITIQUE** : Cette variable DOIT pointer vers `coworking_cafe` database

✅ **Format CORRECT** :
```
mongodb+srv://USERNAME:PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe?retryWrites=true&w=majority
                                                                                      ^^^^^^^^^^^^^^^^
                                                                                      Database name
```

❌ **Format INCORRECT** :
```
mongodb+srv://USERNAME:PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking-admin
                                                                         ^^^^^^^^^^^^^^^^
                                                                         Ancienne database
```

**Actions** :
- [ ] Vérifier que `MONGODB_URI` existe dans **Production**
- [ ] Vérifier que la database est `coworking_cafe` (PAS `coworking-admin`)
- [ ] Vérifier username/password corrects
- [ ] Tester la connexion avec MongoDB Compass

### 3. Vérifier NEXTAUTH_SECRET

**CRITIQUE** : Cette variable DOIT exister et être différente du dev

✅ **Doit être** :
- Minimum 32 caractères
- Secret aléatoire
- Différent de l'environnement dev

**Générer un nouveau secret** :
```bash
openssl rand -base64 32
```

**Actions** :
- [ ] Vérifier que `NEXTAUTH_SECRET` existe dans **Production**
- [ ] Vérifier que ce n'est pas "your-nextauth-secret-here-min-32-characters"
- [ ] Vérifier qu'il fait minimum 32 caractères

### 4. Vérifier NEXTAUTH_URL

**CRITIQUE** : Cette variable DOIT pointer vers l'URL de production

✅ **Doit être** :
```
https://coworking-cafe-admin.vercel.app
```

OU si domaine custom :
```
https://admin.coworkingcafe.fr
```

❌ **PAS** :
```
http://localhost:3001  (URL dev)
```

**Actions** :
- [ ] Vérifier que `NEXTAUTH_URL` existe dans **Production**
- [ ] Vérifier que c'est l'URL HTTPS de production
- [ ] Vérifier qu'il n'y a pas de trailing slash

## Procédure de Correction

### Méthode A : Via Vercel Dashboard (Recommandé)

1. **Aller sur Vercel**
   ```
   https://vercel.com/dashboard
   → Projet admin
   → Settings → Environment Variables
   ```

2. **Pour CHAQUE variable manquante ou incorrecte** :
   - Cliquer sur "Add New" ou "Edit"
   - Name: `MONGODB_URI` (ou autre variable)
   - Value: Coller la bonne valeur
   - Environments: Cocher **Production**, Preview, Development
   - Cliquer "Save"

3. **Redéployer** (obligatoire pour appliquer les changements) :
   - Option 1 : Aller dans "Deployments" → Dernier déploiement → "..." → "Redeploy"
   - Option 2 : Faire un commit vide pour forcer redéploiement

### Méthode B : Via Vercel CLI

```bash
# 1. Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Lier au projet
cd apps/admin
vercel link

# 4. Ajouter/Modifier les variables

# MONGODB_URI
vercel env add MONGODB_URI production
# Coller: mongodb+srv://USERNAME:PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe?retryWrites=true&w=majority

# NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Coller: (Générer avec: openssl rand -base64 32)

# NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Coller: https://coworking-cafe-admin.vercel.app

# 5. Redéployer
vercel --prod
```

## Test de Validation

### Après correction et redéploiement :

1. **Tester l'API auth** :
   ```bash
   curl https://coworking-cafe-admin.vercel.app/api/auth/providers
   ```

   **✅ Doit retourner** :
   ```json
   {
     "credentials": {
       "id": "credentials",
       "name": "Credentials",
       "type": "credentials"
     }
   }
   ```

   **❌ NE DOIT PAS retourner** :
   ```html
   <!DOCTYPE html>
   ```

2. **Tester la page login** :
   ```
   https://coworking-cafe-admin.vercel.app/login
   ```
   - Doit afficher le formulaire de login
   - Pas d'erreur dans la console (F12)

3. **Tester login avec PIN** :
   - Entrer le PIN dev
   - Doit se connecter sans erreur 500

## Logs Vercel (Si erreur persiste)

Si l'erreur persiste après correction :

1. **Voir les logs en temps réel** :
   ```bash
   vercel logs https://coworking-cafe-admin.vercel.app --follow
   ```

2. **Ou via Dashboard** :
   ```
   Vercel Dashboard → Projet → Deployments
   → Cliquer sur le déploiement actif
   → Onglet "Functions"
   → Cliquer sur une fonction API (ex: /api/auth/[...nextauth])
   → Voir les logs d'erreur
   ```

## Causes Possibles Secondaires

Si les variables sont correctes mais erreur persiste :

### 1. MongoDB Network Access

**Vérifier MongoDB Atlas** :
```
MongoDB Atlas → Network Access
→ Vérifier que Vercel IPs sont autorisées
→ OU temporairement : Allow Access from Anywhere (0.0.0.0/0)
```

**IPs Vercel à autoriser** :
```
76.76.21.0/24
76.223.47.0/24
```

### 2. MongoDB Database Access

**Vérifier MongoDB Atlas** :
```
MongoDB Atlas → Database Access
→ Vérifier que l'utilisateur dans MONGODB_URI a accès à coworking_cafe
→ Permissions : readWrite sur coworking_cafe
```

### 3. Déploiement Incomplet

**Forcer un redéploiement complet** :
```bash
cd apps/admin

# Option 1 : Commit vide
git commit --allow-empty -m "chore: redeploy with correct env vars"
git push origin main

# Option 2 : Vercel CLI
vercel --prod --force
```

## Checklist Finale

Avant de considérer le problème résolu :

- [ ] MONGODB_URI défini et pointe vers `coworking_cafe` database
- [ ] NEXTAUTH_SECRET défini (32+ caractères)
- [ ] NEXTAUTH_URL défini (https://...)
- [ ] Vercel IPs autorisées dans MongoDB Network Access
- [ ] User MongoDB a accès en readWrite à `coworking_cafe`
- [ ] Redéploiement effectué
- [ ] Test `/api/auth/providers` retourne JSON (pas HTML)
- [ ] Login avec PIN fonctionne
- [ ] Pas d'erreur dans console browser (F12)
- [ ] Pas d'erreur dans logs Vercel

---

**Temps estimé** : 10-15 minutes
**Priorité** : CRITIQUE
**Impact** : Bloque toute authentification en production
