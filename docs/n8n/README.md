# N8N - Automatisation des Tâches Planifiées

> **Alternative aux Cron Jobs Northflank** - Utiliser N8N pour gérer les tâches planifiées du CoworKing Café.

## Pourquoi N8N ?

- **Interface visuelle** : Configuration facile sans CLI
- **Monitoring intégré** : Logs et historique des exécutions
- **Retry automatique** : Gestion des erreurs et reprises
- **Notifications** : Alertes en cas d'échec

---

## Liste des Workflows à Configurer

| Workflow | Schedule | Endpoint | Description |
|----------|----------|----------|-------------|
| Send Reminders | `0 10 * * *` (10h00) | `/api/cron/send-reminders` | Rappels 24h avant réservation |
| Check Attendance | `0 10 * * *` (10h00) | `/api/cron/check-attendance` | Traitement des no-shows |
| Daily Report | `0 19 * * *` (19h00) | `/api/cron/daily-report` | Rapport quotidien admin |

### ❌ Cron Jobs Obsolètes (ne plus utiliser)

| Workflow | Raison |
|----------|--------|
| ~~Create Holds (J-7)~~ | Remplacé par capture manuelle Stripe (90 jours) |
| ~~Capture Deposits (J-6)~~ | Remplacé par capture manuelle Stripe (90 jours) |
| ~~Publish Scheduled~~ | Fonctionnalité de publication différée supprimée |

---

## Configuration Requise

### Variables d'environnement

```env
# Dans l'application (apps/site)
CRON_SECRET=votre-secret-tres-securise

# Dans N8N (credentials)
SITE_BASE_URL=https://votre-domaine.com
CRON_SECRET=votre-secret-tres-securise
```

### Sécurité des Endpoints

Tous les endpoints cron vérifient le header d'autorisation :

```
Authorization: Bearer ${CRON_SECRET}
```

---

## Configuration N8N

### Option 1 : N8N Cloud (Recommandé)

1. Créer un compte sur [n8n.cloud](https://n8n.cloud)
2. Importer les workflows depuis `workflows/`
3. Configurer les credentials

### Option 2 : Self-hosted sur Northflank

1. Créer un service Docker avec l'image `n8nio/n8n`
2. Configurer le volume pour la persistance
3. Exposer le port 5678

---

## Structure des Workflows

Chaque workflow suit ce pattern :

```
[Schedule Trigger]
    → [Set Variables (URL, Secret)]
    → [HTTP Request POST]
    → [IF Error]
        → [Send Alert Email/Slack]
```

---

## Monitoring

### Vérifier les exécutions

1. Accéder au dashboard N8N
2. Aller dans "Executions"
3. Filtrer par workflow

### Alertes recommandées

Configurer des notifications (email/Slack) pour :
- Échec d'exécution
- Timeout (> 30 secondes)
- Erreurs HTTP (status != 200)

---

## Ajouter un nouveau Cron Job

1. **Créer l'endpoint API** dans `apps/site/src/app/api/cron/[nom]/route.ts`
2. **Sécuriser** avec vérification du `CRON_SECRET`
3. **Documenter** dans ce fichier (ajouter à la table)
4. **Créer le workflow N8N** (copier un existant et adapter)
5. **Tester** manuellement avant activation

---

## Fichiers de Configuration

```
docs/n8n/
├── README.md              # Ce fichier
├── workflows/             # Exports JSON des workflows N8N
│   ├── send-reminders.json
│   ├── check-attendance.json
│   └── daily-report.json
└── SETUP.md               # Guide d'installation détaillé
```

---

## Ressources

- [Documentation N8N](https://docs.n8n.io/)
- [N8N Schedule Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)
- [N8N HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
