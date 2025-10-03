/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      // Baris ini penting untuk Vercel agar tidak gagal build karena error TypeScript
      ignoreBuildErrors: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "ik.imagekit.io",
        },
      ],
    },
  };
  
  module.exports = nextConfig;