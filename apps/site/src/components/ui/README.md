# UI Components Documentation

Composants UI de base réutilisables pour apps/site.

## Table des Matières

1. [Button](#button)
2. [Card](#card)
3. [Input](#input)
4. [Select](#select)
5. [Modal](#modal)
6. [Spinner](#spinner)

---

## Button

Composant bouton avec variants, tailles, icons et loading state.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Style du bouton |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Taille du bouton |
| `loading` | `boolean` | `false` | Affiche un spinner |
| `disabled` | `boolean` | `false` | Désactive le bouton |
| `leftIcon` | `ReactNode` | - | Icône à gauche |
| `rightIcon` | `ReactNode` | - | Icône à droite |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Type HTML |

### Exemples

```tsx
import { Button } from '@/components/ui';

// Bouton primary
<Button variant="primary">
  Enregistrer
</Button>

// Bouton avec loading
<Button variant="primary" loading={true}>
  Chargement...
</Button>

// Bouton avec icônes
<Button variant="outline" leftIcon={<SearchIcon />}>
  Rechercher
</Button>

// Bouton danger
<Button variant="danger" size="sm">
  Supprimer
</Button>
```

### Classes SCSS

```scss
.ui-button
.ui-button--primary
.ui-button--secondary
.ui-button--outline
.ui-button--ghost
.ui-button--danger
.ui-button--sm
.ui-button--md
.ui-button--lg
.ui-button--loading
.ui-button--disabled
```

---

## Card

Composant card avec pattern composition (Card.Header, Card.Body, Card.Footer).

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'outlined' \| 'elevated'` | `'default'` | Style de la card |
| `className` | `string` | - | Classes CSS additionnelles |
| `children` | `ReactNode` | - | Contenu de la card |

### Exemples

```tsx
import { Card } from '@/components/ui';

// Card simple
<Card variant="outlined">
  <Card.Header>
    <h3>Titre</h3>
  </Card.Header>
  <Card.Body>
    <p>Contenu de la card</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>

// Card elevated
<Card variant="elevated">
  <Card.Body>
    Contenu simple
  </Card.Body>
</Card>
```

### Classes SCSS

```scss
.ui-card
.ui-card--default
.ui-card--outlined
.ui-card--elevated
.ui-card__header
.ui-card__body
.ui-card__footer
```

---

## Input

Composant input avec forwardRef, label, error state et icons.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label du champ |
| `error` | `string` | - | Message d'erreur |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel'` | `'text'` | Type d'input |
| `required` | `boolean` | `false` | Champ requis |
| `disabled` | `boolean` | `false` | Champ désactivé |
| `leftIcon` | `ReactNode` | - | Icône à gauche |
| `rightIcon` | `ReactNode` | - | Icône à droite |

### Exemples

```tsx
import { Input } from '@/components/ui';
import { useRef } from 'react';

// Input simple
<Input
  label="Email"
  type="email"
  placeholder="votre@email.com"
  required
/>

// Input avec erreur
<Input
  label="Mot de passe"
  type="password"
  error="Le mot de passe doit contenir au moins 8 caractères"
/>

// Input avec icône
<Input
  label="Recherche"
  type="text"
  leftIcon={<SearchIcon />}
/>

// Input avec ref
const inputRef = useRef<HTMLInputElement>(null);

<Input
  ref={inputRef}
  label="Nom"
  type="text"
/>
```

### Classes SCSS

```scss
.ui-input__container
.ui-input__label
.ui-input__wrapper
.ui-input
.ui-input--error
.ui-input--with-left-icon
.ui-input--with-right-icon
.ui-input__error
```

---

## Select

Composant select (dropdown natif) avec label, error state et options.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label du champ |
| `options` | `SelectOption[]` | - | Options du select |
| `error` | `string` | - | Message d'erreur |
| `placeholder` | `string` | - | Placeholder |
| `required` | `boolean` | `false` | Champ requis |
| `disabled` | `boolean` | `false` | Champ désactivé |

### Type SelectOption

```typescript
interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
}
```

### Exemples

```tsx
import { Select } from '@/components/ui';

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3 (désactivée)', value: '3', disabled: true }
];

// Select simple
<Select
  label="Sélectionnez une option"
  options={options}
  placeholder="Choisir..."
  required
/>

// Select avec erreur
<Select
  label="Catégorie"
  options={options}
  value={selectedValue}
  onChange={(e) => setSelectedValue(e.target.value)}
  error="Veuillez sélectionner une catégorie"
/>
```

### Classes SCSS

```scss
.ui-select__container
.ui-select__label
.ui-select__wrapper
.ui-select
.ui-select--error
.ui-select--placeholder
.ui-select__icon
.ui-select__error
```

---

## Modal

Composant modal avec portal, backdrop, fermeture ESC/backdrop.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | État ouvert/fermé |
| `onClose` | `() => void` | - | Callback de fermeture |
| `title` | `string` | - | Titre de la modal |
| `children` | `ReactNode` | - | Contenu de la modal |
| `closeOnBackdropClick` | `boolean` | `true` | Fermer au clic backdrop |
| `closeOnEsc` | `boolean` | `true` | Fermer avec touche ESC |

### Exemples

```tsx
import { Modal, Button } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Ouvrir la modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirmer l'action"
      >
        <p>Êtes-vous sûr de vouloir continuer ?</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="primary" onClick={handleConfirm}>
            Confirmer
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

### Classes SCSS

```scss
.ui-modal__backdrop
.ui-modal
.ui-modal--open
.ui-modal__header
.ui-modal__title
.ui-modal__close
.ui-modal__content
```

---

## Spinner

Composant spinner (loading) avec tailles.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Taille du spinner |
| `className` | `string` | - | Classes CSS additionnelles |

### Exemples

```tsx
import { Spinner } from '@/components/ui';

// Spinner medium (défaut)
<Spinner />

// Spinner petit
<Spinner size="sm" />

// Spinner large
<Spinner size="lg" />

// Dans un bouton (déjà intégré dans Button)
<Button loading={true}>
  Chargement...
</Button>
```

### Classes SCSS

```scss
.ui-spinner
.ui-spinner--sm
.ui-spinner--md
.ui-spinner--lg
.ui-spinner__svg
.ui-spinner__circle
```

---

## Import Barrel

Tous les composants sont exportés depuis `@/components/ui/index.ts` :

```tsx
// Import multiple
import { Button, Card, Input, Select, Modal, Spinner } from '@/components/ui';

// OU import individuel
import { Button } from '@/components/ui/Button';
```

---

## Conventions

### Nommage SCSS

Tous les composants UI utilisent le préfixe `.ui-` et suivent BEM modifié :

```scss
.ui-{component}                    // Block
.ui-{component}__element           // Element
.ui-{component}--modifier          // Modifier
```

### Accessibilité

Tous les composants respectent les standards d'accessibilité :

- Labels avec `htmlFor` et `id`
- ARIA attributes (`aria-invalid`, `aria-describedby`, etc.)
- Support clavier (focus-visible, ESC key, etc.)
- Screen reader support (`role="alert"`, texte sr-only, etc.)

### TypeScript

Tous les composants sont typés avec TypeScript strict :

- Props interfaces exportées
- Pas de `any` types
- Support forwardRef pour Input

---

## Prochaines Étapes

Composants à créer ensuite :

- [ ] `Textarea.tsx` - Champ texte multiligne
- [ ] `Checkbox.tsx` - Case à cocher
- [ ] `Radio.tsx` - Bouton radio
- [ ] `Switch.tsx` - Interrupteur on/off
- [ ] `Toast.tsx` - Notification temporaire
- [ ] `Tooltip.tsx` - Info-bulle
- [ ] `DatePicker.tsx` - Sélecteur de date
- [ ] `Badge.tsx` - Badge/tag
- [ ] `Alert.tsx` - Message d'alerte
- [ ] `Tabs.tsx` - Onglets

---

_Dernière mise à jour : 2026-01-21_
