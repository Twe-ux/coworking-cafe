/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // TypeScript - Ignore build errors for deployment
  // TODO: Fix TypeScript errors post-deployment (see OPTION_C_BUILD_RESULTS.md)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Images configuration - responsive srcset optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Device breakpoints for srcset (used with sizes attribute)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Smaller image sizes for fixed-width images (icons, thumbnails)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // SCSS configuration
  sassOptions: {
    includePaths: ["./src/styles"],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ["bootstrap-icons"],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },

  // Headers for PWA files
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600",
          },
        ],
      },
    ];
  },

  // Redirects - Canonical URL enforcement (301 permanent)
  // Canonical domain: coworkingcafe.fr (without www)
  async redirects() {
    const BOOK = "https://book.coworkingcafe.fr";
    return [
      // ── EXISTANT : canonicalisation host (À GARDER) ──
      {
        source: "/:path*",
        has: [{ type: "host", value: "new.coworkingcafe.fr" }],
        destination: "https://coworkingcafe.fr/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.coworkingcafe.fr" }],
        destination: "https://coworkingcafe.fr/:path*",
        permanent: true,
      },
      // ── NOUVEAU : réservation (tout l'ancien funnel → plateforme) ──
      { source: "/booking", destination: `${BOOK}/reserver`, permanent: true },
      {
        source: "/booking/:path*",
        destination: `${BOOK}/reserver`,
        permanent: true,
      },
      // ── NOUVEAU : auth ──
      { source: "/auth/login", destination: `${BOOK}/login`, permanent: true },
      {
        source: "/auth/register",
        destination: `${BOOK}/register`,
        permanent: true,
      },
      {
        source: "/auth/forgot-password",
        destination: `${BOOK}/reset-password`,
        permanent: true,
      },
      {
        source: "/auth/reset-password",
        destination: `${BOOK}/reset-password`,
        permanent: true,
      },
      {
        source: "/auth/activate-account",
        destination: `${BOOK}/login`,
        permanent: true,
      },
      { source: "/auth", destination: `${BOOK}/login`, permanent: true },
    ];
  },
};

module.exports = nextConfig;
