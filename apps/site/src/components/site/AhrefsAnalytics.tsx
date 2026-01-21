/**
 * Ahrefs Web Analytics Component
 * Script analytics Ahrefs
 */

export default function AhrefsAnalytics() {
  // Ne charger que en production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <script
      async
      src="https://analytics.ahrefs.com/analytics.js"
      data-key="YOUR_AHREFS_KEY"
    />
  );
}
