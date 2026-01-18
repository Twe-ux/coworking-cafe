# 🎨 Guide des Icônes - Admin App

**Date**: 18 janvier 2026
**App**: `/apps/admin/`
**Status**: ✅ Configuré et fonctionnel

---

## 📋 Table des Matières

1. [Structure des Icônes](#structure-des-icônes)
2. [Types d'Icônes et Usage](#types-dicônes-et-usage)
3. [Configuration Metadata](#configuration-metadata)
4. [Dossier Public Partagé](#dossier-public-partagé)
5. [Checklist de Validation](#checklist-de-validation)
6. [Régénérer les Icônes](#régénérer-les-icônes)

---

## 📁 Structure des Icônes

```
/apps/admin/public/
├── favicon.ico                      # 16x16/32x32 - Onglet navigateur
├── favicon.svg                      # Scalable - Navigateur moderne
├── favicon-96x96.png                # 96x96 - HD favicon
├── apple-touch-icon.png             # 180x180 - iOS home screen
├── web-app-manifest-192x192.png     # 192x192 - PWA icône standard
├── web-app-manifest-512x512.png     # 512x512 - PWA icône haute résolution
└── logo/
    └── logo-circle-white.png        # Logo cercle (usage interne)
```

---

## 🎯 Types d'Icônes et Usage

### 1. Favicon (Navigateur)

**Fichiers** :
- `favicon.ico` (16x16 & 32x32, multi-résolution)
- `favicon.svg` (scalable, navigateurs modernes)
- `favicon-96x96.png` (haute résolution)

**Usage** :
- S'affiche dans l'onglet du navigateur
- Favoris/Bookmarks
- Barre d'adresse

**Configuration** (`layout.tsx`) :
```typescript
icons: {
  icon: [
    { url: '/favicon.ico', sizes: '32x32' },
    { url: '/favicon.svg', type: 'image/svg+xml' },
    { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
  ],
}
```

---

### 2. Apple Touch Icon (iOS)

**Fichier** : `apple-touch-icon.png` (180x180)

**Usage** :
- Icône sur l'écran d'accueil iOS/iPadOS
- Safari "Add to Home Screen"
- iOS Safari bookmarks

**Configuration** (`layout.tsx`) :
```typescript
icons: {
  apple: [
    { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}

appleWebApp: {
  capable: true,
  statusBarStyle: 'black-translucent',
  title: 'CWC Admin',
}
```

**Spécifications iOS** :
- Taille : 180x180px (obligatoire)
- Format : PNG avec transparence
- Coins : iOS ajoute automatiquement les coins arrondis
- Nom : Doit être exactement `apple-touch-icon.png`

---

### 3. PWA Icons (Web App Manifest)

**Fichiers** :
- `web-app-manifest-192x192.png` (standard)
- `web-app-manifest-512x512.png` (haute résolution)

**Usage** :
- Installation PWA (Progressive Web App)
- Écran d'accueil Android
- Chrome "Install App"
- Splash screen

**Configuration** (`manifest.ts`) :
```typescript
icons: [
  {
    src: '/web-app-manifest-192x192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'any',
  },
  {
    src: '/web-app-manifest-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any',
  },
]
```

**Spécifications PWA** :
- Taille minimale : 192x192px
- Taille recommandée : 512x512px
- Format : PNG avec transparence
- Purpose : `any` (standard) ou `maskable` (icône adaptable Android)

---

## ⚙️ Configuration Metadata

### `/src/app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: "CoworKing Café Admin",
  description: "Administration CoworKing Café",

  // Manifest PWA
  manifest: '/manifest.webmanifest',

  // Couleur thème (barre Android/iOS)
  themeColor: '#000000',

  // Viewport PWA
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },

  // Configuration iOS
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CWC Admin',
  },

  // Icônes
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}
```

### `/src/app/manifest.ts`

```typescript
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Coworking Café - Admin',
    short_name: 'CWC Admin',
    description: 'Dashboard administrateur du Coworking Café',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['business', 'productivity'],
    shortcuts: [
      {
        name: 'Messages Contact',
        short_name: 'Contact',
        description: 'Voir les messages de contact',
        url: '/admin/support/contact',
        icons: [{ src: '/web-app-manifest-192x192.png', sizes: '192x192' }],
      },
    ],
  }
}
```

---

## 🔄 Dossier Public Partagé ?

### ❌ Non Recommandé

**Question** : Devrait-on partager le dossier `/public/` entre `apps/site` et `apps/admin` ?

**Réponse** : **Non**, pour plusieurs raisons :

#### 1. Contrainte Technique Next.js

Next.js nécessite un dossier `/public/` **à la racine de chaque app**. C'est une contrainte du framework.

```
❌ NE FONCTIONNE PAS
/public/                  # Racine monorepo
  ├── admin-icons/
  └── site-icons/

✅ CORRECT
/apps/admin/public/       # Dossier public app admin
  └── favicon.ico
/apps/site/public/        # Dossier public app site
  └── favicon.ico
```

#### 2. Icônes Différentes par Nature

Les deux apps ont des identités visuelles différentes :

| Aspect | Admin | Site |
|--------|-------|------|
| **Public** | Non (dashboard privé) | Oui (site public) |
| **Couleur thème** | Sombre (#000000) | Clair ou brand |
| **Logo** | Logo admin simplifié | Logo complet brand |
| **Favicon** | Badge "A" ou logo circle | Logo café complet |
| **PWA** | Business tool | Marketing/Booking |

#### 3. URLs Différentes

- Admin : `https://admin.coworkingcafe.com`
- Site : `https://coworkingcafe.com`

**Résultat** : Chaque domaine a son propre favicon et metadata → icônes séparées logiques.

---

### ✅ Alternative : Package d'Assets Partagés

Si vraiment besoin de partager certains assets (ex: logo branding) :

```bash
# Créer un package d'assets
mkdir -p packages/assets/icons

# Structure
packages/assets/
├── icons/
│   ├── brand/
│   │   ├── logo.svg
│   │   └── logo-circle.svg
│   ├── admin/
│   │   └── favicon-admin.ico
│   └── site/
│       └── favicon-site.ico
├── package.json
└── README.md
```

**Build script** pour copier dans chaque app :

```json
// packages/assets/package.json
{
  "scripts": {
    "copy:admin": "cp -r icons/admin/* ../../apps/admin/public/",
    "copy:site": "cp -r icons/site/* ../../apps/site/public/",
    "copy:all": "pnpm copy:admin && pnpm copy:site"
  }
}
```

**Mais** : Ajoute de la complexité pour un gain limité. **Recommandation** : Garder icônes séparées.

---

## ✅ Checklist de Validation

### 1. Vérifier les Fichiers

```bash
cd /apps/admin/

# Vérifier présence des icônes
ls -lh public/*.png public/*.ico public/*.svg

# Devrait afficher :
# favicon.ico
# favicon.svg
# favicon-96x96.png
# apple-touch-icon.png
# web-app-manifest-192x192.png
# web-app-manifest-512x512.png
```

### 2. Vérifier les Dimensions

```bash
# Vérifier dimensions PNG
file public/*.png

# Résultat attendu :
# apple-touch-icon.png: 180x180
# favicon-96x96.png: 96x96
# web-app-manifest-192x192.png: 192x192
# web-app-manifest-512x512.png: 512x512
```

### 3. Tester dans Navigateur

**Chrome/Edge** :
1. Lancer l'app : `pnpm dev`
2. Ouvrir `http://localhost:3000`
3. Vérifier favicon dans l'onglet ✅
4. Ouvrir DevTools > Application > Manifest
5. Vérifier icônes PWA ✅

**Safari (iOS)** :
1. Ouvrir sur iPhone/iPad
2. Partager > "Add to Home Screen"
3. Vérifier icône 180x180 ✅

**Android** :
1. Ouvrir sur Android
2. Menu > "Install App"
3. Vérifier icônes 192x192 et 512x512 ✅

### 4. Valider Manifest PWA

```bash
# Builder l'app
pnpm build

# Accéder au manifest généré
curl http://localhost:3000/manifest.webmanifest | jq

# Vérifier :
# - name: "Coworking Café - Admin"
# - icons[0].src: "/web-app-manifest-192x192.png"
# - icons[1].src: "/web-app-manifest-512x512.png"
```

### 5. Lighthouse Audit

**Chrome DevTools** :
1. Ouvrir DevTools > Lighthouse
2. Sélectionner "Progressive Web App"
3. Run audit
4. Vérifier score PWA > 90 ✅

**Critères PWA** :
- ✅ Manifest avec icônes 192x192 et 512x512
- ✅ Service worker (si configuré)
- ✅ HTTPS (en production)
- ✅ Responsive
- ✅ Favicon présent

---

## 🎨 Régénérer les Icônes

Si tu veux régénérer toutes les icônes depuis un logo source :

### Outils Recommandés

1. **Figma** (export multi-résolutions)
2. **Adobe Illustrator**
3. **Online : RealFaviconGenerator** (https://realfavicongenerator.net/)

### Process Recommandé

#### 1. Créer le Logo Source

**Format** : SVG 512x512px
- Logo centré
- Fond transparent
- Couleurs brand

#### 2. Exporter les Tailles

```bash
# Depuis Figma/Illustrator, exporter en PNG :
- 512x512 → web-app-manifest-512x512.png
- 192x192 → web-app-manifest-192x192.png
- 180x180 → apple-touch-icon.png
- 96x96 → favicon-96x96.png
- 32x32 → favicon-32x32.png (pour .ico)
- 16x16 → favicon-16x16.png (pour .ico)
```

#### 3. Générer le favicon.ico

**Outil** : ImageMagick

```bash
# Convertir PNG → ICO multi-résolution
convert favicon-16x16.png favicon-32x32.png -colors 256 favicon.ico
```

**Ou** : Utiliser RealFaviconGenerator (génère tout automatiquement)

#### 4. Créer le SVG Favicon

```bash
# Optimiser le SVG
npx svgo logo.svg -o favicon.svg
```

#### 5. Remplacer dans `/public/`

```bash
# Copier tous les fichiers générés
cp *.png *.ico *.svg /apps/admin/public/
```

---

## 📊 Récapitulatif

| Fichier | Taille | Usage | Obligatoire |
|---------|--------|-------|-------------|
| `favicon.ico` | 16x16 & 32x32 | Navigateur | ✅ Oui |
| `favicon.svg` | Scalable | Navigateur moderne | 🟡 Recommandé |
| `favicon-96x96.png` | 96x96 | HD favicon | 🟡 Recommandé |
| `apple-touch-icon.png` | 180x180 | iOS home screen | ✅ Oui (si PWA) |
| `web-app-manifest-192x192.png` | 192x192 | PWA standard | ✅ Oui (si PWA) |
| `web-app-manifest-512x512.png` | 512x512 | PWA HD | ✅ Oui (si PWA) |

---

## 🐛 Troubleshooting

### Favicon ne s'affiche pas

**Causes** :
1. Cache navigateur
2. Chemin incorrect dans `layout.tsx`
3. Fichier manquant dans `/public/`

**Solutions** :
```bash
# 1. Vider cache navigateur
# Chrome : Ctrl+Shift+Delete > Clear cache

# 2. Vérifier chemin
cat src/app/layout.tsx | grep favicon

# 3. Vérifier fichier existe
ls public/favicon.ico
```

### PWA ne s'installe pas

**Causes** :
1. Manifest invalide
2. Icônes manquantes
3. Pas de HTTPS (en production)

**Solutions** :
```bash
# 1. Valider manifest
curl http://localhost:3000/manifest.webmanifest | jq

# 2. Vérifier icônes PWA
ls public/web-app-manifest-*.png

# 3. Tester avec Lighthouse (DevTools)
```

### Apple Touch Icon incorrecte

**Causes** :
1. Taille incorrecte (doit être 180x180)
2. Nom fichier incorrect
3. Format incorrect

**Solutions** :
```bash
# Vérifier taille
file public/apple-touch-icon.png
# Doit afficher: 180 x 180

# Vérifier nom (case-sensitive)
ls public/apple-touch-icon.png
```

---

## 📚 Ressources

- [Next.js Metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Apple Touch Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

---

**Auteur** : Claude Sonnet 4.5 + Thierry
**Date** : 18 janvier 2026
**Status** : ✅ Documentation complète et validée
