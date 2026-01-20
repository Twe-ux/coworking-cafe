# Push Notifications PWA - Documentation

## Vue d'ensemble

Le système de notifications push permet d'envoyer des notifications sur l'écran du téléphone (ou desktop) quand un nouveau message de contact arrive. Il utilise les technologies PWA (Progressive Web App) standard.

## Fonctionnalités

- ✅ Notifications push pour nouveaux messages de contact
- ✅ Badge sur l'icône de l'app avec le nombre de messages non lus
- ✅ Support mobile (iOS, Android) et desktop
- ✅ Activation/désactivation depuis l'interface admin
- ✅ Service Worker pour gestion hors ligne et notifications

## Architecture

### Composants principaux

1. **Service Worker** (`/public/sw.js`)
   - Gère les notifications push
   - Met à jour le badge de l'app
   - Gère le cache pour fonctionnement hors ligne

2. **Manifest PWA** (`/public/manifest.webmanifest`)
   - Configuration de l'app PWA
   - Icônes, couleurs, raccourcis

3. **API Routes**
   - `/api/notifications/subscribe` - Enregistrer un device
   - `/api/notifications/unsubscribe` - Supprimer un device
   - `/api/notifications/send` - Envoyer une notification

4. **Models**
   - `PushSubscription` - Stocke les subscriptions des devices

5. **UI Components**
   - `NotificationManager` - Bouton pour activer/désactiver

6. **Helpers**
   - `/lib/notifications.ts` - Fonctions client (enregistrement, permissions)
   - `/lib/push-notifications.ts` - Fonctions serveur (envoi notifications)

## Configuration

### Variables d'environnement

Le fichier `.env.local` contient les clés VAPID (générées automatiquement) :

```env
# Push Notifications (VAPID Keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@coworkingcafe.com
```

**⚠️ Important** : Ne jamais partager ou commiter `VAPID_PRIVATE_KEY` !

### Générer de nouvelles clés VAPID

Si vous devez régénérer les clés :

```bash
# Supprimer les anciennes clés dans .env.local
# Puis exécuter :
pnpm run generate-vapid-keys
```

**Note** : Régénérer les clés invalidera toutes les subscriptions existantes.

## Utilisation

### 1. Installation de l'app PWA

Sur mobile :
1. Ouvrir l'admin dans Safari (iOS) ou Chrome (Android)
2. Appuyer sur "Ajouter à l'écran d'accueil"
3. L'app s'installe comme une app native

### 2. Activer les notifications

1. Se connecter au dashboard admin
2. Un bouton "Activer les notifications" apparaît en bas à droite
3. Cliquer sur le bouton
4. Autoriser les notifications dans le navigateur

### 3. Recevoir des notifications

Quand un nouveau message de contact arrive :
1. Une notification s'affiche sur l'écran
2. Le badge de l'app montre le nombre de messages non lus
3. Cliquer sur la notification ouvre la page des messages

### 4. Désactiver les notifications

1. Cliquer sur l'icône de cloche barrée en bas à droite
2. Les notifications sont désactivées pour cet appareil

## Fonctionnement technique

### Flux de notification

1. **Nouveau message de contact**
   ```
   Site public → POST /api/contact-mails (apps/site)
   → Sauvegarde message en DB
   → Appelle POST /api/notifications/send (apps/admin)
   ```

2. **Envoi de la notification**
   ```
   API /notifications/send
   → Récupère le message de contact
   → Compte les messages non lus
   → Appelle sendNewContactNotification()
   → Récupère toutes les subscriptions en DB
   → Envoie push à chaque appareil
   ```

3. **Réception sur l'appareil**
   ```
   Service Worker reçoit l'événement 'push'
   → Affiche la notification
   → Met à jour le badge
   ```

4. **Clic sur la notification**
   ```
   Service Worker reçoit 'notificationclick'
   → Ouvre/focus la page /admin/support/contact
   → Ferme la notification
   ```

### Badge API

Le badge sur l'icône de l'app est mis à jour :
- Quand on charge la liste des messages (`useContactMessages`)
- Quand on reçoit une notification push

```typescript
// Mise à jour manuelle du badge
updateAppBadge(5); // Affiche "5" sur l'icône
updateAppBadge(0); // Efface le badge
```

## Debugging

### Vérifier si les notifications sont supportées

```javascript
if ('serviceWorker' in navigator && 'Notification' in window) {
  console.log('✅ Notifications supportées');
} else {
  console.log('❌ Notifications non supportées');
}
```

### Vérifier la permission

```javascript
console.log('Permission:', Notification.permission);
// "default" - Pas encore demandé
// "granted" - Accordé
// "denied" - Refusé
```

### Vérifier le service worker

```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('✅ Service Worker enregistré');
    console.log('Scope:', reg.scope);
  }
});
```

### Vérifier la subscription

```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    if (sub) {
      console.log('✅ Abonné aux push notifications');
      console.log('Endpoint:', sub.endpoint);
    }
  });
});
```

### Console du Service Worker

Dans Chrome DevTools :
1. Application → Service Workers
2. Cliquer sur le lien "sw.js"
3. Voir les logs du service worker

### Tester une notification

Depuis la console du navigateur :

```javascript
// Afficher une notification de test
new Notification('Test', {
  body: 'Ceci est un test',
  icon: '/web-app-manifest-192x192.png'
});

// Ou via le service worker
navigator.serviceWorker.ready.then(reg => {
  reg.showNotification('Test SW', {
    body: 'Test depuis le service worker',
    icon: '/web-app-manifest-192x192.png'
  });
});
```

## Limitations et compatibilité

### iOS / Safari

- ✅ Notifications supportées depuis iOS 16.4+
- ⚠️ Fonctionne uniquement quand l'app est installée (PWA)
- ⚠️ Badge API limitée (peut ne pas fonctionner)
- ⚠️ HTTPS requis en production

### Android / Chrome

- ✅ Support complet des notifications
- ✅ Badge API fonctionne
- ✅ Fonctionne dans le navigateur ET en PWA

### Desktop

- ✅ Chrome, Edge, Firefox supportent les notifications
- ⚠️ Safari desktop : support limité

### Réseau

- ⚠️ **HTTPS obligatoire en production** (sauf localhost)
- ⚠️ Les push notifications ne fonctionnent pas si pas de connexion internet

## Sécurité

### VAPID Keys

- Clés générées localement, stockées en `.env.local`
- Clé publique : peut être exposée (NEXT_PUBLIC_)
- Clé privée : JAMAIS exposée au client, jamais commitée

### Subscriptions

- Stockées en MongoDB
- Pas d'information personnelle sauf user-agent
- Endpoint unique par appareil
- Supprimées automatiquement si expirées (HTTP 410)

### API Routes

- Subscription/unsubscription : Publiques (mais sans impact sécurité)
- Send notification : Appelée en interne uniquement

## Troubleshooting

### Les notifications ne s'affichent pas

1. Vérifier la permission : `Notification.permission === "granted"`
2. Vérifier que le SW est actif : DevTools → Application → Service Workers
3. Vérifier la subscription : `reg.pushManager.getSubscription()`
4. Vérifier les logs serveur : Y a-t-il des erreurs lors de l'envoi ?
5. Vérifier MongoDB : Les subscriptions sont-elles enregistrées ?

### Le badge ne s'affiche pas

1. Vérifier le support : `'setAppBadge' in navigator`
2. iOS : Badge API peut ne pas fonctionner
3. Vérifier les logs : `updateAppBadge()` est-elle appelée ?

### Service Worker ne s'enregistre pas

1. Vérifier HTTPS (ou localhost)
2. Vérifier le scope : `/sw.js` doit être à la racine
3. Vérifier les erreurs dans la console
4. Désinstaller l'ancien SW : DevTools → Application → Service Workers → Unregister

### Notifications reçues en double

- Peut arriver si plusieurs onglets ouverts
- Le service worker gère normalement cela avec le `tag`
- Vérifier les subscriptions en DB : pas de doublons ?

## Maintenance

### Mettre à jour le Service Worker

Si vous modifiez `/public/sw.js` :
1. Incrémenter `CACHE_NAME` (ex: `cwc-admin-v1` → `cwc-admin-v2`)
2. Les utilisateurs recevront automatiquement la mise à jour
3. L'ancien cache sera supprimé lors de l'activation

### Nettoyer les subscriptions expirées

Les subscriptions expirées sont automatiquement supprimées lors de l'envoi (HTTP 410).

Pour un nettoyage manuel :

```javascript
// Script à exécuter en DB
db.pushsubscriptions.deleteMany({
  updatedAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
});
// Supprime les subscriptions > 90 jours
```

## Roadmap

- [ ] Personnalisation des notifications (son, vibration)
- [ ] Notifications groupées (plusieurs messages)
- [ ] Actions dans les notifications (Marquer lu, Répondre)
- [ ] Support des images dans les notifications
- [ ] Statistiques d'ouverture des notifications
- [ ] Notifications programmées
- [ ] Notifications pour autres événements (réservations, etc.)

---

**Dernière mise à jour** : 2026-01-18
