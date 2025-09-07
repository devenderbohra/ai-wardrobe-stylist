/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'storage.googleapis.com'],
  },
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_BASE_URL: process.env.GEMINI_BASE_URL,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
  },
};

module.exports = nextConfig;
