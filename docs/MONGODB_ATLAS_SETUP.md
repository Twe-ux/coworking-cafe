# 🗄️ MongoDB Atlas - Configuration Production & Développement

> Guide de configuration MongoDB Atlas pour Coworking Café
> Date : 2026-01-30

---

## 🎯 Objectifs

- ✅ Séparer clairement PROD et DEV
- ✅ Créer des utilisateurs avec permissions minimales
- ✅ Sécuriser les accès réseau (IP Whitelist)
- ✅ Gérer plusieurs environnements proprement

---

## 🏗️ Architecture Recommandée

### Option 1 : Projets Séparés (Recommandé)

```
MongoDB Atlas Organization
│
├── Project: Coworking-Cafe-PROD
│   ├── Cluster: prod-cluster (M10 ou supérieur)
│   ├── Database: coworking_cafe
│   ├── Users: admin-prod, site-prod, socket-prod
│   └── Network: Vercel IPs, Northflank IPs
│
└── Project: Coworking-Cafe-DEV
    ├── Cluster: dev-cluster (M0 Free ou M2)
    ├── Database: coworking_cafe_dev
    ├── Users: dev-user
    └── Network: Votre IP, 0.0.0.0/0 (temporaire)
```

**Avantages** :

- ✅ Isolation totale prod/dev
- ✅ Facturation séparée
- ✅ Pas de risque de toucher la prod par erreur
- ✅ Gestion des accès granulaire

### Option 2 : Clusters Séparés (Acceptable)

```
MongoDB Atlas Organization
│
└── Project: Coworking-Cafe
    ├── Cluster: prod-cluster
    │   ├── Database: coworking_cafe
    │   └── Users: admin-prod, site-prod
    │
    └── Cluster: dev-cluster
        ├── Database: coworking_cafe_dev
        └── Users: dev-user
```

**Avantages** :

- ✅ Plus simple à gérer (un seul projet)
- ⚠️ Risque de confusion prod/dev

---

## 👥 Gestion des Utilisateurs MongoDB (Database Users)

### Principe du Moindre Privilège

**Ne jamais utiliser un utilisateur admin partout !**

Créer des utilisateurs spécialisés par service :

| Utilisateur      | Rôle        | Usage               | Permissions                            |
| ---------------- | ----------- | ------------------- | -------------------------------------- |
| `admin-prod`     | Admin       | Scripts, migrations | `atlasAdmin` ou `readWriteAnyDatabase` |
| `site-prod`      | Application | apps/site           | `readWrite` sur `coworking_cafe`       |
| `admin-app-prod` | Application | apps/admin          | `readWrite` sur `coworking_cafe`       |
| `socket-prod`    | Application | socket-server       | `readWrite` sur `coworking_cafe`       |
| `readonly-prod`  | Analytics   | Dashboards          | `read` sur `coworking_cafe`            |
| `dev-user`       | Dev         | Développement local | `readWrite` sur `coworking_cafe_dev`   |

### Créer un Utilisateur dans Atlas

#### Via Interface Web

1. **Aller dans Database Access** (menu gauche)
2. **Cliquer "Add New Database User"**
3. **Remplir le formulaire** :

   ```
   Authentication Method: Password
   Username: site-prod
   Password: [Générer un mot de passe fort]

   Database User Privileges:
   - Built-in Role: Read and write to any database
     OU
   - Specific Privileges:
     → Database: coworking_cafe
     → Collection: (All Collections)
     → Privileges: readWrite
   ```

4. **Cliquer "Add User"**

#### Via MongoDB CLI

```bash
# Installer mongocli
brew install mongodb/brew/mongocli

# Se connecter à Atlas
mongocli auth login

# Créer un utilisateur
mongocli atlas dbusers create \
  --username site-prod \
  --password "VotreMotDePasseSecurise123!" \
  --role readWrite@coworking_cafe \
  --projectId YOUR_PROJECT_ID
```

---

## 🔒 Sécurité Réseau (IP Whitelist)

### Production

**Autoriser UNIQUEMENT les IPs nécessaires** :

#### Vercel (apps/site + apps/admin)

```
# IPs Vercel (peuvent changer, vérifier la doc officielle)
# https://vercel.com/docs/concepts/edge-network/regions#region-list

76.76.21.0/24
76.76.21.21
76.76.21.98
```

**Comment trouver les IPs Vercel** :

1. Aller sur https://vercel.com/docs/concepts/edge-network/ip-addresses
2. Copier les plages IP de la région de déploiement
3. Ou utiliser un service IP fixe (Vercel Pro)

#### Northflank (socket-server)

```bash
# Trouver l'IP de votre service Northflank
# Dans Northflank Dashboard:
# → Service → Networking → External IP

# Exemple:
35.195.123.45
```

#### Votre IP Locale (pour connexion directe)

```bash
# Trouver votre IP publique
curl https://api.ipify.org

# Ajouter cette IP dans Atlas
# Format: 203.0.113.42/32 (le /32 signifie "seulement cette IP")
```

### Développement

**Plus permissif pour faciliter le développement** :

```
# Votre IP locale
203.0.113.42/32

# Ou temporairement (JAMAIS EN PROD!)
0.0.0.0/0  # ⚠️ Autorise toutes les IPs
```

**⚠️ ATTENTION** : `0.0.0.0/0` = **TOUTES les IPs** → Utiliser UNIQUEMENT en dev

### Ajouter une IP dans Atlas

1. **Aller dans Network Access** (menu gauche)
2. **Cliquer "Add IP Address"**
3. **Options** :
   - **Add Current IP Address** : Ajoute votre IP actuelle
   - **Add IP Address** : Saisir manuellement (ex: `76.76.21.0/24`)
   - **Allow Access from Anywhere** : `0.0.0.0/0` (dev uniquement)
4. **Optionnel** : Ajouter un commentaire (ex: "Vercel Production")
5. **Cliquer "Confirm"**

---

## 🔑 Connection Strings (URI)

### Format de Connection String

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Exemples par Environnement

#### Production - apps/site

```bash
# .env.production (apps/site)
MONGODB_URI=mongodb+srv://site-prod:YOUR_PASSWORD@prod-cluster.abc123.mongodb.net/coworking_cafe?retryWrites=true&w=majority
```

#### Production - apps/admin

```bash
# .env.production (apps/admin)
MONGODB_URI=mongodb+srv://admin-app-prod:YOUR_PASSWORD@prod-cluster.abc123.mongodb.net/coworking_cafe?retryWrites=true&w=majority
```

#### Production - socket-server

```bash
# .env.production (socket-server)
MONGODB_URI=mongodb+srv://socket-prod:YOUR_PASSWORD@prod-cluster.abc123.mongodb.net/coworking_cafe?retryWrites=true&w=majority
```

#### Développement

```bash
# .env.local (tous les apps)
MONGODB_URI=mongodb+srv://dev-user:YOUR_PASSWORD@dev-cluster.xyz789.mongodb.net/coworking_cafe_dev?retryWrites=true&w=majority
```

### ⚠️ Sécurité des Mots de Passe

**Règles** :

- ✅ Minimum 16 caractères
- ✅ Majuscules + Minuscules + Chiffres + Symboles
- ✅ Différent pour chaque utilisateur
- ✅ Stocké dans variables d'environnement (JAMAIS dans le code)

**Générer un mot de passe fort** :

```bash
# Méthode 1 : OpenSSL
openssl rand -base64 24

# Méthode 2 : En ligne
# → https://passwordsgenerator.net/
# Longueur: 24, Symboles: Oui
```

**Encoder les caractères spéciaux dans l'URI** :

```bash
# Si le mot de passe contient des caractères spéciaux (@ # % etc.)
# Les encoder en URL :

@ → %40
# → %23
% → %25
/ → %2F

# Exemple :
# Mot de passe: MyP@ss#123
# Encodé: MyP%40ss%23123
```

---

## 📋 Checklist Configuration Production

### Avant Déploiement

- [ ] **Projet Atlas Production créé**
  - [ ] Cluster déployé (M10+ recommandé)
  - [ ] Région choisie (proche de vos utilisateurs)

- [ ] **Utilisateurs créés avec permissions minimales**
  - [ ] `admin-prod` (scripts/migrations)
  - [ ] `site-prod` (apps/site)
  - [ ] `admin-app-prod` (apps/admin)
  - [ ] `socket-prod` (socket-server)

- [ ] **IP Whitelist configurée**
  - [ ] IPs Vercel ajoutées
  - [ ] IP Northflank ajoutée
  - [ ] `0.0.0.0/0` SUPPRIMÉ (si ajouté en dev)

- [ ] **Connection Strings testées**
  - [ ] Test connexion depuis apps/site
  - [ ] Test connexion depuis apps/admin
  - [ ] Test connexion depuis socket-server

- [ ] **Backup automatiques activés**
  - [ ] Cloud Backup activé (Atlas → Backup)
  - [ ] Fréquence: Quotidien minimum
  - [ ] Rétention: 7 jours minimum

- [ ] **Alertes configurées**
  - [ ] Alerte si connexions échouées (authentification)
  - [ ] Alerte si charge CPU > 80%
  - [ ] Alerte si espace disque < 10%

### Après Déploiement

- [ ] **Monitoring actif**
  - [ ] Vérifier les métriques Atlas (Performance Advisor)
  - [ ] Créer des index si recommandés

- [ ] **Documentation**
  - [ ] Connection strings sauvegardées en sécurité (1Password, Bitwarden)
  - [ ] Procédure de rotation des mots de passe documentée

---

## 🔄 Rotation des Mots de Passe

**Fréquence recommandée** : Tous les 90 jours

### Procédure

1. **Créer un nouvel utilisateur avec nouveau mot de passe**

   ```
   Atlas → Database Access → Add New Database User
   Username: site-prod-2
   Password: [Nouveau mot de passe]
   Permissions: Identiques à site-prod
   ```

2. **Mettre à jour les variables d'environnement**

   ```bash
   # Vercel (apps/site)
   vercel env rm MONGODB_URI production
   vercel env add MONGODB_URI production
   # Coller la nouvelle URI avec site-prod-2
   ```

3. **Redéployer les applications**

   ```bash
   # Vercel redéploie automatiquement quand env change
   # Ou forcer un redéploiement
   vercel --prod
   ```

4. **Supprimer l'ancien utilisateur**

   ```
   Atlas → Database Access → site-prod → Delete
   ```

5. **Vérifier que tout fonctionne**
   - Tester le site
   - Vérifier les logs Vercel
   - Vérifier les connexions dans Atlas Metrics

---

## 📊 Monitoring & Alertes

### Métriques à Surveiller

1. **Performance**
   - Temps de réponse moyen
   - Opérations/seconde
   - Utilisation CPU/RAM

2. **Connexions**
   - Nombre de connexions actives
   - Pics de connexions
   - Connexions échouées

3. **Stockage**
   - Espace disque utilisé
   - Croissance quotidienne
   - Index performance

### Configurer des Alertes

```
Atlas → Alerts → New Alert

Exemples d'alertes utiles:

1. "Connections" > 80% de la limite
   → Email: admin@coworkingcafe.fr

2. "CPU Usage" > 80% pendant 5 minutes
   → Email + SMS

3. "Disk Space" < 10% restant
   → Email urgent

4. "Authentication Failures" > 10 en 5 minutes
   → Possible attaque, email urgent
```

---

## 💰 Coûts Estimés

### Production (M10 Cluster)

```
M10 Cluster (Shared vCPU, 2GB RAM, 10GB Storage)
- Europe (Ireland): ~57 USD/mois
- Backup automatique: ~10 USD/mois
- Total: ~67 USD/mois (~62 EUR/mois)
```

### Développement (M0 Free)

```
M0 Cluster (512MB RAM, 5GB Storage)
- Gratuit
- Limite: 1 cluster M0 par projet
```

### Optimisation

- **Indexation** : Créer des index pour améliorer les perfs
- **Archivage** : Archiver les vieilles données (bookings > 1 an)
- **Projection** : Récupérer seulement les champs nécessaires
- **Pagination** : Limiter les résultats (`.limit(50)`)

---

## 🆘 Troubleshooting

### Erreur : "Authentication failed"

```
Error: MongoServerError: Authentication failed
```

**Solutions** :

1. Vérifier username/password dans connection string
2. Vérifier que l'utilisateur existe dans Database Access
3. Vérifier les permissions de l'utilisateur
4. Encoder les caractères spéciaux du mot de passe

### Erreur : "IP not whitelisted"

```
Error: connection error: IP address is not whitelisted
```

**Solutions** :

1. Ajouter l'IP dans Network Access
2. Vérifier que l'IP est correcte (`curl https://api.ipify.org`)
3. En dev temporaire : Ajouter `0.0.0.0/0` (JAMAIS EN PROD)

### Erreur : "Too many connections"

```
Error: Too many connections
```

**Solutions** :

1. Fermer les connexions inutilisées (`.close()`)
2. Utiliser connection pooling (déjà fait avec Mongoose)
3. Upgrader le cluster (M10 → M20)

### Performances lentes

**Diagnostics** :

1. Atlas → Performance Advisor → Voir les recommandations
2. Créer les index suggérés
3. Vérifier les slow queries (> 100ms)

---

## 📚 Ressources

### Documentation Officielle

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)
- [Security Best Practices](https://docs.mongodb.com/manual/security/)

### Outils Utiles

- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI pour explorer la DB
- [mongodump/mongorestore](https://docs.mongodb.com/database-tools/) - Backup/restore manuels
- [mongocli](https://www.mongodb.com/docs/mongocli/stable/) - CLI pour gérer Atlas

### Support

- [MongoDB Community Forums](https://www.mongodb.com/community/forums/)
- [Atlas Support](https://support.mongodb.com/) (avec plan payant)

---

## ✅ Résumé des Bonnes Pratiques

```
✅ Projets ou clusters séparés prod/dev
✅ Utilisateurs spécialisés par service (moindre privilège)
✅ IP Whitelist stricte en production
✅ Mots de passe forts (16+ caractères)
✅ Rotation des mots de passe tous les 90 jours
✅ Backup automatiques activés
✅ Alertes configurées (CPU, connexions, espace)
✅ Monitoring régulier des métriques
✅ Connection strings dans variables d'environnement
✅ Encoder les caractères spéciaux dans les URIs
✅ Créer des index pour les requêtes fréquentes

❌ Jamais 0.0.0.0/0 en production
❌ Jamais de mots de passe dans le code
❌ Jamais utiliser l'utilisateur admin pour les apps
❌ Jamais exposer les connection strings publiquement
```

---

**Dernière mise à jour** : 2026-01-30
**Responsable** : Dev Team
