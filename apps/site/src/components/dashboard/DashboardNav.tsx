'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface DashboardNavProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: '🏠',
    label: 'Dashboard'
  },
  {
    href: '/dashboard/bookings',
    icon: '📅',
    label: 'Mes réservations'
  },
  {
    href: '/dashboard/profile',
    icon: '👤',
    label: 'Mon profil'
  },
  {
    href: '/dashboard/settings',
    icon: '⚙️',
    label: 'Paramètres'
  }
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="dashboard__mobile-header">
        <Link href="/" className="dashboard__logo">
          CoworKing Café
        </Link>
        <button
          className="dashboard__mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="dashboard__mobile-toggle-icon">
            {isMobileMenuOpen ? '✕' : '☰'}
          </span>
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`dashboard__sidebar ${isMobileMenuOpen ? 'dashboard__sidebar--open' : ''}`}>
        <div className="dashboard__sidebar-header">
          <Link href="/" className="dashboard__sidebar-logo">
            CoworKing Café
          </Link>
        </div>

        <nav className="dashboard__nav">
          <ul className="dashboard__nav-list">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <li key={item.href} className="dashboard__nav-item">
                  <Link
                    href={item.href}
                    className={`dashboard__nav-link ${isActive ? 'dashboard__nav-link--active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="dashboard__nav-icon">{item.icon}</span>
                    <span className="dashboard__nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="dashboard__user">
          <div className="dashboard__user-info">
            <div className="dashboard__user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="dashboard__user-details">
              <p className="dashboard__user-name">{user.name}</p>
              <p className="dashboard__user-email">{user.email}</p>
            </div>
          </div>
          <button
            className="dashboard__logout"
            onClick={handleLogout}
            aria-label="Se déconnecter"
          >
            <span className="dashboard__logout-icon">🚪</span>
            <span className="dashboard__logout-text">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="dashboard__overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
