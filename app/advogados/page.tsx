'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Lawyer {
  id: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    photo?: string;
    plan: string;
    verified: boolean;
  };
  practiceAreas: Array<{
    practiceArea: {
      name: string;
      slug: string;
    };
  }>;
  reviews: Array<{
    rating: number;
    comment: string;
    reviewerName: string;
    createdAt: string;
  }>;
  city?: string;
  state?: string;
  bio?: string;
  website?: string;
}

export default function AdvogadosPage() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    area: '',
    featured: false,
  });

  useEffect(() => {
    fetchLawyers();
  }, [filters]);

  const fetchLawyers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.state) params.append('state', filters.state);
      if (filters.area) params.append('area', filters.area);
      if (filters.featured) params.append('featured', 'true');

      const response = await fetch(`/api/advogados?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLawyers(data.lawyers || []);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const generateWhatsAppLink = (phone?: string) => {
    if (!phone) return '#';
    const cleaned = phone.replace(/\D/g, '');
    return `https://wa.me/${cleaned}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando advogados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Meu Advogado
            </Link>
            <nav className="flex space-x-8">
              <Link href="/advogados" className="text-blue-600 font-medium">
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filtrar Advogados</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Cidade"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os estados</option>
              <option value="FL">Florida</option>
              <option value="MA">Massachusetts</option>
              <option value="NJ">New Jersey</option>
              <option value="CA">California</option>
            </select>
            <select
              value={filters.area}
              onChange={(e) => handleFilterChange('area', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as áreas</option>
              <option value="imigracao">Imigração</option>
              <option value="direito-de-familia">Direito de Família</option>
              <option value="direito-criminal">Direito Criminal</option>
              <option value="acidentes">Acidentes</option>
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Apenas Destaque</span>
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-gray-600">
            {lawyers.length} advogado{lawyers.length !== 1 ? 's' : ''} encontrado{lawyers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Lawyers Grid */}
        {lawyers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum advogado encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros para ver mais resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <div key={lawyer.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {lawyer.user.photo ? (
                        <img
                          src={lawyer.user.photo}
                          alt={lawyer.user.name}
                          className="w-12 h-12 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-gray-500 font-semibold">
                            {lawyer.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{lawyer.user.name}</h3>
                        {lawyer.user.verified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            ✓ Verificado
                          </span>
                        )}
                      </div>
                    </div>
                    {lawyer.user.plan === 'FEATURED' && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⭐ Destaque
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  {(lawyer.city || lawyer.state) && (
                    <p className="text-sm text-gray-600 mb-3">
                      📍 {lawyer.city}{lawyer.city && lawyer.state && ', '}{lawyer.state}
                    </p>
                  )}

                  {/* Practice Areas */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Áreas de atuação:</p>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.practiceAreas.map((pa) => (
                        <span
                          key={pa.practiceArea.slug}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {pa.practiceArea.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reviews */}
                  {lawyer.reviews.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center">
                        <div className="flex">
                          {renderStars(
                            Math.round(
                              lawyer.reviews.reduce((acc, r) => acc + r.rating, 0) / lawyer.reviews.length
                            )
                          )}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          ({lawyer.reviews.length} avaliação{lawyer.reviews.length !== 1 ? 'ões' : ''})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="flex space-x-2">
                    {lawyer.user.phone && (
                      <a
                        href={generateWhatsAppLink(lawyer.user.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-600 text-white text-center px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        WhatsApp
                      </a>
                    )}
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
