/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') ?? 'localhost:3000'] },
  },
}

module.exports = nextConfig
