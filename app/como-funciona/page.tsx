import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Como Funciona - Encontre seu Advogado em 3 Passos',
  description: 'Descubra como encontrar o advogado brasileiro perfeito nos EUA. Processo simples, rápido e gratuito.',
}

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Como Funciona?
          </h1>
          <p className="text-xl text-blue-100">
            Encontrar um advogado brasileiro nunca foi tão fácil
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-5xl">📝</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
                PASSO 1
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Conte seu Problema
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Descreva sua situação em poucos minutos. Pode ser por texto, áudio ou até pelo WhatsApp. 
                Nossa inteligência artificial analisa seu caso e identifica a área jurídica correta.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> 100% gratuito
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Leva menos de 2 minutos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Totalmente confidencial
                </li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-16">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-5xl">🤖</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-right">
              <div className="inline-block bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
                PASSO 2
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                IA Encontra os Melhores Advogados
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Nosso algoritmo analisa mais de 150 advogados brasileiros cadastrados e seleciona 
                os 3 mais qualificados para o seu tipo de caso e localização.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2 justify-center md:justify-end">
                  <span className="text-green-500">✓</span> Match baseado em especialidade
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-end">
                  <span className="text-green-500">✓</span> Considera avaliações reais
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-end">
                  <span className="text-green-500">✓</span> Prioriza advogados verificados
                </li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-5xl">💬</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full mb-3">
                PASSO 3
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Fale Direto com o Advogado
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Escolha o advogado que mais te agrada e entre em contato direto pelo WhatsApp, 
                chat ou vídeo. A primeira consulta é gratuita para você conhecer o profissional.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Consulta inicial grátis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Resposta em até 24 horas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> WhatsApp, chat ou vídeo
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">É realmente gratuito?</h3>
              <p className="text-gray-600">
                Sim! Usar a plataforma para encontrar advogados é 100% gratuito. A primeira consulta 
                com o advogado também é gratuita. Você só paga se decidir contratar os serviços.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Os advogados são verificados?</h3>
              <p className="text-gray-600">
                Sim! Verificamos a licença (Bar Number) de cada advogado cadastrado. Advogados com 
                selo de verificação passaram por checagem de credenciais e histórico.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quanto tempo leva para receber resposta?</h3>
              <p className="text-gray-600">
                Em média, advogados respondem em menos de 24 horas. Para casos urgentes, muitos 
                advogados oferecem atendimento imediato pelo WhatsApp.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Posso usar mesmo sem documentos?</h3>
              <p className="text-gray-600">
                Sim! Sua situação migratória não afeta seu acesso à plataforma. Muitos advogados 
                atendem clientes independente do status imigratório.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para Começar?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Encontre seu advogado brasileiro em menos de 2 minutos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/caso"
              className="inline-flex items-center justify-center gap-2 bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              📝 Contar meu Caso
            </Link>
            <Link
              href="/advogados"
              className="inline-flex items-center justify-center gap-2 bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
            >
              🔍 Ver Advogados
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
