# Layout Components

Composants de mise en page pour le site public CoworKing Café.

## Composants disponibles

### 1. Header
Navigation principale avec menu responsive et user menu.

**Props:**
```typescript
interface HeaderProps {
  user?: {
    name: string;
    avatar?: string;
  };
  className?: string;
  id?: string;
}
```

**Exemple:**
```tsx
import { Header } from '@/components/layout';

// Sans utilisateur connecté
<Header />

// Avec utilisateur connecté
<Header user={{ name: 'John Doe', avatar: '/images/avatar.jpg' }} />
```

**Features:**
- Navigation desktop horizontale
- Menu mobile burger responsive
- Bouton CTA "Réserver"
- User menu dropdown (si connecté)
- Active state sur le lien actuel
- Liens: Accueil, Espaces, Tarifs, Blog, Contact

---

### 2. Footer
Pied de page avec 3 colonnes, newsletter et liens légaux.

**Props:**
```typescript
interface FooterProps {
  className?: string;
  id?: string;
}
```

**Exemple:**
```tsx
import { Footer } from '@/components/layout';

<Footer />
```

**Features:**
- 3 colonnes: À propos, Liens rapides, Newsletter
- Formulaire newsletter (API: POST /api/newsletter)
- Social media icons (Facebook, Instagram, LinkedIn)
- Liens légaux (Mentions légales, CGU, Confidentialité)
- Copyright dynamique (année courante)

---

### 3. Navigation
Liste de liens responsive avec état actif.

**Props:**
```typescript
interface NavigationProps {
  links: Array<{
    label: string;
    href: string;
    active?: boolean;
  }>;
  onClick?: () => void;
  className?: string;
  id?: string;
}
```

**Exemple:**
```tsx
import { Navigation } from '@/components/layout';

const links = [
  { label: 'Accueil', href: '/' },
  { label: 'Espaces', href: '/spaces' },
  { label: 'Tarifs', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' }
];

<Navigation links={links} />
```

**Features:**
- Active state automatique (via usePathname)
- Active state manuel (prop `active`)
- Callback onClick optionnel (pour fermer menu mobile)
- Responsive: horizontal desktop, vertical mobile

---

### 4. Breadcrumb
Fil d'Ariane avec Schema.org BreadcrumbList.

**Props:**
```typescript
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href: string;
    current?: boolean;
  }>;
  className?: string;
  id?: string;
}
```

**Exemple:**
```tsx
import { Breadcrumb } from '@/components/layout';

<Breadcrumb
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Article', href: '/blog/article-slug', current: true }
  ]}
/>
```

**Features:**
- Schema.org JSON-LD pour SEO
- Séparateur ">" entre items
- Dernier item non cliquable
- Format: Accueil > Page > Sous-page

---

## Utilisation dans un Layout

```tsx
// app/(site)/layout.tsx
import { Header, Footer } from '@/components/layout';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

## Utilisation avec Breadcrumb

```tsx
// app/(site)/blog/[slug]/page.tsx
import { Breadcrumb } from '@/components/layout';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: 'Mon article', href: `/blog/${params.slug}`, current: true }
        ]}
      />
      {/* Contenu de la page */}
    </div>
  );
}
```

## Styles SCSS

Les styles sont organisés selon la convention BEM modifiée:

```scss
// Fichiers:
// - styles/layout/_header.scss
// - styles/layout/_footer.scss
// - styles/layout/_navigation.scss
// - styles/layout/_breadcrumb.scss

// Classes BEM:
.layout-header { }
.layout-header__container { }
.layout-header__logo { }
.layout-header__logo-link { }
.layout-header__nav { }
.layout-header__nav--desktop { }
.layout-header__nav--mobile { }
```

## Conventions

- **TypeScript**: Aucun `any` type
- **Imports**: Utiliser `@/` pour imports absolus
- **Props**: Hériter de `BaseComponentProps` (className, id)
- **Styles**: BEM modifié avec préfixe `.layout-*`
- **Client Components**: `'use client'` si événements (onClick, useState)
- **Responsive**: Mobile-first (styles mobile par défaut, media queries pour desktop)

## Tests

Pour tester les composants:

```bash
# Type-check
pnpm type-check

# Build
pnpm build

# Dev server
pnpm dev
```

## Notes

- **Header** utilise `'use client'` pour gérer les menus déroulants
- **Footer** utilise `'use client'` pour le formulaire newsletter
- **Navigation** utilise `usePathname()` pour détecter la page active
- **Breadcrumb** est un Server Component (pas d'interactivité)
