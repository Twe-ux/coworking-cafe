import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Props du composant SettingsSection
 */
export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Composant SettingsSection
 * Section réutilisable pour la page paramètres
 * Structure: titre + description + contenu
 */
export function SettingsSection({
  title,
  description,
  children,
  className
}: SettingsSectionProps) {
  const baseClass = 'settings-section';

  const containerClasses = cn(
    baseClass,
    className
  );

  return (
    <section className={containerClasses}>
      <div className={`${baseClass}__header`}>
        <h2 className={`${baseClass}__title`}>{title}</h2>
        {description && (
          <p className={`${baseClass}__description`}>{description}</p>
        )}
      </div>

      <div className={`${baseClass}__content`}>
        {children}
      </div>
    </section>
  );
}
