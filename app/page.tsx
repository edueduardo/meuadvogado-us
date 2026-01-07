'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'

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

const testimonials = [
  {
    id: 1,
    name: "Maria Santos",
    location: "Miami, FL",
    photo: "MS",
    text: "Estava desesperada com meu caso de imigração. Em 24h consegui um advogado que falava português e resolveu tudo! Hoje tenho meu Green Card.",
    rating: 5,
    case: "Green Card Aprovado",
    result: "$0 → Green Card em 8 meses"
  },
  {
    id: 2,
    name: "João Silva", 
    location: "Newark, NJ",
    photo: "JS",
    text: "Sofri um acidente de trabalho e não sabia meus direitos. O advogado conseguiu $45.000 de indenização! Recomendo demais.",
    rating: 5,
    case: "Acidente de Trabalho",
    result: "$45.000 de indenização"
  },
  {
    id: 3,
    name: "Ana Oliveira",
    location: "Boston, MA", 
    photo: "AO",
    text: "Processo de divórcio nos EUA é complicado. Ter um advogado brasileiro que entende nossa cultura fez toda diferença. Resolveu em 3 meses!",
    rating: 5,
    case: "Divórcio Finalizado",
    result: "Custódia garantida"
  },
  {
    id: 4,
    name: "Carlos Mendes",
    location: "Orlando, FL",
    photo: "CM",
    text: "Fui parado pela polícia e achei que ia ser deportado. O advogado me orientou pelo WhatsApp na hora e resolveu tudo. Vida salva!",
    rating: 5,
    case: "DUI Arquivado",
    result: "Caso arquivado, sem deportação"
  }
]

const urgencyMessages = [
  "🔥 47 pessoas consultaram advogados nas últimas 2 horas",
  "⚡ 12 casos novos abertos hoje em Miami",
  "✅ Maria S. acabou de contratar um advogado de imigração",
  "🎯 3 advogados disponíveis agora em seu estado",
  "⏰ Seu caso pode prescrever - não perca o prazo!",
  "💰 João conseguiu $45.000 de indenização ontem"
]

const liveNotifications = [
  { name: "Pedro R.", action: "contratou advogado de imigração", time: "2 min", location: "Miami" },
  { name: "Lucia M.", action: "enviou caso de acidente", time: "5 min", location: "Newark" },
  { name: "Roberto S.", action: "agendou consulta", time: "8 min", location: "Boston" },
  { name: "Fernanda C.", action: "contratou advogado criminal", time: "12 min", location: "Orlando" },
]

const costEstimates: Record<string, { min: number; max: number; contingency?: boolean }> = {
  imigracao: { min: 2500, max: 8000 },
  familia: { min: 3000, max: 10000 },
  criminal: { min: 5000, max: 25000 },
  acidentes: { min: 0, max: 0, contingency: true },
  trabalhista: { min: 2000, max: 7000 },
  empresarial: { min: 1500, max: 5000 },
}

const practiceAreas = [
  { icon: '🛂', name: 'Imigração', slug: 'imigracao', desc: 'Vistos, Green Card, Cidadania, Deportação', urgency: 'Prazos legais rigorosos!' },
  { icon: '👨‍👩‍👧', name: 'Família', slug: 'familia', desc: 'Divórcio, Custódia, Pensão, Adoção', urgency: 'Proteja sua família agora' },
  { icon: '⚖️', name: 'Criminal', slug: 'criminal', desc: 'DUI, Defesa Criminal, Fiança', urgency: 'Cada minuto conta!' },
  { icon: '🚗', name: 'Acidentes', slug: 'acidentes', desc: 'Acidentes de Carro, Trabalho, Quedas', urgency: 'Prazo de 2 anos!' },
  { icon: '💼', name: 'Trabalhista', slug: 'trabalhista', desc: 'Demissão, Discriminação, Salários', urgency: 'Seus direitos importam' },
  { icon: '🏢', name: 'Empresarial', slug: 'empresarial', desc: 'Abertura de Empresa, Contratos, LLC', urgency: 'Proteja seu negócio' },
  { icon: '🏠', name: 'Imobiliário', slug: 'imobiliario', desc: 'Compra, Venda, Aluguel, Disputas', urgency: 'Investimento seguro' },
  { icon: '📋', name: 'Outros', slug: 'outros', desc: 'Testamentos, Impostos, Imigração', urgency: 'Planeje seu futuro' },
]

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentLawyers, setRecentLawyers] = useState<Lawyer[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [urgencyIndex, setUrgencyIndex] = useState(0)
  const [notificationIndex, setNotificationIndex] = useState(0)
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [estimatedCost, setEstimatedCost] = useState<{ min: number; max: number; contingency?: boolean }>({ min: 0, max: 0 })
  const [showNotification, setShowNotification] = useState(true)

  useEffect(() => {
    fetchData()
    
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    const urgencyInterval = setInterval(() => {
      setUrgencyIndex((prev) => (prev + 1) % urgencyMessages.length)
    }, 4000)

    const notificationInterval = setInterval(() => {
      setShowNotification(false)
      setTimeout(() => {
        setNotificationIndex((prev) => (prev + 1) % liveNotifications.length)
        setShowNotification(true)
      }, 500)
    }, 5000)

    return () => {
      clearInterval(testimonialInterval)
      clearInterval(urgencyInterval)
      clearInterval(notificationInterval)
    }
  }, [])

  useEffect(() => {
    if (selectedArea && costEstimates[selectedArea]) {
      setEstimatedCost(costEstimates[selectedArea])
    } else {
      setEstimatedCost({ min: 0, max: 0 })
    }
  }, [selectedArea])

  const fetchData = async () => {
    try {
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

  const openWhatsApp = useCallback(() => {
    const message = encodeURIComponent('Olá! Preciso de ajuda jurídica nos EUA. Podem me ajudar?')
    window.open(`https://wa.me/13055551234?text=${message}`, '_blank')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 relative">
      
      {/* WHATSAPP FLOATING BUTTON */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#22c55e] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 group"
        aria-label="Falar pelo WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          Online
        </span>
      </button>

      {/* LIVE NOTIFICATION POPUP */}
      <div className={`fixed bottom-24 right-6 z-40 transition-all duration-500 ${showNotification ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
        <div className="bg-white rounded-lg shadow-2xl p-4 max-w-xs border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
              {liveNotifications[notificationIndex].name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {liveNotifications[notificationIndex].name} {liveNotifications[notificationIndex].action}
              </p>
              <p className="text-xs text-gray-500">
                {liveNotifications[notificationIndex].location} • {liveNotifications[notificationIndex].time} atrás
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* URGENCY BANNER */}
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-2.5 px-4 text-center text-sm font-medium">
        <span className="animate-pulse">{urgencyMessages[urgencyIndex]}</span>
      </div>

      {/* HEADER */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">⚖️</span>
            <span className="hidden sm:inline">Meu Advogado</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/advogados" className="text-white/80 hover:text-white transition-colors">Advogados</Link>
            <Link href="/caso" className="text-white/80 hover:text-white transition-colors">Conte seu Caso</Link>
            <Link href="/para-advogados" className="text-white/80 hover:text-white transition-colors">Sou Advogado</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-white/80 hover:text-white hidden sm:block">Entrar</Link>
            <Link href="/cadastro" className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105">
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6 border border-white/20">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>+500 brasileiros ajudados este mês</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              <span className="text-red-400">Deportação?</span>{' '}
              <span className="text-yellow-400">Green Card Negado?</span>
              <br className="hidden sm:block" />
              <span className="text-green-400">Acidente de Trabalho?</span>
              <br />
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Advogado Brasileiro Te Ajuda em 24h
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              IA conecta você com o <strong>advogado perfeito</strong> que fala português, 
              entende sua cultura e <strong>resolve seu caso</strong>.
            </p>

            {/* Guarantee Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-2 rounded-lg text-sm">
                <span className="text-green-400">✓</span><span>Consulta Gratuita</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-2 rounded-lg text-sm">
                <span className="text-green-400">✓</span><span>100% em Português</span>
              </div>
              <div className="flex items-center gap-2 text-white/90 bg-white/10 px-3 py-2 rounded-lg text-sm">
                <span className="text-green-400">✓</span><span>Garantia de Satisfação</span>
              </div>
            </div>

            {/* Search Box */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-5 md:p-8 mb-8">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-left text-sm font-medium text-gray-700 mb-1">Qual seu problema?</label>
                  <select 
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-medium transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="imigracao">🛂 Imigração / Green Card</option>
                    <option value="familia">👨‍👩‍👧 Família / Divórcio</option>
                    <option value="criminal">⚖️ Criminal / DUI</option>
                    <option value="acidentes">🚗 Acidentes</option>
                    <option value="trabalhista">💼 Trabalhista</option>
                    <option value="empresarial">🏢 Empresarial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-left text-sm font-medium text-gray-700 mb-1">Onde você está?</label>
                  <select 
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-medium transition-all"
                  >
                    <option value="">Selecione...</option>
                    <option value="FL">🌴 Florida</option>
                    <option value="MA">🏛️ Massachusetts</option>
                    <option value="NJ">🗽 New Jersey</option>
                    <option value="NY">🍎 New York</option>
                    <option value="CA">☀️ California</option>
                    <option value="TX">⛳ Texas</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Link 
                    href={`/advogados?area=${selectedArea}&state=${selectedState}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg"
                  >
                    🔍 Buscar
                  </Link>
                </div>
              </div>

              {/* Cost Estimator */}
              {estimatedCost.min > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="text-sm text-gray-600">Custo estimado:</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${estimatedCost.min.toLocaleString()} - ${estimatedCost.max.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">30% mais barato</span>
                  </div>
                </div>
              )}

              {estimatedCost.contingency && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-bold text-gray-900">VOCÊ NÃO PAGA NADA ADIANTADO!</p>
                      <p className="text-sm text-gray-600">Advogado só recebe se você ganhar (contingência)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/caso" className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg">
                <span className="text-2xl">📝</span>Conte seu Caso (Grátis)
              </Link>
              <button onClick={openWhatsApp} className="group bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#22c55e] hover:to-[#0d6e5b] text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg">
                <span className="text-2xl">💬</span>Falar pelo WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STATS */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-1">{loading ? '...' : (stats?.lawyers.total || 150)}+</div>
              <div className="text-blue-100 text-sm">Advogados Verificados</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-1">$2.4M+</div>
              <div className="text-blue-100 text-sm">Recuperados p/ Clientes</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-1">98%</div>
              <div className="text-blue-100 text-sm">Clientes Satisfeitos</div>
            </div>
            <div className="p-4">
              <div className="text-4xl md:text-5xl font-bold mb-1">24h</div>
              <div className="text-blue-100 text-sm">Tempo Médio de Resposta</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona? <span className="text-blue-600">Simples assim:</span>
            </h2>
            <p className="text-xl text-gray-600">3 passos para resolver seu problema jurídico</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative text-center p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Conte seu Problema</h3>
              <p className="text-gray-600">Descreva sua situação em 30 segundos. Nossa IA entende e analisa.</p>
            </div>
            <div className="relative text-center p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all hover:shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">IA Encontra Especialistas</h3>
              <p className="text-gray-600">Algoritmo analisa 150+ advogados e seleciona os 3 melhores para você.</p>
            </div>
            <div className="relative text-center p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all hover:shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fale Direto pelo WhatsApp</h3>
              <p className="text-gray-600">Consulta gratuita com advogado brasileiro em até 24 horas.</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/caso" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg">
              Começar Agora - É Grátis<span className="text-xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Histórias <span className="text-green-600">Reais</span> de Sucesso
            </h2>
            <p className="text-xl text-gray-600">Brasileiros que resolveram seus problemas com nossa ajuda</p>
          </div>

          <div className="max-w-4xl mx-auto mb-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 transition-all">
              <div className="flex items-start gap-6">
                <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {testimonials[currentTestimonial].photo}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (<span key={i} className="text-yellow-400 text-xl">★</span>))}
                  </div>
                  <p className="text-lg text-gray-700 mb-4 italic">"{testimonials[currentTestimonial].text}"</p>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</p>
                      <p className="text-sm text-gray-500">{testimonials[currentTestimonial].location}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">✓ {testimonials[currentTestimonial].case}</span>
                      <p className="text-sm text-green-600 font-bold mt-1">{testimonials[currentTestimonial].result}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {testimonials.map((_, index) => (
              <button key={index} onClick={() => setCurrentTestimonial(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentTestimonial ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* FEAR-BASED URGENCY */}
      <section className="py-12 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">⚠️ Não Deixe Seu Caso Prescrever!</h2>
          <p className="text-lg text-red-100 mb-6">
            <strong>Acidentes:</strong> 2 anos de prazo | <strong>Imigração:</strong> Prazos variam | <strong>Criminal:</strong> Cada minuto conta
          </p>
          <Link href="/caso" className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg">
            Consultar Agora - Grátis<span className="animate-pulse">→</span>
          </Link>
        </div>
      </section>

      {/* PRACTICE AREAS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Áreas de <span className="text-blue-600">Atuação</span></h2>
            <p className="text-xl text-gray-600">Especialistas em todas as áreas do direito americano</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {practiceAreas.map((area) => (
              <Link key={area.slug} href={`/advogados?area=${area.slug}`} className="group bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{area.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{area.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{area.desc}</p>
                <span className="text-xs text-red-500 font-medium">{area.urgency}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT LAWYERS */}
      {!loading && recentLawyers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Advogados <span className="text-blue-600">Disponíveis Agora</span></h2>
              <p className="text-xl text-gray-600">Profissionais verificados prontos para te ajudar</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentLawyers.slice(0, 6).map((lawyer) => (
                <Link key={lawyer.id} href={`/advogados/${lawyer.slug}`} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border border-gray-100 hover:border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{lawyer.name}</h3>
                        {lawyer.verified && <span className="text-green-500">✓</span>}
                      </div>
                      {lawyer.headline && <p className="text-gray-600 text-sm mb-2">{lawyer.headline}</p>}
                      <p className="text-sm text-gray-500">📍 {lawyer.city}, {lawyer.state}</p>
                    </div>
                    {lawyer.featured && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">⭐ Destaque</span>}
                  </div>
                  {lawyer.practiceAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {lawyer.practiceAreas.slice(0, 2).map((area) => (
                        <span key={area.slug} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{area.name}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{lawyer.rating > 0 ? lawyer.rating.toFixed(1) : '5.0'}</span>
                      <span className="text-gray-400 text-sm">({lawyer.reviewCount || 0})</span>
                    </div>
                    <span className="text-blue-600 font-medium text-sm">Ver perfil →</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/advogados" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105">
                Ver Todos os Advogados<span>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA ADVOGADOS */}
      <section className="py-16 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">É Advogado Brasileiro nos EUA? 🇧🇷</h2>
          <p className="text-xl text-slate-300 mb-8">
            Cadastre-se gratuitamente e receba clientes brasileiros que precisam da sua ajuda.
            <br /><span className="text-green-400 font-bold">+50 leads/mês para advogados verificados</span>
          </p>
          <Link href="/para-advogados" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg">
            Quero Receber Clientes<span>→</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-gray-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2"><span>⚖️</span> Meu Advogado</h3>
              <p className="text-sm mb-4">Conectando brasileiros com advogados de confiança nos Estados Unidos desde 2024.</p>
              <button onClick={openWhatsApp} className="bg-[#25D366] p-2 rounded-lg hover:opacity-80 transition-opacity">
                <span className="text-white text-lg">💬</span>
              </button>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Para Clientes</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/advogados" className="hover:text-white transition-colors">Buscar Advogados</Link></li>
                <li><Link href="/caso" className="hover:text-white transition-colors">Conte seu Caso</Link></li>
                <li><Link href="/como-funciona" className="hover:text-white transition-colors">Como Funciona</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Para Advogados</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/para-advogados" className="hover:text-white transition-colors">Cadastre-se</Link></li>
                <li><Link href="/planos" className="hover:text-white transition-colors">Planos e Preços</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Área do Advogado</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 contato@meuadvogado.us</li>
                <li>💬 WhatsApp: (305) 555-1234</li>
                <li>📍 Miami, FL - USA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2026 Meu Advogado. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
