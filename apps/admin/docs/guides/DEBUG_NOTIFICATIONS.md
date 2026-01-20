# Debug Notifications Push - Guide de Résolution

**Date**: 2026-01-19
**Version**: 2.0 (avec optimisations iOS)

---

## 🍎 iOS vs macOS/Desktop

### Sur iOS (iPhone/iPad)

⚠️ **IMPORTANT** : Les notifications ne fonctionnent QUE si :
1. L'app est installée sur l'écran d'accueil (via Safari → Partage → "Sur l'écran d'accueil")
2. L'app est ouverte depuis l'écran d'accueil (PAS depuis Safari)
3. iOS 16.4 minimum requis

**Limitations iOS** :
- Titre : max 30 caractères
- Message : max 120 caractères
- Icône fixe (celle du manifest, non modifiable)
- Pas de médias enrichis (GIF, vidéos)

📖 **Guide complet** : Voir `/apps/admin/IOS_SETUP_GUIDE.md`

### Sur macOS/Desktop

✅ Fonctionne dans Safari sans installation (mais mieux avec PWA installée)
✅ Pas de limite stricte de caractères
✅ Icône de l'app affichée

---

## ✅ Ce qui fonctionne

- Badge se met à jour avec le bon nombre
- Tests manuels de notifications locales fonctionnent
- Tout est configuré côté client (abonné aux push, permissions OK)

## ❌ Ce qui ne fonctionne pas

- Pas de popup de notification lors d'un nouveau message de contact

---

## 🔍 Diagnostic en 4 Étapes

### Étape 1: Vérifier que la notification est envoyée depuis apps/site

1. **Ouvrir la console du terminal** où `apps/site` tourne (`pnpm dev`)
2. **Créer un message de contact** depuis le formulaire
3. **Chercher dans les logs** :

```
[Contact] Push notification triggered for message: 676e...
```

✅ Si tu vois ce message → L'API site appelle bien l'API admin
❌ Si tu ne vois rien → Le fetch vers apps/admin échoue

### Étape 2: Vérifier que l'API admin reçoit la requête

1. **Ouvrir la console du terminal** où `apps/admin` tourne (`pnpm dev`)
2. **Créer un message de contact**
3. **Chercher dans les logs** :

```
[Notifications] Push notification sent for message: 676e...
[Push] Sent: 1, Failed: 0
[Push] Notification sent to: https://...
```

✅ Si tu vois ces messages → La notification est envoyée
❌ Si tu ne vois rien → L'API n'est pas appelée ou échoue

### Étape 3: Vérifier que le Service Worker reçoit l'événement push

1. **Ouvrir les DevTools** dans Safari (Cmd+Option+C)
2. **Aller dans Console**
3. **Créer un message de contact**
4. **Chercher les logs** :

```
[Service Worker] Push event received
[Service Worker] Parsed push data: {...}
[Service Worker] Showing notification with options: {...}
[Service Worker] Notification shown successfully
```

✅ Si tu vois ces messages → Le SW fonctionne
❌ Si tu ne vois rien → Le push n'arrive pas au SW

### Étape 4: Vérifier les URLs de communication inter-apps

Dans `apps/site/.env.local`, vérifie:

```bash
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3001
```

**Important**: Doit pointer vers l'URL où `apps/admin` tourne.

---

## 🔧 Solutions par Problème

### Problème 1: apps/site n'appelle pas apps/admin

**Symptôme**: Pas de log `[Contact] Push notification triggered` dans site

**Cause**: L'URL admin est incorrecte ou l'app admin n'est pas lancée

**Solution**:
```bash
# Vérifier .env.local dans apps/site
cat apps/site/.env.local | grep ADMIN_API_URL

# Doit retourner:
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3001

# Vérifier que admin tourne bien sur port 3001
curl http://localhost:3001/api/notifications/send -I
```

### Problème 2: L'API admin ne trouve pas les subscriptions

**Symptôme**: Log dans admin dit `[Push] No subscriptions found`

**Cause**: La subscription n'est pas enregistrée en base

**Solution**:
1. Va sur `/admin/debug/notifications`
2. Clique sur "Rafraîchir statut"
3. Si "Abonné aux push" est NON:
   - Clique "S'abonner aux push"
   - Attends le toast de confirmation
   - Vérifie en BD qu'une `pushSubscriptions` existe

**Vérifier en BD**:
```bash
# Dans MongoDB Compass ou shell
db.pushsubscriptions.find({})
# Doit retourner au moins 1 document
```

### Problème 3: Service Worker ne reçoit pas l'événement push

**Symptôme**: Pas de log `[Service Worker] Push event received` dans console

**Cause possible**:
1. Le SW n'est pas actif
2. La subscription est invalide
3. Les clés VAPID ne matchent pas

**Solution A - Réenregistrer le SW**:
1. Dans DevTools → Application → Service Workers
2. Cliquer "Unregister"
3. Recharger la page
4. Sur `/admin/debug/notifications` → "Enregistrer SW"
5. Puis "S'abonner aux push"

**Solution B - Vérifier les clés VAPID**:
```bash
# Dans apps/admin/.env.local
grep VAPID .env.local

# Les clés publique/privée doivent correspondre
# Si besoin de régénérer:
cd apps/admin
pnpm generate-vapid-keys
# Copier les clés dans .env.local
# Redémarrer apps/admin
```

### Problème 4: Safari bloque les notifications

**Symptôme**: Tout semble OK mais aucune popup n'apparaît

**Cause**: Permissions système macOS

**Solution**:
1. Ouvrir **Préférences Système** → **Notifications**
2. Chercher **Safari** dans la liste
3. Vérifier que "Autoriser les notifications" est **activé**
4. Si l'app est installée (standalone), chercher **"CoworKing Café Admin"** aussi
5. Vérifier que les notifications sont autorisées

---

## 🧪 Test Complet du Flux

Pour tester le flux complet:

```bash
# Terminal 1 - apps/site
cd apps/site
pnpm dev
# Surveiller les logs: [Contact] Push notification triggered

# Terminal 2 - apps/admin
cd apps/admin
pnpm dev
# Surveiller les logs: [Notifications] Push notification sent

# Navigateur - Safari
# 1. Ouvrir DevTools (Cmd+Option+C) → Console
# 2. Aller sur le formulaire de contact
# 3. Envoyer un message
# 4. Surveiller les logs: [Service Worker] Push event received
```

**Résultat attendu**:
1. ✅ Log dans terminal site
2. ✅ Log dans terminal admin
3. ✅ Log dans console navigateur
4. ✅ Popup de notification apparaît
5. ✅ Badge se met à jour

---

## 📝 Checklist Complète

- [ ] apps/admin tourne sur port 3001
- [ ] apps/site tourne sur port 3000
- [ ] NEXT_PUBLIC_ADMIN_API_URL configuré dans apps/site/.env.local
- [ ] Clés VAPID configurées dans apps/admin/.env.local
- [ ] Permission notifications accordée dans Safari
- [ ] Service Worker enregistré (/admin/debug/notifications)
- [ ] Abonné aux push notifications (/admin/debug/notifications)
- [ ] Au moins 1 subscription en base de données
- [ ] Permissions système macOS autorisent notifications Safari
- [ ] App installée en mode standalone (si applicable)

---

## 🆘 Si Rien ne Fonctionne

Tente une **réinitialisation complète**:

```bash
# 1. Supprimer toutes les subscriptions en BD
# Dans MongoDB
db.pushsubscriptions.deleteMany({})

# 2. Désinstaller le Service Worker
# Dans DevTools → Application → Service Workers → Unregister

# 3. Révoquer les permissions
# Dans Safari → Préférences → Sites web → Notifications
# Supprimer localhost:3001

# 4. Redémarrer les apps
cd apps/admin && pnpm dev
cd apps/site && pnpm dev

# 5. Refaire la configuration complète
# /admin/debug/notifications
# 1. Demander permission
# 2. Enregistrer SW
# 3. S'abonner aux push
# 4. Tester avec un message de contact
```

---

**Dernière mise à jour**: 2026-01-19
