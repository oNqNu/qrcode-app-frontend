/** @type {import('next').NextConfig} */

require('dotenv').config();

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  assetPrefix: process.env.GITHUB_PAGES ? '/repository-name' : '',
};

module.exports = nextConfig;
