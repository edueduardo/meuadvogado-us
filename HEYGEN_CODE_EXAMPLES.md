# 💻 HeyGen Video Component - Exemplos de Código

## 1️⃣ IMPORT BÁSICO

```typescript
// No topo do seu arquivo de página (client component)
'use client'

import HeyGenVideo from '@/components/HeyGenVideo'
```

---

## 2️⃣ EXEMPLO 1: HOMEPAGE - HERO VIDEO

### Código Completo para app/page.tsx

```typescript
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import LegalCopilot from '@/components/LegalCopilot'
import HeyGenVideo from '@/components/HeyGenVideo'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* ... header code ... */}

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white/90 text-sm mb-8">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>🇧🇷 +500 brasileiros ajudados este mês</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-6 max-w-4xl leading-tight">
          Conectando <span className="text-blue-400">Brasileiros</span> e{' '}
          <span className="text-green-400">Advogados</span> nos EUA
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-blue-100/80 text-center mb-12 max-w-2xl">
          A plataforma que resolve problemas jurídicos em português
        </p>

        {/* 🎥 HERO VIDEO - ADICIONE AQUI */}
        {mounted && (
          <div className="w-full max-w-3xl mb-12">
            <HeyGenVideo
              videoId="homepage_hero_testimonial"
              title="Cliente Real - Resultado Real"
              autoplay={true}
              muted={true}
              loop={true}
              className="rounded-2xl shadow-2xl shadow-blue-500/30"
              width="100%"
              height={400}
              abTestVariant="homepage_hero_video"
            />
          </div>
        )}

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Cliente Card */}
          <Link href="/cliente" className="group bg-gradient-to-br from-blue-600/90 to-blue-800/90 backdrop-blur-md rounded-3xl p-8 border border-blue-400/30 hover:border-blue-400/60 transition-all">
            <div className="text-6xl mb-6">🆘</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Preciso de um Advogado
            </h2>
            <p className="text-blue-100/80 mb-6">
              Está com problema jurídico nos EUA? Encontre um advogado brasileiro que fala sua língua.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Encontrar Advogado →</span>
            </div>
          </Link>

          {/* Advogado Card */}
          <Link href="/advogado" className="group bg-gradient-to-br from-green-600/90 to-emerald-800/90 backdrop-blur-md rounded-3xl p-8 border border-green-400/30">
            <div className="text-6xl mb-6">⚖️</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Sou Advogado
            </h2>
            <p className="text-green-100/80 mb-6">
              Advogado brasileiro nos EUA? Receba clientes qualificados que falam português.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Receber Clientes →</span>
            </div>
          </Link>
        </div>

        {/* Como Funciona Section with Video */}
        <section className="mt-20 w-full max-w-5xl">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
              Como Funciona? É Bem Simples
            </h2>

            {/* 3-Step Visual */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-white mb-2">Passo 1</h3>
                <p className="text-blue-100/70">Conte seu caso</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-white mb-2">Passo 2</h3>
                <p className="text-blue-100/70">IA encontra advogado</p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-white mb-2">Passo 3</h3>
                <p className="text-blue-100/70">Conversa via chat</p>
              </div>
            </div>

            {/* 🎥 EXPLAINER VIDEO - ADICIONE AQUI */}
            {mounted && (
              <div className="mb-8">
                <HeyGenVideo
                  videoId="homepage_explainer_process"
                  title="Como Funciona em 30 segundos"
                  autoplay={false}
                  muted={false}
                  loop={false}
                  className="rounded-2xl shadow-xl shadow-blue-500/20"
                  width="100%"
                  height={400}
                  abTestVariant="homepage_explainer_video"
                />
              </div>
            )}

            {/* CTA */}
            <div className="text-center">
              <Link
                href="/cliente"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all hover:shadow-lg"
              >
                Começar Agora - É Grátis
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white">150+</div>
            <div className="text-blue-200/60 text-sm">Advogados</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white">$2.4M+</div>
            <div className="text-blue-200/60 text-sm">Recuperados</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold text-white">98%</div>
            <div className="text-blue-200/60 text-sm">Satisfação</div>
          </div>
        </div>
      </main>

      <LegalCopilot />
    </div>
  )
}
```

---

## 3️⃣ EXEMPLO 2: CLIENTE PAGE - ROTATING TESTIMONIALS

### Código para app/cliente/page.tsx

```typescript
'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import HeyGenVideo from '@/components/HeyGenVideo'

// Video testimonials mapping
const videoTestimonials = [
  { id: 'cliente_depoimento_maria_santos', name: 'Maria Santos' },
  { id: 'cliente_depoimento_joao_silva', name: 'João Silva' },
  { id: 'cliente_depoimento_ana_oliveira', name: 'Ana Oliveira' },
  { id: 'cliente_depoimento_carlos_mendes', name: 'Carlos Mendes' },
]

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

export default function ClientePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [showVideoTestimonials, setShowVideoTestimonials] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Auto rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ... hero section ... */}

      {/* TESTIMONIALS SECTION WITH VIDEOS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Histórias <span className="text-green-600">Reais</span> de Sucesso
            </h2>
            <p className="text-xl text-gray-600">Brasileiros que resolveram seus problemas com nossa ajuda</p>
          </div>

          <div className="max-w-4xl mx-auto mb-10">
            {/* 🎥 TESTIMONIAL VIDEO - ADICIONE AQUI */}
            {showVideoTestimonials && mounted ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 transition-all">
                <div className="mb-6">
                  <HeyGenVideo
                    videoId={videoTestimonials[currentTestimonial].id}
                    title={`Depoimento - ${testimonials[currentTestimonial].name}`}
                    autoplay={false}
                    muted={false}
                    loop={false}
                    className="rounded-xl"
                    width="100%"
                    height={400}
                    abTestVariant="cliente_testimonial_video"
                  />
                </div>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{testimonials[currentTestimonial].name}</p>
                    <p className="text-sm text-gray-500">{testimonials[currentTestimonial].location}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                      ✓ {testimonials[currentTestimonial].case}
                    </span>
                    <p className="text-sm text-green-600 font-bold mt-1">{testimonials[currentTestimonial].result}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* FALLBACK: Text testimonials */
              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500">
                <div className="flex items-start gap-6">
                  <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {testimonials[currentTestimonial].photo}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-lg text-gray-700 mb-4 italic">
                      "{testimonials[currentTestimonial].text}"
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-bold text-gray-900">{testimonials[currentTestimonial].name}</p>
                        <p className="text-sm text-gray-500">{testimonials[currentTestimonial].location}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                          ✓ {testimonials[currentTestimonial].case}
                        </span>
                        <p className="text-sm text-green-600 font-bold mt-1">{testimonials[currentTestimonial].result}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ... rest of page ... */}
    </div>
  )
}
```

---

## 4️⃣ EXEMPLO 3: ADVOGADO PAGE - DAY IN LIFE + ROI VIDEO

### Código para app/advogado/page.tsx

```typescript
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import HeyGenVideo from '@/components/HeyGenVideo'

export default function AdvogadoPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showVideoTestimonials, setShowVideoTestimonials] = useState(true)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const lawyerTestimonials = [
    {
      id: 1,
      name: "Dr. Ricardo Almeida",
      specialty: "Imigração",
      location: "Miami, FL",
      photo: "RA",
      videoId: "advogado_depoimento_ricardo_almeida",
      metric: "+$85.000 em honorários"
    },
    {
      id: 2,
      name: "Dra. Fernanda Costa",
      specialty: "Acidentes",
      location: "Newark, NJ",
      photo: "FC",
      videoId: "advogado_depoimento_fernanda_costa",
      metric: "ROI de 1.200%"
    },
    {
      id: 3,
      name: "Dr. Marcos Silva",
      specialty: "Criminal",
      location: "Boston, MA",
      photo: "MS",
      videoId: "advogado_depoimento_marcos_silva",
      metric: "8 casos/mês"
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ... hero section ... */}

      {/* COMO FUNCIONA - COM DAY IN LIFE VIDEO */}
      <section className="py-16 bg-gray-50" id="como-funciona">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona para <span className="text-green-600">Advogados</span>
            </h2>
            <p className="text-xl text-gray-600">Simples, transparente e sem surpresas</p>
          </div>

          {/* 🎥 DAY IN LIFE VIDEO - ADICIONE AQUI */}
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
              <p className="text-gray-600">Cadastro em 5 minutos. Adicione suas especialidades e experiência.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-green-500">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mb-4">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Receba Leads</h3>
              <p className="text-gray-600">Nossa IA faz o match entre seu perfil e clientes qualificados.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-green-500">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl mb-4">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Feche Casos</h3>
              <p className="text-gray-600">Converse pelo chat ou WhatsApp e converta em cliente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LAWYER TESTIMONIALS */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advogados que <span className="text-green-600">Cresceram</span> Conosco
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* 🎥 LAWYER TESTIMONIAL VIDEO - ADICIONE AQUI */}
            {showVideoTestimonials && mounted ? (
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
              /* FALLBACK: Text testimonials */
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
                      "Lorem ipsum dolor sit amet..."
                    </p>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-bold text-gray-900">{lawyerTestimonials[currentTestimonial].name}</p>
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
                    index === currentTestimonial
                      ? 'bg-green-600 w-6'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR SECTION */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Calcule seu ROI
          </h2>

          {/* 🎥 ROI EXPLAINER VIDEO - ADICIONE AQUI */}
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

      {/* ... rest of page ... */}
    </div>
  )
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Copiar código de exemplo
- [ ] Importar `HeyGenVideo` component
- [ ] Adicionar `import HeyGenVideo from '@/components/HeyGenVideo'`
- [ ] Adicionar `'use client'` no topo da página
- [ ] Adicionar `const [mounted, setMounted] = useState(false)`
- [ ] Usar `{mounted && <HeyGenVideo ... />}`
- [ ] Testar responsividade (mobile/tablet/desktop)
- [ ] Testar A/B test variant tracking
- [ ] Confirmar Mixpanel events sendo enviados
- [ ] Fazer deploy

---

## 🔧 DEBUGGING

### Videos não carregam?
```typescript
// Verifique se videoId está correto
console.log('Video ID:', videoId)

// Verifique se HeyGen embed URL é acessível
// https://app.heygen.com/embed/{videoId}
```

### A/B test não funciona?
```typescript
// Confirme abTestVariant está passado
<HeyGenVideo
  {...props}
  abTestVariant="treatment" // Must be 'control', 'treatment', or 'treatment2'
/>

// Verifique Mixpanel está carregado
console.log('Mixpanel:', (window as any).mixpanel)
```

### Mixpanel não rastreia?
```typescript
// Verifique token está no env
echo $NEXT_PUBLIC_MIXPANEL_TOKEN

// Verifique Mixpanel script está no _document.tsx
```
