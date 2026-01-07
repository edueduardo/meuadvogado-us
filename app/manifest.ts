import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Meu Advogado - Advogados Brasileiros nos EUA',
    short_name: 'Meu Advogado',
    description: 'Encontre advogados brasileiros nos Estados Unidos. Imigração, Acidentes, Família, Criminal. Consulta gratuita em português.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#2563eb',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['legal', 'business', 'lifestyle'],
    lang: 'pt-BR',
  }
}
