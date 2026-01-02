'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LawyerProfile {
  id: string;
  userId: string;
  oabNumber?: string;
  barAdmission?: string;
  languages: string[];
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  bio?: string;
  website?: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    photo?: string;
  };
  practiceAreas: Array<{
    practiceArea: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

const ALL_PRACTICE_AREAS = [
  { id: '1', name: 'Imigração', slug: 'imigracao' },
  { id: '2', name: 'Direito de Família', slug: 'direito-de-familia' },
  { id: '3', name: 'Direito Criminal', slug: 'direito-criminal' },
  { id: '4', name: 'Acidentes', slug: 'acidentes' },
  { id: '5', name: 'Negócios', slug: 'negocios' },
  { id: '6', name: 'Trabalhista', slug: 'trabalhista' },
  { id: '7', name: 'Imobiliário', slug: 'imobiliario' },
  { id: '8', name: 'Outros', slug: 'outros' },
];

const LANGUAGES = [
  'Português', 'English', 'Español', 'Italiano', 'Francês', 'Alemão'
];

export default function PerfilPage() {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    oabNumber: '',
    barAdmission: '',
    languages: ['Português'],
    address: '',
    city: '',
    state: '',
    zipcode: '',
    bio: '',
    website: '',
    phone: '',
    practiceAreas: [] as string[],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // TODO: Implementar API real
      // const response = await fetch('/api/lawyer/profile');
      // const data = await response.json();
      
      // Dados mockados
      const mockProfile: LawyerProfile = {
        id: '1',
        userId: '1',
        oabNumber: '123456/FL',
        barAdmission: '2015-05-15',
        languages: ['Português', 'English', 'Español'],
        address: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zipcode: '33101',
        bio: 'Advogado especializado em imigração com mais de 10 anos de experiência atendendo a comunidade brasileira.',
        website: 'https://joaosilva-law.com',
        user: {
          name: 'Dr. João Silva',
          email: 'joao@meuadvogado.us',
          phone: '(305) 123-4567',
          photo: '',
        },
        practiceAreas: [
          { practiceArea: { id: '1', name: 'Imigração', slug: 'imigracao' } },
          { practiceArea: { id: '2', name: 'Direito de Família', slug: 'direito-de-familia' } },
        ],
      };
      
      setProfile(mockProfile);
      setFormData({
        oabNumber: mockProfile.oabNumber || '',
        barAdmission: mockProfile.barAdmission || '',
        languages: mockProfile.languages,
        address: mockProfile.address || '',
        city: mockProfile.city || '',
        state: mockProfile.state || '',
        zipcode: mockProfile.zipcode || '',
        bio: mockProfile.bio || '',
        website: mockProfile.website || '',
        phone: mockProfile.user.phone || '',
        practiceAreas: mockProfile.practiceAreas.map(pa => pa.practiceArea.id),
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // TODO: Implementar API real
      // const response = await fetch('/api/lawyer/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      
      // if (response.ok) {
      //   setMessage('Perfil atualizado com sucesso!');
      //   fetchProfile();
      // }
      
      setMessage('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handlePracticeAreaToggle = (areaId: string) => {
    setFormData(prev => ({
      ...prev,
      practiceAreas: prev.practiceAreas.includes(areaId)
        ? prev.practiceAreas.filter(id => id !== areaId)
        : [...prev.practiceAreas, areaId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfil...</p>
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
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
              Meu Advogado
            </Link>
            <nav className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/advogados" className="text-gray-700 hover:text-blue-600">
                Ver Diretório
              </Link>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm">
                Sair
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-1">
            Atualize suas informações profissionais para atrair mais clientes
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações Profissionais</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número OAB
                </label>
                <input
                  type="text"
                  value={formData.oabNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, oabNumber: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456/FL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Admissão na OAB
                </label>
                <input
                  type="date"
                  value={formData.barAdmission}
                  onChange={(e) => setFormData(prev => ({ ...prev, barAdmission: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone/WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://seusite.com"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografia Profissional
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descreva sua experiência, especialidades e abordagem..."
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Endereço do Escritório</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Miami"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  <option value="FL">Florida</option>
                  <option value="MA">Massachusetts</option>
                  <option value="NJ">New Jersey</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.zipcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipcode: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="33101"
                />
              </div>
            </div>
          </div>

          {/* Idiomas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Idiomas</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {LANGUAGES.map((language) => (
                <label key={language} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={() => handleLanguageToggle(language)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{language}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Áreas de Atuação */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Áreas de Atuação</h2>
            <p className="text-sm text-gray-600 mb-4">
              Selecione as áreas que você atende (seu plano permite {profile?.plan === 'FREE' ? '1' : profile?.plan === 'PREMIUM' ? '5' : 'ilimitadas'} áreas)
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALL_PRACTICE_AREAS.map((area) => (
                <label key={area.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.practiceAreas.includes(area.id)}
                    onChange={() => handlePracticeAreaToggle(area.id)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{area.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
