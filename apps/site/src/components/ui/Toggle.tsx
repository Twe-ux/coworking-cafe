'use client';

import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Props du composant Toggle
 */
export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/**
 * Composant Toggle (Switch on/off)
 * Accessible avec aria-label et keyboard navigation
 */
export function Toggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled = false,
  className,
  id,
  ...props
}: ToggleProps) {
  const baseClass = 'ui-toggle';
  const toggleId = id || `toggle-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(e.target.checked);
  };

  const containerClasses = cn(
    `${baseClass}__container`,
    {
      [`${baseClass}__container--disabled`]: disabled
    },
    className
  );

  const switchClasses = cn(
    `${baseClass}__switch`,
    {
      [`${baseClass}__switch--checked`]: checked,
      [`${baseClass}__switch--disabled`]: disabled
    }
  );

  const thumbClasses = cn(
    `${baseClass}__thumb`,
    {
      [`${baseClass}__thumb--checked`]: checked
    }
  );

  return (
    <div className={containerClasses}>
      <div className={`${baseClass}__content`}>
        {label && (
          <label htmlFor={toggleId} className={`${baseClass}__label`}>
            {label}
          </label>
        )}
        {description && (
          <p className={`${baseClass}__description`}>{description}</p>
        )}
      </div>

      <label className={`${baseClass}__wrapper`}>
        <input
          id={toggleId}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={`${baseClass}__input`}
          aria-checked={checked}
          aria-label={label}
          {...props}
        />
        <span className={switchClasses}>
          <span className={thumbClasses} />
        </span>
      </label>
    </div>
  );
}
