'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { US_STATE_BARS } from '@/lib/verification/bar-verification'

const steps = [
  { id: 1, title: 'Dados Pessoais', icon: '👤' },
  { id: 2, title: 'Licença USA', icon: '🇺🇸' },
  { id: 3, title: 'Especialidades', icon: '⚖️' },
  { id: 4, title: 'Perfil', icon: '📝' },
  { id: 5, title: 'Plano', icon: '💳' },
]

const practiceAreas = [
  { id: 'immigration', name: 'Imigração', icon: '🛂' },
  { id: 'personal-injury', name: 'Acidentes Pessoais', icon: '🚗' },
  { id: 'family', name: 'Direito de Família', icon: '👨‍👩‍👧' },
  { id: 'criminal', name: 'Criminal', icon: '⚖️' },
  { id: 'business', name: 'Empresarial', icon: '🏢' },
  { id: 'real-estate', name: 'Imobiliário', icon: '🏠' },
  { id: 'employment', name: 'Trabalhista', icon: '💼' },
  { id: 'bankruptcy', name: 'Falência', icon: '📉' },
]

export default function OnboardingAdvogadoPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Dados Pessoais
    name: '',
    email: '',
    phone: '',
    
    // Step 2: Licença USA (obrigatória)
    barState: '',
    barNumber: '',
    admissionYear: '',
    // Licença internacional (opcional)
    hasInternationalLicense: false,
    internationalCountry: 'Brazil',
    internationalOrg: 'OAB',
    internationalNumber: '',
    internationalState: '',
    
    // Step 3: Especialidades
    selectedAreas: [] as string[],
    statesOfPractice: [] as string[],
    
    // Step 4: Perfil
    headline: '',
    bio: '',
    yearsExperience: '',
    languages: ['Portuguese', 'English'],
    
    // Step 5: Plano
    selectedPlan: 'STARTER',
  })

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArea = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAreas: prev.selectedAreas.includes(areaId)
        ? prev.selectedAreas.filter(a => a !== areaId)
        : [...prev.selectedAreas, areaId]
    }))
  }

  const toggleState = (state: string) => {
    setFormData(prev => ({
      ...prev,
      statesOfPractice: prev.statesOfPractice.includes(state)
        ? prev.statesOfPractice.filter(s => s !== state)
        : [...prev.statesOfPractice, state]
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Aqui faria a chamada de API para salvar
      console.log('Form data:', formData)
      
      // Redirecionar para dashboard
      router.push('/advogado/dashboard?welcome=true')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
            ⚖️ Meu Advogado
          </Link>
          <span className="text-white/60 text-sm">Cadastro de Advogado</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                  currentStep >= step.id 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {currentStep > step.id ? '✓' : step.icon}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 md:w-24 h-1 mx-2 rounded ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
          {steps[currentStep - 1].title}
        </h1>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          
          {/* Step 1: Dados Pessoais */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Dr(a). Nome Sobrenome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email profissional</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (WhatsApp)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          )}

          {/* Step 2: Licença USA */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>🇺🇸 Licença americana é obrigatória.</strong> Para atuar nos EUA, você deve ter Bar Number de pelo menos um estado.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado do Bar *</label>
                  <select
                    value={formData.barState}
                    onChange={(e) => updateForm('barState', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecione o estado</option>
                    {Object.entries(US_STATE_BARS).map(([abbr, state]) => (
                      <option key={abbr} value={abbr}>{state.name} ({abbr})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bar Number *</label>
                  <input
                    type="text"
                    value={formData.barNumber}
                    onChange={(e) => updateForm('barNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano de admissão</label>
                <input
                  type="number"
                  value={formData.admissionYear}
                  onChange={(e) => updateForm('admissionYear', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="2015"
                  min="1950"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="border-t pt-6 mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasInternationalLicense}
                    onChange={(e) => updateForm('hasInternationalLicense', e.target.checked)}
                    className="w-5 h-5 text-green-500 rounded"
                  />
                  <span className="text-gray-700">Também sou licenciado em outro país (opcional)</span>
                </label>

                {formData.hasInternationalLicense && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-800 text-sm mb-4">
                      ⚠️ <strong>Aviso:</strong> Licenças internacionais são apenas informativas. 
                      O Meu Advogado NÃO verifica licenças de outros países.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                        <select
                          value={formData.internationalCountry}
                          onChange={(e) => updateForm('internationalCountry', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        >
                          <option value="Brazil">Brasil</option>
                          <option value="Portugal">Portugal</option>
                          <option value="Other">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Organização</label>
                        <input
                          type="text"
                          value={formData.internationalOrg}
                          onChange={(e) => updateForm('internationalOrg', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                          placeholder="OAB"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número/Registro</label>
                        <input
                          type="text"
                          value={formData.internationalNumber}
                          onChange={(e) => updateForm('internationalNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                          placeholder="123456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado/Seção</label>
                        <input
                          type="text"
                          value={formData.internationalState}
                          onChange={(e) => updateForm('internationalState', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                          placeholder="SP, RJ..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Especialidades */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Áreas de atuação (selecione todas que se aplicam)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {practiceAreas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => toggleArea(area.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.selectedAreas.includes(area.id)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{area.icon}</span>
                      <span className="text-sm font-medium">{area.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Estados onde atua</label>
                <div className="flex flex-wrap gap-2">
                  {['FL', 'NY', 'CA', 'TX', 'NJ', 'MA', 'IL', 'GA', 'PA', 'NC'].map((state) => (
                    <button
                      key={state}
                      onClick={() => toggleState(state)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.statesOfPractice.includes(state)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">Para leis federais (imigração, tributário), você pode atuar em todo o país.</p>
              </div>
            </div>
          )}

          {/* Step 4: Perfil */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Headline profissional</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => updateForm('headline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Advogado de Imigração | 15+ anos de experiência | Green Cards & Vistos"
                />
                <p className="text-sm text-gray-500 mt-1">Uma frase que resume sua experiência</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sobre você</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="Conte sua história, experiência e como você ajuda clientes brasileiros..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Anos de experiência</label>
                <input
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => updateForm('yearsExperience', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                  placeholder="10"
                  min="0"
                  max="60"
                />
              </div>
            </div>
          )}

          {/* Step 5: Plano */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: 'STARTER', name: 'Starter', price: 'Grátis', features: ['3 leads/mês', 'Perfil básico'] },
                  { id: 'PROFESSIONAL', name: 'Professional', price: '$199/mês', features: ['Leads ilimitados', 'Perfil destacado', 'Badge verificado'], popular: true },
                  { id: 'ENTERPRISE', name: 'Enterprise', price: '$499/mês', features: ['Tudo do Pro', 'Primeiro nos resultados', 'Account manager'] },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => updateForm('selectedPlan', plan.id)}
                    className={`p-6 rounded-xl border-2 text-left transition-all relative ${
                      formData.selectedPlan === plan.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-2xl font-bold text-green-600 my-2">{plan.price}</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.features.map((f, i) => (
                        <li key={i}>✓ {f}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
              
              <p className="text-center text-gray-500 text-sm">
                Você pode fazer upgrade a qualquer momento. Sem compromisso.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
              >
                ← Voltar
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all hover:scale-105"
              >
                Continuar →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Criar minha conta'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
