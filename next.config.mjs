/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server-side rendering for authentication and dynamic features
  // Note: For deployment, use Vercel, Netlify, or any Node.js hosting
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}
export default nextConfig
  