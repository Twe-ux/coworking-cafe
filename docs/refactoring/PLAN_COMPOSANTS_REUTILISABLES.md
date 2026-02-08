# 📋 PLAN REFACTORISATION - COMPOSANTS RÉUTILISABLES

**Date** : 2026-01-29
**Objectif** : Créer des composants réutilisables pour le site public
**Approche** : Progressive, testée, sécurisée

---

## ⚠️ LEÇONS DE L'ÉCHEC PRÉCÉDENT

### Pourquoi la tentative précédente a échoué

**Problème** : Réécriture complète non testée
- ✗ Tout refait en une seule fois
- ✗ Pas de tests intermédiaires
- ✗ Changements visuels non intentionnels
- ✗ Logique cassée
- ✗ Pas de rollback plan

### Nouvelle Approche : Progressive et Sécurisée

**Principes** :
- ✅ **UN composant à la fois**
- ✅ **Test visuel après chaque étape**
- ✅ **Commit après chaque composant validé**
- ✅ **0 changement visuel non intentionnel**
- ✅ **Rollback immédiat si problème**

---

## 🎯 OBJECTIFS

### Composants Cibles

**Priorité 1 - Hero** :
- `HeroOne.tsx` → `Hero.tsx` (variant: "one")
- `HeroTwo.tsx` → `Hero.tsx` (variant: "two")
- `HeroThree.tsx` → `Hero.tsx` (variant: "three")
- `HeroFour.tsx` → `Hero.tsx` (variant: "four")

**Priorité 2 - Section** :
- `AboutOne.tsx` → `Section.tsx` (variant: "about-one")
- `AboutTwo.tsx` → `Section.tsx` (variant: "about-two")
- `ProjectOne.tsx` → `Section.tsx` (variant: "project-one")

**Priorité 3 - Card** :
- `ProjectCard.tsx` → `Card.tsx` (variant: "project")
- `BlogCard.tsx` → `Card.tsx` (variant: "blog")
- `SpaceCard.tsx` → `Card.tsx` (variant: "space")

### Résultat Attendu

- **Réduction code** : -25 à -30%
- **Duplication éliminée** : ~500-700 lignes
- **Flexibilité** : Composants avec `children` et `variant`
- **Maintenabilité** : 1 seul composant à maintenir au lieu de 4+

---

## 🔄 WORKFLOW DÉTAILLÉ

### Phase 1 : Analyse (Opus) - 30 min par composant

**Responsable** : Opus (meilleure analyse stratégique)

**Tâches** :
1. Lire TOUS les composants d'un même type (ex: Hero)
2. Identifier les points communs et différences
3. Créer une matrice comparative
4. Proposer une interface de props
5. Proposer les variants
6. **NE PAS CODER** - Seulement analyse

**Livrable** :
```markdown
# Analyse Hero Components

## Composants Analysés
- HeroOne.tsx (120 lignes)
- HeroTwo.tsx (115 lignes)
- HeroThree.tsx (130 lignes)
- HeroFour.tsx (110 lignes)

## Points Communs
- Structure: <section> avec image + texte
- Props: title, subtitle, image, cta
- Styles SCSS: .hero__xxx

## Différences
- HeroOne: Image à gauche, texte à droite
- HeroTwo: Image plein écran avec overlay
- HeroThree: Image arrière-plan avec gradient
- HeroFour: Image à droite, texte à gauche

## Interface Proposée
interface HeroProps {
  variant: "one" | "two" | "three" | "four"
  title: string
  subtitle?: string
  image: string
  imageAlt: string
  cta?: { label: string; href: string }
  children?: React.ReactNode
}

## Variants SCSS
.hero--one { }
.hero--two { }
.hero--three { }
.hero--four { }
```

---

### Phase 2 : Création Composant (Sonnet) - 1h par composant

**Responsable** : Sonnet (meilleur pour implémentation)

**Tâches** :
1. Créer le nouveau composant générique
2. Implémenter TOUS les variants
3. Copier les styles SCSS existants (SANS modification)
4. Typer correctement (0 `any`)
5. Documenter avec JSDoc

**Contraintes STRICTES** :
- ❌ **INTERDICTION de modifier les styles**
- ❌ **INTERDICTION de changer la structure HTML**
- ✅ Copier-coller les styles existants
- ✅ Ajouter variants avec classes conditionnelles

**Exemple Hero** :
```typescript
// apps/site/src/components/ui/Hero.tsx

/**
 * Composant Hero réutilisable
 * Remplace HeroOne, HeroTwo, HeroThree, HeroFour
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface HeroProps {
  /**
   * Variante visuelle du Hero
   * - "one": Image gauche, texte droite
   * - "two": Image plein écran avec overlay
   * - "three": Image arrière-plan avec gradient
   * - "four": Image droite, texte gauche
   */
  variant: 'one' | 'two' | 'three' | 'four';

  /** Titre principal */
  title: string;

  /** Sous-titre (optionnel) */
  subtitle?: string;

  /** URL de l'image */
  image: string;

  /** Texte alternatif de l'image (SEO) */
  imageAlt: string;

  /** Bouton CTA (optionnel) */
  cta?: {
    label: string;
    href: string;
  };

  /** Classes CSS additionnelles */
  className?: string;

  /** Contenu personnalisé (remplace title/subtitle si fourni) */
  children?: React.ReactNode;
}

export function Hero({
  variant,
  title,
  subtitle,
  image,
  imageAlt,
  cta,
  className,
  children
}: HeroProps) {
  return (
    <section className={cn('hero', `hero--${variant}`, className)}>
      {/* Contenu copié EXACTEMENT depuis HeroOne/Two/Three/Four */}
      {/* Selon le variant */}

      {variant === 'one' && (
        <>
          <div className="hero__image">
            <Image src={image} alt={imageAlt} width={600} height={400} priority />
          </div>
          <div className="hero__content">
            {children ? (
              children
            ) : (
              <>
                <h1 className="hero__title">{title}</h1>
                {subtitle && <p className="hero__subtitle">{subtitle}</p>}
                {cta && (
                  <Link href={cta.href} className="hero__cta">
                    {cta.label}
                  </Link>
                )}
              </>
            )}
          </div>
        </>
      )}

      {variant === 'two' && (
        // Code exact de HeroTwo
      )}

      {/* ... autres variants */}
    </section>
  );
}
```

**Styles SCSS** :
```scss
// styles/components/_hero.scss

// ✅ Copier-coller EXACT des styles existants
.hero {
  // Styles de base
}

// Variant one (copié depuis HeroOne)
.hero--one {
  // Copier EXACTEMENT les styles de HeroOne
}

// Variant two (copié depuis HeroTwo)
.hero--two {
  // Copier EXACTEMENT les styles de HeroTwo
}

// etc.
```

---

### Phase 3 : Test Visuel (Humain) - 15 min par composant

**Responsable** : Toi (validation humaine)

**Process** :
1. Sonnet crée une page de test
2. Tu compares visuellement ancien vs nouveau
3. Tu valides ou demandes corrections

**Page de Test** :
```typescript
// apps/site/src/app/test-hero/page.tsx

export default function TestHeroPage() {
  return (
    <div>
      <h1>Test Hero - Variant One</h1>

      <h2>Ancien (HeroOne)</h2>
      <HeroOne
        title="Test"
        subtitle="Subtitle"
        image="/test.jpg"
      />

      <hr />

      <h2>Nouveau (Hero variant="one")</h2>
      <Hero
        variant="one"
        title="Test"
        subtitle="Subtitle"
        image="/test.jpg"
        imageAlt="Test"
      />
    </div>
  );
}
```

**Checklist Validation** :
- [ ] Les deux versions sont **VISUELLEMENT IDENTIQUES**
- [ ] Les espacements sont identiques
- [ ] Les couleurs sont identiques
- [ ] Les fonts sont identiques
- [ ] Responsive identique (mobile, tablet, desktop)
- [ ] Hover/animations identiques

**Si différence** :
- ❌ **REJETER** → Sonnet corrige
- ✅ **APPROUVER** → Passer à Phase 4

---

### Phase 4 : Migration Progressive (Sonnet) - 30 min par composant

**Responsable** : Sonnet

**Tâches** :
1. Remplacer 1 seul usage de l'ancien composant
2. Tester visuellement
3. Si OK, remplacer le suivant
4. Répéter jusqu'à migration complète

**Exemple Migration Hero** :

**Étape 1** : Remplacer HeroOne sur homepage
```typescript
// apps/site/src/app/(site)/page.tsx

// ❌ Avant
import { HeroOne } from '@/components/site/home/HeroOne';

<HeroOne
  title="Bienvenue"
  subtitle="Au CoworKing Café"
  image="/images/hero.jpg"
/>

// ✅ Après
import { Hero } from '@/components/ui/Hero';

<Hero
  variant="one"
  title="Bienvenue"
  subtitle="Au CoworKing Café"
  image="/images/hero.jpg"
  imageAlt="Espace de coworking moderne"
/>
```

**Test** : Vérifier que la homepage s'affiche identiquement

**Étape 2** : Remplacer HeroOne sur page concept
```typescript
// apps/site/src/app/(site)/concept/page.tsx
// Même process
```

**Étape 3** : Supprimer HeroOne.tsx seulement quand TOUS les usages sont migrés

---

### Phase 5 : Nettoyage (Sonnet) - 15 min par composant

**Responsable** : Sonnet

**Tâches** :
1. Supprimer les anciens composants (HeroOne, Two, Three, Four)
2. Supprimer les imports non utilisés
3. Nettoyer les styles SCSS obsolètes (optionnel)
4. Mettre à jour la documentation

**Commit** :
```bash
git add .
git commit -m "refactor(site): replace HeroOne/Two/Three/Four with Hero component

- Create Hero component with 4 variants
- Migrate all usages (12 pages)
- Remove old components
- 0 visual regression
- -450 lines of code
"
git push origin main
```

---

## 🎭 RÉPARTITION OPUS vs SONNET

### Opus (Planification & Architecture)

**Quand** : Analyse et décisions stratégiques

**Tâches** :
- ✅ Analyser les composants existants
- ✅ Identifier patterns et différences
- ✅ Proposer interface de props
- ✅ Définir variants
- ✅ Créer matrice comparative
- ✅ Review finale après migration

**Pourquoi Opus** :
- Meilleure compréhension contextuelle
- Meilleure analyse architecturale
- Décisions plus réfléchies

---

### Sonnet (Implémentation)

**Quand** : Code et exécution

**Tâches** :
- ✅ Créer le nouveau composant
- ✅ Implémenter les variants
- ✅ Copier les styles SCSS
- ✅ Créer page de test
- ✅ Migrer les usages
- ✅ Nettoyer ancien code

**Pourquoi Sonnet** :
- Plus rapide pour implémentation
- Bon pour tâches répétitives
- Efficace pour migrations

---

## 📅 PLANNING DÉTAILLÉ

### Semaine 1 : Hero Component

**Jour 1 (2h)** :
- [ ] **Opus** : Analyse HeroOne/Two/Three/Four (30 min)
- [ ] **Sonnet** : Création Hero.tsx (1h)
- [ ] **Toi** : Validation visuelle (15 min)
- [ ] **Sonnet** : Corrections si nécessaire (15 min)

**Jour 2 (2h)** :
- [ ] **Sonnet** : Migration usages (1h30)
- [ ] **Toi** : Validation pages migrées (15 min)
- [ ] **Sonnet** : Nettoyage + commit (15 min)

---

### Semaine 2 : Section Component

**Jour 3 (2h)** :
- [ ] **Opus** : Analyse AboutOne/Two, ProjectOne (30 min)
- [ ] **Sonnet** : Création Section.tsx (1h)
- [ ] **Toi** : Validation visuelle (15 min)
- [ ] **Sonnet** : Corrections (15 min)

**Jour 4 (2h)** :
- [ ] **Sonnet** : Migration usages (1h30)
- [ ] **Toi** : Validation (15 min)
- [ ] **Sonnet** : Nettoyage + commit (15 min)

---

### Semaine 3 : Card Component

**Jour 5 (2h)** :
- [ ] **Opus** : Analyse ProjectCard/BlogCard/SpaceCard (30 min)
- [ ] **Sonnet** : Création Card.tsx (1h)
- [ ] **Toi** : Validation visuelle (15 min)
- [ ] **Sonnet** : Corrections (15 min)

**Jour 6 (2h)** :
- [ ] **Sonnet** : Migration usages (1h30)
- [ ] **Toi** : Validation (15 min)
- [ ] **Sonnet** : Nettoyage + commit (15 min)

---

### Jour 7 : Review Finale

**Review Finale (1h)** :
- [ ] **Opus** : Review complète de l'architecture
- [ ] **Toi** : Tests visuels complets
- [ ] **Sonnet** : Documentation finale
- [ ] **Commit final** + tag version

**Total** : ~12-15 heures sur 7 jours (2h/jour)

---

## 🔒 SÉCURITÉ & ROLLBACK

### Commits Fréquents

**Règle** : Commit après CHAQUE composant validé

```bash
# Après Hero validé
git add .
git commit -m "refactor(site): create Hero component"
git push origin main

# Après Section validé
git add .
git commit -m "refactor(site): create Section component"
git push origin main
```

**Bénéfice** : Rollback facile si problème

---

### Plan de Rollback

**Si problème détecté** :

**Étape 1** : Identifier le commit problématique
```bash
git log --oneline -10
```

**Étape 2** : Revenir au commit précédent
```bash
# Méthode 1: Revert (conserve historique)
git revert <commit-sha>
git push origin main

# Méthode 2: Reset (supprime commits)
git reset --hard <commit-sha>
git push origin main --force
```

**Étape 3** : Analyser le problème
- Quel composant a causé le problème ?
- Quelle différence visuelle ?
- Quel code est en cause ?

**Étape 4** : Corriger et re-tenter
- Opus analyse le problème
- Sonnet corrige
- Re-test avant commit

---

### Tests de Non-Régression

**Après chaque migration** :

**Checklist Visuelle** :
- [ ] Homepage identique
- [ ] Page concept identique
- [ ] Page espaces identique
- [ ] Mobile responsive OK
- [ ] Tablet responsive OK
- [ ] Desktop responsive OK
- [ ] Hover states OK
- [ ] Animations OK

**Checklist Technique** :
- [ ] `pnpm build` réussit
- [ ] `pnpm type-check` réussit
- [ ] Console browser : 0 erreurs
- [ ] Lighthouse score maintenu

---

## 📊 MÉTRIQUES DE SUCCÈS

### Code Quality

**Avant** :
- Composants Hero : 4 fichiers, ~475 lignes
- Composants Section : 3 fichiers, ~350 lignes
- Composants Card : 3 fichiers, ~300 lignes
- **Total** : 10 fichiers, ~1,125 lignes

**Après** :
- Hero.tsx : 1 fichier, ~150 lignes
- Section.tsx : 1 fichier, ~120 lignes
- Card.tsx : 1 fichier, ~100 lignes
- **Total** : 3 fichiers, ~370 lignes

**Gain** : -7 fichiers, -755 lignes (-67%)

---

### Maintenabilité

**Avant** :
- Modifier Hero → 4 fichiers à éditer
- Ajouter variant → Créer nouveau composant
- Duplication → 75%

**Après** :
- Modifier Hero → 1 fichier à éditer
- Ajouter variant → Ajouter prop + styles
- Duplication → 0%

---

## 🎯 EXEMPLE COMPLET : Hero Component

### Étape 1 : Analyse (Opus)

**Prompt pour Opus** :
```
Analyse les composants Hero existants dans apps/site :
- HeroOne.tsx
- HeroTwo.tsx
- HeroThree.tsx
- HeroFour.tsx

Pour chaque composant :
1. Lire le code complet
2. Identifier la structure HTML
3. Identifier les props
4. Identifier les styles SCSS
5. Noter les différences visuelles

Créer une matrice comparative et proposer :
- Interface HeroProps complète
- Liste des variants
- Stratégie de migration

NE PAS CODER. Seulement analyse.
```

**Output Attendu** :
```markdown
# Analyse Hero Components

## HeroOne.tsx
Structure: Grid 2 colonnes, image gauche, texte droite
Props: title, subtitle, image, cta
Styles: .hero-one, .hero-one__image, .hero-one__content

## HeroTwo.tsx
Structure: Image fullscreen avec overlay
Props: title, subtitle, backgroundImage
Styles: .hero-two, .hero-two__overlay, .hero-two__content

## Matrice Comparative
| Feature | HeroOne | HeroTwo | HeroThree | HeroFour |
|---------|---------|---------|-----------|----------|
| Layout  | Grid    | Overlay | BG image  | Grid RTL |
| Image   | Left    | BG      | BG        | Right    |
| CTA     | Yes     | Yes     | No        | Yes      |

## Interface Proposée
[Code TypeScript de l'interface]

## Variants SCSS
[Liste des variants]
```

---

### Étape 2 : Création (Sonnet)

**Prompt pour Sonnet** :
```
Crée le composant Hero.tsx selon l'analyse d'Opus.

Contraintes STRICTES :
- Copier EXACTEMENT les structures HTML des anciens composants
- Copier EXACTEMENT les styles SCSS (ne RIEN modifier)
- Implémenter TOUS les variants
- Typer correctement (0 any)
- Documenter avec JSDoc

Créer aussi :
- styles/components/_hero.scss (copier styles existants)
- apps/site/src/app/test-hero/page.tsx (page de test)
```

**Output** : Code complet du composant

---

### Étape 3 : Validation (Toi)

**Process** :
1. `pnpm dev`
2. Ouvrir `http://localhost:3000/test-hero`
3. Comparer visuellement ancien vs nouveau
4. Tester responsive
5. Valider ou rejeter

---

### Étape 4 : Migration (Sonnet)

**Prompt pour Sonnet** :
```
Migre PROGRESSIVEMENT HeroOne vers Hero variant="one".

Processus :
1. Remplacer 1 seul usage (homepage)
2. Me demander de valider
3. Si OK, remplacer le suivant
4. Répéter jusqu'à migration complète

Ne supprime PAS les anciens composants avant que je valide tout.
```

---

### Étape 5 : Nettoyage (Sonnet)

**Prompt pour Sonnet** :
```
Tous les usages sont validés.

Nettoyer :
1. Supprimer HeroOne/Two/Three/Four.tsx
2. Supprimer imports non utilisés
3. Commit avec message descriptif
```

---

## ✅ CHECKLIST FINALE

### Avant de Commencer
- [ ] Lire ce plan complet
- [ ] Comprendre pourquoi la tentative précédente a échoué
- [ ] Accepter l'approche progressive
- [ ] Réserver 2h/jour pendant 7 jours

### Pendant la Refactorisation
- [ ] Suivre le workflow étape par étape
- [ ] Valider visuellement après chaque étape
- [ ] Commit après chaque composant validé
- [ ] Tester responsive à chaque fois
- [ ] 0 changement visuel non intentionnel

### Après Chaque Composant
- [ ] Tests visuels OK
- [ ] Build TypeScript OK
- [ ] Console browser propre
- [ ] Commit + push
- [ ] Documentation mise à jour

---

## 🚀 DÉMARRAGE

### Prêt à Commencer ?

**Étape 1** : Valider ce plan
- [ ] Plan lu et compris
- [ ] Opus et Sonnet disponibles
- [ ] Temps réservé (2h/jour)

**Étape 2** : Lancer Analyse Hero
```
/model opus

Analyse les composants Hero selon le plan dans docs/PLAN_COMPOSANTS_REUTILISABLES.md
```

**Étape 3** : Attendre validation avant Phase 2

---

**Questions avant de commencer ?**

