'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface FormData {
  name: string
  phone: string
  email: string
  city: string
  state: string
  practiceArea: string
  description: string
  urgency: string
}

export default function CasoPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [caseId, setCaseId] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: session?.user?.name || '',
    phone: '',
    email: session?.user?.email || '',
    city: '',
    state: '',
    practiceArea: '',
    description: '',
    urgency: 'media',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    
    try {
      const res = await fetch('/api/caso/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar caso')
      }

      setCaseId(data.caseId)
      setEnviado(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar caso. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-lg text-center">
          <div className="text-8xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Caso Enviado com Sucesso!</h1>
          <p className="text-gray-600 mb-2">
            Nossa IA está analisando seu caso agora...
          </p>
          <p className="text-sm text-gray-500 mb-8">
            ID do caso: <span className="font-mono font-semibold">{caseId}</span>
          </p>
          <div className="space-y-3">
            {session ? (
              <Link 
                href="/cliente/dashboard"
                className="block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Ver Meu Dashboard
              </Link>
            ) : (
              <Link 
                href="/cadastro"
                className="block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Criar Conta para Acompanhar
              </Link>
            )}
            <Link 
              href="/advogados"
              className="block bg-gray-100 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-200 font-semibold"
            >
              Ver Advogados Disponíveis
            </Link>
          </div>
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seu Nome *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
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
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(305) 123-4567"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
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
                name="city"
                value={formData.city}
                onChange={handleInputChange}
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
                name="state"
                value={formData.state}
                onChange={handleInputChange}
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
              name="practiceArea"
              value={formData.practiceArea}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione a área...</option>
              <option value="Imigração">Imigração (Vistos, Green Card, Deportação)</option>
              <option value="Família">Família (Divórcio, Custódia, Pensão)</option>
              <option value="Criminal">Criminal (DUI, Prisão, Defesa)</option>
              <option value="Acidentes">Acidentes (Carro, Trabalho, Pessoal)</option>
              <option value="Trabalhista">Trabalhista (Demissão, Discriminação)</option>
              <option value="Empresarial">Empresarial (Abrir Empresa, Contratos)</option>
              <option value="Imobiliário">Imobiliário (Compra, Venda, Aluguel)</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descreva seu Caso *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Explique sua situação com o máximo de detalhes possível. Quanto mais informações, melhor poderemos ajudá-lo a encontrar o advogado certo."
              minLength={50}
            />
            <p className="text-sm text-gray-500 mt-1">Mínimo 50 caracteres ({formData.description.length}/50)</p>
          </div>

          {/* Urgência */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível de Urgência
            </label>
            <div className="flex gap-4">
              {[{label: 'Baixa', value: 'LOW'}, {label: 'Média', value: 'MEDIUM'}, {label: 'Alta', value: 'HIGH'}, {label: 'Urgente', value: 'URGENT'}].map(({label, value}) => (
                <label key={value} className="flex items-center">
                  <input
                    type="radio"
                    name="urgency"
                    value={value}
                    checked={formData.urgency === value}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
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
