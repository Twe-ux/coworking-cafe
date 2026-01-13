/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // SCSS configuration
  sassOptions: {
    includePaths: ['./src/styles'],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['bootstrap-icons'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
