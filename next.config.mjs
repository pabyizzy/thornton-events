/** @type {import('next').NextConfig} */
const nextConfig = {
    // Static export for Hostinger deployment
    output: 'export',
    // Disable image optimization for static export
    images: { unoptimized: true },
    // Disable trailing slashes for static export
    trailingSlash: false,
    // Skip build-time errors for static export
    skipTrailingSlashRedirect: true,
    // Disable server-side features that don't work with static export
  }
  export default nextConfig
  