# 📱 Guide PWA - CoworKing Café Site

## ✅ Configuration PWA activée

La PWA est maintenant configurée avec un parcours optimisé pour les clients :
- **Première ouverture** : Page de connexion (/auth/login)
- **Après connexion** : Dashboard client (automatique)
- **Navigation** : Profil, Réservations, Paramètres

### 📄 Fichiers créés

1. **`public/manifest.webmanifest`** - Configuration PWA
   - Nom : "CoworKing Café - Client"
   - Start URL : /auth/login (connexion au lancement)
   - Scope : / (toute l'app)
   - Raccourcis : Mon Dashboard, Réserver

2. **`public/sw.js`** - Service Worker
   - Cache basique pour offline
   - Cache : /booking + assets

3. **`src/app/layout.tsx`** - Metadata ajoutée
   - Lien vers manifest
   - Configuration Apple Web App

## 🧪 Tester la PWA

### Sur Desktop (Chrome/Edge)

1. Ouvrir http://localhost:3000
2. Dans la barre d'adresse, cliquer sur l'icône "Installer" ⊕
3. Ou : Menu > Installer CoworKing Café
4. L'app s'ouvre sur la page de connexion

### Sur Mobile (iOS Safari)

1. Ouvrir http://localhost:3000
2. Appuyer sur "Partager" (icône carré avec flèche)
3. Sélectionner "Sur l'écran d'accueil"
4. L'app apparaît comme une app native
5. Première ouverture → Page de connexion

### Sur Mobile (Android Chrome)

1. Ouvrir http://localhost:3000
2. Bannière "Ajouter à l'écran d'accueil" apparaît
3. Ou : Menu > Ajouter à l'écran d'accueil
4. Première ouverture → Page de connexion

## 🎯 Parcours Utilisateur PWA

### 📱 Première Installation

1. **Installation** : Ajouter l'app à l'écran d'accueil
2. **Première ouverture** : Page de connexion `/auth/login`
3. **Connexion** : Saisir identifiants
4. **Redirection automatique** : Dashboard client `/{userId}`
5. **Navigation** : Accès à toutes les fonctionnalités (Profil, Réservations, Paramètres)

### ⚡ Raccourcis PWA (Long press sur l'icône)

- **Mon Dashboard** : Accès direct à l'espace client
- **Réserver** : Créer une nouvelle réservation

## 🎯 Fonctionnalités PWA

### ✅ Activées
- Installation sur écran d'accueil
- Mode standalone (plein écran sans barre de navigation)
- **Interface adaptative** : Header et Footer masqués automatiquement en mode PWA sur :
  - `/auth/*` (login, register, etc.)
  - `/booking` et sous-routes
  - `/dashboard` et sous-routes
  - `/{userId}/*` (profil, réservations, paramètres)
- Raccourcis rapides (Dashboard, Réservation)
- Cache basique pour offline
- Icônes adaptées
- Start URL optimisée pour l'authentification

### ⚠️ Non activées (optionnel)
- Notifications push
- Synchronisation en arrière-plan
- Cache avancé des pages

## 🎨 Interface Adaptative PWA

### Détection Automatique

L'application détecte automatiquement si elle est lancée en mode PWA (standalone) et adapte l'interface :

- **Mode Navigateur** : Header et Footer complets visibles partout
- **Mode PWA** : Header et Footer masqués sur les pages applicatives (auth, booking, dashboard)

Cette adaptation se fait via :
- `useIsPWA()` hook qui détecte `display-mode: standalone`
- `ConditionalLayout` qui cache conditionnellement header/footer selon la route

### Bénéfices

- **Expérience native** : Plus d'espace pour le contenu principal
- **Navigation optimisée** : Pas de distractions avec navigation du site
- **Focus utilisateur** : L'attention reste sur les fonctionnalités app

## 🔧 Activer le Service Worker (Important)

Le service worker n'est **pas encore enregistré**. Pour l'activer :

### Option 1 : Script dans le layout (Recommandé)

Ajouter dans `src/app/layout.tsx` :

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('SW registered'))
                  .catch(err => console.log('SW registration failed'));
              });
            }
          `
        }} />
      </head>
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
```

### Option 2 : Composant dédié (Plus propre)

Créer `src/components/PWARegister.tsx` :

```tsx
'use client';

import { useEffect } from 'react';

export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
```

Puis l'importer dans le layout :

```tsx
import { PWARegister } from '@/components/PWARegister';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <PWARegister />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
```

## 📊 Vérifier que la PWA fonctionne

### Chrome DevTools

1. Ouvrir DevTools (F12)
2. Aller dans l'onglet **Application**
3. Vérifier :
   - **Manifest** : Doit afficher les infos de manifest.webmanifest
   - **Service Workers** : Doit montrer sw.js activé
   - **Cache Storage** : Doit montrer coworking-cafe-v1

### Lighthouse

1. DevTools > Lighthouse
2. Sélectionner "Progressive Web App"
3. Cliquer "Generate report"
4. Score cible : > 80/100

## 🎨 Personnalisation

### Changer les couleurs

Éditer `public/manifest.webmanifest` :

```json
{
  "background_color": "#NOUVELLE_COULEUR",
  "theme_color": "#NOUVELLE_COULEUR"
}
```

### Ajouter des icônes supplémentaires

Si tu as des icônes 192x192 ou 512x512 :

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Modifier le scope

Pour limiter la PWA **uniquement** à /booking et /dashboard :

```json
{
  "start_url": "/booking",
  "scope": "/booking"  // Limite aux URL commençant par /booking
}
```

Ou créer 2 manifests séparés si nécessaire.

## 🚀 Prochaines étapes (optionnel)

- [ ] Enregistrer le service worker (Option 1 ou 2 ci-dessus)
- [ ] Tester sur mobile réel
- [ ] Ajouter plus de pages au cache offline
- [ ] Configurer notifications push (si besoin)
- [ ] Optimiser les icônes (créer 192x192 et 512x512)

## 🐛 Troubleshooting

**La PWA ne s'installe pas ?**
- Vérifier que le service worker est enregistré (DevTools > Application)
- Vérifier que manifest.webmanifest est accessible : http://localhost:3000/manifest.webmanifest
- Vérifier console pour erreurs

**Le service worker ne se met pas à jour ?**
- Dans DevTools > Application > Service Workers
- Cocher "Update on reload"
- Ou cliquer "Unregister" puis refresh

**L'icône ne s'affiche pas ?**
- Vérifier que les fichiers existent dans /public/
- Vider le cache navigateur
- Réinstaller la PWA

## ✅ Checklist finale

- [ ] Manifest créé et accessible
- [ ] Service worker créé
- [ ] Service worker enregistré (Option 1 ou 2)
- [ ] Testé sur desktop
- [ ] Testé sur mobile
- [ ] Score Lighthouse > 80
- [ ] Commit les changements
