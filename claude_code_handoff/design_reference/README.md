# Design reference — mockups HTML

Ces fichiers sont la source de vérité visuelle. Chaque HTML est autonome (React + Babel inline, ouvre direct dans un navigateur).

## À ouvrir en premier

**`05_v2_dark_editorial/index.html`** — page d'index avec liens vers toutes les pages V2. C'est la direction retenue pour le site public + le dashboard desktop.

## Fichiers

| Fichier | Contenu | Device | Statut |
|---|---|---|---|
| `01_auth.html` | Login, register, reset password | Mobile + desktop | Référence |
| `02_booking_flow.html` | Flow réservation 4 étapes | Mobile + desktop | Référence |
| `03_dashboard_mobile.html` | Espace membre mobile | Mobile uniquement | Référence |
| `04_landing_variations.html` | 3 variations de landing | Desktop | **Archive** (V1, ne pas utiliser) |
| `05_v2_dark_editorial/` | **Tout le V2** : landing, espaces, concept, tarifs, menu, événements, dashboard desktop | Responsive | Référence principale |
| `*.jsx` + `styles.css` | Fichiers partagés utilisés par les mockups 01–04 (chargés via `<script src>`) | — | Support |

## V1 vs V2

- **V1** = `04_landing_variations.html` → exploration initiale avec 3 directions visuelles. **Obsolète.**
- **V2** = `05_v2_dark_editorial/` → direction retenue « Dark Editorial ». **À implémenter.**

Les fichiers 01/02/03 ont été faits avant V2 et utilisent un style intermédiaire. Les porter vers les tokens V2 lors de l'implémentation (palette + typo + composants de `05_v2_dark_editorial/`).
