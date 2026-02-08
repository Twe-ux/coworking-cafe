# CLAUDE.md - Site App Development Guide

> **App** : `/apps/site/` - Site Public + Dashboard Client
> **Version** : 7.0
> **Status** : 🚧 En Refactorisation

---

## 📋 Vue d'Ensemble

Application Next.js 14 contenant **DEUX parties distinctes** :

### 🌐 Site Public
- Home, Espaces, Blog, Contact
- Réservations en ligne
- Pages marketing

### 👤 Dashboard Client
- Gestion réservations
- Messages/Support
- Paramètres compte
- Module promo

**Stack** : Next.js 14 · TypeScript · Bootstrap 5 · SCSS · MongoDB · NextAuth

---

## 🎯 Status Actuel

### ✅ Phases Complétées

- **Phase 1** : Élimination `any` types (-73% réduction) ✅
- **Phase 2** : Correction erreurs TypeScript (0 erreur) ✅
- **Phase Email** : Délivrabilité emails (Score 10/10) ✅

### 🚧 En Cours : Refactorisation Code

**Objectif** : Code propre et maintenable

- 🎯 Fichiers < 200 lignes
- 🎯 Composants réutilisables (children)
- 🎯 Nommage BEM cohérent
- 🎯 Pas de duplication
- 🎯 Dates en format string

**Voir** : [docs/refactoring/](./docs/refactoring/) pour détails des phases

---

## 🚨 Règles CRITIQUES

### 1. TypeScript - ZÉRO `any`

```typescript
// ❌ INTERDIT
function handleData(data: any) { }

// ✅ CORRECT
import type { BookingData } from '@/types/booking'
function handleData(data: BookingData) { }
```

### 2. Dates - TOUJOURS des Strings

```typescript
// ❌ INTERDIT
{ date: new Date().toISOString() }

// ✅ CORRECT
{ date: "2026-01-16", startTime: "09:00" } // YYYY-MM-DD, HH:mm
```

### 3. Composants - Réutilisables avec Children

```typescript
// ❌ MAUVAIS - Duplication
<HeroOne />
<HeroTwo />

// ✅ BON - Flexible
<Hero variant="full" title="Titre">
  <CustomContent />
</Hero>
```

### 4. SCSS - Nommage BEM Modifié

```scss
// ✅ CORRECT - BEM avec préfixe global
.section-hero { }           // Bloc
.section-hero__title { }    // Élément
.section-hero--dark { }     // Modificateur

// ❌ INTERDIT - Duplication
.hero-one { }
.hero-two { }
```

### 5. Taille Fichiers - Max 200 Lignes

| Type | Max | Action |
|------|-----|--------|
| Composants | 200 | Extraire sous-composants |
| Pages | 150 | Logique → hooks |
| API Routes | 200 | Extraire validation |

---

## 📚 Documentation Détaillée

**Toute la documentation est dans `/docs/`** :

### 📖 Guides de Développement
→ **[docs/guides/](./docs/guides/)**
- Architecture site + dashboard
- Conventions code (BEM, Bootstrap, SCSS)
- Workflow refactorisation
- PWA & Service Workers
- Questions fréquentes

### 🔄 Historique Refactorisation
→ **[docs/refactoring/](./docs/refactoring/)**
- Phase 1 : Élimination `any` types
- Phase 2 : Correction erreurs TypeScript
- Phase Email : Délivrabilité
- Rapports détaillés par phase

### ⚙️ Features Spécifiques
→ **[docs/features/](./docs/features/)**
- Système de réservation
- Module promo (scan QR code)
- Dashboard client
- Intégration Stripe

### 🚀 Opérations & Déploiement
→ **[docs/operations/](./docs/operations/)**
- Déploiement Vercel
- Monitoring production
- Troubleshooting
- Email deliverability

### 💡 Améliorations Futures
→ **[docs/improvements/](./docs/improvements/)**
- TODO list
- Features prévues
- Optimisations

---

## 🎯 Checklist Avant de Coder

- [ ] J'ai lu ce CLAUDE.md
- [ ] J'ai consulté la doc pertinente dans `/docs/`
- [ ] Je n'utiliserai pas `any`
- [ ] Dates en format string (YYYY-MM-DD, HH:mm)
- [ ] Composants réutilisables (pas de duplication)
- [ ] Fichiers < 200 lignes
- [ ] Nommage BEM cohérent pour SCSS
- [ ] Tests manuels avant commit

---

## 💡 En Cas de Doute

**Questions rapides** :

| Question | Réponse |
|----------|---------|
| Où est la documentation ? | → [docs/guides/](./docs/guides/) |
| Comment nommer mes classes SCSS ? | → BEM modifié (.section-hero__title) |
| `any` interdit ? | → OUI - Toujours typer |
| Date ou string ? | → TOUJOURS string (YYYY-MM-DD) |
| Comment refactoriser ? | → [docs/refactoring/](./docs/refactoring/) |

**Plus de réponses** : [docs/guides/FAQ.md](./docs/guides/FAQ.md)

---

## ⚠️ IMPORTANT : Distinction Site Public vs Dashboard

### Structure de `/apps/site/`

```
/apps/site/
├── src/app/(site)/              # 🌐 SITE PUBLIC
│   ├── page.tsx                 # Home
│   ├── booking/                 # Réservations
│   ├── spaces/                  # Espaces
│   └── blog/                    # Blog
│
└── src/app/dashboard/           # 👤 DASHBOARD CLIENT
    ├── settings/                # Paramètres
    ├── messages/                # Messagerie
    └── promo/                   # Module promo
```

### APIs Partagées

Certaines APIs sont utilisées par les DEUX parties :

- ✅ **Partagées** : Booking, Auth, Promo
- 🌐 **Site only** : Blog, Contact
- 👤 **Dashboard only** : Messages, Settings

**Voir** : [MIGRATION_GUIDE.md](../admin/docs/guides/MIGRATION_GUIDE.md) (admin) pour gérer les APIs partagées

---

## 🚀 Workflow Refactorisation

```
1. Lire ce CLAUDE.md
2. Consulter docs/refactoring/
3. Analyser code à refactoriser
4. Appliquer conventions strictes
5. Tester manuellement
6. Type-check + Build
7. Commit
```

**Guide complet** : [docs/refactoring/](./docs/refactoring/)

---

## 📖 Liens Rapides

### Documentation
- [docs/guides/](./docs/guides/) - Guides développement
- [docs/refactoring/](./docs/refactoring/) - Historique phases
- [docs/features/](./docs/features/) - Features spécifiques
- [docs/operations/](./docs/operations/) - Déploiement & ops

### Documentation Externe
- [Next.js 14](https://nextjs.org/docs/app)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/)
- [TypeScript](https://www.typescriptlang.org/docs/)

---

## 📝 Commandes Utiles

```bash
# Développement
pnpm dev                      # Lancer serveur dev
pnpm type-check               # Vérifier TypeScript
pnpm build                    # Builder l'app

# Tests
pnpm exec tsc --noEmit        # Type check complet
```

---

**Dernière mise à jour** : 2026-02-08
**Mainteneur** : Thierry + Claude
**Version** : 7.0

---

*Ce fichier est le point d'entrée. Consulte `/docs/` pour les guides détaillés ! 🚀*
