'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeyGenVideo from '@/components/HeyGenVideo'

const lawyerTestimonials = [
  {
    id: 1,
    name: "Dr. Ricardo Almeida",
    specialty: "Imigração",
    location: "Miami, FL",
    photo: "RA",
    videoId: "advogado_depoimento_ricardo_almeida",
    text: "Em 3 meses na plataforma, recebi mais de 40 leads qualificados. Já fechei 12 casos. O ROI é absurdo!",
    metric: "+$85.000 em honorários"
  },
  {
    id: 2,
    name: "Dra. Fernanda Costa",
    specialty: "Acidentes",
    location: "Newark, NJ",
    photo: "FC",
    videoId: "advogado_depoimento_fernanda_costa",
    text: "Antes gastava $3.000/mês em Google Ads com resultados ruins. Aqui pago $199 e recebo leads que realmente fecham.",
    metric: "ROI de 1.200%"
  },
  {
    id: 3,
    name: "Dr. Marcos Silva",
    specialty: "Criminal",
    location: "Boston, MA",
    photo: "MS",
    videoId: "advogado_depoimento_marcos_silva",
    text: "Os clientes já vêm pré-qualificados e sabendo que falo português. A conversão é muito maior.",
    metric: "8 casos/mês"
  },
]

const plans = [
  {
    name: "Starter",
    price: "Grátis",
    period: "",
    features: [
      "3 leads/mês",
      "Perfil básico",
      "Chat com clientes",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$199",
    period: "/mês",
    features: [
      "Leads ilimitados",
      "Perfil destacado",
      "Badge verificado",
      "Prioridade no matching",
      "Analytics avançados",
      "Suporte prioritário",
    ],
    cta: "Começar Agora",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$499",
    period: "/mês",
    features: [
      "Tudo do Professional",
      "Primeiro nos resultados",
      "API de integração",
      "White-label disponível",
      "Account manager dedicado",
      "Marketing co-branded",
    ],
    cta: "Falar com Vendas",
    highlight: false,
  },
]

const stats = [
  { value: "500+", label: "Brasileiros/mês buscando advogado" },
  { value: "$0", label: "Custo de aquisição para você" },
  { value: "85%", label: "Taxa de contato dos leads" },
  { value: "24h", label: "Tempo médio para primeiro contato" },
]

export default function AdvogadoPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showVideoTestimonials, setShowVideoTestimonials] = useState(true)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % lawyerTestimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-600/20 via-transparent to-transparent"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>

        {/* Header */}
        <header className="relative z-10 bg-white/5 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">⚖️</span>
              <span>Meu Advogado</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/cliente" className="text-white/70 hover:text-white text-sm hidden sm:block">
                Sou Cliente
              </Link>
              <Link href="/login" className="text-white/70 hover:text-white text-sm">
                Entrar
              </Link>
              <Link href="/cadastro?tipo=advogado" className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all hover:scale-105">
                Cadastrar Grátis
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6 border border-white/20 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>+500 brasileiros buscando advogado este mês</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Receba <span className="text-green-400">Clientes Brasileiros</span> Qualificados Todos os Dias
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-green-100/80 mb-8">
              Chega de gastar fortunas em marketing. Brasileiros nos EUA precisam de você 
              e já estão aqui procurando.
            </p>

            {/* Pain Points */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 text-white/80">
                <span className="text-red-400 text-xl">✗</span>
                <span>Cansado de pagar caro no Google Ads?</span>
              </div>
              <div className="flex items-start gap-3 text-white/80">
                <span className="text-red-400 text-xl">✗</span>
                <span>Leads frios que nunca respondem?</span>
              </div>
              <div className="flex items-start gap-3 text-white/80">
                <span className="text-red-400 text-xl">✗</span>
                <span>Clientes que não falam português?</span>
              </div>
              <div className="flex items-start gap-3 text-white/80">
                <span className="text-red-400 text-xl">✗</span>
                <span>Tempo perdido com casos fora da sua área?</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/cadastro?tipo=advogado"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
              >
                <span>Começar Grátis</span>
                <span>→</span>
              </Link>
              <Link 
                href="#como-funciona"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all border border-white/30"
              >
                <span>Ver Como Funciona</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {stats.map((stat, index) => (
              <div key={index} className="p-4">
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-green-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-gray-50" id="como-funciona">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona para <span className="text-green-600">Advogados</span>
            </h2>
            <p className="text-xl text-gray-600">Simples, transparente e sem surpresas</p>
          </div>

          {/* Day in Life Video */}
          {mounted && (
            <div className="max-w-4xl mx-auto mb-12">
              <HeyGenVideo
                videoId="advogado_day_in_life"
                title="Um Dia na Vida de um Advogado"
                autoplay={true}
                muted={true}
                loop={true}
                className="rounded-2xl shadow-2xl shadow-green-500/30"
                width="100%"
                height={500}
                abTestVariant="advogado_day_in_life_video"
              />
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-green-500">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mb-4">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Crie seu Perfil</h3>
              <p className="text-gray-600">
                Cadastro em 5 minutos. Adicione suas especialidades, experiência, 
                estados onde atua e foto profissional.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-green-500">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mb-4">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Receba Leads</h3>
              <p className="text-gray-600">
                Nossa IA faz o match entre seu perfil e clientes que precisam 
                exatamente da sua expertise. Você recebe notificação instantânea.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-green-500">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mb-4">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Feche Casos</h3>
              <p className="text-gray-600">
                Converse pelo chat ou WhatsApp, faça a consulta inicial e 
                converta em cliente. Simples assim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advogados que <span className="text-green-600">Cresceram</span> Conosco
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {showVideoTestimonials ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                <div className="mb-6">
                  <HeyGenVideo
                    videoId={lawyerTestimonials[currentTestimonial].videoId}
                    title={`Depoimento - ${lawyerTestimonials[currentTestimonial].name}`}
                    autoplay={false}
                    muted={false}
                    loop={false}
                    className="rounded-xl"
                    width="100%"
                    height={400}
                    abTestVariant="advogado_testimonial_video"
                  />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{lawyerTestimonials[currentTestimonial].name}</p>
                    <p className="text-sm text-gray-500">
                      {lawyerTestimonials[currentTestimonial].specialty} • {lawyerTestimonials[currentTestimonial].location}
                    </p>
                  </div>
                  <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold">
                    {lawyerTestimonials[currentTestimonial].metric}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                <div className="flex items-start gap-6">
                  <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {lawyerTestimonials[currentTestimonial].photo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-lg text-gray-700 mb-4 italic">
                      "{lawyerTestimonials[currentTestimonial].text}"
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-bold text-gray-900">{lawyerTestimonials[currentTestimonial].name}</p>
                        <p className="text-sm text-gray-500">
                          {lawyerTestimonials[currentTestimonial].specialty} • {lawyerTestimonials[currentTestimonial].location}
                        </p>
                      </div>
                      <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold">
                        {lawyerTestimonials[currentTestimonial].metric}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-2 mt-6">
              {lawyerTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? 'bg-green-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planos <span className="text-green-600">Transparentes</span>
            </h2>
            <p className="text-xl text-gray-600">Sem taxas escondidas. Cancele quando quiser.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`bg-white rounded-2xl p-8 ${
                  plan.highlight 
                    ? 'ring-2 ring-green-500 shadow-xl relative' 
                    : 'border border-gray-200 shadow-lg'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                    Mais Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cadastro?tipo=advogado"
                  className={`block text-center py-3 rounded-xl font-bold transition-all hover:scale-105 ${
                    plan.highlight
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Calcule seu ROI
          </h2>

          {/* ROI Explainer Video */}
          {mounted && (
            <div className="mb-8 max-w-2xl mx-auto">
              <HeyGenVideo
                videoId="advogado_roi_explainer"
                title="Como Funciona seu ROI"
                autoplay={false}
                muted={false}
                loop={false}
                className="rounded-xl"
                width="100%"
                height={300}
                abTestVariant="advogado_roi_explainer_video"
              />
            </div>
          )}

          <p className="text-xl text-green-100 mb-8">
            Se você fechar apenas 1 caso de imigração por mês ($3.000),
            seu ROI é de <strong className="text-yellow-300">1.400%</strong> no plano Professional.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
            <div className="space-y-4 text-left text-white">
              <div className="flex justify-between">
                <span>Investimento mensal:</span>
                <span className="font-bold">$199</span>
              </div>
              <div className="flex justify-between">
                <span>1 caso fechado:</span>
                <span className="font-bold text-green-300">+$3.000</span>
              </div>
              <div className="border-t border-white/20 pt-4 flex justify-between text-xl">
                <span>Lucro líquido:</span>
                <span className="font-bold text-yellow-300">+$2.801</span>
              </div>
            </div>
          </div>
          <Link
            href="/cadastro?tipo=advogado"
            className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 mt-8 shadow-lg"
          >
            Começar Agora - É Grátis
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Como os leads são qualificados?</h3>
              <p className="text-gray-600">
                Nossa IA analisa o caso do cliente, identifica a área jurídica e faz match apenas 
                com advogados que atuam naquela especialidade e estado. O cliente já chega sabendo 
                que você fala português.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">
                Sim! Sem multas, sem burocracia. Você pode fazer downgrade para o plano gratuito 
                ou cancelar completamente quando quiser.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Preciso verificar minha licença?</h3>
              <p className="text-gray-600">
                Sim, verificamos o Bar Number de todos os advogados. Isso garante confiança para 
                os clientes e destaque para você. Advogados verificados recebem 3x mais contatos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para Crescer sua Prática?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Junte-se a 150+ advogados brasileiros que já estão recebendo clientes qualificados.
          </p>
          <Link
            href="/cadastro?tipo=advogado"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
          >
            Criar Minha Conta Grátis →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <span className="text-2xl">⚖️</span>
              <span className="font-bold">Meu Advogado</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/cliente" className="hover:text-white">Para Clientes</Link>
              <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
              <Link href="/termos" className="hover:text-white">Termos</Link>
            </div>
            <p className="text-sm">© 2026 Meu Advogado</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
