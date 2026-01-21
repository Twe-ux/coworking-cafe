/**
 * Footer Component - apps/site
 * Pied de page du site public
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { BaseComponentProps } from '@/types/common';

interface FooterProps extends BaseComponentProps {}

export function Footer({ className, id }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setSubmitMessage('Veuillez entrer votre email');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage('Merci pour votre inscription !');
        setEmail('');
      } else {
        setSubmitMessage(result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      setSubmitMessage('Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('layout-footer', className)} id={id}>
      <div className="layout-footer__container">
        {/* Grille 3 colonnes */}
        <div className="layout-footer__grid">
          {/* Colonne 1: À propos */}
          <div className="layout-footer__column">
            <h3 className="layout-footer__column-title">À propos</h3>
            <p className="layout-footer__description">
              CoworKing Café est un espace de coworking convivial au cœur de Paris,
              basé sur le concept anticafé. Travaillez dans un cadre agréable avec
              café et snacks à volonté.
            </p>
          </div>

          {/* Colonne 2: Liens rapides */}
          <div className="layout-footer__column">
            <h3 className="layout-footer__column-title">Liens rapides</h3>
            <nav className="layout-footer__nav">
              <Link href="/concept" className="layout-footer__link">
                Notre concept
              </Link>
              <Link href="/spaces" className="layout-footer__link">
                Nos espaces
              </Link>
              <Link href="/pricing" className="layout-footer__link">
                Tarifs
              </Link>
              <Link href="/student-offers" className="layout-footer__link">
                Offres étudiants
              </Link>
              <Link href="/members-program" className="layout-footer__link">
                Programme fidélité
              </Link>
              <Link href="/blog" className="layout-footer__link">
                Blog
              </Link>
              <Link href="/contact" className="layout-footer__link">
                Contact
              </Link>
            </nav>
          </div>

          {/* Colonne 3: Contact & Newsletter */}
          <div className="layout-footer__column">
            <h3 className="layout-footer__column-title">Restez informé</h3>
            <p className="layout-footer__newsletter-text">
              Inscrivez-vous à notre newsletter pour recevoir nos actualités et offres
              exclusives.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="layout-footer__newsletter-form"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="layout-footer__newsletter-input"
                disabled={isSubmitting}
                aria-label="Email pour newsletter"
              />
              <button
                type="submit"
                className="layout-footer__newsletter-button"
                disabled={isSubmitting}
                aria-label="S'inscrire à la newsletter"
              >
                {isSubmitting ? 'Envoi...' : "S'inscrire"}
              </button>
            </form>
            {submitMessage && (
              <p
                className={cn(
                  'layout-footer__newsletter-message',
                  submitMessage.includes('Merci') &&
                    'layout-footer__newsletter-message--success'
                )}
              >
                {submitMessage}
              </p>
            )}
          </div>
        </div>

        {/* Social Media */}
        <div className="layout-footer__social">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="layout-footer__social-link"
            aria-label="Facebook"
          >
            <i className="bi bi-facebook" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="layout-footer__social-link"
            aria-label="Instagram"
          >
            <i className="bi bi-instagram" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="layout-footer__social-link"
            aria-label="LinkedIn"
          >
            <i className="bi bi-linkedin" />
          </a>
        </div>

        {/* Liens légaux */}
        <div className="layout-footer__legal">
          <nav className="layout-footer__legal-nav">
            <Link href="/mentions-legales" className="layout-footer__legal-link">
              Mentions légales
            </Link>
            <Link href="/cgu" className="layout-footer__legal-link">
              CGU
            </Link>
            <Link
              href="/politique-confidentialite"
              className="layout-footer__legal-link"
            >
              Confidentialité
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        <div className="layout-footer__copyright">
          <p className="layout-footer__copyright-text">
            © {currentYear} CoworKing Café. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
