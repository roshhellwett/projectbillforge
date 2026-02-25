import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a standalone output folder that Railway can run with `node server.js`
  output: "standalone",

  // Include migration files in standalone output (they aren't auto-detected)
  outputFileTracingIncludes: {
    "*": ["./drizzle/**/*", "./migrate.mjs"],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // HTTP Security Headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer info
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for 1 year (activate only after confirming HTTPS works)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Disable browser features not needed by BillForge
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Content Security Policy — restrict script/style sources
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs unsafe-eval in dev
              "style-src 'self' 'unsafe-inline'", // Tailwind needs unsafe-inline
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

