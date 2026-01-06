import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mantém lint para dev/CI se você quiser rodar manualmente (`npm run lint`),
  // mas impede que o deploy falhe por causa do `next build`.
  eslint: {
    ignoreDuringBuilds: true,
  },
} as any; // Type assertion para permitir propriedades não documentadas

export default nextConfig;
