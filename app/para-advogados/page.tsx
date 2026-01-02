import Link from 'next/link'

export default function ParaAdvogadosPage() {
  return (
    <div className="min-h-screen bg-white">
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
            <Link href="/caso" className="text-gray-600 hover:text-blue-600">
              Conte seu Caso
            </Link>
            <Link href="/para-advogados" className="text-blue-600 font-medium">
              Para Advogados
            </Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-blue-600">
              Entrar
            </Link>
            <Link href="/cadastro" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Receba Clientes Brasileiros<br />nos Estados Unidos
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Cadastre-se no maior diretório de advogados brasileiros nos EUA 
            e receba leads qualificados de clientes que precisam da sua ajuda.
          </p>
          <Link 
            href="/cadastro"
            className="inline-block bg-white text-blue-900 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg"
          >
            Começar Gratuitamente →
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">3.5M+</div>
              <div className="text-gray-600">Brasileiros nos EUA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">1.000+</div>
              <div className="text-gray-600">Buscas por mês</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">150+</div>
              <div className="text-gray-600">Advogados Cadastrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">4.8⭐</div>
              <div className="text-gray-600">Avaliação Média</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que se cadastrar?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Leads Qualificados</h3>
              <p className="text-gray-600">
                Receba contatos de brasileiros que realmente precisam de ajuda jurídica 
                na sua área de especialidade.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🇧🇷</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidade Brasileira</h3>
              <p className="text-gray-600">
                Acesse o maior mercado de brasileiros nos EUA buscando 
                advogados que falam português.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Aumente sua Visibilidade</h3>
              <p className="text-gray-600">
                Apareça nas buscas do Google e receba avaliações 
                que fortalecem sua reputação online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Escolha seu Plano
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Comece grátis e faça upgrade quando quiser
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-xl shadow-sm p-8 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Gratuito</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Perfil básico
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> 1 área de atuação
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Contato por email
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="mr-2">✗</span> Sem destaque na busca
                </li>
              </ul>
              <Link 
                href="/cadastro"
                className="block w-full text-center border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 font-semibold"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                  Mais Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Premium</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Perfil completo
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> 5 áreas de atuação
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> WhatsApp + Email
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Badge "Verificado"
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> 20 leads/mês
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Analytics
                </li>
              </ul>
              <Link 
                href="/cadastro"
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Assinar Premium
              </Link>
            </div>

            {/* Featured */}
            <div className="bg-white rounded-xl shadow-sm p-8 border-2 border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Destaque</h3>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Tudo do Premium
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Áreas ilimitadas
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Leads ilimitados
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Topo da busca
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Badge "Destaque"
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Suporte prioritário
                </li>
              </ul>
              <Link 
                href="/cadastro"
                className="block w-full text-center border-2 border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 font-semibold"
              >
                Assinar Destaque
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para crescer seu escritório?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Cadastre-se agora e comece a receber clientes brasileiros ainda hoje.
          </p>
          <Link 
            href="/cadastro"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg"
          >
            Criar Conta Gratuita →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 Meu Advogado. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
