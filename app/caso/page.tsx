'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CasoPage() {
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEnviando(true)
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setEnviando(false)
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Caso Enviado!</h1>
          <p className="text-gray-600 mb-6">
            Recebemos seu caso. Em breve você receberá recomendações de advogados 
            especializados no seu tipo de problema.
          </p>
          <Link 
            href="/advogados"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Ver Advogados Disponíveis
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Link href="/caso" className="text-blue-600 font-medium">
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
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Conte seu Caso</h1>
          <p className="text-gray-600">
            Descreva sua situação e encontraremos os melhores advogados para ajudá-lo.
            É grátis e confidencial.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu Nome *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite seu nome completo"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp / Telefone *
            </label>
            <input
              type="tel"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          {/* Localização */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cidade *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Miami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione...</option>
                <option value="FL">Florida</option>
                <option value="MA">Massachusetts</option>
                <option value="NJ">New Jersey</option>
                <option value="NY">New York</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="GA">Georgia</option>
                <option value="IL">Illinois</option>
              </select>
            </div>
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Problema *
            </label>
            <select
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione a área...</option>
              <option value="imigracao">Imigração (Vistos, Green Card, Deportação)</option>
              <option value="familia">Família (Divórcio, Custódia, Pensão)</option>
              <option value="criminal">Criminal (DUI, Prisão, Defesa)</option>
              <option value="acidentes">Acidentes (Carro, Trabalho, Pessoal)</option>
              <option value="trabalhista">Trabalhista (Demissão, Discriminação)</option>
              <option value="empresarial">Empresarial (Abrir Empresa, Contratos)</option>
              <option value="imobiliario">Imobiliário (Compra, Venda, Aluguel)</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descreva seu Caso *
            </label>
            <textarea
              required
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explique sua situação com o máximo de detalhes possível. Quanto mais informações, melhor poderemos ajudá-lo a encontrar o advogado certo."
              minLength={50}
            />
            <p className="text-sm text-gray-500 mt-1">Mínimo 50 caracteres</p>
          </div>

          {/* Urgência */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível de Urgência
            </label>
            <div className="flex gap-4">
              {['Baixa', 'Média', 'Alta', 'Urgente'].map((nivel) => (
                <label key={nivel} className="flex items-center">
                  <input
                    type="radio"
                    name="urgencia"
                    value={nivel.toLowerCase()}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{nivel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? 'Enviando...' : '📝 Enviar Caso'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Suas informações são confidenciais e serão compartilhadas apenas com 
            advogados relevantes para o seu caso.
          </p>
        </form>
      </div>
    </div>
  )
}
