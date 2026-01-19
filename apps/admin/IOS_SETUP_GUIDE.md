# Guide d'Installation et Notifications iOS

## 🍎 Spécificités iOS (iPhone/iPad)

### ⚠️ Installation OBLIGATOIRE

Sur iOS, contrairement à macOS/Desktop, les notifications push **ne fonctionnent QUE** si l'app est installée sur l'écran d'accueil.

**Pourquoi ?**
- iOS exige que l'app soit installée comme PWA (Progressive Web App)
- L'app doit être ouverte depuis l'écran d'accueil (pas depuis Safari)
- Les notifications s'afficheront alors comme une app native

---

## 📱 Installation sur iPhone/iPad

### Étape 1 : Ouvrir dans Safari

1. **Ouvre Safari** (navigateur natif iOS)
2. **Va sur** : `https://admin.coworkingcafe.com` (ou `http://localhost:3001` en dev)

⚠️ **Important** : Ne fonctionne PAS dans Chrome, Edge ou Firefox iOS !

### Étape 2 : Ajouter à l'Écran d'Accueil

1. **Clique sur le bouton Partage** (icône ⬆️ en bas de l'écran)
2. **Scroll vers le bas** et sélectionne **"Sur l'écran d'accueil"**
3. **Modifie le nom** si tu veux (par défaut : "CWC Admin")
4. **Clique "Ajouter"**

### Étape 3 : Lancer l'App

1. **Ferme Safari**
2. **Va sur ton écran d'accueil**
3. **Clique sur l'icône "CWC Admin"**
4. L'app s'ouvre en plein écran (sans barre Safari)

### Étape 4 : Activer les Notifications

1. **Dans l'app**, va sur `/admin/debug/notifications`
2. **Clique** sur "Demander permission"
3. **Accepte** la permission dans la popup iOS
4. **Clique** sur "Enregistrer SW"
5. **Clique** sur "S'abonner aux push"

✅ Tu es prêt à recevoir des notifications !

---

## 📏 Limitations iOS

### Contenu des Notifications

| Élément | Limite | Note |
|---------|--------|------|
| **Titre** | 30 caractères | Tronqué au-delà avec "..." |
| **Message** | 120 caractères | Tronqué au-delà avec "..." |
| **Icône** | Fixe (du manifest) | Non modifiable par notification |
| **Médias** | Non supportés | Pas de GIF, vidéos, images |

### Format Automatique

iOS ajoute automatiquement :
- **"depuis CWC Admin"** sous le titre (non modifiable)
- **Heure écoulée** (ex: "il y a 5 min")
- **Badge** avec le nombre de notifications

### Affichage

Les notifications apparaissent :
- ✅ En haut de l'écran (heads-up)
- ✅ Dans le Centre de Notifications
- ✅ Sur l'écran verrouillé
- ✅ Avec un son et vibration

**Identique aux apps natives iOS !** 🎉

---

## 🔔 Exemple de Notification iOS

### Message de Contact

**Titre** : `Jean Dupont - Réservation`
**Depuis** : `CWC Admin` _(automatique)_
**Message** : `Bonjour, je souhaite réserver un espace pour demain...` _(max 120 car.)_
**Badge** : `3` _(messages non lus)_
**Heure** : `il y a 2 min` _(automatique)_

Au clic → Ouvre l'app et navigue vers `/admin/messages/contact`

---

## ⚙️ Réglages iOS

### Gérer les Notifications

**Paramètres iOS → Notifications → CWC Admin**

Tu peux configurer :
- ✅ Autoriser les notifications
- ✅ Sons et haptiques
- ✅ Badges
- ✅ Afficher en écran verrouillé
- ✅ Style d'alerte (bannières ou alertes)
- ✅ Aperçu (toujours, déverrouillé, jamais)

### Désinstaller l'App

1. **Maintiens l'icône** sur l'écran d'accueil
2. **Clique** "Supprimer l'app"
3. **Confirme** la suppression

Cela désinstalle l'app ET arrête les notifications.

---

## 🚨 Dépannage iOS

### Problème : Pas de Notification

**Solution 1** : Vérifie que l'app est installée
- ❌ Ouvert dans Safari → Pas de notifications
- ✅ Ouvert depuis l'écran d'accueil → Notifications OK

**Solution 2** : Vérifie les permissions
1. **Réglages iOS** → **Notifications** → **CWC Admin**
2. Vérifie que "Autoriser les notifications" est **activé**

**Solution 3** : Réinstalle l'app
1. Supprime l'app de l'écran d'accueil
2. Réinstalle via Safari → Partage → "Sur l'écran d'accueil"
3. Refais l'étape 4 (Activer les notifications)

### Problème : Notification Tronquée

C'est **normal** sur iOS :
- Titre max 30 caractères
- Message max 120 caractères

Le système tronque automatiquement avec "..." au-delà.

### Problème : Pas d'Icône Personnalisée

**Normal** sur iOS :
- L'icône est celle du manifest (fixe)
- Non modifiable par notification
- Différent d'Android qui permet des icônes dynamiques

---

## 🎯 Checklist Complète

Avant de tester les notifications sur iOS :

- [ ] App installée sur l'écran d'accueil (via Safari)
- [ ] App ouverte depuis l'écran d'accueil (pas Safari)
- [ ] Permission notifications accordée (popup iOS)
- [ ] Service Worker enregistré (/admin/debug/notifications)
- [ ] Abonné aux push notifications
- [ ] Réglages iOS → Notifications → CWC Admin → Activé

Si tous ces points sont ✅, les notifications devraient fonctionner !

---

## 📊 Support Navigateurs iOS

| Navigateur | Support PWA | Support Notifications | Recommandation |
|------------|-------------|----------------------|----------------|
| **Safari** | ✅ Complet | ✅ Complet | ✅ Recommandé |
| Chrome | ⚠️ Partiel | ❌ Non | ❌ Ne pas utiliser |
| Edge | ⚠️ Partiel | ❌ Non | ❌ Ne pas utiliser |
| Firefox | ❌ Non | ❌ Non | ❌ Ne pas utiliser |

**Conclusion** : Sur iOS, utilise **TOUJOURS Safari** pour installer l'app !

---

## 🚀 En Production

Quand l'app sera déployée sur `https://admin.coworkingcafe.com` :

1. Les utilisateurs iOS pourront installer l'app facilement
2. Les notifications fonctionneront automatiquement
3. Le nom affiché sera "CWC Admin" (du manifest)
4. L'icône sera le logo CoworKing Café

**Tout fonctionnera exactement comme une app native !** ✨

---

**Version iOS minimum** : iOS 16.4+
**Dernière mise à jour** : 2026-01-19
