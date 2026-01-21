/**
 * Helper functions for client dashboard routing
 */

/**
 * Get the dashboard URL for a given username
 */
export function getDashboardUrl(username: string): string {
  return `/${username}`;
}

/**
 * Get the profile URL for a given username
 */
export function getProfileUrl(username: string): string {
  return `/${username}/profile`;
}

/**
 * Get the reservations URL for a given username
 */
export function getReservationsUrl(username: string): string {
  return `/${username}/reservations`;
}

/**
 * Get the settings URL for a given username
 */
export function getSettingsUrl(username: string): string {
  return `/${username}/settings`;
}

/**
 * Get the new reservation URL for a given username
 */
export function getNewReservationUrl(username: string): string {
  return `/${username}/reservations/new`;
}

/**
 * Check if a path is a client dashboard route
 */
export function isClientDashboardRoute(pathname: string): boolean {
  // Match routes like /username, /username/profile, etc.
  // But exclude known public routes
  const publicRoutes = [
    '/',
    '/about',
    '/blog',
    '/blog-details',
    '/contact',
    '/faq',
    '/home-2',
    '/pricing',
    '/projects',
    '/project-details',
    '/services',
    '/service-details',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/dashboard',
    '/booking',
    '/signin',
    '/signup',
  ];

  // Check if it's a public route
  if (publicRoutes.includes(pathname)) {
    return false;
  }

  // Check if it's a dashboard admin route
  if (pathname.startsWith('/dashboard/')) {
    return false;
  }

  // Check if it matches the pattern /username or /username/*
  const clientDashboardPattern = /^\/[^\/]+(?:\/(?:profile|reservations|settings))?(?:\/.*)?$/;
  return clientDashboardPattern.test(pathname);
}
