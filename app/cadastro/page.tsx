'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserType = 'CLIENT' | 'LAWYER'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  city: string
  state: string
  userType: UserType
  // Lawyer specific
  barNumber?: string
  practiceAreas?: string[]
  languages?: string[]
  bio?: string
}

export default function CadastroPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<UserType>('CLIENT')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    state: '',
    userType: 'CLIENT',
    practiceAreas: [],
    languages: ['Português'],
    bio: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (field: 'practiceAreas' | 'languages', value: string) => {
    setFormData(prev => {
      const current = prev[field] || []
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    if (userType === 'LAWYER') {
      setStep(2)
    } else {
      handleFinalSubmit()
    }
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        role: userType,
        ...(userType === 'LAWYER' && {
          barNumber: formData.barNumber,
          practiceAreas: formData.practiceAreas,
          languages: formData.languages,
          bio: formData.bio,
        }),
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar conta')
      }

      // Se requer verificação de email, mostrar mensagem
      if (data.requiresEmailVerification) {
        setUserEmail(formData.email)
        setShowEmailVerification(true)
        return
      }

      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Mostrar tela de verificação de email
  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-blue-600">
              Meu Advogado
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✉️ Confirme seu email</h2>
            
            <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Enviamos um link de verificação para:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-blue-600">{userEmail}</p>
              </div>
              <p className="text-gray-600">
                Clique no link no seu email para ativar sua conta.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Verifique também sua pasta de spam ou lixo eletrônico.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Não recebeu o email?
              </p>
              <Link 
                href="/resend-verification"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Reenviar Email de Verificação
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Email incorreto?{' '}
                <button 
                  onClick={() => {
                    setShowEmailVerification(false)
                    setError('')
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Voltar e corrigir
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            Meu Advogado
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Criar Conta</h1>
          <p className="text-gray-600 mt-2">
            {step === 1 ? 'Escolha o tipo de conta e preencha seus dados' : 'Complete seu perfil profissional'}
          </p>
        </div>

        {/* User Type Selection */}
        {step === 1 && (
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setUserType('CLIENT')}
              className={`flex-1 p-6 rounded-lg border-2 transition ${
                userType === 'CLIENT'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">👤</div>
              <div className="font-semibold text-gray-900">Sou Cliente</div>
              <div className="text-sm text-gray-600 mt-1">Preciso de um advogado</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('LAWYER')}
              className={`flex-1 p-6 rounded-lg border-2 transition ${
                userType === 'LAWYER'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">⚖️</div>
              <div className="font-semibold text-gray-900">Sou Advogado</div>
              <div className="text-sm text-gray-600 mt-1">Quero receber clientes</div>
            </button>
          </div>
        )}

        {/* Progress for Lawyers */}
        {userType === 'LAWYER' && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className={`w-20 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={step === 1 ? handleStep1Submit : (e) => { e.preventDefault(); handleFinalSubmit(); }} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={userType === 'LAWYER' ? 'Dr. João Silva' : 'João Silva'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="joao@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="(305) 123-4567"
                />
              </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="FL">Florida</option>
                    <option value="MA">Massachusetts</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NY">New York</option>
                    <option value="CA">California</option>
                    <option value="TX">Texas</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-gray-900">Informações Profissionais</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número da OAB / Bar Number *
                </label>
                <input
                  type="text"
                  name="barNumber"
                  value={formData.barNumber || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Áreas de Atuação *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Imigração', 'Família', 'Criminal', 'Acidentes', 'Trabalhista', 'Empresarial', 'Imobiliário', 'Outros'].map((area) => (
                    <label key={area} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.practiceAreas?.includes(area)}
                        onChange={() => handleCheckboxChange('practiceAreas', area)}
                        className="mr-3"
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Idiomas
                </label>
                <div className="flex gap-4">
                  {['Português', 'English', 'Español'].map((idioma) => (
                    <label key={idioma} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.languages?.includes(idioma)}
                        onChange={() => handleCheckboxChange('languages', idioma)}
                        className="mr-2"
                      />
                      <span>{idioma}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografia / Sobre Você
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Conte sobre sua experiência, especialidades e como você pode ajudar clientes brasileiros..."
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input type="checkbox" required className="mr-2" />
                  <span className="text-sm text-gray-600">
                    Li e aceito os <a href="#" className="text-blue-600">Termos de Uso</a> e <a href="#" className="text-blue-600">Política de Privacidade</a>
                  </span>
                </label>
              </div>
            </>
          )}

          <div className="flex gap-4">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                ← Voltar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : step === 1 ? (userType === 'LAWYER' ? 'Próximo →' : 'Criar Conta') : 'Criar Conta'}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
