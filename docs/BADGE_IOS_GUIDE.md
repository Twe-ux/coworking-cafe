# Guide Badge iOS

**Date** : 2026-01-19

---

## 📱 Pourquoi le badge ne fonctionne pas sur ton iPhone

### Prérequis pour que le badge fonctionne sur iOS

Le badge (pastille avec nombre) nécessite **TOUTES** ces conditions :

1. ✅ **iOS 16.4 ou supérieur** (avril 2023)
2. ✅ **App installée sur l'écran d'accueil** (via "Ajouter à l'écran d'accueil")
3. ✅ **App ouverte en mode standalone** (icône depuis l'écran d'accueil, PAS Safari)

---

## 🔧 Comment installer correctement sur iPhone

### Étape 1 : Vérifier la version iOS
1. Ouvrir **Réglages**
2. Aller dans **Général → Informations**
3. Vérifier **Version du logiciel**
4. **Minimum requis : iOS 16.4** (si version inférieure, mettre à jour)

### Étape 2 : Installer l'app sur l'écran d'accueil
1. Ouvrir Safari
2. Aller sur `https://votre-domaine.com/admin`
3. Cliquer sur le bouton **Partager** (en bas, icône avec flèche vers le haut)
4. Scroller et sélectionner **"Sur l'écran d'accueil"**
5. Cliquer sur **"Ajouter"**

### Étape 3 : Ouvrir depuis l'écran d'accueil
1. **Fermer Safari** (important!)
2. Retourner à l'écran d'accueil
3. Cliquer sur l'icône **"CWC Admin"** nouvellement créée
4. L'app s'ouvre en mode **standalone** (sans barre d'adresse Safari)

### Étape 4 : Vérifier que ça marche
1. Dans l'app, aller sur `/admin/debug/notifications`
2. Vérifier que **"Standalone (Installée): Oui ✅"**
3. Vérifier que **"Badge API: Supporté ✅"**
4. Cliquer sur **"Test Badge (iOS/PWA)"**
5. Revenir à l'écran d'accueil → Le badge devrait afficher **"5"**

---

## 🐛 Problèmes courants

### Le badge ne s'affiche toujours pas

**Problème 1 : Version iOS trop ancienne**
- Vérifier que iOS ≥ 16.4
- Mettre à jour iOS si nécessaire

**Problème 2 : App pas en mode standalone**
- Ne PAS ouvrir via Safari
- Ouvrir via l'icône sur l'écran d'accueil

**Problème 3 : App pas correctement installée**
1. Supprimer l'icône de l'écran d'accueil
2. Recommencer l'installation (Étape 2)

**Problème 4 : Cache ou bug iOS**
1. Fermer complètement l'app (double-clic Home + swipe up)
2. Redémarrer l'iPhone
3. Rouvrir l'app depuis l'écran d'accueil

---

## 📊 Logs de debug

### Ouvrir la console sur iPhone

**Option 1 : Safari sur Mac (recommandé)**
1. Sur Mac : Safari → Développement → Activer le menu Développement
2. Sur iPhone : Réglages → Safari → Avancé → Activer "Inspecteur web"
3. Connecter iPhone au Mac avec câble
4. Sur Mac : Safari → Développement → [Votre iPhone] → [Votre app]
5. La console s'ouvre → Chercher `[Notifications]`

**Option 2 : Safari sur iPhone (limité)**
1. Sur iPhone : Réglages → Safari → Avancé → Activer "Console Web"
2. Dans Safari, aller sur votre site
3. Appuyer sur le bouton de partage
4. "Console" devrait apparaître (pas toujours visible)

### Messages à chercher

```
[Notifications] Update badge requested: {
  count: 5,
  standalone: true,    ← Doit être TRUE
  ios: true,           ← Doit être TRUE
  badgeAPISupported: true  ← Doit être TRUE
}

[Notifications] ✅ Badge updated via Badge API: 5
```

**Si tu vois** :
```
[Notifications] ❌ Badge API failed: NotAllowedError
[Notifications] 💡 iOS: L'app doit être installée sur l'écran d'accueil
```
→ L'app n'est PAS en mode standalone, ouvre-la depuis l'icône de l'écran d'accueil !

---

## ✅ Ce qui devrait fonctionner maintenant

### Sur macOS
- ✅ Badge fonctionne (même dans Safari classique si macOS 13+)
- ✅ Notifications fonctionnent (si PWA installée)

### Sur iPhone (iOS 16.4+)
- ✅ Badge fonctionne (si app installée sur écran d'accueil)
- ❌ Notifications push ne fonctionneront JAMAIS (limitation Apple)

---

## 🎯 Résumé rapide

Pour que le badge fonctionne sur iPhone :

1. **iOS 16.4+** (vérifier dans Réglages)
2. **Installer sur écran d'accueil** (Partager → Sur l'écran d'accueil)
3. **Ouvrir depuis l'icône** (PAS Safari)
4. **Tester** avec le bouton sur `/admin/debug/notifications`

Si tout est OK, le badge devrait s'afficher avec le nombre de messages non lus !

---

**Dernière mise à jour** : 2026-01-19
