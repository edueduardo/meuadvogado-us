'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Stats {
  lawyers: {
    total: number
    verified: number
    cities: number
    states: number
  }
  practiceAreas: number
  cases: {
    total: number
    byStatus: Record<string, number>
  }
  clients: number
  lastUpdated: string
  error?: string
}

interface Lawyer {
  id: string
  name: string
  slug: string
  headline?: string
  city: string
  state: string
  plan: string
  verified: boolean
  featured: boolean
  yearsExperience?: number
  languages: string[]
  practiceAreas: Array<{
    name: string
    slug: string
  }>
  rating: number
  reviewCount: number
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentLawyers, setRecentLawyers] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Buscar stats e advogados recentes em paralelo
      const [statsResponse, lawyersResponse] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/lawyers/recent')
      ])

      const statsData = await statsResponse.json()
      const lawyersData = await lawyersResponse.json()

      setStats(statsData)
      setRecentLawyers(lawyersData.lawyers || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Meu Advogado
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/advogados" className="text-gray-600 hover:text-blue-600">
              Buscar Advogados
            </Link>
            <Link href="/caso" className="text-gray-600 hover:text-blue-600">
              Conte seu Caso
            </Link>
            <Link href="/para-advogados" className="text-gray-600 hover:text-blue-600">
              Para Advogados
            </Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-blue-600">
              Entrar
            </Link>
            <Link href="/cadastro" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Encontre um Advogado<br />
          <span className="text-blue-600">Brasileiro nos EUA</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Conectamos brasileiros que precisam de ajuda jurídica com advogados 
          que falam português e entendem sua cultura.
        </p>
        
        {/* Search Box */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-12">
          <div className="grid md:grid-cols-3 gap-4">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Área de Atuação</option>
              <option value="imigracao">Imigração</option>
              <option value="familia">Direito de Família</option>
              <option value="criminal">Direito Criminal</option>
              <option value="acidentes">Acidentes Pessoais</option>
              <option value="trabalhista">Direito Trabalhista</option>
              <option value="empresarial">Direito Empresarial</option>
            </select>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Estado</option>
              <option value="FL">Florida</option>
              <option value="MA">Massachusetts</option>
              <option value="NJ">New Jersey</option>
              <option value="NY">New York</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
            </select>
            <Link 
              href="/advogados"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center"
            >
              Buscar Advogados
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link 
            href="/caso"
            className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 font-semibold text-lg"
          >
            📝 Conte seu Caso (Grátis)
          </Link>
          <Link 
            href="/advogados"
            className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 font-semibold text-lg"
          >
            🔍 Ver Todos os Advogados
          </Link>
        </div>

        {/* Login/Cadastro CTA */}
        <div className="bg-blue-50 rounded-xl p-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Já tem uma conta?
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            Acesse sua área para conversar com advogados, acompanhar seus casos e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center"
            >
              🔑 Entrar na Minha Conta
            </Link>
            <Link 
              href="/cadastro"
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-semibold flex items-center justify-center"
            >
              👤 Criar Conta Gratuita
            </Link>
          </div>
        </div>
      </section>

      {/* Stats - DADOS REAIS */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold">
                {loading ? '...' : stats?.lawyers.total || 0}
                {!loading && stats?.lawyers.verified && (
                  <span className="text-xl text-blue-200 block">
                    ({stats.lawyers.verified} verificados)
                  </span>
                )}
              </div>
              <div className="text-blue-100">Advogados</div>
            </div>
            <div>
              <div className="text-4xl font-bold">
                {loading ? '...' : stats?.lawyers.cities || 0}
              </div>
              <div className="text-blue-100">Cidades</div>
            </div>
            <div>
              <div className="text-4xl font-bold">
                {loading ? '...' : stats?.practiceAreas || 0}
              </div>
              <div className="text-blue-100">Áreas de Atuação</div>
            </div>
            <div>
              <div className="text-4xl font-bold">
                {loading ? '...' : stats?.cases.total || 0}
              </div>
              <div className="text-blue-100">Casos</div>
            </div>
          </div>
          {stats?.error && (
            <div className="text-center text-blue-200 text-sm mt-4">
              ⚠️ {stats.error}
            </div>
          )}
        </div>
      </section>

      {/* Recent Lawyers - DADOS REAIS */}
      {!loading && recentLawyers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advogados Verificados Recentes
            </h2>
            <p className="text-xl text-gray-600">
              Conheça alguns de nossos advogados brasileiros qualificados nos EUA
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentLawyers.map((lawyer) => (
              <Link
                key={lawyer.id}
                href={`/advogados/${lawyer.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {lawyer.name}
                    </h3>
                    {lawyer.headline && (
                      <p className="text-gray-600 text-sm mb-2">{lawyer.headline}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      <span>📍 {lawyer.city}, {lawyer.state}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {lawyer.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">
                        ✅ Verificado
                      </span>
                    )}
                    {lawyer.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Destaque
                      </span>
                    )}
                  </div>
                </div>

                {lawyer.practiceAreas.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {lawyer.practiceAreas.slice(0, 3).map((area) => (
                        <span
                          key={area.slug}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {area.name}
                        </span>
                      ))}
                      {lawyer.practiceAreas.length > 3 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{lawyer.practiceAreas.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    {lawyer.rating > 0 && (
                      <>
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 text-gray-600">
                          {lawyer.rating.toFixed(1)}
                        </span>
                        {lawyer.reviewCount > 0 && (
                          <span className="text-gray-400 ml-1">
                            ({lawyer.reviewCount})
                          </span>
                        )}
                      </>
                    )}
                    {lawyer.yearsExperience && (
                      <span className="ml-4 text-gray-500">
                        {lawyer.yearsExperience} anos exp.
                      </span>
                    )}
                  </div>
                  <span className="text-blue-600 font-medium">
                    Ver perfil →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/advogados"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Ver Todos os Advogados →
            </Link>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Por que usar o Meu Advogado?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🇧🇷</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Falam Português</h3>
            <p className="text-gray-600">
              Todos os advogados falam português fluentemente e entendem a cultura brasileira.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verificados</h3>
            <p className="text-gray-600">
              Verificamos a licença e credenciais de todos os advogados cadastrados.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Contato Direto</h3>
            <p className="text-gray-600">
              Entre em contato direto via WhatsApp, telefone ou email sem intermediários.
            </p>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Áreas de Atuação
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '✈️', name: 'Imigração', desc: 'Vistos, Green Card, Cidadania' },
              { icon: '👨‍👩‍👧', name: 'Família', desc: 'Divórcio, Custódia, Pensão' },
              { icon: '⚖️', name: 'Criminal', desc: 'DUI, Defesa Criminal' },
              { icon: '🚗', name: 'Acidentes', desc: 'Acidentes de Carro, Trabalho' },
              { icon: '💼', name: 'Trabalhista', desc: 'Demissão, Discriminação' },
              { icon: '🏢', name: 'Empresarial', desc: 'Abertura de Empresa, Contratos' },
              { icon: '🏠', name: 'Imobiliário', desc: 'Compra, Venda, Aluguel' },
              { icon: '📋', name: 'Outros', desc: 'Testamentos, Impostos' },
            ].map((area) => (
              <Link 
                key={area.name}
                href={`/advogados?area=${area.name.toLowerCase()}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{area.icon}</div>
                <h3 className="font-semibold text-gray-900">{area.name}</h3>
                <p className="text-sm text-gray-500">{area.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Advogados */}
      <section className="bg-blue-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            É Advogado Brasileiro nos EUA?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Cadastre-se gratuitamente e receba clientes brasileiros que precisam da sua ajuda.
          </p>
          <Link 
            href="/para-advogados"
            className="inline-block bg-white text-blue-900 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg"
          >
            Quero me Cadastrar →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Meu Advogado</h3>
              <p className="text-sm">
                Conectando brasileiros com advogados de confiança nos Estados Unidos.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Para Clientes</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">🔑 Entrar na Conta</Link></li>
                <li><Link href="/cadastro" className="hover:text-white">👤 Criar Conta</Link></li>
                <li><Link href="/advogados" className="hover:text-white">Buscar Advogados</Link></li>
                <li><Link href="/caso" className="hover:text-white">Conte seu Caso</Link></li>
                <li><Link href="/como-funciona" className="hover:text-white">Como Funciona</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Para Advogados</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/para-advogados" className="hover:text-white">Cadastre-se</Link></li>
                <li><Link href="/planos" className="hover:text-white">Planos</Link></li>
                <li><Link href="/login" className="hover:text-white">Área do Advogado</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li>contato@meuadvogado.us</li>
                <li>WhatsApp: (XX) XXXXX-XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2025 Meu Advogado. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
