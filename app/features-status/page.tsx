'use client';

import { CheckCircle, AlertCircle, Lock, ExternalLink, Zap, Code } from 'lucide-react';

interface Feature {
  name: string;
  description: string;
  status: 'ready' | 'waiting-api-key' | 'partial';
  category: 'wow' | 'dashboard' | 'verification' | 'analytics';
  url?: string;
  apiKeyNeeded?: string;
  implementation?: string;
  testUrl?: string;
}

const FEATURES: Feature[] = [
  // 🎉 WOW Features
  {
    name: '🤖 AI Legal Copilot 24/7',
    description: 'Chatbot inteligente com Claude AI para perguntas jurídicas em tempo real',
    status: 'waiting-api-key',
    category: 'wow',
    apiKeyNeeded: 'ANTHROPIC_API_KEY',
    url: '/',
    implementation: 'components/LegalCopilot.tsx + lib/ai/legal-copilot.ts',
    testUrl: '/',
  },
  {
    name: '🔮 Quiz "Qual Minha Chance?"',
    description: 'Quiz interativo que calcula probabilidade de sucesso do caso',
    status: 'ready',
    category: 'wow',
    url: '/quiz',
    implementation: 'components/CaseSuccessQuiz.tsx + app/quiz/page.tsx',
    testUrl: '/quiz',
  },
  {
    name: '📍 Live Case Tracker',
    description: 'Rastreamento em tempo real do progresso do caso (estilo Uber)',
    status: 'ready',
    category: 'wow',
    url: '/cliente/dashboard',
    implementation: 'components/CaseTracker.tsx + useSocketChat hook',
    testUrl: '/cliente/dashboard',
  },

  // 📊 Dashboards
  {
    name: '🎛️ Admin Dashboard',
    description: 'Dashboard em tempo real com todas as métricas da plataforma',
    status: 'ready',
    category: 'dashboard',
    url: '/admin',
    implementation: 'app/admin/page.tsx + app/api/admin/stats/route.ts',
    testUrl: '/admin',
  },
  {
    name: '📊 Analytics Dashboard',
    description: 'Analytics em tempo real com trends, insights e previsões',
    status: 'partial',
    category: 'analytics',
    apiKeyNeeded: 'NEXT_PUBLIC_MIXPANEL_TOKEN (opcional)',
    url: '/analytics/dashboard',
    implementation: 'app/analytics/dashboard/page.tsx + app/api/analytics/dashboard/route.ts',
    testUrl: '/analytics/dashboard',
  },

  // ✅ Verification
  {
    name: '✅ State Bar Verification',
    description: 'Verificação de licenças BAR para todos os 50 estados + enhanced lookups para NY/CA/FL/TX',
    status: 'ready',
    category: 'verification',
    url: '/api/lawyers/verify-enhanced',
    implementation: 'lib/verification/state-bar-lookup.ts + app/api/lawyers/verify-enhanced/route.ts',
    testUrl: '/api/lawyers/verify-enhanced?state=CA',
  },

  // 🎓 Educational
  {
    name: '🎓 Lawyer Academy',
    description: 'Plataforma de educação com 4 video scripts prontos para HeyGen',
    status: 'ready',
    category: 'wow',
    url: '/advogado/academy',
    implementation: 'app/advogado/academy/page.tsx',
    testUrl: '/advogado/academy',
  },
  {
    name: '📘 Client Guide',
    description: 'Guia educacional para clientes com 4 video scripts prontos para HeyGen',
    status: 'ready',
    category: 'wow',
    url: '/cliente/guia',
    implementation: 'app/cliente/guia/page.tsx',
    testUrl: '/cliente/guia',
  },

  // 💳 Payment
  {
    name: '💳 Stripe Payments',
    description: 'Sistema completo de pagamentos e assinaturas (Professional/Enterprise)',
    status: 'waiting-api-key',
    category: 'dashboard',
    apiKeyNeeded: 'STRIPE_SECRET_KEY',
    implementation: 'lib/stripe/stripe-service.ts + app/api/stripe/* endpoints',
  },

  // 📧 Email
  {
    name: '📧 Email Templates',
    description: 'Sistema de email com templates para welcome, case updates, payments',
    status: 'waiting-api-key',
    category: 'dashboard',
    apiKeyNeeded: 'RESEND_API_KEY',
    implementation: 'lib/email/templates/* + lib/email/email-service.ts',
  },

  // 🤖 AI Matching
  {
    name: '🤖 AI Lawyer Matching',
    description: 'Matching inteligente entre clientes e advogados usando Claude',
    status: 'waiting-api-key',
    category: 'wow',
    apiKeyNeeded: 'ANTHROPIC_API_KEY',
    implementation: 'lib/ai/claude-service.ts + app/api/ai/match/route.ts',
  },
];

const StatusIcon = ({ status }: { status: 'ready' | 'waiting-api-key' | 'partial' }) => {
  switch (status) {
    case 'ready':
      return <CheckCircle className="text-green-400" size={24} />;
    case 'partial':
      return <AlertCircle className="text-yellow-400" size={24} />;
    case 'waiting-api-key':
      return <Lock className="text-red-400" size={24} />;
  }
};

const StatusBadge = ({ status }: { status: 'ready' | 'waiting-api-key' | 'partial' }) => {
  switch (status) {
    case 'ready':
      return <span className="px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-xs font-semibold">✓ PRONTO</span>;
    case 'partial':
      return <span className="px-3 py-1 bg-yellow-900/50 text-yellow-300 rounded-full text-xs font-semibold">⚠️ PARCIAL</span>;
    case 'waiting-api-key':
      return <span className="px-3 py-1 bg-red-900/50 text-red-300 rounded-full text-xs font-semibold">🔑 AGUARDANDO API KEY</span>;
  }
};

const CategoryColor = (category: string) => {
  switch (category) {
    case 'wow':
      return 'from-purple-900 to-purple-800 border-purple-700';
    case 'dashboard':
      return 'from-blue-900 to-blue-800 border-blue-700';
    case 'analytics':
      return 'from-green-900 to-green-800 border-green-700';
    case 'verification':
      return 'from-indigo-900 to-indigo-800 border-indigo-700';
    default:
      return 'from-gray-900 to-gray-800 border-gray-700';
  }
};

export default function FeaturesStatus() {
  const ready = FEATURES.filter(f => f.status === 'ready').length;
  const partial = FEATURES.filter(f => f.status === 'partial').length;
  const waiting = FEATURES.filter(f => f.status === 'waiting-api-key').length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 p-8 border-b border-gray-700">
        <h1 className="text-4xl font-bold mb-2">🚀 Status das Features</h1>
        <p className="text-gray-300 mb-6">Veja exatamente o que está implementado e pronto para usar</p>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900/30 border border-green-700 p-4 rounded-lg">
            <p className="text-green-300 text-sm font-semibold mb-2">✓ PRONTO PARA USAR</p>
            <p className="text-3xl font-bold text-green-400">{ready}</p>
            <p className="text-xs text-gray-400 mt-2">Features sem dependências</p>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
            <p className="text-yellow-300 text-sm font-semibold mb-2">⚠️ PARCIALMENTE PRONTO</p>
            <p className="text-3xl font-bold text-yellow-400">{partial}</p>
            <p className="text-xs text-gray-400 mt-2">Funciona, mas melhor com API key</p>
          </div>

          <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg">
            <p className="text-red-300 text-sm font-semibold mb-2">🔑 AGUARDANDO API KEY</p>
            <p className="text-3xl font-bold text-red-400">{waiting}</p>
            <p className="text-xs text-gray-400 mt-2">Precisa de credenciais externas</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="p-8">
        <div className="space-y-6">
          {/* WOW Features */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="text-purple-400" size={28} />
              🎉 WOW Features (Diferenciadores)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES.filter(f => f.category === 'wow').map((feature) => (
                <div
                  key={feature.name}
                  className={`bg-gradient-to-br ${CategoryColor(feature.category)} border p-6 rounded-lg hover:shadow-lg transition`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <StatusIcon status={feature.status} />
                      <div>
                        <h3 className="font-bold text-lg">{feature.name}</h3>
                        <p className="text-sm text-gray-300 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <StatusBadge status={feature.status} />
                      {feature.status === 'waiting-api-key' && (
                        <span className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded">
                          Precisa: {feature.apiKeyNeeded}
                        </span>
                      )}
                    </div>

                    {feature.testUrl && (
                      <a
                        href={feature.testUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3"
                      >
                        <ExternalLink size={16} />
                        Testar agora →
                      </a>
                    )}

                    {feature.implementation && (
                      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
                        <Code size={12} className="inline mr-1" />
                        {feature.implementation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboards */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📊 Dashboards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES.filter(f => f.category === 'dashboard').map((feature) => (
                <div
                  key={feature.name}
                  className={`bg-gradient-to-br ${CategoryColor(feature.category)} border p-6 rounded-lg hover:shadow-lg transition`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <StatusIcon status={feature.status} />
                      <div>
                        <h3 className="font-bold text-lg">{feature.name}</h3>
                        <p className="text-sm text-gray-300 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <StatusBadge status={feature.status} />
                      {feature.apiKeyNeeded && (
                        <span className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded">
                          {feature.apiKeyNeeded}
                        </span>
                      )}
                    </div>

                    {feature.testUrl && (
                      <a
                        href={feature.testUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3"
                      >
                        <ExternalLink size={16} />
                        Acessar dashboard →
                      </a>
                    )}

                    {feature.implementation && (
                      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
                        <Code size={12} className="inline mr-1" />
                        {feature.implementation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📈 Analytics & Verification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES.filter(f => f.category === 'analytics' || f.category === 'verification').map((feature) => (
                <div
                  key={feature.name}
                  className={`bg-gradient-to-br ${CategoryColor(feature.category)} border p-6 rounded-lg hover:shadow-lg transition`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <StatusIcon status={feature.status} />
                      <div>
                        <h3 className="font-bold text-lg">{feature.name}</h3>
                        <p className="text-sm text-gray-300 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <StatusBadge status={feature.status} />
                      {feature.apiKeyNeeded && (
                        <span className="text-xs bg-yellow-900/50 text-yellow-200 px-2 py-1 rounded">
                          {feature.apiKeyNeeded}
                        </span>
                      )}
                    </div>

                    {feature.testUrl && (
                      <a
                        href={feature.testUrl}
                        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-3"
                      >
                        <ExternalLink size={16} />
                        Testar endpoint →
                      </a>
                    )}

                    {feature.implementation && (
                      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700">
                        <Code size={12} className="inline mr-1" />
                        {feature.implementation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* External Features */}
          <div>
            <h2 className="text-2xl font-bold mb-4">🔌 Integrações Externas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES.filter(f => f.status === 'waiting-api-key' && !['wow', 'dashboard', 'analytics', 'verification'].includes(f.category)).map((feature) => (
                <div
                  key={feature.name}
                  className={`bg-gradient-to-br from-red-900 to-red-800 border border-red-700 p-6 rounded-lg hover:shadow-lg transition`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <StatusIcon status={feature.status} />
                      <div>
                        <h3 className="font-bold text-lg">{feature.name}</h3>
                        <p className="text-sm text-gray-300 mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <StatusBadge status={feature.status} />
                    {feature.apiKeyNeeded && (
                      <div className="bg-red-900/50 border border-red-700 p-3 rounded mt-3">
                        <p className="text-xs font-semibold text-red-300">Adicione à arquivo .env:</p>
                        <p className="text-xs text-red-200 font-mono mt-1">{feature.apiKeyNeeded}=seu_token_aqui</p>
                      </div>
                    )}

                    {feature.implementation && (
                      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-red-700">
                        <Code size={12} className="inline mr-1" />
                        {feature.implementation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Keys Setup Guide */}
        <div className="mt-12 bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-700 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Lock size={28} className="text-orange-400" />
            🔑 Próximos Passos - Adicionar API Keys
          </h2>

          <p className="text-gray-300 mb-6">
            Todas as features estão implementadas. Apenas adicione estas API keys para ativar funcionalidades completas:
          </p>

          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
              <p className="font-semibold text-blue-300 mb-2">1️⃣ ANTHROPIC_API_KEY</p>
              <p className="text-sm text-gray-300">
                ✅ Ativa: AI Copilot + AI Lawyer Matching
                <br />
                📝 <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Obter chave →</a>
              </p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
              <p className="font-semibold text-green-300 mb-2">2️⃣ STRIPE_SECRET_KEY</p>
              <p className="text-sm text-gray-300">
                ✅ Ativa: Pagamentos + Assinaturas (Professional/Enterprise)
                <br />
                📝 <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Obter chave →</a>
              </p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
              <p className="font-semibold text-purple-300 mb-2">3️⃣ RESEND_API_KEY</p>
              <p className="text-sm text-gray-300">
                ✅ Ativa: Email Notifications (Welcome, Case Updates, Payments)
                <br />
                📝 <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Obter chave →</a>
              </p>
            </div>

            <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
              <p className="font-semibold text-pink-300 mb-2">4️⃣ NEXT_PUBLIC_MIXPANEL_TOKEN</p>
              <p className="text-sm text-gray-300">
                ✅ Ativa: Advanced Analytics com Mixpanel (Optional, já funciona sem)
                <br />
                📝 <a href="https://mixpanel.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Obter chave →</a>
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded">
            <p className="text-green-300 font-semibold mb-2">✅ COMO ADICIONAR AS KEYS:</p>
            <p className="text-sm text-gray-300 font-mono bg-gray-800 p-3 rounded mb-2 overflow-x-auto">
              Crie/edite o arquivo <code>.env.local</code> na raiz do projeto:
            </p>
            <pre className="text-sm text-gray-300 bg-gray-800 p-3 rounded overflow-x-auto">
{`ANTHROPIC_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_MIXPANEL_TOKEN=abc123...`}
            </pre>
            <p className="text-xs text-gray-400 mt-2">Depois reinicie o servidor: npm run dev</p>
          </div>
        </div>

        {/* Current Implementation Stats */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">📦 O Que Você Tem Implementado Agora</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle size={20} /> Pronto Para Usar
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ Todos os 3 WOW Features (Copilot, Quiz, Case Tracker)</li>
                <li>✓ Admin Dashboard com métricas reais</li>
                <li>✓ Analytics Dashboard com trends</li>
                <li>✓ State Bar Verification para 50 estados</li>
                <li>✓ Enhanced lookups para NY, CA, FL, TX</li>
                <li>✓ Lawyer Academy (4 video scripts prontos)</li>
                <li>✓ Client Guide (4 video scripts prontos)</li>
                <li>✓ Real-time chat com Socket.IO</li>
                <li>✓ Feature gating (plans: Starter/Pro/Enterprise)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                <AlertCircle size={20} /> Aguardando API Keys
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>⏳ AI Lawyer Matching (precisa ANTHROPIC_API_KEY)</li>
                <li>⏳ Stripe Payments (precisa STRIPE_SECRET_KEY)</li>
                <li>⏳ Email Notifications (precisa RESEND_API_KEY)</li>
                <li>⏳ Mixpanel Analytics (precisa MIXPANEL_TOKEN)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
