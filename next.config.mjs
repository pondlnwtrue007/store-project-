/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    allowedOrigins: ['localhost:3000', '192.168.1.163:3000'],
  },
};

export default nextConfig;
