/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@coworking-cafe/database', '@coworking-cafe/shared'],
  experimental: {
    instrumentationHook: true,
  },
}

module.exports = nextConfig
