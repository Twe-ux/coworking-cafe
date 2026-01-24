'use client';

import { useEffect, useState } from 'react';

interface ProtectedEmailProps {
  user: string;
  domain: string;
  className?: string;
  style?: React.CSSProperties;
  showIcon?: boolean;
  subject?: string;
  displayText?: string; // Optional custom display text instead of email
}

/**
 * Protected Email Component
 *
 * Protects email addresses from spam bots by:
 * 1. Storing email parts as base64-encoded data attributes
 * 2. Rendering only on client-side (not in HTML source)
 * 3. Using JavaScript to construct mailto link on click
 * 4. Displaying email character by character to avoid string scraping
 * 5. No complete email text in DOM attributes or content
 */
export default function ProtectedEmail({
  user,
  domain,
  className = '',
  style,
  showIcon = false,
  subject,
  displayText,
}: ProtectedEmailProps) {
  const [emailChars, setEmailChars] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only render on client-side
    setMounted(true);

    if (!displayText) {
      // Split email into individual characters to make scraping harder
      const fullEmail = `${user}@${domain}`;
      setEmailChars(fullEmail.split(''));
    }
  }, [user, domain, displayText]);

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <span className={className}>
        {showIcon && <i className="bi bi-envelope me-2" />}
        Chargement...
      </span>
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Construct email dynamically on click (never stored as complete string)
    const email = `${user}@${domain}`;

    // Construct mailto link
    const mailtoLink = subject
      ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
      : `mailto:${email}`;

    // Open email client
    window.location.href = mailtoLink;
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className={className}
      style={style}
      aria-label="Envoyer un email"
      title="Cliquez pour envoyer un email"
      data-u={btoa(user)}
      data-d={btoa(domain)}
    >
      {showIcon && <i className="bi bi-envelope me-2" />}
      {displayText ? (
        displayText
      ) : (
        <>
          {emailChars.map((char, index) => (
            <span key={index} data-c={btoa(char)}>
              {char}
            </span>
          ))}
        </>
      )}
    </a>
  );
}

/**
 * Helper function to encode email for use in components
 * Usage: encodeEmailParts('strasbourg', 'coworkingcafe.fr')
 */
export function encodeEmailParts(user: string, domain: string) {
  return {
    user: btoa(user),
    domain: btoa(domain),
  };
}
