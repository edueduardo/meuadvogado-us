'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function PlanosPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')

  const handleCheckout = async (plan: string) => {
    if (!session) {
      router.push('/login')
      return
    }

    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval }),
      })

      const data = await res.json()
      if (data.url) {
        toast.success('Redirecionando para o pagamento...')
        window.location.href = data.url
      } else {
        toast.error('Erro ao criar checkout. Tente novamente.')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      toast.error('Erro ao criar checkout. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      id: 'FREE',
      name: 'Gratuito',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Para começar',
      features: [
        'Perfil básico no diretório',
        'Recebe notificações de leads',
        'Precisa upgrade para ver leads',
        'Suporte por email',
      ],
      cta: 'Plano Atual',
      disabled: true,
      color: 'gray',
    },
    {
      id: 'PREMIUM',
      name: 'Premium',
      priceMonthly: 149,
      priceAnnual: 1428,
      description: 'Mais popular',
      popular: true,
      features: [
        '✨ Leads ILIMITADOS',
        '🎯 Perfil destacado na busca',
        '✅ Selo de verificado',
        '📊 Dashboard de analytics',
        '💬 Responder avaliações',
        '🚀 Suporte prioritário',
        '📈 Relatórios mensais',
      ],
      cta: 'Começar Premium',
      color: 'blue',
    },
    {
      id: 'FEATURED',
      name: 'Destaque',
      priceMonthly: 299,
      priceAnnual: 2868,
      description: 'Máxima visibilidade',
      features: [
        '👑 Tudo do Premium',
        '⭐ TOPO dos resultados',
        '🎖️ Badge de destaque',
        '🏠 Showcase na homepage',
        '📱 Promoção em redes sociais',
        '👤 Gerente de conta dedicado',
        '🔥 Prioridade máxima nos leads',
        '📞 Suporte 24/7',
      ],
      cta: 'Começar Destaque',
      color: 'purple',
    },
  ]

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.priceMonthly === 0) return 'Grátis'
    const price = interval === 'monthly' ? plan.priceMonthly : Math.round(plan.priceAnnual / 12)
    return `$${price}`
  }

  const getSavings = (plan: typeof plans[0]) => {
    if (interval === 'annual' && plan.priceAnnual > 0) {
      const monthlyCost = plan.priceMonthly * 12
      const savings = monthlyCost - plan.priceAnnual
      return `Economize $${savings}/ano`
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LegalAI Pro
            </Link>
            <Link href="/advogado/dashboard" className="text-gray-600 hover:text-indigo-600 transition">
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Expanda sua prática jurídica com leads qualificados de brasileiros nos EUA
          </p>

          {/* Toggle Interval */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                interval === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setInterval('annual')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                interval === 'annual'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                plan.popular ? 'ring-4 ring-indigo-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  MAIS POPULAR
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">{getPrice(plan)}</span>
                    {plan.priceMonthly > 0 && (
                      <span className="text-gray-600 ml-2">/mês</span>
                    )}
                  </div>
                  {getSavings(plan) && (
                    <p className="text-green-600 text-sm font-medium mt-2">{getSavings(plan)}</p>
                  )}
                </div>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={plan.disabled || loading === plan.id}
                  className={`w-full py-3 rounded-lg font-bold transition mb-6 ${
                    plan.color === 'blue'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                      : plan.color === 'purple'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading === plan.id ? 'Processando...' : plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Perguntas Frequentes
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Como funciona o pagamento?</h3>
              <p className="text-gray-600">
                Aceitamos cartões de crédito via Stripe. O pagamento é processado de forma segura e automática.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Quantos leads vou receber?</h3>
              <p className="text-gray-600">
                Depende da sua área e localização. Planos pagos têm acesso ilimitado a todos os leads qualificados.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Posso fazer upgrade depois?</h3>
              <p className="text-gray-600">
                Sim! Você pode fazer upgrade a qualquer momento e pagará apenas a diferença proporcional.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Ainda tem dúvidas? Entre em contato conosco
          </p>
          <a
            href="mailto:suporte@legalai.com"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            suporte@legalai.com
          </a>
        </div>
      </div>
    </div>
  )
}
