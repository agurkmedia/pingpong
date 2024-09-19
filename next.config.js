/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  experimental: {
    largePageDataBytes: 128 * 100000, // Increase the limit to 12.8MB
  },
};

module.exports = nextConfig;