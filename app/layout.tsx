import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Header from './components/Header'
import ToastProvider from './components/ToastProvider'
import SocketInitializer from './components/SocketInitializer'

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
