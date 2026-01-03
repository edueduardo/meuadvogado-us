import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Meu Advogado - Advogados Brasileiros nos EUA',
  description: 'Encontre advogados brasileiros nos Estados Unidos. Especialistas em imigração, família, criminal e mais.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
