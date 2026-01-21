/**
 * ClassNames Utility - apps/site
 * Helper pour combiner des classes CSS de manière conditionnelle
 */

/**
 * Type pour les valeurs de classe CSS
 */
type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary;

/**
 * Array de valeurs de classe
 */
interface ClassArray extends Array<ClassValue> {}

/**
 * Objet dictionnaire de classes conditionnelles
 */
interface ClassDictionary {
  [key: string]: unknown;
}

/**
 * Convertir une valeur en string de classe
 */
function toVal(mix: ClassValue): string {
  let str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (let i = 0; i < mix.length; i++) {
        if (mix[i]) {
          const y = toVal(mix[i]);
          if (y) {
            str && (str += ' ');
            str += y;
          }
        }
      }
    } else {
      for (const key in mix) {
        if (mix[key]) {
          str && (str += ' ');
          str += key;
        }
      }
    }
  }

  return str;
}

/**
 * Combiner des classes CSS de manière conditionnelle
 * @param inputs Valeurs de classe à combiner
 * @returns String de classes combinées
 *
 * @example
 * cn('foo', 'bar') => 'foo bar'
 * cn('foo', { bar: true, baz: false }) => 'foo bar'
 * cn('foo', undefined, null, 'bar') => 'foo bar'
 * cn(['foo', 'bar']) => 'foo bar'
 */
export function cn(...inputs: ClassValue[]): string {
  let str = '';

  for (let i = 0; i < inputs.length; i++) {
    const tmp = inputs[i];
    if (tmp) {
      const x = toVal(tmp);
      if (x) {
        str && (str += ' ');
        str += x;
      }
    }
  }

  return str;
}

/**
 * Variante de cn() qui supprime les classes dupliquées
 * @param inputs Valeurs de classe à combiner
 * @returns String de classes uniques combinées
 *
 * @example
 * cnUnique('foo', 'bar', 'foo') => 'foo bar'
 */
export function cnUnique(...inputs: ClassValue[]): string {
  const classes = cn(...inputs).split(' ');
  return [...new Set(classes)].join(' ');
}

/**
 * Helper pour créer des classes BEM
 * @param block Nom du bloc
 * @param element Nom de l'élément (optionnel)
 * @param modifier Nom du modificateur (optionnel)
 * @returns Classe BEM
 *
 * @example
 * bem('card') => 'card'
 * bem('card', 'header') => 'card__header'
 * bem('card', 'header', 'large') => 'card__header--large'
 * bem('card', null, 'active') => 'card--active'
 */
export function bem(
  block: string,
  element?: string | null,
  modifier?: string | null
): string {
  let className = block;

  if (element) {
    className += `__${element}`;
  }

  if (modifier) {
    className += `--${modifier}`;
  }

  return className;
}

/**
 * Helper pour créer des variantes de composants
 * @param base Classe de base
 * @param variants Objet de variantes { key: value }
 * @param className Classes additionnelles
 * @returns String de classes combinées
 *
 * @example
 * variant('btn', { size: 'lg', color: 'primary' }) => 'btn btn--size-lg btn--color-primary'
 * variant('btn', { size: 'lg' }, 'custom-class') => 'btn btn--size-lg custom-class'
 */
export function variant(
  base: string,
  variants?: Record<string, string | boolean | undefined>,
  className?: string
): string {
  const classes: string[] = [base];

  if (variants) {
    Object.entries(variants).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        classes.push(`${base}--${key}-${value}`);
      } else if (value === true) {
        classes.push(`${base}--${key}`);
      }
    });
  }

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
}
