# CoworKing Café Strasbourg — spec produit

Document de référence complet pour l'implémentation. Lire `CLAUDE.md` d'abord pour l'ordre et les conventions, puis cette spec pour les détails.

## 1. Contexte produit

**CoworKing Café** est un espace hybride coworking + café à Strasbourg. Positionnement : « Le café motive, l'humain relie ». Cible : freelances, équipes en remote, télétravailleurs, étudiants. Ouvert 7j/7, 9h–20h.

### Ce qu'on construit
Un site web public (marketing + vente) + un espace membre (compte, réservations, fidélité) + un flow de réservation complet (espaces à l'heure / journée / mois + salles privatisables).

### Stack cible
À confirmer au début — vérifier `apps/site/package.json`. Les mockups sont en React mais peuvent être portés vers Next/Remix/Astro selon ce qui existe.

---

## 2. Architecture

### Routes site public (`apps/site`)
```
/                     → Landing (hero, usages, concept, CTA)
/espaces              → Les 4 lieux + équipements
/concept              → Histoire, équipe, partenaires
/tarifs               → Plans + salles + FAQ
/menu                 → Carte boissons
/evenements           → Calendrier + privatisation
/login, /register, /reset
```

### Routes espace membre
```
/dashboard            → Vue d'ensemble
/dashboard/bookings   → Réservations actives
/dashboard/history    → Historique
/dashboard/wallet     → Crédits + factures
/dashboard/loyalty    → Points + récompenses
/dashboard/profile    → Infos perso
/dashboard/events     → Événements inscrits
/dashboard/directory  → Annuaire membres
```

### Flow de réservation (modale ou page dédiée)
```
/booking              → step 1 : choix espace
/booking?step=date    → step 2 : date + heure
/booking?step=options → step 3 : services add-ons
/booking?step=confirm → step 4 : récap + paiement Stripe
```

---

## 3. Design tokens

Source : `design_reference/05_v2_dark_editorial/tokens.css`.

### Couleurs
```css
--body:    #1A1A1A   /* texte principal, fonds dark */
--main:    #417972   /* sauge, accent primaire, CTA secondaires */
--btn:     #F2D381   /* miel, CTA primaires, highlights */
--btn-dark:#8A6B1F   /* miel foncé, texte sur miel */
--cream:   #FAF6EE   /* fond crème */
--line:    #E8E2D4   /* bordures, séparateurs */
--gry:     #7A766B   /* texte secondaire, meta */
--danger:  #C0534C   /* erreurs, alertes */
```

### Typo
- **Fraunces** (serif, opsz 9–144, weight 400–600) → titres, chiffres, noms de produits
- **Inter** (400 / 500 / 600) → body, UI, CTAs
- **JetBrains Mono** (400 / 500) → tags, labels secondaires, meta (avec letter-spacing 0.12–0.18em, uppercase)

Tailles clés :
- H1 : `clamp(40px, 7vw, 84px)` / Fraunces / -0.02em
- H2 : `clamp(32px, 4.5vw, 52px)` / Fraunces
- H3 : 22–28px / Fraunces
- Body : 14–16px / Inter
- Lead : 17–19px / Inter 400 / 1.55 line-height
- Tag/eyebrow : 10.5–11px / Mono / 0.14em / uppercase

### Rayons / ombres
- Cards : 18–22px
- Boutons : 100px (pill)
- Inputs : 12–14px
- Chips : 100px
- Pas d'ombres lourdes — bordures fines `1px solid var(--line)` suffisent

### Grilles
- Max-width content : 1200px (class `.wrap`)
- Padding container : `clamp(20px, 4vw, 48px)`
- Gap grid : 14–24px selon densité

---

## 4. Composants partagés

À implémenter dans `components/` :

### `<Nav>`
- Desktop : logo + 6 liens + "Se connecter" (ghost) + "Réserver" (primary miel)
- Mobile : logo + burger → panel fullscreen avec les liens
- Variant `dark` (sur fond sombre) + variant clair
- Prop `active` pour marquer la page courante

### `<PageHeader>`
- Fond dark (`--body`)
- Numéro de page + eyebrow mono + titre H1 serif + lead
- Utilisé au top de chaque page hors landing

### `<Footer>`
- 4 colonnes : brand + coordonnées, Espaces, Le lieu, Membre
- Fond sombre, tag mono pour les titres de colonnes

### `<Card>` variantes
- Standard : fond `#fff`, border `--line`, radius 18–22px
- Crème : fond `--cream`
- Dark : fond `--body`, texte blanc, pour highlights
- Glass (dans sections dark) : `rgba(255,255,255,0.04)` + `backdrop-blur`

### `<Chip>`
- Pill fond coloré léger + texte coloré assorti
- Variants : chip-btn (miel), tag (outline mono), status (success/pending/error)

### `<Button>`
- `primary` → fond `--btn` miel, texte `--body` noir
- `dark` → fond `--body`, texte blanc
- `ghost` → transparent + border
- `ghost-light` → transparent sur fond dark, border blanc 20%
- Tailles : sm (10px 14px), md (12px 22px), lg (14px 28px)
- Pills, toujours avec icône Chevron Right à droite sur CTAs

### `<Icon>`
- Unique composant SVG, prop `name size stroke sw fill`
- 45 icônes déjà dessinées, ajouter si manque
- Stroke par défaut : 1.7, fill : none

---

## 5. État et données

### Modèle données principal

```ts
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: 'hourly' | 'daily' | 'monthly';
  createdAt: Date;
  loyaltyPoints: number;
  creditHours: number;
  creditResetDate: Date;
};

type Space = {
  id: 'open' | 'verriere' | 'etage' | 'event';
  name: string;
  capacity: number;
  hourlyPrice: number;
  dailyPrice?: number;
  color: string;
  photos: string[];
};

type Booking = {
  id: string;
  userId: string;
  spaceId: string;
  startAt: Date;
  endAt: Date;
  duration: 'hourly' | 'daily' | 'weekly' | 'monthly';
  participants?: number;
  addons: string[];
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalCents: number;
  paidAt?: Date;
};

type EventItem = {
  id: string;
  title: string;
  category: 'communaute' | 'atelier' | 'degustation' | 'soiree';
  startAt: Date;
  endAt: Date;
  capacity: number;
  registered: number;
  description: string;
};

type Activity = {
  id: string;
  userId: string;
  type: 'booking_confirmed' | 'loyalty_earned' | 'invoice_paid' | 'event_registered' | 'member_joined';
  createdAt: Date;
  meta: Record<string, any>;
};
```

### Règles tarifaires
- Réservation ≥ 5 jours dans la même semaine : **-15%**
- Réservation ≥ 20 jours dans le mois : **-40%**
- Abonnement annuel : **-15%** sur le mensuel
- Annulation gratuite jusqu'à J-1, au-delà : 50% retenu

### Points fidélité
- 1h open-space = 10 pts
- 1 journée = 50 pts
- Événement participé = 30 pts
- Parrainage validé = 200 pts
- Paliers : Régulier (0–1500) → Ambassadeur (1500+) → Premium (5000+)

---

## 6. API (à confirmer avec le dev backend)

Endpoints suggérés (REST, cookie auth) :

```
POST   /api/auth/login         { email, password? | magicToken? }
POST   /api/auth/register      { email, firstName, lastName }
POST   /api/auth/magic-link    { email }
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/spaces             → liste des 4 espaces
GET    /api/availability       { spaceId, date } → créneaux libres
POST   /api/bookings           { spaceId, startAt, endAt, addons }
GET    /api/bookings           → réservations de l'user
DELETE /api/bookings/:id

GET    /api/events             → calendrier public
POST   /api/events/:id/register

GET    /api/me/loyalty         → points + palier + récompenses
GET    /api/me/invoices        → factures
GET    /api/me/activity        → feed activité
PATCH  /api/me                 → update profile

POST   /api/checkout/session   → Stripe checkout
POST   /api/webhooks/stripe
```

---

## 7. Accessibilité & i18n

- Contraste AA minimum (vérifier `--main` sur `--cream` → OK, `--btn` sur `--body` → OK)
- Tous les boutons icon-only ont `aria-label`
- Formulaires : `<label>` explicite, `aria-invalid` sur erreur, messages d'erreur sous le champ
- Focus visible custom (outline 2px `--main`, offset 2px)
- Nav clavier complète (pas de trap)
- `prefers-reduced-motion` → désactiver transforms/transitions

I18n : prévoir `t()` helper (FR par défaut, EN prochaine étape). Toutes les dates via helpers locale-aware (utiliser `Intl.DateTimeFormat`).

---

## 8. PWA (optionnel phase 2)

- Manifest avec icônes 192/512
- Service worker cache statique + stratégie stale-while-revalidate pour API read-only
- Page offline custom (retour à la dernière vue dashboard)
- Badge notifications (réservations à venir)

---

## 9. Références — correspondance design → page

| Design | Page produit | Priorité |
|---|---|---|
| `05_v2_dark_editorial/landing.html` | `/` | P1 |
| `05_v2_dark_editorial/espaces.html` | `/espaces` | P1 |
| `05_v2_dark_editorial/concept.html` | `/concept` | P2 |
| `05_v2_dark_editorial/tarifs.html` | `/tarifs` | P1 |
| `05_v2_dark_editorial/menu.html` | `/menu` | P2 |
| `05_v2_dark_editorial/evenements.html` | `/evenements` | P2 |
| `05_v2_dark_editorial/dashboard.html` | `/dashboard` (desktop) | P2 |
| `03_dashboard_mobile.html` | `/dashboard` (mobile) | P2 |
| `01_auth.html` | `/login`, `/register`, `/reset` | P1 |
| `02_booking_flow.html` | `/booking` (mobile + desktop) | P1 |
| `04_landing_variations.html` | _(archive, ne pas implémenter)_ | — |

---

## 10. Questions ouvertes à clarifier avec le product owner

1. **Paiement** : Stripe Checkout (redirect) ou Stripe Elements (embed) ?
2. **Magic link** : quel provider (Resend, Postmark, SES) ?
3. **Calendrier de dispos** : synchro avec un Google Calendar admin, ou DB interne uniquement ?
4. **Annuaire membres** : opt-in explicite (RGPD) ou automatique ?
5. **Chat live** : inclus en v1 ou reporté ?
6. **Multi-tenants** : prévu (plusieurs cafés) ou mono-site uniquement ?
7. **Facturation** : génération PDF (quelle lib ?), envoi email auto ?
