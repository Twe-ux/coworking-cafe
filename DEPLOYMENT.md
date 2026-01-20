# Guide de déploiement Northflank

## Prérequis

1. Compte Northflank
2. Repository GitHub connecté
3. Variables d'environnement configurées

## Variables d'environnement globales

Créer ces secrets dans Northflank :

### Communs
- `MONGODB_URI` : mongodb+srv://user:pass@cluster.mongodb.net/db
- `NEXTAUTH_SECRET` : [génération aléatoire 32 chars]
- `JWT_SECRET` : [génération aléatoire 32 chars]

### Stripe
- `STRIPE_PUBLIC_KEY` : pk_live_...
- `STRIPE_SECRET_KEY` : sk_live_...
- `STRIPE_WEBHOOK_SECRET` : whsec_...

### Push Notifications (Admin)
- `VAPID_PUBLIC_KEY` : [clé publique VAPID]
- `VAPID_PRIVATE_KEY` : [clé privée VAPID]

### URLs (configurées après déploiement initial)
- `SITE_URL` : https://coworking.app
- `ADMIN_URL` : https://admin.coworking.app
- `SOCKET_URL` : https://socket.coworking.app

## Ordre de déploiement

### 1. Créer les 3 services

Dans Northflank, créer 3 services avec ces configurations :

#### Service 1 : Site Public
- Name: coworking-site
- Import: apps/site/northflank.json
- Domain: coworking.app

#### Service 2 : Admin Dashboard
- Name: coworking-admin
- Import: apps/admin/northflank.json
- Domain: admin.coworking.app

#### Service 3 : Socket Server
- Name: coworking-socket
- Import: apps/socket-server/northflank.json
- Domain: socket.coworking.app

### 2. Configuration DNS

Dans ton registrar DNS :

```
Type    Name      Value
─────────────────────────────────────────
A       @         [Northflank IP pour site]
CNAME   admin     [Northflank domain pour admin]
CNAME   socket    [Northflank domain pour socket]
```

### 3. Build & Deploy

Northflank va automatiquement :
1. Clone le repo
2. Install toutes les dépendances (pnpm workspace)
3. Build les packages dans l'ordre
4. Build les apps
5. Démarrer les services

### 4. Vérifications post-déploiement

- [ ] Site public accessible : https://coworking.app
- [ ] Admin accessible : https://admin.coworking.app
- [ ] Socket health check : https://socket.coworking.app/health
- [ ] MongoDB connection réussie (logs Northflank)
- [ ] WebSocket fonctionne (tester messagerie admin)

## Scaling

### Scaler le site public (traffic élevé)
```
replicas: 2
resources.memory: 1024MB
```

### Scaler Socket.io (> 50 users simultanés)
1. Ajouter Redis addon sur Northflank
2. Modifier socket-server pour utiliser Redis adapter
3. Augmenter replicas: 2

## Monitoring

- Logs : Northflank Dashboard > Service > Logs
- Metrics : CPU, Memory, Network dans Northflank
- Alerts : Configurer dans Northflank Notifications

## Rollback

En cas de problème :
1. Northflank Dashboard > Service > Deployments
2. Sélectionner déploiement précédent
3. Click "Redeploy"

## Support

- [Documentation Northflank](https://northflank.com/docs)
- [Status page](https://status.northflank.com/)
