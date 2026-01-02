import Link from 'next/link'

const advogados = [
  {
    id: 1,
    nome: 'Dr. João Silva',
    foto: '👨‍💼',
    areas: ['Imigração', 'Família'],
    cidade: 'Miami',
    estado: 'FL',
    avaliacao: 4.9,
    avaliacoes: 127,
    idiomas: ['Português', 'English', 'Español'],
    verificado: true,
    destaque: true,
  },
  {
    id: 2,
    nome: 'Dra. Maria Santos',
    foto: '👩‍💼',
    areas: ['Criminal', 'Acidentes'],
    cidade: 'Orlando',
    estado: 'FL',
    avaliacao: 4.8,
    avaliacoes: 89,
    idiomas: ['Português', 'English'],
    verificado: true,
    destaque: true,
  },
  {
    id: 3,
    nome: 'Dr. Carlos Oliveira',
    foto: '👨‍💼',
    areas: ['Empresarial', 'Imobiliário'],
    cidade: 'Boston',
    estado: 'MA',
    avaliacao: 4.7,
    avaliacoes: 64,
    idiomas: ['Português', 'English'],
    verificado: true,
    destaque: false,
  },
  {
    id: 4,
    nome: 'Dra. Ana Costa',
    foto: '👩‍💼',
    areas: ['Imigração'],
    cidade: 'Newark',
    estado: 'NJ',
    avaliacao: 4.9,
    avaliacoes: 156,
    idiomas: ['Português', 'English', 'Español'],
    verificado: true,
    destaque: true,
  },
  {
    id: 5,
    nome: 'Dr. Pedro Almeida',
    foto: '👨‍💼',
    areas: ['Trabalhista', 'Acidentes'],
    cidade: 'Los Angeles',
    estado: 'CA',
    avaliacao: 4.6,
    avaliacoes: 42,
    idiomas: ['Português', 'English'],
    verificado: true,
    destaque: false,
  },
  {
    id: 6,
    nome: 'Dra. Fernanda Lima',
    foto: '👩‍💼',
    areas: ['Família', 'Imigração'],
    cidade: 'Houston',
    estado: 'TX',
    avaliacao: 4.8,
    avaliacoes: 78,
    idiomas: ['Português', 'English'],
    verificado: true,
    destaque: false,
  },
]

export default function AdvogadosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Meu Advogado
          </Link>
          <nav className="hidden md:flex space-x-8">
            <Link href="/advogados" className="text-blue-600 font-medium">
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">Área de Atuação</option>
              <option value="imigracao">Imigração</option>
              <option value="familia">Direito de Família</option>
              <option value="criminal">Direito Criminal</option>
              <option value="acidentes">Acidentes Pessoais</option>
              <option value="trabalhista">Direito Trabalhista</option>
              <option value="empresarial">Direito Empresarial</option>
            </select>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">Estado</option>
              <option value="FL">Florida</option>
              <option value="MA">Massachusetts</option>
              <option value="NJ">New Jersey</option>
              <option value="NY">New York</option>
              <option value="CA">California</option>
              <option value="TX">Texas</option>
            </select>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">Cidade</option>
              <option value="miami">Miami</option>
              <option value="orlando">Orlando</option>
              <option value="boston">Boston</option>
              <option value="newark">Newark</option>
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Buscar
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {advogados.length} Advogados Encontrados
          </h1>
          <p className="text-gray-600">Advogados brasileiros nos Estados Unidos</p>
        </div>

        {/* Lista */}
        <div className="space-y-4">
          {advogados.map((adv) => (
            <div key={adv.id} className={`bg-white rounded-lg shadow-sm p-6 ${adv.destaque ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Foto */}
                <div className="text-6xl">{adv.foto}</div>
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold text-gray-900">{adv.nome}</h2>
                    {adv.verificado && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ Verificado</span>
                    )}
                    {adv.destaque && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">⭐ Destaque</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">📍 {adv.cidade}, {adv.estado}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {adv.areas.map((area) => (
                      <span key={area} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>⭐ {adv.avaliacao} ({adv.avaliacoes} avaliações)</span>
                    <span>🗣️ {adv.idiomas.join(', ')}</span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2">
                  <a 
                    href={`https://wa.me/1234567890`}
                    target="_blank"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-center"
                  >
                    💬 WhatsApp
                  </a>
                  <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50">
                    Ver Perfil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
