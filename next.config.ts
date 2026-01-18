import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  output: 'standalone',
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

export default nextConfig
