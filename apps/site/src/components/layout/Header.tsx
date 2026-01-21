/**
 * Header Component - apps/site
 * Navigation principale du site public
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { Navigation } from './Navigation';
import type { BaseComponentProps } from '@/types/common';

interface UserData {
  name: string;
  avatar?: string;
}

interface HeaderProps extends BaseComponentProps {
  user?: UserData;
}

const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Espaces', href: '/spaces' },
  { label: 'Tarifs', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' }
];

export function Header({ user, className, id }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={cn('layout-header', className)} id={id}>
      <div className="layout-header__container">
        {/* Logo */}
        <div className="layout-header__logo">
          <Link href="/" className="layout-header__logo-link">
            <span className="layout-header__logo-text">CoworKing Café</span>
          </Link>
        </div>

        {/* Navigation Desktop */}
        <nav className="layout-header__nav layout-header__nav--desktop">
          <Navigation links={navLinks} />
        </nav>

        {/* Actions */}
        <div className="layout-header__actions">
          {/* Bouton Réserver (CTA) */}
          <Link href="/booking" className="layout-header__cta">
            Réserver
          </Link>

          {/* User Menu (si connecté) */}
          {user ? (
            <div className="layout-header__user-menu">
              <button
                onClick={toggleUserMenu}
                className="layout-header__user-button"
                aria-label="Menu utilisateur"
                aria-expanded={isUserMenuOpen}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="layout-header__user-avatar"
                  />
                ) : (
                  <span className="layout-header__user-initials">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="layout-header__user-dropdown">
                  <div className="layout-header__user-info">
                    <span className="layout-header__user-name">{user.name}</span>
                  </div>
                  <nav className="layout-header__user-nav">
                    <Link
                      href="/dashboard"
                      className="layout-header__user-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Mon compte
                    </Link>
                    <Link
                      href="/dashboard/bookings"
                      className="layout-header__user-link"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Mes réservations
                    </Link>
                    <Link
                      href="/api/auth/signout"
                      className="layout-header__user-link layout-header__user-link--signout"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Déconnexion
                    </Link>
                  </nav>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="layout-header__login">
              Connexion
            </Link>
          )}

          {/* Burger Menu (Mobile) */}
          <button
            onClick={toggleMobileMenu}
            className={cn(
              'layout-header__burger',
              isMobileMenuOpen && 'layout-header__burger--active'
            )}
            aria-label="Menu mobile"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="layout-header__burger-line" />
            <span className="layout-header__burger-line" />
            <span className="layout-header__burger-line" />
          </button>
        </div>
      </div>

      {/* Navigation Mobile */}
      {isMobileMenuOpen && (
        <nav className="layout-header__nav layout-header__nav--mobile">
          <Navigation links={navLinks} onClick={closeMobileMenu} />
          {!user && (
            <div className="layout-header__mobile-actions">
              <Link
                href="/auth/login"
                className="layout-header__mobile-link"
                onClick={closeMobileMenu}
              >
                Connexion
              </Link>
              <Link
                href="/booking"
                className="layout-header__mobile-cta"
                onClick={closeMobileMenu}
              >
                Réserver
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
