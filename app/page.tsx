import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
            <Link href="/para-advogados" className="text-gray-600 hover:text-blue-600">
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
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Encontre um Advogado<br />
          <span className="text-blue-600">Brasileiro nos EUA</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Conectamos brasileiros que precisam de ajuda jurídica com advogados 
          que falam português e entendem sua cultura.
        </p>
        
        {/* Search Box */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-12">
          <div className="grid md:grid-cols-3 gap-4">
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Área de Atuação</option>
              <option value="imigracao">Imigração</option>
              <option value="familia">Direito de Família</option>
              <option value="criminal">Direito Criminal</option>
              <option value="acidentes">Acidentes Pessoais</option>
              <option value="trabalhista">Direito Trabalhista</option>
              <option value="empresarial">Direito Empresarial</option>
            </select>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Estado</option>
              <option value="FL">Florida</option>
              <option value="MA">Massachusetts</option>
              <option value="NJ">New Jersey</option>
              <option value="NY">New York</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
            </select>
            <Link 
              href="/advogados"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center"
            >
              Buscar Advogados
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/caso"
            className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 font-semibold text-lg"
          >
            📝 Conte seu Caso (Grátis)
          </Link>
          <Link 
            href="/advogados"
            className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 font-semibold text-lg"
          >
            🔍 Ver Todos os Advogados
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold">150+</div>
              <div className="text-blue-100">Advogados</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50+</div>
              <div className="text-blue-100">Cidades</div>
            </div>
            <div>
              <div className="text-4xl font-bold">10+</div>
              <div className="text-blue-100">Áreas de Atuação</div>
            </div>
            <div>
              <div className="text-4xl font-bold">1.000+</div>
              <div className="text-blue-100">Casos Resolvidos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Por que usar o Meu Advogado?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🇧🇷</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Falam Português</h3>
            <p className="text-gray-600">
              Todos os advogados falam português fluentemente e entendem a cultura brasileira.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verificados</h3>
            <p className="text-gray-600">
              Verificamos a licença e credenciais de todos os advogados cadastrados.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Contato Direto</h3>
            <p className="text-gray-600">
              Entre em contato direto via WhatsApp, telefone ou email sem intermediários.
            </p>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Áreas de Atuação
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '✈️', name: 'Imigração', desc: 'Vistos, Green Card, Cidadania' },
              { icon: '👨‍👩‍👧', name: 'Família', desc: 'Divórcio, Custódia, Pensão' },
              { icon: '⚖️', name: 'Criminal', desc: 'DUI, Defesa Criminal' },
              { icon: '🚗', name: 'Acidentes', desc: 'Acidentes de Carro, Trabalho' },
              { icon: '💼', name: 'Trabalhista', desc: 'Demissão, Discriminação' },
              { icon: '🏢', name: 'Empresarial', desc: 'Abertura de Empresa, Contratos' },
              { icon: '🏠', name: 'Imobiliário', desc: 'Compra, Venda, Aluguel' },
              { icon: '📋', name: 'Outros', desc: 'Testamentos, Impostos' },
            ].map((area) => (
              <Link 
                key={area.name}
                href={`/advogados?area=${area.name.toLowerCase()}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{area.icon}</div>
                <h3 className="font-semibold text-gray-900">{area.name}</h3>
                <p className="text-sm text-gray-500">{area.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Advogados */}
      <section className="bg-blue-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            É Advogado Brasileiro nos EUA?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Cadastre-se gratuitamente e receba clientes brasileiros que precisam da sua ajuda.
          </p>
          <Link 
            href="/para-advogados"
            className="inline-block bg-white text-blue-900 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg"
          >
            Quero me Cadastrar →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">Meu Advogado</h3>
              <p className="text-sm">
                Conectando brasileiros com advogados de confiança nos Estados Unidos.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Para Clientes</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/advogados" className="hover:text-white">Buscar Advogados</Link></li>
                <li><Link href="/caso" className="hover:text-white">Conte seu Caso</Link></li>
                <li><Link href="/como-funciona" className="hover:text-white">Como Funciona</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Para Advogados</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/para-advogados" className="hover:text-white">Cadastre-se</Link></li>
                <li><Link href="/planos" className="hover:text-white">Planos</Link></li>
                <li><Link href="/login" className="hover:text-white">Área do Advogado</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li>contato@meuadvogado.us</li>
                <li>WhatsApp: (XX) XXXXX-XXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2025 Meu Advogado. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
