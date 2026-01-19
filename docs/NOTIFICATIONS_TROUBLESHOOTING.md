# Dépannage des Notifications Push PWA

**Date** : 2026-01-19
**Auteur** : Thierry + Claude

---

## 🎯 Résumé du Problème

### Desktop Safari
- ✅ Badge fonctionne (pastille avec nombre)
- ❌ Notifications ne s'affichent PAS à l'écran

### iPhone / iOS
- ✅ Badge fonctionne (pastille avec nombre)
- ❌ Notifications ne s'affichent PAS (limitation Apple)

---

## ❌ Limitations iOS - IMPORTANT

### Web Push Notifications NON supportées sur iOS

**Apple ne supporte PAS les Web Push Notifications sur iOS**, même en PWA installée.

Cela concerne :
- iPhone (tous modèles)
- iPad
- Safari iOS
- Chrome iOS (utilise le moteur Safari)
- Firefox iOS (utilise le moteur Safari)
- Tous les navigateurs iOS (utilisent tous le moteur WebKit d'Apple)

**Seule la Badge API fonctionne** → Pastille avec nombre sur l'icône de l'app.

### Pourquoi ?

Apple refuse d'implémenter l'API Web Push sur iOS pour :
- Protéger la vie privée
- Contrôler l'écosystème des notifications
- Pousser au développement d'apps natives

### Alternative pour iOS

Pour avoir de vraies notifications sur iPhone, il faut :
1. Développer une app native iOS (Swift)
2. Utiliser APNs (Apple Push Notification service)
3. Publier sur l'App Store

**Coût** : Plusieurs semaines de développement + compte développeur Apple (99€/an)

---

## 🖥️ Desktop Safari - Dépannage

### Support Safari Desktop

| Safari Version | macOS Version | Support Web Push |
|----------------|---------------|------------------|
| Safari 16+ | macOS 13+ | ✅ Oui (limité) |
| Safari 15 | macOS 12 | ❌ Non |
| Safari < 15 | macOS < 12 | ❌ Non |

### Prérequis Safari Desktop

Pour que les notifications fonctionnent sur Safari Desktop :

1. **macOS 13 (Ventura) ou supérieur** + **Safari 16 ou supérieur**

2. **Installer la PWA** (obligatoire pour Safari) :
   - Ouvrir l'app dans Safari
   - Menu "Fichier" → "Ajouter au Dock" (Safari 17+)
   - OU Menu "Partager" → "Ajouter à l'écran d'accueil"

3. **Permissions système activées** :
   - Préférences Système → Notifications
   - Chercher "Safari" ou le nom de l'app
   - Cocher "Autoriser les notifications"

4. **Permissions dans l'app** :
   - Cliquer sur le bouton "Activer les notifications"
   - Accepter la demande de permission

### Tester les Notifications Safari

#### Étape 1 : Page de debug
Aller sur `/admin/debug/notifications`

#### Étape 2 : Vérifier le statut
- ✅ Notifications supportées : OUI
- ✅ Permission accordée : OUI
- ✅ Service Worker enregistré : OUI
- ✅ Abonné aux push notifications : OUI

#### Étape 3 : Test local
1. Cliquer sur **"Test notification locale"**
2. Une notification devrait apparaître IMMÉDIATEMENT
3. Si rien : vérifier les permissions système

#### Étape 4 : Test Service Worker
1. Cliquer sur **"Test via Service Worker"**
2. Une notification devrait apparaître
3. Si rien : vérifier la console (logs)

#### Étape 5 : Consulter les logs
1. Ouvrir la console : `Cmd + Option + C`
2. Chercher `[Service Worker]` et `[Notifications]`
3. Vérifier les erreurs

### Problèmes courants Safari

#### 1. Notification locale ne fonctionne pas
**Cause** : Permissions système non activées

**Solution** :
```
Préférences Système → Notifications → Safari → Activer
```

#### 2. Notification SW ne fonctionne pas
**Cause** : PWA pas installée

**Solution** :
- Safari nécessite que l'app soit installée (Dock ou écran d'accueil)
- Menu "Fichier" → "Ajouter au Dock"

#### 3. Push notifications ne fonctionnent pas
**Cause** : VAPID keys pas configurées ou invalides

**Solution** :
```bash
# Vérifier dans .env.local
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_clé_publique
VAPID_PRIVATE_KEY=votre_clé_privée
```

#### 4. Badge fonctionne mais pas les notifications
**Cause** : Badge API fonctionne mieux que Web Push sur Safari

**Solution** :
- Tester avec notification locale d'abord
- Vérifier que la PWA est installée
- Redémarrer Safari

---

## 🔧 Outil de Debug

### Accès
URL : `/admin/debug/notifications`

### Fonctionnalités

1. **État du système**
   - Support des notifications
   - Permission accordée
   - Service Worker enregistré
   - Subscription active

2. **Tests**
   - Test notification locale (sans SW)
   - Test notification via Service Worker
   - Test push notification complète

3. **Logs détaillés**
   - Console avec préfixe `[Service Worker]`
   - Console avec préfixe `[Notifications]`

### Utilisation

```bash
# 1. Ouvrir la page de debug
https://votre-domaine.com/admin/debug/notifications

# 2. Cliquer sur "Demander permission"
# → Accepter dans la popup

# 3. Cliquer sur "Test notification locale"
# → Doit afficher une notification immédiatement

# 4. Si OK : Cliquer sur "Test via Service Worker"
# → Doit afficher une notification via SW

# 5. Si OK : Tester avec un vrai message de contact
```

---

## ✅ Navigateurs Supportés

### Desktop

| Navigateur | Windows | macOS | Linux | Support |
|------------|---------|-------|-------|---------|
| Chrome | ✅ | ✅ | ✅ | Excellent |
| Edge | ✅ | ✅ | ✅ | Excellent |
| Firefox | ✅ | ✅ | ✅ | Excellent |
| Safari | - | ⚠️ (limité) | - | Limité |
| Opera | ✅ | ✅ | ✅ | Excellent |

**Recommandation Desktop** : Chrome, Edge ou Firefox

### Mobile

| Navigateur | Android | iOS | Support |
|------------|---------|-----|---------|
| Chrome | ✅ | ❌ | Android uniquement |
| Samsung Internet | ✅ | - | Excellent |
| Firefox | ✅ | ❌ | Android uniquement |
| Safari | - | ❌ | Non supporté |
| Tous navigateurs iOS | - | ❌ | Non supporté |

**Recommandation Mobile** : Android avec Chrome

---

## 📊 Ce qui Fonctionne Actuellement

### ✅ Fonctionnel

1. **Badge API** (tous navigateurs sauf vieux Safari)
   - Pastille avec nombre sur l'icône
   - Mise à jour automatique
   - Fonctionne même sur iOS !

2. **Notifications Push Desktop**
   - Chrome, Edge, Firefox : ✅
   - Safari Desktop : ⚠️ (avec limitations)

3. **Notifications Push Android**
   - Chrome Android : ✅
   - Samsung Internet : ✅

### ❌ Non Fonctionnel

1. **Notifications Push iOS**
   - Tous navigateurs iOS : ❌
   - Limitation Apple (pas de solution PWA)

2. **Safari Desktop sans installation**
   - Nécessite installation PWA

---

## 🚀 Solution Complète Recommandée

### Pour les utilisateurs Desktop
**Utiliser Chrome, Edge ou Firefox** → Notifications fonctionnent parfaitement

### Pour les utilisateurs Android
**Utiliser Chrome** → Notifications fonctionnent parfaitement

### Pour les utilisateurs iOS/iPhone
**Deux options** :

1. **Option PWA (actuelle)** :
   - ✅ Badge avec nombre (pastille sur l'icône)
   - ❌ Pas de notifications push à l'écran
   - ✅ Gratuit, déjà implémenté
   - **Recommandé pour budget limité**

2. **Option App Native iOS** :
   - ✅ Badge + notifications push complètes
   - ✅ Intégration système native
   - ❌ Coût : plusieurs semaines dev + 99€/an App Store
   - **Recommandé pour expérience premium**

---

## 📝 Logs de Debug

### Console Navigateur

Ouvrir la console et chercher :

```javascript
// Service Worker
[Service Worker] Installing...
[Service Worker] Activating...
[Service Worker] Push event received
[Service Worker] Showing notification

// Notifications
[Notifications] Service Worker registered
[Notifications] Permission: granted
[Notifications] Push subscription successful
[Notifications] Badge updated: 3
```

### Erreurs Courantes

```javascript
// Erreur 1 : Permission refusée
[Notifications] Notifications not supported
→ Vérifier permissions système

// Erreur 2 : Service Worker échoue
[Service Worker] Service Worker registration failed
→ Vérifier HTTPS, manifest.webmanifest, sw.js

// Erreur 3 : Push subscription échoue
[Notifications] Push subscription failed
→ Vérifier VAPID keys dans .env.local

// Erreur 4 : Notification ne s'affiche pas
[Service Worker] Failed to show notification
→ Vérifier que PWA est installée (Safari)
```

---

## 🔗 Ressources

### Documentation Officielle
- [MDN - Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [MDN - Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Can I Use - Web Push](https://caniuse.com/push-api)
- [Safari Web Push (Apple)](https://webkit.org/blog/12824/news-from-wwdc-webkit-features-in-safari-16-beta/)

### Articles Utiles
- [Why iOS doesn't support Web Push](https://firt.dev/notes/pwa-ios/)
- [Safari Push Notifications Guide](https://web.dev/push-notifications-safari/)

---

**Dernière mise à jour** : 2026-01-19
