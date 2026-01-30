# Socket Server - Déploiement Northflank

## 📋 Variables d'environnement

### Configuration Production

```bash
# MongoDB (même que site/admin)
MONGODB_URI=mongodb+srv://...

# CORS - URLs autorisées
ALLOWED_ORIGINS=https://admin.votredomaine.com,https://site.votredomaine.com

# Port (optionnel, défaut = 3002)
PORT=3002

# Environment
NODE_ENV=production

# JWT Secret (même que NEXTAUTH_SECRET de l'admin)
JWT_SECRET=...
```

---

## 🚀 Configuration Service Northflank

### Settings → General

- **Name**: `socket-server`
- **Port**: `3002`
- **Dockerfile Path**: `apps/socket-server/Dockerfile`
- **Build Context**: `.` (root du monorepo)

### Settings → Environment Variables

Ajouter les variables listées ci-dessus.

### Settings → Health Check

- **Path**: `/api/health` (ou `/health`)
- **Protocol**: `HTTP`
- **Port**: `3002`
- **Interval**: `30s`
- **Timeout**: `10s`
- **Unhealthy Threshold**: `3`
- **Healthy Threshold**: `2`

---

## 🔒 Sécurité

### ⚠️ Points Critiques

1. **MONGODB_URI** : DOIT être la même base que site et admin
2. **JWT_SECRET** : DOIT être identique à `NEXTAUTH_SECRET` de l'admin
3. **ALLOWED_ORIGINS** : Contenir UNIQUEMENT les URLs de production (HTTPS)

### Synchronisation avec les autres apps

| Variable | Sync avec | Note |
|----------|-----------|------|
| `MONGODB_URI` | Site + Admin | **Identique** |
| `JWT_SECRET` | Admin (`NEXTAUTH_SECRET`) | **Identique** |
| `ALLOWED_ORIGINS` | - | URLs des apps |

---

## 🧪 Test du Déploiement

### 1. Health Check

```bash
curl https://socket.votredomaine.com/health
# ou
curl https://socket.votredomaine.com/api/health
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T...",
  "uptime": 123.456
}
```

### 2. Test WebSocket (depuis navigateur)

```javascript
// Ouvrir la console dans l'admin
const socket = io('https://socket.votredomaine.com', {
  auth: {
    token: 'votre-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to socket server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});
```

---

## 📦 Build & Deploy

### Build automatique via Northflank

Northflank détecte automatiquement le `Dockerfile` et build lors d'un push sur `main`.

### Build manuel (local)

```bash
# Depuis la racine du monorepo
docker build -f apps/socket-server/Dockerfile -t socket-server .
docker run -p 3002:3002 --env-file apps/socket-server/.env.local socket-server
```

---

## 🐛 Troubleshooting

### Socket ne se connecte pas

1. **Vérifier ALLOWED_ORIGINS** :
   - Doit contenir l'URL de l'admin (HTTPS)
   - Pas de trailing slash
   - Séparées par virgules (pas d'espaces)

2. **Vérifier JWT_SECRET** :
   - Doit être identique à `NEXTAUTH_SECRET` de l'admin
   - Tester avec un token généré par l'admin

3. **Vérifier MONGODB_URI** :
   - Connection MongoDB OK ?
   - User/password corrects ?
   - Base de données accessible depuis Northflank ?

### Health check échoue

1. Vérifier que le service écoute sur le port `3002`
2. Vérifier que `/api/health` ou `/health` répond
3. Logs Northflank :
   ```
   Northflank → Services → socket-server → Logs
   ```

---

## 📊 Monitoring

### Logs Northflank

```
Northflank → Services → socket-server → Logs
```

**Filtrer par** :
- `✅` : Succès (connexions, démarrages)
- `❌` : Erreurs
- `Client connected` : Nouvelles connexions
- `Client disconnected` : Déconnexions

### Métriques

```
Northflank → Services → socket-server → Metrics
```

- CPU Usage
- Memory Usage
- Network I/O
- Active Connections

---

## 🔄 Redéploiement

### Après modif du code

```bash
git add .
git commit -m "fix(socket-server): ..."
git push origin main
```

Northflank redéploie automatiquement.

### Après modif des variables d'environnement

1. Northflank → Services → socket-server → Environment Variables
2. Modifier la variable
3. Save
4. Redeploy (bouton en haut à droite)

---

## ✅ Checklist Déploiement

Avant de déployer en production :

- [ ] `MONGODB_URI` configuré (même que site/admin)
- [ ] `ALLOWED_ORIGINS` configuré avec URLs HTTPS
- [ ] `JWT_SECRET` configuré (même que admin)
- [ ] `PORT` = 3002
- [ ] `NODE_ENV` = production
- [ ] Health check configuré (`/api/health`)
- [ ] Build Dockerfile réussit
- [ ] Test connexion WebSocket OK
- [ ] Logs Northflank sans erreurs

---

**Dernière mise à jour** : 2026-01-30
