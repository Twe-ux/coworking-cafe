# CLAUDE.md - CoworKing Café Monorepo

Instructions pour Claude Code lors du travail sur ce projet.

## 📋 Contexte du projet

Monorepo Next.js 14 contenant :
- **apps/site** : Site public + Dashboard client (Bootstrap + SCSS)
- **apps/admin** : Dashboard admin (Tailwind + shadcn/ui + PWA)
- **packages/** : Code partagé (database, email, shared)

**Projet original** : `/Users/twe/Developer/Thierry/bt-coworkingcafe/` (ne pas toucher)
**Nouveau monorepo** : `/Users/twe/Developer/Thierry/coworking-cafe/` (version propre)

---

## 🎯 Objectif principal

**Refactorisation complète du site** avec code propre et maintenable :
- ✅ 44 pages à refactoriser (voir docs/REFACTO_TEMPLATE.md)
- ✅ Nommage cohérent (BEM modifié)
- ✅ Composants réutilisables avec children
- ✅ Pas de duplication de code
- ✅ SCSS harmonisé

---

## 📚 Documentation

**IMPORTANT : Lire ces documents avant de coder**

### docs/CONVENTIONS.md
- Architecture monorepo
- Nommage BEM modifié (`.page-name__section-element`)
- Structure des fichiers
- Guidelines React/TypeScript/SCSS
- Variables CSS et mixins
- Composants réutilisables

### docs/REFACTO_TEMPLATE.md
- Workflow en 4 phases (Analyse → Écriture → Découpage → Harmonisation)
- Templates de code complets
- Exemples avant/après
- Checklist par page
- Ordre de refacto recommandé

---

## 🔧 Commandes

```bash
# Root
pnpm install              # Installer toutes les dépendances
pnpm dev                  # Lancer site + admin en parallèle
pnpm build                # Builder tous les apps

# Site
pnpm --filter @coworking/site dev
pnpm --filter @coworking/site build

# Admin
pnpm --filter @coworking/admin dev
pnpm --filter @coworking/admin build
```

---

## 🎨 Workflow de refacto (par page)

### Phase 1 : Analyse (30min-1h)
1. Lire page actuelle dans `bt-coworkingcafe/`
2. Lire tous ses composants
3. Identifier duplications et réutilisations
4. Suivre checklist dans docs/REFACTO_TEMPLATE.md

### Phase 2 : Écriture monolithique (1-2h)
1. **Tout écrire dans un seul fichier** (vision complète)
2. Structure :
   ```tsx
   // TYPES
   // DATA
   // ANIMATION VARIANTS
   // SOUS-COMPOSANTS LOCAUX
   // PAGE PRINCIPALE
   ```
3. Nommage BEM cohérent
4. SCSS harmonisé correspondant

### Phase 3 : Découpage (1-2h)
1. Extraire composants **réutilisables** → `src/components/ui/`
2. Extraire composants **layout** → `src/components/layout/`
3. Garder composants **spécifiques** dans la page
4. Utiliser **children** et composition
5. Renommer avec cohérence (pas de One, Two, Three)

### Phase 4 : Harmonisation (30min)
1. Vérifier nommage cohérent entre pages
2. Vérifier réutilisation composants
3. Tests responsive
4. Validation accessibilité

---

## ✅ Règles strictes

### Nommage
```scss
// ✅ BON - BEM modifié
.home__hero
.home__hero-title
.home__hero-title--highlighted
.home__hero-cta

// ❌ MAUVAIS
.hero-one
.heroTitle
.hero_title
```

### Composants
```tsx
// ✅ BON - Composant flexible avec children
<Hero variant="full" title="Titre">
  <CustomContent />
</Hero>

// ❌ MAUVAIS - Duplication
<HeroOne />
<HeroTwo />
<HeroThree />
```

### TypeScript
```tsx
// ✅ BON
interface HeroProps {
  title: string
  subtitle?: string
}

// ❌ MAUVAIS
const data: any = getData()
```

---

## 📊 État d'avancement

### ✅ Fait
- [x] Structure monorepo créée
- [x] apps/site configuré
- [x] Documentation complète (CONVENTIONS + REFACTO_TEMPLATE)
- [x] Audit des 44 pages

### ⏳ En cours
- [ ] Refacto page Home (prochaine étape)
- [ ] Refacto système Booking (7 pages)
- [ ] Refacto Dashboard Client (4 pages)

### 📋 À faire
- [ ] Refacto pages Auth (4 pages)
- [ ] Refacto pages Offres (5 pages)
- [ ] Refacto pages principales restantes
- [ ] Setup apps/admin (Tailwind + PWA)
- [ ] Setup packages partagés
- [ ] Déploiement Northflank

---

## 🚨 Rappels importants

1. **NE JAMAIS toucher** à `/Users/twe/Developer/Thierry/bt-coworkingcafe/`
2. **Toujours suivre** docs/REFACTO_TEMPLATE.md étape par étape
3. **Valider avec l'utilisateur** avant de passer à la page suivante
4. **Commits fréquents** avec messages descriptifs
5. **Tests après chaque page** (responsive, accessibilité)

---

## 💡 Tips

- Lire **docs/CONVENTIONS.md** en cas de doute sur le nommage
- Utiliser **docs/REFACTO_TEMPLATE.md** comme checklist
- Identifier les **patterns récurrents** pour les composants réutilisables
- Toujours préférer **composition + children** à la duplication
- Penser **mobile-first** pour le responsive

---

## 🔗 Liens utiles

- Repo original : `/Users/twe/Developer/Thierry/bt-coworkingcafe/`
- Nouveau monorepo : `/Users/twe/Developer/Thierry/coworking-cafe/`
- Documentation : `./docs/`

---

*Dernière mise à jour : 2026-01-13*
