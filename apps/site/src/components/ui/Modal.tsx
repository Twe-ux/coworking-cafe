'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

/**
 * Props du composant Modal
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
}

/**
 * Composant Modal avec portal
 * Features:
 * - Portal pour z-index proper
 * - Fermeture backdrop click
 * - Fermeture ESC key
 * - Animation ouverture/fermeture
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  closeOnBackdropClick = true,
  closeOnEsc = true
}: ModalProps) {
  const baseClass = 'ui-modal';
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEsc]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        `${baseClass}__backdrop`,
        `${baseClass}__backdrop--open`
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${baseClass}__title` : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          baseClass,
          `${baseClass}--open`,
          className
        )}
      >
        <div className={`${baseClass}__header`}>
          {title && (
            <h2 id={`${baseClass}__title`} className={`${baseClass}__title`}>
              {title}
            </h2>
          )}

          <button
            type="button"
            className={`${baseClass}__close`}
            onClick={onClose}
            aria-label="Fermer la modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className={`${baseClass}__content`}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
