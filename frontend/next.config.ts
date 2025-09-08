import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // This line tells Next.js to create a standalone output
  // that can be easily run in a Docker container.
  output: 'standalone',
}

export default nextConfig