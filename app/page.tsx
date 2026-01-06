'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronRight, Shield, Clock, DollarSign, Users, Zap } from 'lucide-react'

interface Stats {
  lawyers: { total: number; verified: number }
  cases: { total: number }
  clients: number
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [userType, setUserType] = useState<'client' | 'lawyer' | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR - Simple and Clear */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            Meu Advogado
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-gray-700 hover:text-blue-600 transition">
              Como Funciona
            </a>
            <a href="#stats" className="text-gray-700 hover:text-blue-600 transition">
              Números
            </a>
            <a href="#faq" className="text-gray-700 hover:text-blue-600 transition">
              FAQ
            </a>
          </div>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600 transition">
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - CLEAR VALUE PROPOSITION */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Encontre o Advogado Perfeito em Minutos
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Conecte-se com advogados verificados, receba orientação jurídica confiável, resova seu problema legal com segurança e confiança.
              </p>

              {/* CTA BUTTONS - CRYSTAL CLEAR CHOICE */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setUserType('client')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg flex items-center justify-center gap-2"
                >
                  👤 Sou Cliente
                  <ChevronRight size={20} />
                </button>
                <button
                  onClick={() => setUserType('lawyer')}
                  className="bg-blue-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-900 transition border-2 border-white flex items-center justify-center gap-2"
                >
                  ⚖️ Sou Advogado
                  <ChevronRight size={20} />
                </button>
              </div>

              <p className="text-blue-100 text-sm mt-6">
                ✓ 100% seguro  ✓ Verificado  ✓ Sem compromisso
              </p>
            </div>

            {/* Right: Visual */}
            <div className="hidden md:block">
              <div className="bg-blue-400 bg-opacity-20 rounded-xl p-8 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-white bg-opacity-10 p-4 rounded-lg">
                    <Shield className="text-blue-200" size={24} />
                    <span className="text-blue-100">Advogados Verificados</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white bg-opacity-10 p-4 rounded-lg">
                    <Clock className="text-blue-200" size={24} />
                    <span className="text-blue-100">Resposta em Minutos</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white bg-opacity-10 p-4 rounded-lg">
                    <DollarSign className="text-blue-200" size={24} />
                    <span className="text-blue-100">Preços Transparentes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK SELECT - If user clicked a button */}
      {userType && (
        <section className="bg-blue-50 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setUserType(null)}
              className="text-blue-600 hover:text-blue-700 mb-8 flex items-center gap-2"
            >
              ← Voltar
            </button>

            {userType === 'client' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Você é um Cliente que precisa de Advogado</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Conte Seu Caso</h3>
                      <p className="text-gray-600">Descreva seu problema legal em detalhes</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">IA Analisa</h3>
                      <p className="text-gray-600">Nossa IA analisa seu caso automaticamente</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Match com Advogado</h3>
                      <p className="text-gray-600">Encontramos os melhores advogados para seu caso</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Contrate & Converse</h3>
                      <p className="text-gray-600">Chat em tempo real + pagamento seguro</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/cadastro"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                >
                  Começar Agora
                  <ChevronRight size={20} />
                </Link>
              </div>
            )}

            {userType === 'lawyer' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Você é um Advogado que quer Clientes</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Crie Seu Perfil</h3>
                      <p className="text-gray-600">Mostre sua experiência e especialidades</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Receba Leads Qualificados</h3>
                      <p className="text-gray-600">Nossa IA envia apenas casos que combinam com você</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Escolha & Comece</h3>
                      <p className="text-gray-600">Aceite os casos que interessam, comunique pelo chat</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <span className="text-blue-600 font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Ganhe Dinheiro</h3>
                      <p className="text-gray-600">Pagamento seguro direto na sua conta</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/cadastro"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
                >
                  Comece a Receber Clientes
                  <ChevronRight size={20} />
                </Link>

                <p className="text-gray-600 text-sm mt-6">
                  Sua licença OAB será verificada. Apenas advogados verificados podem usar a plataforma.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* HOW IT WORKS - CLEAR & VISUAL */}
      <section id="como-funciona" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Como Funciona</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* CLIENT FLOW */}
            <div>
              <div className="bg-blue-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Para Clientes</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Descreva seu problema</h4>
                      <p className="text-gray-600 text-sm">Conte os detalhes do seu caso</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Análise automática</h4>
                      <p className="text-gray-600 text-sm">IA analisa urgência e complexidade</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Veja advogados qualificados</h4>
                      <p className="text-gray-600 text-sm">Top 5 matches para seu caso</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Chat & Contrate</h4>
                      <p className="text-gray-600 text-sm">Comunique em tempo real, seguro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LAWYER FLOW */}
            <div>
              <div className="bg-blue-50 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Para Advogados</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Crie seu perfil</h4>
                      <p className="text-gray-600 text-sm">Mostre expertise, experiência, idiomas</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Seja verificado</h4>
                      <p className="text-gray-600 text-sm">Validamos sua licença OAB</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Receba leads qualificados</h4>
                      <p className="text-gray-600 text-sm">IA envia apenas casos que combinam</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                      4
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Ganhe dinheiro</h4>
                      <p className="text-gray-600 text-sm">Pagamento imediato, seguro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS - PROOF & SOCIAL PROOF */}
      <section id="stats" className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Números que Falam</h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">
                {stats?.lawyers.total || '500+'}
              </div>
              <p className="text-gray-300">Advogados Verificados</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">
                {stats?.clients || '10k+'}
              </div>
              <p className="text-gray-300">Clientes Atendidos</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">
                {stats?.cases.total || '15k+'}
              </div>
              <p className="text-gray-300">Casos Resolvidos</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-400 mb-2">4.9★</div>
              <p className="text-gray-300">Rating Médio</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - WHAT MAKES US DIFFERENT */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Por Que Escolher Meu Advogado?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-600 transition">
              <Shield className="text-blue-600 mb-4" size={32} />
              <h3 className="font-bold text-lg text-gray-900 mb-2">100% Verificado</h3>
              <p className="text-gray-600">Todos advogados têm licença OAB validada. Zero fraude.</p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-600 transition">
              <Zap className="text-blue-600 mb-4" size={32} />
              <h3 className="font-bold text-lg text-gray-900 mb-2">IA Smart Matching</h3>
              <p className="text-gray-600">Nossa IA encontra o advogado PERFEITO para seu caso.</p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-600 transition">
              <DollarSign className="text-blue-600 mb-4" size={32} />
              <h3 className="font-bold text-lg text-gray-900 mb-2">Preço Transparente</h3>
              <p className="text-gray-600">Sem surpresas. Você sabe quanto custa antes de começar.</p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-600 transition">
              <Clock className="text-blue-600 mb-4" size={32} />
              <h3 className="font-bold text-lg text-gray-900 mb-2">Resposta Rápida</h3>
              <p className="text-gray-600">Advogados respondem em minutos, não dias.</p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-600 transition">
              <Users className="text-blue-600 mb-4" size={32} />
              <h3 className="font-bold text-lg text-gray-900 mb-2">Chat em Tempo Real</h3>
              <p className="text-gray-600">Comunique quando quiser com segurança total.</p>
            </div>

            <div className="p-6 rounded-lg border border-gray-200 hover:border-blue-600 transition">
              <Shield className="text-blue-600 mb-4" size={32} />
              <h3 className="font-bold text-lg text-gray-900 mb-2">Pagamento Seguro</h3>
              <p className="text-gray-600">Escrow protection. Seu dinheiro está seguro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL - CLEAR ACTION */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de clientes e advogados que confiam em Meu Advogado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cadastro"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              Sou Cliente
            </Link>
            <Link
              href="/cadastro"
              className="bg-blue-800 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-900 transition border-2 border-white"
            >
              Sou Advogado
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">Meu Advogado</h3>
              <p className="text-sm">Conectando clientes com advogados verificados.</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Para Clientes</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/caso" className="hover:text-white">Conte seu Caso</Link></li>
                <li><Link href="/advogados" className="hover:text-white">Buscar Advogados</Link></li>
                <li><a href="#" className="hover:text-white">Como Funciona</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Para Advogados</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/para-advogados" className="hover:text-white">Cadastre-se</Link></li>
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Meu Advogado. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
