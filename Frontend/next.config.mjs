/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://feeldiary-backend.vercel.app/api/:path*", // proxy to your API
      },
    ];
  },
};

export default nextConfig;
