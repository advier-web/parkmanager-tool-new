/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@react-pdf',
    '@react-pdf/renderer',
    'react-pdf',
    'pdfjs-dist'
  ],
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