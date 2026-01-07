import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Header from './components/Header'
import ToastProvider from './components/ToastProvider'
import SocketInitializer from '@/components/SocketInitializer'

export const metadata: Metadata = {
  title: {
    default: 'Meu Advogado - Advogados Brasileiros nos EUA | Consulta Grátis',
    template: '%s | Meu Advogado',
  },
  description: 'Encontre advogados brasileiros nos Estados Unidos. Imigração, Green Card, Acidentes, Família, Criminal. Consulta gratuita em português. Resposta em 24h.',
  keywords: [
    'advogado brasileiro EUA',
    'advogado imigração',
    'green card advogado',
    'advogado português Miami',
    'advogado brasileiro Florida',
    'advogado acidente trabalho',
    'advogado família EUA',
    'advogado criminal brasileiro',
    'deportação advogado',
    'visto americano advogado',
  ],
  authors: [{ name: 'Meu Advogado' }],
  creator: 'Meu Advogado',
  publisher: 'Meu Advogado',
  metadataBase: new URL('https://meuadvogado-us.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://meuadvogado-us.vercel.app',
    siteName: 'Meu Advogado',
    title: 'Meu Advogado - Advogados Brasileiros nos EUA',
    description: 'Encontre advogados brasileiros nos Estados Unidos. Consulta gratuita em português.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Meu Advogado - Advogados Brasileiros nos EUA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meu Advogado - Advogados Brasileiros nos EUA',
    description: 'Encontre advogados brasileiros nos Estados Unidos. Consulta gratuita.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Providers>
          <ToastProvider />
          <SocketInitializer />
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
