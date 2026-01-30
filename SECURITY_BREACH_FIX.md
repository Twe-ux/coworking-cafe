# 🚨 FAILLE DE SÉCURITÉ - Plan d'Action Urgent

> Credentials MongoDB exposés dans l'historique Git
> Date : 2026-01-30
> Gravité : CRITIQUE
> Status : 🔴 CREDENTIALS RÉVOQUÉS IMMÉDIATEMENT REQUIS

---

## ⚠️ CREDENTIALS COMPROMIS

Les mots de passe suivants sont **publics sur GitHub** :

```
User: admin-prod
Password: G4mgKELvkqNeUtQicRG8Zem4CSxHPana
Cluster: coworking-cafe-prod.ypxy4uk.mongodb.net

User: dev
Password: MzAo7OOuM30AKHCw
Cluster: coworking.jhxdixz.mongodb.net
```

**Fichiers concernés** :
- `docs/UPDATE_MONGODB_URI.md`
- `docs/DEV_VS_PROD.md`

**Commits concernés** : Au moins 2 commits pushés sur `origin/main`

---

## 🚀 GUIDES DÉTAILLÉS CRÉÉS

### 1️⃣ **URGENT_FIX_CREDENTIALS.md** (À FAIRE MAINTENANT)
→ Guide complet pour révoquer les credentials et restaurer la sécurité
→ **Temps estimé** : 20-25 minutes
→ **Priorité** : CRITIQUE

### 2️⃣ **GIT_HISTORY_CLEANUP.md** (Optionnel, après sécurisation)
→ Guide pour nettoyer l'historique Git avec BFG Repo-Cleaner
→ **Temps estimé** : 15-20 minutes
→ **Priorité** : Moyenne (peut attendre)

---

## ⚡ ACTIONS IMMÉDIATES (MAINTENANT)

```bash
# 1. Ouvrir le guide urgent
open URGENT_FIX_CREDENTIALS.md

# 2. Suivre les étapes 1-5
# - Révoquer admin-prod et dev dans MongoDB Atlas
# - Créer admin-prod-v2 et dev-v2
# - Mettre à jour .env.local
# - Mettre à jour Vercel
# - Tester

# 3. Après sécurisation (optionnel)
open GIT_HISTORY_CLEANUP.md
```

---

## 📋 RÉSUMÉ DES ÉTAPES

---

## 🔥 ACTIONS IMMÉDIATES (À FAIRE MAINTENANT)

### 1. Révoquer les Utilisateurs MongoDB (5 min)

**MongoDB Atlas** :

1. **Aller sur https://cloud.mongodb.com/**
2. **Cluster PROD (coworking-cafe-prod)** :
   - Database Access → Utilisateur `admin-prod` → **DELETE**
   - ⚠️ Cela va CASSER la production temporairement

3. **Cluster DEV (coworking)** :
   - Database Access → Utilisateur `dev` → **DELETE**
   - Cela va casser le développement local

---

### 2. Créer de Nouveaux Utilisateurs (5 min)

**Nouveaux credentials sécurisés** :

```bash
# Générer des mots de passe forts
openssl rand -base64 32  # Pour admin-prod (nouveau)
openssl rand -base64 32  # Pour dev (nouveau)
```

**Créer dans MongoDB Atlas** :

#### Cluster PROD (coworking-cafe-prod)

```
Database Access → Add New Database User

Username: admin-prod-v2
Password: [Nouveau password 32+ chars]
Database User Privileges: Read and write to any database
```

#### Cluster DEV (coworking)

```
Database Access → Add New Database User

Username: dev-v2
Password: [Nouveau password 32+ chars]
Database User Privileges: Read and write to any database
```

---

### 3. Mettre à Jour les URIs PARTOUT (10 min)

#### A. Local (.env.local)

```bash
# apps/admin/.env.local
MONGODB_URI=mongodb+srv://dev-v2:NOUVEAU_PASSWORD@coworking.jhxdixz.mongodb.net/coworking_cafe_dev
```

#### B. Vercel (Production)

```bash
# Via CLI
vercel env rm MONGODB_URI production
vercel env add MONGODB_URI production
# Coller : mongodb+srv://admin-prod-v2:NOUVEAU_PASSWORD@coworking-cafe-prod.ypxy4uk.mongodb.net/coworking_cafe_prod

# Redéployer
vercel --prod
```

**Ou via Dashboard** :
- https://vercel.com/dashboard
- Projet admin → Settings → Environment Variables
- MONGODB_URI → Edit → Remplacer avec nouvelle URI
- Save → Redeploy

#### C. Northflank (si socket-server)

1. Dashboard Northflank
2. Service socket-server → Environment Variables
3. MONGODB_URI → Mettre la nouvelle URI
4. Restart service

---

### 4. Tester que Tout Fonctionne

```bash
# A. Test local
cd apps/admin
pnpm dev
# → http://localhost:3001/login

# B. Test production
# → https://admin.coworkingcafe.fr/login
```

---

## 🧹 Nettoyer l'Historique Git (OPTIONNEL, RISQUÉ)

**⚠️ ATTENTION** : Réécrire l'historique Git est **risqué** et va casser les clones existants.

### Option A : Garder l'Historique (Recommandé)

Les anciens passwords sont révoqués, donc **plus de risque**.

**Avantages** :
- ✅ Simple
- ✅ Pas de risque de casser Git
- ✅ Les passwords sont révoqués de toute façon

**Inconvénients** :
- ⚠️ L'historique contient toujours les passwords (mais révoqués)

### Option B : Nettoyer l'Historique (Avancé)

**Utiliser BFG Repo-Cleaner** :

```bash
# 1. Backup complet
cp -r coworking-cafe coworking-cafe-backup

# 2. Télécharger BFG
brew install bfg

# 3. Créer un fichier avec les passwords à supprimer
cat > passwords.txt << EOF
G4mgKELvkqNeUtQicRG8Zem4CSxHPana
MzAo7OOuM30AKHCw
EOF

# 4. Nettoyer l'historique
cd coworking-cafe
bfg --replace-text passwords.txt

# 5. Force push (⚠️ DESTRUCTIF)
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin main --force

# 6. Notifier l'équipe de re-cloner
# Tous les clones existants doivent être supprimés et re-clonés
```

**⚠️ Conséquences** :
- Tous les membres de l'équipe doivent re-cloner
- L'historique est réécrit
- Les PR/branches existantes peuvent être cassées

---

## 📋 Checklist de Récupération

- [ ] **URGENT** : Supprimer utilisateurs `admin-prod` et `dev` dans MongoDB Atlas
- [ ] Créer nouveaux utilisateurs `admin-prod-v2` et `dev-v2`
- [ ] Mettre à jour `.env.local` avec nouveaux credentials
- [ ] Mettre à jour Vercel Environment Variables
- [ ] Mettre à jour Northflank (si socket-server)
- [ ] Tester login local
- [ ] Tester login production
- [ ] Vérifier que les apps fonctionnent
- [ ] (Optionnel) Nettoyer historique Git avec BFG
- [ ] Documenter l'incident

---

## 🛡️ Prévention Future

### 1. Fichiers à ne JAMAIS Committer

Ajouter à `.gitignore` (déjà fait normalement) :

```
.env
.env.local
.env.production
.env.*.local
*.pem
*.key
```

### 2. Git Hooks de Sécurité

Vous avez déjà un pre-commit hook qui détecte les secrets, mais il a été bypassé avec `--no-verify`.

**Règle** : **JAMAIS** utiliser `--no-verify` pour des fichiers avec des secrets réels.

### 3. Utiliser des Fichiers .env.example

Toujours utiliser des **placeholders** :

```bash
# ✅ BON - .env.example
MONGODB_URI=mongodb+srv://username:PASSWORD@cluster.mongodb.net/database

# ❌ MAUVAIS - .env.example avec vrais credentials
MONGODB_URI=mongodb+srv://admin:G4mgKEL...@cluster.mongodb.net/database
```

### 4. Documentation

**Dans les docs** :
- ✅ Utiliser `PASSWORD` au lieu des vrais passwords
- ✅ Utiliser `username` au lieu des vrais usernames
- ✅ Dire à l'utilisateur de remplacer par ses vraies valeurs

---

## 📊 Impact de la Faille

### Données Exposées

```
✅ Passwords révoqués → Plus de risque
❌ Structure de la BD visible (noms collections)
❌ Noms de clusters visibles
❌ Noms d'utilisateurs visibles
```

### Accès Possibles (avant révocation)

- ✅ Lecture/écriture complète sur `coworking_cafe_prod`
- ✅ Lecture/écriture complète sur `coworking_cafe_dev`
- ✅ Suppression de données possible
- ✅ Export de données possible

### Recommandations Post-Incident

1. **Vérifier les logs MongoDB Atlas** :
   - Atlas → Cluster → Monitoring → Access Logs
   - Chercher des connexions suspectes (IPs inconnues)

2. **Audit des données** :
   - Vérifier qu'aucune donnée n'a été modifiée/supprimée
   - Comparer avec backup récent

3. **Notifications** :
   - Si données clients compromises → Notification RGPD obligatoire
   - Documenter l'incident

---

## 🔗 Ressources

- MongoDB Security : https://docs.mongodb.com/manual/security/
- GitHub Secrets Scanning : https://docs.github.com/en/code-security/secret-scanning
- BFG Repo-Cleaner : https://rtyley.github.io/bfg-repo-cleaner/

---

**Dernière mise à jour** : 2026-01-30
**Gravité** : CRITIQUE
**Status** : 🔴 EN ATTENTE DE RÉSOLUTION
