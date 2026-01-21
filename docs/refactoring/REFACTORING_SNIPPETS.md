# Snippets de Code - Refactorisation Header/Footer/Layout

Guide de référence rapide avec les extraits de code les plus importants.

---

## Layout Principal

### Layout TSX
```tsx
// apps/site/src/app/(site)/layout.tsx
import type { ReactNode } from "react"
import type { Metadata } from "next"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ScrollToTop from "@/components/ui/ScrollToTop"
import "./layout.scss"

export const metadata: Metadata = {
  title: "CoworKing Café by Anticafé",
  description: "Espace de coworking à Strasbourg",
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <ScrollToTop />
    </>
  )
}
```

---

## Header

### Menu Items Data
```tsx
const menuItems: MenuItem[] = [
  { label: "Accueil", href: "/" },
  {
    label: "Concept",
    href: "/concept",
    submenu: [
      { label: "Working café", href: "/concept" },
      { label: "Take Away", href: "/take-away" },
      { label: "Notre histoire", href: "/history" },
      { label: "Manifeste", href: "/manifest" },
    ],
  },
  { label: "Espaces", href: "/spaces" },
  {
    label: "Tarifs",
    href: "/pricing",
    submenu: [
      { label: "Nos offres", href: "/pricing" },
      { label: "Programme membre", href: "/members-program" },
      { label: "Offres étudiantes", href: "/student-offers" },
    ],
  },
  { label: "Menu", href: "/boissons" },
  { label: "Le Mag'", href: "/blog" },
]
```

### Active Link Detection
```tsx
const isActiveLink = (href: string): boolean => {
  if (href === "/") {
    return pathname === "/"
  }
  return pathname.startsWith(href)
}
```

### Header Structure
```tsx
<header className="header">
  <div className="header__container">
    <div className="header__content">
      <Link href="/" className="header__logo">
        <img src="/images/logo-black.svg" alt="CoworKing Café" />
      </Link>

      <Navbar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="header__actions">
        <Link href="/contact" className="header__action header__action--desktop-only">
          Contact
        </Link>
        <Link href="/booking" className="header__cta header__cta--desktop-only">
          <span>Réserver</span>
          <i className="bi bi-arrow-up-right" />
        </Link>
        <button className="header__burger" onClick={toggleMobileMenu}>
          <i className={isMobileMenuOpen ? "bi bi-x" : "bi bi-list"} />
        </button>
      </div>
    </div>
  </div>
</header>
```

### Header SCSS - Sticky & Responsive
```scss
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: var(--btn-clr);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &__nav {
    @media (max-width: 1199px) {
      position: fixed;
      top: 0;
      left: -100%;
      width: 300px;
      height: 100vh;
      background-color: var(--btn-clr);
      transition: left 0.3s ease;
    }

    &--active {
      left: 0;
    }
  }
}
```

---

## Footer

### Footer Data
```tsx
const footerSections: FooterSection[] = [
  {
    title: "Liens rapides",
    links: [
      { label: "Réserver", href: "/booking" },
      { label: "Fonctionnement", href: "/concept" },
      { label: "Tarifs", href: "/pricing" },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "CGU / CGV", href: "/CGU" },
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Politique de confidentialité", href: "/confidentiality" },
    ],
  },
]

const socialLinks: SocialLink[] = [
  {
    platform: "Facebook",
    icon: "fa-brands fa-facebook-f",
    href: "https://facebook.com/coworkingcafe",
    ariaLabel: "Suivez-nous sur Facebook",
  },
  {
    platform: "Instagram",
    icon: "fa-brands fa-instagram",
    href: "https://instagram.com/coworkingcafe",
    ariaLabel: "Suivez-nous sur Instagram",
  },
]

const contactInfo = {
  address: {
    street: "1 rue de la Division leclerc",
    city: "67000 Strasbourg",
  },
  phone: "09 87 33 45 19",
  email: { user: "strasbourg", domain: "coworkingcafe.fr" },
  hours: "L-V: 09h-20h | S-D & JF: 10h-20h",
}
```

### Footer Structure
```tsx
<footer className="footer">
  <div className="footer__container">
    <div className="footer__brand">
      <Link href="/" className="footer__logo">
        <img src="/images/logo-circle-white.png" alt="CoworKing Café" />
      </Link>
      <ul className="footer__social">
        {socialLinks.map((social) => (
          <li key={social.platform}>
            <a href={social.href} aria-label={social.ariaLabel}>
              <i className={social.icon} />
            </a>
          </li>
        ))}
      </ul>
    </div>

    <hr className="footer__divider" />

    <div className="footer__content">
      <FooterContact />
      <FooterLinks />
    </div>

    <FooterCopyright />
  </div>
</footer>
```

### Footer SCSS - Grid Layout
```scss
.footer {
  background-color: var(--secondary-clr);
  color: var(--pra-clr);

  &__content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 3rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}
```

---

## ScrollToTop

### Component avec Debounce
```tsx
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400)
    }

    let timeoutId: NodeJS.Timeout | null = null
    const debouncedHandleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 100)
    }

    window.addEventListener("scroll", debouncedHandleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <button
      className={`scroll-to-top ${isVisible ? "scroll-to-top--visible" : ""}`}
      onClick={scrollToTop}
      aria-label="Retour en haut de page"
    >
      <i className="bi bi-arrow-up" />
    </button>
  )
}
```

### ScrollToTop SCSS
```scss
.scroll-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;

  &--visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
  }
}
```

---

## Variables CSS

### Fichier layout.scss
```scss
:root {
  // Couleurs
  --main-clr: #417972;
  --btn-clr: #f2d381;
  --secondary-clr: #1a1a1a;
  --primary-clr: #ffffff;
  --grayWhite-clr: #e3ece7;
  --pra-clr: #e3ece7ab;

  // Spacing
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;

  // Shadows
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);

  // Transitions
  --transition-base: 0.3s ease;

  // Breakpoints
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;
}
```

---

## Patterns BEM Communs

### Block + Element + Modifier
```scss
// Block
.header { }

// Elements
.header__logo { }
.header__nav { }
.header__cta { }

// Sub-elements
.header__nav-list { }
.header__nav-item { }
.header__nav-link { }

// Modifiers
.header__nav--active { }
.header__cta--desktop-only { }
.header__nav-link--active { }

// État
.header__nav-item.is-open { }
```

### Responsive Pattern
```scss
.header {
  // Mobile first (base styles)
  padding: 1rem;

  // Desktop
  @media (min-width: 1200px) {
    padding: 1.5rem;
  }
}
```

---

## TypeScript Types

### Interface Props
```tsx
interface MenuItem {
  label: string
  href: string
  submenu?: MenuItem[]
}

interface NavbarProps {
  isOpen: boolean
  onClose: () => void
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface FooterLink {
  label: string
  href: string
}
```

---

## Accessibilité

### ARIA Labels
```tsx
// Boutons
<button aria-label="Toggle menu" aria-expanded={isOpen}>
  <i className="bi bi-list" />
</button>

// Liens sociaux
<a href={url} aria-label="Suivez-nous sur Facebook">
  <i className="fa-brands fa-facebook-f" />
</a>

// Overlay
<div className="header__overlay" onClick={onClose} aria-hidden="true" />
```

### Focus States
```scss
.header__nav-link {
  &:focus-visible {
    outline: 3px solid var(--btn-clr);
    outline-offset: 2px;
  }
}
```

---

## Performance

### Debounced Scroll
```tsx
let timeoutId: NodeJS.Timeout | null = null
const debouncedHandleScroll = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(handleScroll, 100)
}
```

### Passive Listeners
```tsx
window.addEventListener("scroll", handler, { passive: true })
```

### Cleanup
```tsx
useEffect(() => {
  // Setup
  return () => {
    // Cleanup
    window.removeEventListener("scroll", handler)
  }
}, [])
```

---

## Import Paths

### Path Aliases (@)
```tsx
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ScrollToTop from "@/components/ui/ScrollToTop"
```

### Configuration tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Commands

### Installation
```bash
cd apps/site
npm install bootstrap bootstrap-icons
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

---

## Tests Manuels

### Checklist Navigation
- [ ] Logo → home
- [ ] Menu items → bonnes pages
- [ ] Dropdowns hover (desktop)
- [ ] Dropdowns toggle (mobile)
- [ ] Active state visible
- [ ] Menu mobile open/close
- [ ] Overlay close menu

### Checklist Responsive
- [ ] Mobile (< 768px): burger menu
- [ ] Tablet (768-1199px): burger menu
- [ ] Desktop (>= 1200px): horizontal nav

### Checklist Accessibilité
- [ ] Navigation clavier (Tab)
- [ ] Focus visible
- [ ] ARIA labels présents
- [ ] Screen reader compatible

---

*Snippets créés le 2026-01-13*
