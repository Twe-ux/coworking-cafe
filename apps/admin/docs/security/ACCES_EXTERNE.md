# Accès Admin depuis l'Extérieur

## 🏠 Au Café (IP Autorisée)

**URL** : `https://admin.coworkingcafe.fr/`

**Comportement** :
- ✅ Accès direct au dashboard staff
- ✅ Routes disponibles : /, /clocking, /my-schedule, /produits
- ✅ PWA fonctionne normalement

---

## 🌍 Depuis l'Extérieur (IP Non Autorisée)

### ⚠️ IMPORTANT

L'URL racine `https://admin.coworkingcafe.fr/` est **protégée par IP**.

Si vous essayez d'y accéder depuis l'extérieur, vous aurez une erreur **403 - Accès Refusé**.

### ✅ Solution : Utiliser la Route Admin

**URL à utiliser** : `https://admin.coworkingcafe.fr/admin`

**Étapes** :
1. Ouvrir le navigateur
2. Taper : `https://admin.coworkingcafe.fr/admin`
3. Se connecter avec vos identifiants (dev/admin)
4. Accès au panel admin complet

---

## 📱 PWA (Progressive Web App)

### Au Café
- PWA installée → Pointe vers `/`
- ✅ Fonctionne normalement

### À l'Extérieur
- PWA installée → Pointe vers `/` → ❌ 403
- **Solution** : Taper manuellement `/admin` dans le navigateur

**Alternative** : Installer une 2ème PWA pointant vers `/admin` (optionnel)

---

## 🔖 Bookmarks Recommandés

### Chrome/Edge/Firefox

**Bookmark 1** : Dashboard Staff (café uniquement)
```
Nom: CoWorking - Dashboard Staff
URL: https://admin.coworkingcafe.fr/
```

**Bookmark 2** : Admin Panel (partout)
```
Nom: CoWorking - Admin Panel
URL: https://admin.coworkingcafe.fr/admin
```

---

## 🔐 Sécurité

Cette configuration ajoute une **couche de sécurité supplémentaire** :

- Quelqu'un qui découvre `admin.coworkingcafe.fr` tombe sur **403** (pas d'indices)
- Pour accéder à l'admin, il faut **connaître la route `/admin`**
- Réduit les tentatives de brute-force sur la page de login

**3 couches de protection** :
1. ✅ Connaître le sous-domaine
2. ✅ Connaître la route `/admin`
3. ✅ Avoir un compte avec permissions

---

## 🆘 Aide-Mémoire Rapide

| Localisation | URL à utiliser |
|--------------|----------------|
| **Au café** | `https://admin.coworkingcafe.fr/` |
| **À l'extérieur** | `https://admin.coworkingcafe.fr/admin` |

---

**Dernière mise à jour** : 2026-01-30
