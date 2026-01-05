'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Video, Phone, Users, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Lawyer {
  id: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  specialization: string;
  experience: string;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  verified: boolean;
  location: string;
}

interface Consultation {
  id: string;
  scheduledAt: string;
  duration: number;
  consultationType: string;
  status: string;
  meetingLink?: string;
  lawyer: {
    user: {
      name: string;
      email: string;
    };
  };
}

export default function ConsultasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'phone' | 'in_person'>('all');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    loadData();
  }, [session, status]);

  const loadData = async () => {
    try {
      // Carregar advogados
      const lawyersRes = await fetch('/api/lawyers');
      const lawyersData = await lawyersRes.json();
      setLawyers(lawyersData);

      // Carregar consultas do usuário
      const consultationsRes = await fetch('/api/consultations/create');
      const consultationsData = await consultationsRes.json();
      setConsultations(consultationsData.consultations || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lawyer.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const upcomingConsultations = consultations
    .filter(c => new Date(c.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-4 h-4" />;
      case 'PHONE': return <Phone className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getConsultationTypeLabel = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'Vídeo';
      case 'PHONE': return 'Telefone';
      case 'IN_PERSON': return 'Presencial';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'in_progress': return 'Em andamento';
      default: return status;
    }
  };

  const joinConsultation = (consultation: Consultation) => {
    if (consultation.meetingLink) {
      window.open(consultation.meetingLink, '_blank');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Consultas Jurídicas</h1>
              <p className="mt-1 text-sm text-gray-600">
                {session?.user?.role === 'LAWYER' 
                  ? 'Gerencie suas consultas agendadas'
                  : 'Agende consultas com advogados especializados'
                }
              </p>
            </div>
            <Link
              href="/advogados"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Todos Advogados
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Próximas Consultas */}
            {upcomingConsultations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Próximas Consultas
                </h2>
                <div className="space-y-4">
                  {upcomingConsultations.map((consultation) => (
                    <div key={consultation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getConsultationIcon(consultation.consultationType)}
                            <span className="font-medium text-gray-900">
                              {getConsultationTypeLabel(consultation.consultationType)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                              {getStatusLabel(consultation.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Advogado: {consultation.lawyer.user.name}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(consultation.scheduledAt).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(consultation.scheduledAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <span>{consultation.duration} min</span>
                          </div>
                        </div>
                        {consultation.consultationType === 'VIDEO' && consultation.status === 'scheduled' && (
                          <button
                            onClick={() => joinConsultation(consultation)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <Video className="w-4 h-4" />
                            Entrar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de Advogados */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Advogados Disponíveis
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar advogado..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="video">Vídeo</option>
                    <option value="phone">Telefone</option>
                    <option value="in_person">Presencial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredLawyers.map((lawyer) => (
                  <div key={lawyer.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {lawyer.user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{lawyer.user.name}</h3>
                          {lawyer.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verificado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{lawyer.specialization}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>⭐ {lawyer.rating} ({lawyer.totalReviews} avaliações)</span>
                          <span>📍 {lawyer.location}</span>
                          <span>💰 ${lawyer.hourlyRate}/h</span>
                        </div>
                        <Link
                          href={`/consultas/agendar/${lawyer.id}`}
                          className="w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Agendar Consulta
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLawyers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum advogado encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Consultas</span>
                  <span className="font-semibold">{consultations.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Próximas</span>
                  <span className="font-semibold text-blue-600">{upcomingConsultations.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Advogados</span>
                  <span className="font-semibold">{lawyers.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href="/consultas/historico"
                  className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Ver Histórico
                </Link>
                <Link
                  href="/chat"
                  className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Mensagens
                </Link>
                {session?.user?.role === 'CLIENT' && (
                  <Link
                    href="/caso"
                    className="block w-full text-center bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Descrever Caso
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
