# Documentation des Routes API

> Liste complete des routes API de l'application admin.
> **Derniere mise a jour** : 2026-01-20

---

## Vue d'Ensemble

Toutes les routes API suivent le pattern :
- Authentification via `requireAuth()`
- Reponses standardisees avec `successResponse()` / `errorResponse()`
- Format JSON avec structure `{ success: boolean, data?: T, error?: string }`

---

## Routes par Module

### Authentication (`/api/auth/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/[...nextauth]` | Public | NextAuth endpoints |
| POST | `/api/auth/pin` | Public | Verification PIN |
| PUT | `/api/auth/update-pin` | Admin | Mise a jour PIN |

### HR - Employees (`/api/hr/employees/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/hr/employees` | Staff+ | Liste des employes |
| POST | `/api/hr/employees` | Admin | Creer un employe |
| GET | `/api/hr/employees/[id]` | Staff+ | Details employe |
| PUT | `/api/hr/employees/[id]` | Admin | Modifier employe |
| POST | `/api/hr/employees/[id]/end-contract` | Admin | Terminer contrat |
| POST | `/api/hr/employees/draft` | Admin | Brouillon employe |
| POST | `/api/hr/employees/verify-pin` | Public | Verifier PIN pointage |

### Time Entries (`/api/time-entries/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/time-entries` | Staff+ | Liste des pointages |
| POST | `/api/time-entries` | Admin | Creer pointage manuel |
| GET | `/api/time-entries/[id]` | Staff+ | Details pointage |
| PUT | `/api/time-entries/[id]` | Admin | Modifier pointage |
| DELETE | `/api/time-entries/[id]` | Admin | Supprimer pointage |
| POST | `/api/time-entries/clock-in` | Public | Pointer entree (PIN) |
| POST | `/api/time-entries/clock-out` | Public | Pointer sortie (PIN) |
| GET | `/api/time-entries/reports` | Admin | Rapports heures |

### Shifts (`/api/shifts/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/shifts` | Public | Liste des shifts |
| POST | `/api/shifts` | Admin | Creer shift |
| GET | `/api/shifts/[id]` | Staff+ | Details shift |
| PUT | `/api/shifts/[id]` | Admin | Modifier shift |
| DELETE | `/api/shifts/[id]` | Admin | Supprimer shift |

### Availabilities (`/api/availabilities/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/availabilities` | Staff+ | Liste disponibilites |
| POST | `/api/availabilities` | Admin | Creer disponibilite |
| GET | `/api/availabilities/[id]` | Staff+ | Details disponibilite |
| PUT | `/api/availabilities/[id]` | Admin | Modifier disponibilite |
| DELETE | `/api/availabilities/[id]` | Admin | Supprimer disponibilite |

### Accounting - Turnovers (`/api/accounting/turnovers/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/accounting/turnovers` | Admin | Liste CA journaliers |
| POST | `/api/accounting/turnovers` | Admin | Creer entree CA |
| GET | `/api/accounting/turnovers/[id]` | Admin | Details CA jour |
| PUT | `/api/accounting/turnovers/[id]` | Admin | Modifier CA |
| DELETE | `/api/accounting/turnovers/[id]` | Admin | Supprimer CA |

### Accounting - Cash Entries (`/api/accounting/cash-entries/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/accounting/cash-entries` | Admin | Liste entrees caisse |
| POST | `/api/accounting/cash-entries` | Admin | Creer entree caisse |
| GET | `/api/accounting/cash-entries/[id]` | Admin | Details entree |
| PUT | `/api/accounting/cash-entries/[id]` | Admin | Modifier entree |
| DELETE | `/api/accounting/cash-entries/[id]` | Admin | Supprimer entree |

### Messages - Contact (`/api/messages/contact/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/messages/contact` | Admin | Liste messages contact |
| GET | `/api/messages/contact/[id]` | Admin | Details message |
| PUT | `/api/messages/contact/[id]` | Admin | Modifier message |
| DELETE | `/api/messages/contact/[id]` | Admin | Supprimer message |
| GET | `/api/messages/contact/stats` | Admin | Statistiques messages |
| GET | `/api/messages/contact/unread-count` | Admin | Nombre non lus |

### Promo (`/api/promo/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/promo` | Admin | Liste codes promo |
| POST | `/api/promo` | Admin | Creer code promo |
| POST | `/api/promo/init` | Admin | Initialiser config |
| GET | `/api/promo/marketing` | Admin | Config marketing |

### Booking (`/api/booking/`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/booking/spaces` | Staff+ | Liste espaces |
| POST | `/api/booking/spaces` | Admin | Creer espace |
| GET | `/api/booking/spaces/[id]` | Staff+ | Details espace |
| PUT | `/api/booking/spaces/[id]` | Admin | Modifier espace |
| DELETE | `/api/booking/spaces/[id]` | Admin | Supprimer espace |
| GET | `/api/booking/reservations` | Staff+ | Liste reservations |
| POST | `/api/booking/reservations` | Admin | Creer reservation |
| GET | `/api/booking/reservations/[id]` | Staff+ | Details reservation |
| PUT | `/api/booking/reservations/[id]` | Admin | Modifier reservation |
| DELETE | `/api/booking/reservations/[id]` | Admin | Supprimer reservation |

---

## Format des Reponses

### Succes

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation reussie"
}
```

### Erreur

```json
{
  "success": false,
  "error": "Message d'erreur",
  "details": { ... }
}
```

### Codes HTTP

| Code | Signification |
|------|---------------|
| 200 | GET reussi |
| 201 | Creation reussie |
| 204 | Suppression reussie |
| 400 | Erreur validation |
| 401 | Non authentifie |
| 403 | Permission refusee |
| 404 | Ressource introuvable |
| 409 | Conflit (doublon) |
| 500 | Erreur serveur |

---

*Documentation generee le 2026-01-20*
