# 🔐 CONFIGURATION SÉCURITÉ - Coworking Café

**Date**: 2026-01-29  
**Version**: 1.0

Ce document explique la configuration de sécurité mise en place pour protéger les secrets et credentials du projet.

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Fichiers créés](#fichiers-créés)
3. [Installation](#installation)
4. [Utilisation quotidienne](#utilisation-quotidienne)
5. [Dépannage](#dépannage)
6. [Régénération des clés](#régénération-des-clés)

---

## 🎯 VUE D'ENSEMBLE

### Problème

Les secrets (clés API, passwords, tokens) ne doivent **JAMAIS** être committés dans Git pour éviter:
- Compromission des comptes
- Accès non autorisé aux services
- Coûts imprévus (abuse de clés API)
- Violation de données

### Solution

Mise en place d'un système multi-couches:

1. **`.gitignore`** - Ignore automatiquement les fichiers `.env.local`
2. **`.env.example`** - Templates sans secrets (committables)
3. **Git hooks** - Vérification automatique avant chaque commit
4. **Documentation** - Procédures et checklists

---

## 📁 FICHIERS CRÉÉS

### 1. Configuration Environnement

**`apps/site/.env.example`**
- Template pour l'app site (14 variables)
- Placeholders pour tous les secrets
- Instructions de configuration

**`apps/admin/.env.example`**
- Template pour l'app admin (20+ variables)
- Inclut variables spécifiques admin (VAPID, IP whitelist, etc.)
- Instructions de configuration

### 2. Documentation Sécurité

**`KEYS_TO_REGENERATE.md`** (racine)
- Liste de tous les secrets compromis
- Instructions détaillées pour régénération
- Checklists de validation
- Procédure d'urgence

**`SECURITY_AUDIT.md`** (racine)
- Rapport d'audit complet
- Métriques de conformité
- Recommandations
- Checklist pré-déploiement

**`docs/SECURITY_SETUP.md`** (ce fichier)
- Guide d'utilisation quotidien
- Installation des hooks
- Procédures standards

### 3. Git Hooks

**`scripts/pre-commit`**
- Hook Git de validation
- Bloque commits de fichiers `.env.local`
- Détecte secrets hardcodés
- Donne messages d'erreur clairs

**`scripts/install-git-hooks.sh`**
- Script d'installation automatique
- Copie et active le hook
- Permissions exécutables

---

## 🚀 INSTALLATION

### Première Installation

```bash
# 1. Cloner le repo
git clone <url>
cd coworking-cafe

# 2. Installer les hooks Git (OBLIGATOIRE)
./scripts/install-git-hooks.sh

# 3. Copier les templates d'environnement
cp apps/site/.env.example apps/site/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# 4. Remplir les .env.local avec les VRAIES valeurs
# Demander les clés à l'équipe ou voir 1Password/Vault
```

### Vérification Installation

```bash
# Vérifier que le hook est installé
ls -la .git/hooks/pre-commit
# → Doit exister et être exécutable (x)

# Tester le hook
echo "TEST" > test.env.local
git add test.env.local
git commit -m "test"
# → Doit bloquer le commit avec message d'erreur
```

---

## 💼 UTILISATION QUOTIDIENNE

### Workflow Normal

```bash
# 1. Faire vos modifications
vim apps/admin/src/components/MyComponent.tsx

# 2. Ajouter au staging
git add apps/admin/src/components/MyComponent.tsx

# 3. Commit (le hook vérifiera automatiquement)
git commit -m "feat: add new component"

# Si tout va bien:
# ✅ Vérification sécurité passée
# → Commit créé

# Si problème détecté:
# ❌ COMMIT BLOQUÉ
# → Corriger puis recommencer
```

### Que vérifie le hook?

1. **Fichiers .env.local** - Bloque immédiatement
2. **Secrets hardcodés**:
   - MongoDB URIs avec credentials
   - Clés Stripe (sk_test_, sk_live_, pk_test_, pk_live_)
   - Webhook secrets (whsec_)
   - Clés Resend (re_)
   - AWS Access Keys (AKIA)
   - Secrets génériques (> 32 caractères)
3. **Fichiers sensibles** - Avertissement si modifiés:
   - `instrumentation.ts`
   - `mongodb.ts`
   - `stripe.ts`

### Bypass du Hook (⚠️  Avec Précaution)

```bash
# Si faux positif (ex: commentaire documentation)
git commit --no-verify -m "docs: add API example"

# ⚠️  À n'utiliser QUE si tu es CERTAIN qu'il n'y a pas de secret!
```

---

## 🔧 DÉPANNAGE

### Hook ne se déclenche pas

```bash
# 1. Vérifier que le hook existe
ls -la .git/hooks/pre-commit

# 2. Vérifier qu'il est exécutable
chmod +x .git/hooks/pre-commit

# 3. Réinstaller si nécessaire
./scripts/install-git-hooks.sh
```

### Faux Positifs

**Problème**: Le hook bloque un commit légitime (ex: documentation)

**Solutions**:

1. **Recommandé**: Modifier le code pour éviter le pattern détecté
   ```typescript
   // ❌ Bloqué (même en commentaire)
   // const key = "sk_test_abc123..."
   
   // ✅ OK - Pattern modifié
   // const key = "sk_test_[votre_clé]"
   ```

2. **Temporaire**: Bypass avec `--no-verify`
   ```bash
   git commit --no-verify -m "docs: add example"
   ```

### Besoin d'ajouter un nouveau pattern

Éditer `scripts/pre-commit`:

```bash
# Ajouter après les check_secret_pattern existants
check_secret_pattern "YOUR_PATTERN" "Description du secret"

# Puis réinstaller
./scripts/install-git-hooks.sh
```

---

## 🔑 RÉGÉNÉRATION DES CLÉS

### Quand régénérer?

- **Avant déploiement production** (OBLIGATOIRE)
- Après compromission suspectée
- Rotation régulière (ex: tous les 90 jours)
- Changement d'équipe

### Procédure

**Voir le fichier complet**: `KEYS_TO_REGENERATE.md`

**Résumé rapide**:

```bash
# 1. MongoDB
# MongoDB Atlas > Security > Database Access > Créer nouveau user

# 2. NextAuth
openssl rand -base64 32
# → Copier dans .env.local

# 3. Stripe Webhooks
# Dashboard Stripe > Webhooks > Create endpoint
# → Copier le webhook signing secret

# 4. Resend
# https://resend.com/api-keys > Create API Key
# → Copier la clé

# 5. Cloudinary
# Cloudinary Console > Settings > Security > Reset API Secret
# → Copier nouveau secret

# 6. Secrets Inter-Services
openssl rand -hex 32
# → Copier IDENTIQUE dans site ET admin

# 7. VAPID Keys
npx web-push generate-vapid-keys
# → Copier public + private keys

# 8. Hiboutik (optionnel)
# https://[account].hiboutik.com/settings/api > Regenerate
```

---

## ✅ CHECKLIST NOUVELLE MACHINE

Pour un nouveau développeur qui rejoint l'équipe:

```bash
# [ ] 1. Cloner le repo
git clone <url> && cd coworking-cafe

# [ ] 2. Installer hooks Git
./scripts/install-git-hooks.sh

# [ ] 3. Copier templates
cp apps/site/.env.example apps/site/.env.local
cp apps/admin/.env.example apps/admin/.env.local

# [ ] 4. Obtenir secrets
# → Demander à l'équipe ou voir 1Password

# [ ] 5. Remplir .env.local
# → Suivre les instructions dans .env.example

# [ ] 6. Vérifier installation
git add test.txt && git commit -m "test"
# → Hook doit se déclencher

# [ ] 7. Installer dépendances
pnpm install

# [ ] 8. Lancer en dev
pnpm dev
```

---

## 📚 RESSOURCES

### Fichiers de Référence

- **`KEYS_TO_REGENERATE.md`** - Procédures régénération
- **`SECURITY_AUDIT.md`** - Rapport d'audit complet
- **`.env.example`** - Templates configuration
- **`.gitignore`** - Fichiers ignorés

### Outils Recommandés

- **[git-secrets](https://github.com/awslabs/git-secrets)** - Prévention secrets AWS
- **[detect-secrets](https://github.com/Yelp/detect-secrets)** - Scan repos
- **[1Password CLI](https://1password.com/downloads/command-line/)** - Gestion secrets

### Documentation Externe

- **MongoDB Security**: https://www.mongodb.com/docs/manual/security/
- **Stripe Webhooks**: https://stripe.com/docs/webhooks/best-practices
- **OWASP Secrets**: https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password

---

## 🆘 SUPPORT

### En Cas de Problème

1. **Vérifier la documentation** (ce fichier)
2. **Consulter** `SECURITY_AUDIT.md`
3. **Demander à l'équipe** (Slack #dev)
4. **En urgence**: Voir `KEYS_TO_REGENERATE.md` > Procédure d'urgence

### Contacts

- **Lead Dev**: [Nom] - [email]
- **DevOps**: [Nom] - [email]
- **Support MongoDB**: https://cloud.mongodb.com/support
- **Support Stripe**: https://support.stripe.com/

---

**Dernière mise à jour**: 2026-01-29  
**Responsable**: Équipe Dev  
**Version**: 1.0
