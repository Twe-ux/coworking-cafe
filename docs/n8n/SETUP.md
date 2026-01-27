# Guide d'Installation N8N

## Prérequis

- Compte N8N Cloud OU instance self-hosted
- Variable `CRON_SECRET` configurée dans l'app
- Accès aux endpoints `/api/cron/*`

---

## Étape 1 : Configurer les Credentials dans N8N

### Créer un "Header Auth" credential

1. Aller dans **Settings > Credentials**
2. Cliquer **Add Credential**
3. Choisir **Header Auth**
4. Configurer :
   - **Name**: `CoworkingCafe Cron Auth`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer VOTRE_CRON_SECRET`

---

## Étape 2 : Créer un Workflow Type

### Structure de base

```
┌─────────────────────┐
│  Schedule Trigger   │
│  (Cron expression)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    HTTP Request     │
│  POST /api/cron/... │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   IF (error)        │
│   status != 200     │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
  [Success]   [Error]
              Send Alert
```

### Configuration du Schedule Trigger

| Cron | Signification | Utilisé par |
|------|---------------|-------------|
| `0 10 * * *` | Tous les jours à 10h00 | Send Reminders, Check Attendance |
| `0 19 * * *` | Tous les jours à 19h00 | Daily Report |
| `*/5 * * * *` | Toutes les 5 minutes | Publish Scheduled |

### Configuration du HTTP Request

- **Method**: POST
- **URL**: `https://votre-domaine.com/api/cron/[endpoint]`
- **Authentication**: Predefined Credential Type
- **Credential Type**: Header Auth
- **Header Auth**: `CoworkingCafe Cron Auth`
- **Options**:
  - Timeout: 30000 (30 secondes)
  - Response Format: JSON

---

## Étape 3 : Importer les Workflows

1. Aller dans **Workflows**
2. Cliquer **Import from File**
3. Sélectionner le fichier JSON depuis `docs/n8n/workflows/`
4. **Modifier l'URL** avec votre domaine
5. **Associer le credential** Header Auth
6. **Activer** le workflow

---

## Étape 4 : Tester

### Test manuel

1. Ouvrir le workflow
2. Cliquer **Execute Workflow**
3. Vérifier le résultat

### Vérifier les logs API

```bash
# Dans les logs Northflank/Vercel
[CRON] send-reminders executed: { reminders_sent: 5 }
```

---

## Troubleshooting

### Erreur 401 Unauthorized

- Vérifier que `CRON_SECRET` est identique dans N8N et l'app
- Vérifier le format du header : `Bearer SECRET` (avec espace)

### Erreur 500

- Vérifier les logs de l'application
- Tester l'endpoint manuellement avec curl :

```bash
curl -X POST https://votre-domaine.com/api/cron/daily-report \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

### Timeout

- Augmenter le timeout dans N8N (Options > Timeout)
- Optimiser l'endpoint si trop lent

---

## Bonnes Pratiques

1. **Nommer clairement** les workflows : `[CoworkingCafe] Send Reminders`
2. **Ajouter des tags** : `cron`, `coworking`, `production`
3. **Configurer les alertes** en cas d'échec
4. **Documenter** les changements dans ce repo
5. **Tester** en staging avant production
