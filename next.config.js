/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    // Remote patterns for external images (if needed)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Cache optimization
    minimumCacheTTL: 60,
  },
  
  // Strict mode for catching bugs
  reactStrictMode: true,
  
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Trailing slash consistency
  trailingSlash: false,
  
  // Configure Webpack for bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Add any needed Webpack customizations here
    return config;
  },
};

module.exports = nextConfig;