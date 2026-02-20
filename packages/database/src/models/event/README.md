# Event Model

Modèle Mongoose pour la gestion des événements organisés au CoworKing Café.

## Structure

```typescript
interface EventDocument {
  // Informations de base
  title: string;                    // Titre de l'événement
  slug: string;                     // URL-friendly (auto-généré depuis title)
  description: string;              // Description complète (HTML supporté)
  shortDescription?: string;        // Description courte pour les cards (max 300 car.)

  // Date & horaires
  date: string;                     // Format YYYY-MM-DD
  startTime?: string;               // Format HH:mm (ex: "14:00")
  endTime?: string;                 // Format HH:mm (ex: "16:30")

  // Catégorie & image
  category: string[];               // Ex: ["Atelier", "Bien-être"]
  imgSrc: string;                   // URL Cloudinary
  imgAlt: string;                   // Alt text SEO

  // Inscription
  registrationType: "internal" | "external";
  externalLink?: string;            // URL si inscription externe
  maxParticipants?: number;         // Limite si inscription interne
  currentParticipants?: number;     // Compteur si inscription interne

  // Optionnel
  location?: string;                // "Salle Verrière", "Open Space"
  price?: number;                   // Prix affiché (pas de paiement)
  organizer?: string;               // Nom de l'organisateur
  contactEmail?: string;            // Email de contact

  // Statut
  status: "draft" | "published" | "archived";
  createdBy: ObjectId;              // Admin qui a créé l'événement
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage

### Créer un événement

```typescript
import { Event } from '@coworking-cafe/database';

const event = await Event.create({
  title: "Atelier méditation",
  description: "Découvrez la méditation...",
  shortDescription: "Initiation à la méditation en pleine conscience",
  date: "2026-03-15",
  startTime: "14:00",
  endTime: "16:00",
  category: ["Atelier", "Bien-être"],
  imgSrc: "https://res.cloudinary.com/.../meditation.webp",
  imgAlt: "Atelier méditation au CoworKing Café",
  registrationType: "internal",
  maxParticipants: 15,
  currentParticipants: 0,
  location: "Salle Verrière",
  price: 10,
  status: "draft",
  createdBy: adminUserId,
});
// Le slug sera auto-généré : "atelier-meditation"
```

### Lister les événements publiés à venir

```typescript
const upcomingEvents = await Event.find({
  status: "published",
  date: { $gte: new Date().toISOString().split('T')[0] }
})
.sort({ date: 1 })
.limit(12);
```

### Filtrer par catégorie

```typescript
const ateliers = await Event.find({
  status: "published",
  category: { $in: ["Atelier"] },
  date: { $gte: new Date().toISOString().split('T')[0] }
})
.sort({ date: 1 });
```

## Validation

### Champs requis

- **title** : Max 200 caractères
- **slug** : Auto-généré si non fourni (unique)
- **description** : Requis
- **date** : Format YYYY-MM-DD strict
- **category** : Au moins une catégorie
- **imgSrc** : URL de l'image
- **imgAlt** : Alt text requis pour SEO
- **registrationType** : "internal" ou "external"
- **status** : "draft", "published" ou "archived"
- **createdBy** : ObjectId du User admin

### Validation conditionnelle

**Si `registrationType === "external"` :**
- `externalLink` requis

**Si `registrationType === "internal"` :**
- `maxParticipants` requis (min: 1)

### Formats

- **date** : YYYY-MM-DD (ex: "2026-03-15")
- **startTime/endTime** : HH:mm (ex: "14:00", "16:30")
- **contactEmail** : Format email valide

## Index

```typescript
// Performants pour :
{ date: 1, status: 1 }           // Liste événements publiés à venir
{ slug: 1 } (unique)             // URL unique
{ category: 1, status: 1 }       // Filtre par catégorie
{ createdBy: 1 }                 // Événements par admin
{ status: 1, date: -1 }          // Dashboard admin
```

## Hooks

### Pre-save

- **Auto-génération du slug** : Si slug vide, génère depuis title
  - Normalise les accents
  - Remplace espaces par `-`
  - Lowercase

Exemple : "Atelier méditation été 2026" → "atelier-meditation-ete-2026"

## Catégories par défaut

Importées depuis `constants.ts` :

```typescript
import { DEFAULT_EVENT_CATEGORIES } from '@coworking-cafe/database';

// ["Atelier", "Formation", "Conférence", "Networking", "Bien-être", ...]
```

Les admins peuvent ajouter des catégories personnalisées via le dashboard.

## Migration depuis eventsData.ts

L'ancien fichier `apps/site/src/db/events/enventsData.ts` (avec typo) contenait des données hardcodées fictives ("Paid Media Solution", etc.).

Ce fichier doit être **supprimé** et remplacé par des fetch depuis la DB via le modèle Event.

## API Endpoints

### Public (site)
- `GET /api/events/public` - Liste événements publiés à venir

### Admin
- `GET /api/events` - Liste tous les événements (filtres, pagination)
- `POST /api/events` - Créer un événement
- `GET /api/events/[id]` - Détails d'un événement
- `PATCH /api/events/[id]` - Modifier un événement
- `DELETE /api/events/[id]` - Supprimer un événement
- `POST /api/events/[id]/publish` - Toggle status published/draft

## Sécurité

- **Toutes les routes admin** protégées avec `requireAuth(['admin', 'dev'])`
- **Validation Zod** sur tous les inputs
- **Rate limiting** sur upload images
- **Sanitization** du HTML dans description (si éditeur WYSIWYG)

## TODO

- [ ] Créer modèle EventRegistration pour inscriptions internes
- [ ] Ajouter champ `tags` pour recherche fulltext
- [ ] Ajouter champ `isFeatured` pour mise en avant homepage
- [ ] Système de rappels email 24h avant événement
