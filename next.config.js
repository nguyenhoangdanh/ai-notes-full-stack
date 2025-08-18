/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Enable the new app directory (this is now stable in Next.js 13+)
  },
  
  // Configure image optimization
  images: {
    domains: ['localhost'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Configure PWA and service worker
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    analyze: {
      enabled: true,
    }
  }),
  
  // Webpack configuration for compatibility
  webpack: (config, { dev, isServer }) => {
    // Handle @github/spark compatibility
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    
    return config
  },
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    dirs: ['app', 'lib', 'components'],
  },
  
  // Output configuration for deployment
  output: 'standalone',
}

export default nextConfig