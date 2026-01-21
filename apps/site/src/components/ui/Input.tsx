'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Props du composant Input
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Composant Input réutilisable avec forwardRef
 * Types: text, email, password, number, tel
 * Support icons, label, error state
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className,
      type = 'text',
      id,
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const baseClass = 'ui-input';
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    const wrapperClasses = cn(
      `${baseClass}__wrapper`,
      {
        [`${baseClass}__wrapper--error`]: error,
        [`${baseClass}__wrapper--disabled`]: disabled,
        [`${baseClass}__wrapper--with-left-icon`]: leftIcon,
        [`${baseClass}__wrapper--with-right-icon`]: rightIcon
      }
    );

    const inputClasses = cn(
      baseClass,
      {
        [`${baseClass}--error`]: error,
        [`${baseClass}--with-left-icon`]: leftIcon,
        [`${baseClass}--with-right-icon`]: rightIcon
      },
      className
    );

    return (
      <div className={`${baseClass}__container`}>
        {label && (
          <label htmlFor={inputId} className={`${baseClass}__label`}>
            {label}
            {required && <span className={`${baseClass}__required`}>*</span>}
          </label>
        )}

        <div className={wrapperClasses}>
          {leftIcon && (
            <span className={`${baseClass}__left-icon`}>{leftIcon}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            className={inputClasses}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {rightIcon && (
            <span className={`${baseClass}__right-icon`}>{rightIcon}</span>
          )}
        </div>

        {error && (
          <span
            id={`${inputId}-error`}
            className={`${baseClass}__error`}
            role="alert"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
