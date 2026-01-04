'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Meu Advogado</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/advogados" className="text-gray-700 hover:text-blue-600">
              Buscar Advogados
            </Link>
            <Link href="/como-funciona" className="text-gray-700 hover:text-blue-600">
              Como Funciona
            </Link>
            <Link href="/para-advogados" className="text-gray-700 hover:text-blue-600">
              Para Advogados
            </Link>
          </nav>

          {/* Desktop Auth Buttons - DOIS BOTÕES SEPARADOS */}
          <div className="hidden md:flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
            ) : session ? (
              <>
                <Link 
                  href={session.user?.role === 'LAWYER' ? '/advogado/dashboard' : '/cliente/dashboard'}
                  className="text-gray-700 hover:text-blue-600"
                >
                  {session.user?.name}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-500 hover:text-red-600 text-sm"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login?type=client"
                  className="text-blue-600 hover:text-blue-700 font-medium px-3 py-2 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  👤 Entrar como Cliente
                </Link>
                <Link 
                  href="/login?type=lawyer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  ⚖️ Entrar como Advogado
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/advogados" 
                className="text-gray-700 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Buscar Advogados
              </Link>
              <Link 
                href="/como-funciona" 
                className="text-gray-700 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Como Funciona
              </Link>
              <Link 
                href="/para-advogados" 
                className="text-gray-700 hover:text-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Para Advogados
              </Link>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                {status === 'loading' ? (
                  <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
                ) : session ? (
                  <>
                    <Link 
                      href={session.user?.role === 'LAWYER' ? '/advogado/dashboard' : '/cliente/dashboard'}
                      className="text-gray-700 hover:text-blue-600 block py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {session.user?.name}
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                      className="text-red-600 hover:text-red-700 text-sm py-2"
                    >
                      Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login?type=client"
                      className="text-blue-600 hover:text-blue-700 font-medium px-3 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 block text-center mb-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      👤 Entrar como Cliente
                    </Link>
                    <Link 
                      href="/login?type=lawyer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 block text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ⚖️ Entrar como Advogado
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
