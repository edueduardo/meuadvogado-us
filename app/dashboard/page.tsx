import Link from 'next/link'

export default function DashboardPage() {
  const stats = {
    visualizacoes: 1234,
    leads: 23,
    contatos: 18,
    avaliacoes: 12,
  }

  const leads = [
    { id: 1, nome: 'Maria Silva', area: 'Imigração', cidade: 'Miami, FL', data: '2h atrás', status: 'novo' },
    { id: 2, nome: 'João Santos', area: 'Família', cidade: 'Orlando, FL', data: '5h atrás', status: 'novo' },
    { id: 3, nome: 'Ana Costa', area: 'Imigração', cidade: 'Boston, MA', data: '1 dia', status: 'contactado' },
    { id: 4, nome: 'Pedro Lima', area: 'Criminal', cidade: 'Newark, NJ', data: '2 dias', status: 'contactado' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Meu Advogado
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              Meu Perfil
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              Leads
            </Link>
            <Link href="/" className="text-red-500 hover:text-red-600">
              Sair
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, Dr. João! 👋</h1>
          <p className="text-gray-600 mt-1">Aqui está o resumo da sua conta</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.visualizacoes}</div>
            <div className="text-gray-600">Visualizações</div>
            <div className="text-sm text-green-600 mt-1">↑ 12% este mês</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-green-600">{stats.leads}</div>
            <div className="text-gray-600">Leads</div>
            <div className="text-sm text-green-600 mt-1">↑ 8% este mês</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-purple-600">{stats.contatos}</div>
            <div className="text-gray-600">Contatos</div>
            <div className="text-sm text-green-600 mt-1">↑ 5% este mês</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-yellow-600">{stats.avaliacoes}</div>
            <div className="text-gray-600">Avaliações</div>
            <div className="text-sm text-gray-500 mt-1">⭐ 4.9 média</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Leads Recentes */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Leads Recentes</h2>
                  <Link href="/dashboard" className="text-blue-600 text-sm hover:underline">
                    Ver todos →
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {leads.map((lead) => (
                  <div key={lead.id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{lead.nome}</h3>
                          {lead.status === 'novo' && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Novo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {lead.area} • {lead.cidade}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{lead.data}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                          💬 WhatsApp
                        </button>
                        <button className="border border-gray-300 text-gray-600 px-3 py-1 rounded text-sm hover:bg-gray-50">
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plano */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Seu Plano</h2>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="font-semibold text-blue-900">Premium</div>
                <div className="text-sm text-blue-700">$99/mês</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Leads usados</span>
                  <span className="font-medium">15 de 20</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <button className="w-full mt-4 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium">
                Fazer Upgrade
              </button>
            </div>

            {/* Perfil */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Completar Perfil</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Informações básicas
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Áreas de atuação
                </li>
                <li className="flex items-center text-gray-600">
                  <span className="text-green-500 mr-2">✓</span> Contato
                </li>
                <li className="flex items-center text-yellow-600">
                  <span className="mr-2">○</span> Adicionar foto
                </li>
                <li className="flex items-center text-yellow-600">
                  <span className="mr-2">○</span> Biografia completa
                </li>
              </ul>
              <Link 
                href="/dashboard"
                className="block w-full mt-4 text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Editar Perfil
              </Link>
            </div>

            {/* Dicas */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
              <h2 className="text-lg font-semibold mb-2">💡 Dica do Dia</h2>
              <p className="text-sm text-blue-100">
                Advogados com foto recebem 3x mais contatos. 
                Adicione uma foto profissional ao seu perfil!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
