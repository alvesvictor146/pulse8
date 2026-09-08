/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Impede que o site seja carregado em iframes de outros domínios (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Impede MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Proteção XSS para navegadores legados
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Controla informações de referência
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Força HTTPS em produção
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Restringe permissões de APIs de browser
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=()",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // unsafe-eval necessário para Next.js dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https:",
      "worker-src 'self' blob:", // Para Service Worker PWA
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const isProd = process.env.NODE_ENV === 'production';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (isProd ? '/pulse8' : '');

const nextConfig = {
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,

  /*
  async headers() {
    return [
      {
        // Aplicar headers de segurança em todas as rotas
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  */

  // Silenciar avisos de pacotes externos no bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
