/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    // Ensure PostCSS is properly configured
    return config;
  },
};

export default nextConfig;
