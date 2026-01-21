'use client';

import { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import type { SelectOption } from '@/types/common';

/**
 * Props du composant Select
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

/**
 * Composant Select réutilisable
 * Dropdown natif amélioré avec support placeholder, label, error
 */
export function Select({
  label,
  options,
  error,
  placeholder,
  className,
  id,
  disabled = false,
  required = false,
  value,
  onChange,
  ...props
}: SelectProps) {
  const baseClass = 'ui-select';
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  const wrapperClasses = cn(
    `${baseClass}__wrapper`,
    {
      [`${baseClass}__wrapper--error`]: error,
      [`${baseClass}__wrapper--disabled`]: disabled
    }
  );

  const selectClasses = cn(
    baseClass,
    {
      [`${baseClass}--error`]: error,
      [`${baseClass}--placeholder`]: !value && placeholder
    },
    className
  );

  return (
    <div className={`${baseClass}__container`}>
      {label && (
        <label htmlFor={selectId} className={`${baseClass}__label`}>
          {label}
          {required && <span className={`${baseClass}__required`}>*</span>}
        </label>
      )}

      <div className={wrapperClasses}>
        <select
          id={selectId}
          className={selectClasses}
          disabled={disabled}
          required={required}
          value={value}
          onChange={onChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <span className={`${baseClass}__icon`}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {error && (
        <span
          id={`${selectId}-error`}
          className={`${baseClass}__error`}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
