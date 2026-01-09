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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">⚖️</span>
            <span>Meu Advogado</span>
          </div>
          <Link 
            href="/login" 
            className="text-white/80 hover:text-white transition-colors text-sm"
          >
            Já tenho conta →
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Trust Badge */}
        <div className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-8 border border-white/20 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>🇧🇷 +500 brasileiros ajudados este mês</span>
        </div>

        {/* Main Headline */}
        <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center mb-6 max-w-4xl leading-tight transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Conectando <span className="text-blue-400">Brasileiros</span> e{' '}
          <span className="text-green-400">Advogados</span> nos EUA
        </h1>

        {/* Subheadline */}
        <p className={`text-xl md:text-2xl text-blue-100/80 text-center mb-12 max-w-2xl transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          A plataforma que resolve problemas jurídicos em português
        </p>

        {/* Hero Video - Client Testimonial */}
        {mounted && (
          <div className={`w-full max-w-3xl mb-12 transition-all duration-700 delay-250 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
        <div className={`grid md:grid-cols-2 gap-6 max-w-4xl w-full transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          
          {/* Card Cliente */}
          <Link 
            href="/cliente"
            className="group relative bg-gradient-to-br from-blue-600/90 to-blue-800/90 backdrop-blur-md rounded-3xl p-8 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
          >
            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              Para Clientes
            </div>
            
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
              🆘
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Preciso de um Advogado
            </h2>
            
            <p className="text-blue-100/80 mb-6">
              Está com problema jurídico nos EUA? Imigração, acidente, família, criminal? 
              Encontre um advogado brasileiro que fala sua língua.
            </p>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-blue-100/90 text-sm">
                <span className="text-green-400">✓</span> Consulta gratuita
              </li>
              <li className="flex items-center gap-2 text-blue-100/90 text-sm">
                <span className="text-green-400">✓</span> Resposta em 24h
              </li>
              <li className="flex items-center gap-2 text-blue-100/90 text-sm">
                <span className="text-green-400">✓</span> 100% em português
              </li>
            </ul>
            
            <div className="flex items-center justify-between">
              <span className="text-white font-bold group-hover:translate-x-2 transition-transform duration-300">
                Encontrar Advogado →
              </span>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-2xl">🔍</span>
              </div>
            </div>
          </Link>

          {/* Card Advogado */}
          <Link 
            href="/advogado"
            className="group relative bg-gradient-to-br from-green-600/90 to-emerald-800/90 backdrop-blur-md rounded-3xl p-8 border border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20"
          >
            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              Para Advogados
            </div>
            
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
              ⚖️
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Sou Advogado
            </h2>
            
            <p className="text-green-100/80 mb-6">
              Advogado brasileiro nos EUA? Receba clientes qualificados que falam português 
              e precisam da sua expertise.
            </p>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-green-100/90 text-sm">
                <span className="text-yellow-400">✓</span> +50 leads/mês
              </li>
              <li className="flex items-center gap-2 text-green-100/90 text-sm">
                <span className="text-yellow-400">✓</span> Clientes pré-qualificados
              </li>
              <li className="flex items-center gap-2 text-green-100/90 text-sm">
                <span className="text-yellow-400">✓</span> Comece grátis
              </li>
            </ul>
            
            <div className="flex items-center justify-between">
              <span className="text-white font-bold group-hover:translate-x-2 transition-transform duration-300">
                Receber Clientes →
              </span>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-2xl">💼</span>
              </div>
            </div>
          </Link>
        </div>

        {/* "Como Funciona" Section with Explainer Video */}
        <section className={`mt-20 w-full max-w-5xl transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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

            {/* Explainer Video */}
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
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/50"
              >
                Começar Agora - É Grátis
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Links - Quiz & Guide */}
        <div className="mt-12 flex flex-col md:flex-row gap-6 justify-center flex-wrap">
          <Link
            href="/quiz"
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            🔮 Qual minha chance de sucesso?
          </Link>

          <Link
            href="/cliente/guia"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/50"
          >
            📘 Guia Completo para Clientes
          </Link>
        </div>

        {/* Features Status Badge */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/all-features-active"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/30 border border-green-400/30 text-center justify-center"
          >
            <span className="text-xl">🎉</span>
            <span>Ver 12 Features Ativadas (Todas Funcionando!)</span>
            <span>→</span>
          </Link>

          <Link
            href="/features-status"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-blue-500/30 border border-blue-400/30 text-center justify-center"
          >
            <span className="text-xl">📋</span>
            <span>Status Detalhado das Features</span>
            <span>→</span>
          </Link>
        </div>

        {/* Stats */}
        <div className={`mt-16 grid grid-cols-3 gap-8 text-center transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-white/40 text-sm">
          © 2026 Meu Advogado. Todos os direitos reservados.
        </p>
      </footer>

      {/* Legal Copilot - 24/7 Assistant */}
      <LegalCopilot />
    </div>
  )
}
