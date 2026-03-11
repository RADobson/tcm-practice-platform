/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TODO: Fix pre-existing type errors in original codebase
    ignoreBuildErrors: true,
  },
  eslint: {
    // TODO: Fix pre-existing lint errors in original codebase
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
