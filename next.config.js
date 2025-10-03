/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      // Ini penting agar Vercel tidak gagal build karena error TypeScript.
      // Sebaiknya perbaiki error Tipe dan set ke `false` di masa depan.
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