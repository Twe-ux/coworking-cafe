import { cn } from '@/lib/utils/cn';

/**
 * Props du composant Spinner
 */
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Composant Spinner réutilisable
 * Sizes: sm (16px), md (24px), lg (32px)
 * Animation CSS rotate
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  const baseClass = 'ui-spinner';

  const classes = cn(
    baseClass,
    `${baseClass}--${size}`,
    className
  );

  return (
    <div className={classes} role="status" aria-label="Chargement en cours">
      <svg
        className={`${baseClass}__svg`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className={`${baseClass}__circle`}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">Chargement en cours</span>
    </div>
  );
}
