// next.config.ts
import { NextConfig } from 'next';

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,  // Enables React Strict Mode for additional checks during development

  // Security headers configuration
  async headers() {
    return [
      {
        source: "/(.*)",  // Apply to all routes
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",  // Enforces HTTPS communication only
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",  // Prevents MIME type sniffing
          },
          {
            key: "X-Frame-Options",
            value: "DENY",  // Prevents clickjacking attacks
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",  // Protects against XSS attacks
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'; object-src 'none';", // Configures CSP to restrict sources
          },
        ],
      },
    ];
  },
};

export default nextConfig;
