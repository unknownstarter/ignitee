/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    transpilePackages: ["@domain", "@use-cases", "@ports", "@adapters", "@shared"]
  }
}

module.exports = nextConfig
