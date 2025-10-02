
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // Allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      }
    ],
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  experimental: {
    allowedDevOrigins: [
        "https://6000-firebase-studio-1755664777913.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev"
    ]
  }
};

export default nextConfig;
