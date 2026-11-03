/**
 * Two deploy modes:
 *  - Vercel / `next start` (default): full Next.js server with security headers.
 *  - GitHub Pages: set PAGES_BASE_PATH (e.g. "/first-repo/oceanslines") and the
 *    app is exported as static files into `out/`. Every page here is static and
 *    auth is client-side, so the export behaves the same.
 */
const pagesBasePath = process.env.PAGES_BASE_PATH;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(pagesBasePath !== undefined
    ? {
        output: "export",
        basePath: pagesBasePath,
        images: { unoptimized: true },
      }
    : {
        async headers() {
          return [
            { source: "/(.*)", headers: securityHeaders },
            // The portal is private: keep it out of search engines.
            {
              source: "/(login|portal|admin)(.*)",
              headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
            },
          ];
        },
      }),
};

export default nextConfig;
