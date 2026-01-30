# 🧹 Nettoyage de l'Historique Git

**Date**: 2026-01-30
**Prérequis**: ⚠️ Les credentials DOIVENT être révoqués AVANT de faire cette étape

---

## ⚠️ AVANT DE COMMENCER

**CRITIQUE**: Vous DEVEZ avoir fait `URGENT_FIX_CREDENTIALS.md` AVANT cette étape.

Vérifiez:
- [ ] Utilisateurs `admin-prod` et `dev` SUPPRIMÉS dans MongoDB Atlas
- [ ] Nouveaux utilisateurs `admin-prod-v2` et `dev-v2` CRÉÉS
- [ ] `.env.local` mis à jour avec nouveaux credentials
- [ ] Vercel mis à jour avec nouveaux credentials
- [ ] Production et Dev testés et fonctionnels

**Si ce n'est pas fait → STOP et faites `URGENT_FIX_CREDENTIALS.md` d'abord**

---

## 🎯 Objectif

Supprimer les anciens passwords de l'historique Git pour qu'ils ne soient plus visibles sur GitHub.

**Fichiers à nettoyer**:
- `docs/UPDATE_MONGODB_URI.md`
- `docs/DEV_VS_PROD.md`
- Tous les commits qui contiennent ces passwords

---

## 📦 OPTION 1: Utiliser BFG Repo-Cleaner (Recommandé)

### 1. Installer BFG

```bash
# Sur macOS
brew install bfg
```

### 2. Faire un Backup Complet

```bash
# Backup du repo entier
cp -r /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe-BACKUP-$(date +%Y%m%d)

echo "✅ Backup créé dans: /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe-BACKUP-$(date +%Y%m%d)"
```

### 3. Créer la Liste des Passwords à Supprimer

```bash
cd /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe

# Créer le fichier passwords.txt
cat > passwords.txt << 'EOF'
G4mgKELvkqNeUtQicRG8Zem4CSxHPana
MzAo7OOuM30AKHCw
EOF

echo "✅ Fichier passwords.txt créé"
```

### 4. Lancer BFG pour Nettoyer l'Historique

```bash
# Remplacer les passwords par ***REMOVED*** dans tout l'historique
bfg --replace-text passwords.txt .

echo "✅ BFG a nettoyé l'historique"
```

### 5. Vérifier les Changements

```bash
# Voir ce qui a été modifié
git log --oneline --all -10

# Vérifier que les passwords ont disparu
git log --all --full-history -p -S "G4mgKELvkqNeUtQicRG8Zem4CSxHPana" | wc -l
# → Devrait afficher 0

git log --all --full-history -p -S "MzAo7OOuM30AKHCw" | wc -l
# → Devrait afficher 0
```

### 6. Nettoyer Git (Obligatoire)

```bash
# Expirer les reflog
git reflog expire --expire=now --all

# Garbage collection agressive
git gc --prune=now --aggressive

echo "✅ Git nettoyé"
```

### 7. Force Push (⚠️ DESTRUCTIF)

```bash
# Sauvegarder l'état actuel avant force push
git log --oneline -5 > last-5-commits-before-force-push.txt

# Force push vers GitHub
git push origin main --force

echo "✅ Historique nettoyé poussé sur GitHub"
```

**⚠️ ATTENTION**: Cette commande RÉÉCRIT l'historique GitHub. Tous les collaborateurs devront re-cloner le repo.

### 8. Vérifier sur GitHub

```bash
# Ouvrir GitHub et vérifier que les passwords ont disparu
echo "🔗 Vérifier manuellement sur https://github.com/votre-repo/commits/main"
```

---

## 📦 OPTION 2: Supprimer les Fichiers Complètement (Plus Simple)

Si vous n'avez pas besoin de garder `docs/UPDATE_MONGODB_URI.md` et `docs/DEV_VS_PROD.md`:

### 1. Supprimer les Fichiers Localement

```bash
cd /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe

# Supprimer les fichiers
rm docs/UPDATE_MONGODB_URI.md
rm docs/DEV_VS_PROD.md

# Commit la suppression
git add docs/
git commit -m "docs: remove files with exposed credentials"
git push origin main
```

### 2. Supprimer de l'Historique avec BFG

```bash
# Supprimer complètement les fichiers de tout l'historique
bfg --delete-files UPDATE_MONGODB_URI.md .
bfg --delete-files DEV_VS_PROD.md .

# Nettoyer
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin main --force
```

---

## 📦 OPTION 3: Repartir de Zéro (Si Repo Privé)

Si le repo est PRIVÉ et que vous n'avez pas de collaborateurs:

### 1. Créer un Nouveau Repo Propre

```bash
# Nouveau repo sans historique
cd /Users/twe/Developer/Thierry/coworking-cafe/
mkdir coworking-cafe-clean
cd coworking-cafe-clean

# Copier seulement les fichiers actuels (pas .git)
rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' ../coworking-cafe/ .

# Init nouveau repo
git init
git add .
git commit -m "Initial commit - clean repository"

# Remplacer le repo GitHub
git remote add origin https://github.com/votre-username/coworking-cafe.git
git push origin main --force
```

**⚠️ ATTENTION**: Cela SUPPRIME tout l'historique Git. À faire seulement si vous n'avez pas besoin de l'historique.

---

## ✅ APRÈS LE NETTOYAGE

### Notifier les Collaborateurs (si applicable)

```markdown
🚨 IMPORTANT: Historique Git Réécrit

Le repository a été nettoyé pour supprimer des credentials exposés.

TOUS les collaborateurs doivent:
1. Supprimer leur clone local
2. Re-cloner le repository

```bash
cd ~/Developer
rm -rf coworking-cafe
git clone https://github.com/votre-username/coworking-cafe.git
```

Les commits existants ont de nouveaux SHA. Les branches locales doivent être recréées.
```

### Vérifier que Tout Fonctionne

```bash
# 1. Re-cloner dans un nouveau dossier (pour tester)
cd ~/Developer
git clone https://github.com/votre-username/coworking-cafe.git coworking-cafe-test
cd coworking-cafe-test

# 2. Vérifier qu'aucun password n'apparaît
git log --all --full-history -p | grep "G4mgKELvkqNeUtQicRG8Zem4CSxHPana"
# → Devrait ne rien afficher

git log --all --full-history -p | grep "MzAo7OOuM30AKHCw"
# → Devrait ne rien afficher

# 3. Vérifier que le build fonctionne
pnpm install
cd apps/admin
pnpm build
```

### Supprimer les Fichiers Temporaires

```bash
cd /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe

# Supprimer le fichier passwords.txt
rm passwords.txt

# Optionnel: Supprimer le backup (après avoir vérifié que tout fonctionne)
# rm -rf /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe-BACKUP-*
```

---

## 📋 CHECKLIST NETTOYAGE

- [ ] Credentials révoqués dans MongoDB Atlas (prérequis)
- [ ] Backup du repo créé
- [ ] BFG installé (`brew install bfg`)
- [ ] passwords.txt créé avec les 2 passwords
- [ ] BFG exécuté (`bfg --replace-text passwords.txt`)
- [ ] Vérification: `git log -p | grep "password"` → rien
- [ ] Git nettoyé (`git reflog expire`, `git gc`)
- [ ] Force push fait (`git push --force`)
- [ ] Vérifié sur GitHub que passwords ont disparu
- [ ] Collaborateurs notifiés (si applicable)
- [ ] Re-clone et test build OK
- [ ] Fichiers temporaires supprimés (passwords.txt)

---

## ⏰ TEMPS ESTIMÉ

- **Option 1 (BFG)**: 15-20 minutes
- **Option 2 (Supprimer fichiers)**: 10 minutes
- **Option 3 (Nouveau repo)**: 30 minutes

---

## 🆘 EN CAS DE PROBLÈME

### Si BFG échoue:

```bash
# Restaurer depuis le backup
rm -rf .git
cp -r /Users/twe/Developer/Thierry/coworking-cafe/coworking-cafe-BACKUP-*/.git .
git reset --hard
```

### Si Force Push échoue (protected branch):

```
1. Aller sur GitHub
2. Settings → Branches
3. Désactiver temporairement "Branch protection rules" pour main
4. Refaire le force push
5. Réactiver les protections
```

### Si vous avez besoin d'aide:

```bash
# Voir l'état actuel
git status
git log --oneline -5

# Contacter le support GitHub si besoin
```

---

**IMPORTANT**: Cette étape est OPTIONNELLE. Les credentials sont révoqués, donc il n'y a plus de risque de sécurité immédiat. Le nettoyage Git est pour l'hygiène du repository.
