/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@coworking-cafe/database', '@coworking-cafe/shared'],
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    // Disable ESLint during build (can be run separately with `pnpm lint`)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TODO: Re-enable after resolving Employee/TimeEntry type conflicts across components
    // Known issues: Multiple components define their own Employee/TimeEntry interfaces
    // instead of using shared types from @/types/hr and @/types/timeEntry
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
