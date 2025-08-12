/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/wizard/samenvatting',
        destination: '/wizard/vervolgstappen',
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
  transpilePackages: [
    '@react-pdf',
    '@react-pdf/renderer',
    'react-pdf',
    'pdfjs-dist'
  ],
  eslint: {
    // Tijdelijk uitgeschakeld tot alle linting issues zijn opgelost
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tijdelijk uitgeschakeld tot alle type issues zijn opgelost
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // svg behandeling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // ESM modules configuratie
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };

    return config;
  },
};

module.exports = nextConfig; 