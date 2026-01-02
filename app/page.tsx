import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Meu Advogado</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/advogados" className="text-gray-700 hover:text-blue-600">
                Advogados
              </Link>
              <Link href="/para-advogados" className="text-gray-700 hover:text-blue-600">
                Para Advogados
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Entrar
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Encontre um advogado
            <span className="text-blue-600"> brasileiro</span>
            <br />
            nos Estados Unidos
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Advogados que falam seu idioma e entendem suas necessidades jurídicas
          </p>
          
          {/* Search Form */}
          <div className="mt-8 max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <select className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Área de atuação</option>
                <option>Imigração</option>
                <option>Direito de Família</option>
                <option>Direito Criminal</option>
                <option>Acidentes</option>
              </select>
              <select className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Estado</option>
                <option>Florida</option>
                <option>Massachusetts</option>
                <option>New Jersey</option>
                <option>California</option>
              </select>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Português Nativo</h3>
              <p className="mt-2 text-base text-gray-500">
                Todos os advogados falam português fluentemente
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Verificados</h3>
              <p className="mt-2 text-base text-gray-500">
                Verificamos licença e credenciais de todos os advogados
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Gratuito para Você</h3>
              <p className="mt-2 text-base text-gray-500">
                Busque e entre em contato com advogados sem custo
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-blue-600 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">
                Precisa de ajuda jurídica?
              </h2>
              <p className="mt-4 text-xl text-blue-100">
                Conte seu caso e vamos encontrar o advogado certo para você
              </p>
              <div className="mt-8">
                <Link
                  href="/caso"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 transition-colors"
                >
                  Conte seu caso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
