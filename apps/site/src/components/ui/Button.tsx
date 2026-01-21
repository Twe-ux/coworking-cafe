'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Spinner } from './Spinner';

/**
 * Props du composant Button
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

/**
 * Composant Button réutilisable
 * Variants: primary, secondary, outline, ghost, danger
 * Sizes: sm, md, lg
 * Support icons et loading state
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClass = 'ui-button';

  const classes = cn(
    baseClass,
    `${baseClass}--${variant}`,
    `${baseClass}--${size}`,
    {
      [`${baseClass}--loading`]: loading,
      [`${baseClass}--disabled`]: disabled || loading
    },
    className
  );

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={`${baseClass}__spinner`}>
          <Spinner size="sm" />
        </span>
      )}

      {!loading && leftIcon && (
        <span className={`${baseClass}__left-icon`}>{leftIcon}</span>
      )}

      <span className={`${baseClass}__content`}>{children}</span>

      {!loading && rightIcon && (
        <span className={`${baseClass}__right-icon`}>{rightIcon}</span>
      )}
    </button>
  );
}
