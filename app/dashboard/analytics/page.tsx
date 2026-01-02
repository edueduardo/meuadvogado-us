'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  views: {
    daily: Array<{ date: string; views: number }>;
    weekly: Array<{ week: string; views: number }>;
    monthly: Array<{ month: string; views: number }>;
  };
  leads: {
    daily: Array<{ date: string; leads: number }>;
    weekly: Array<{ week: string; leads: number }>;
    monthly: Array<{ month: string; leads: number }>;
  };
  topCities: Array<{
    city: string;
    state: string;
    views: number;
    leads: number;
  }>;
  topPracticeAreas: Array<{
    area: string;
    views: number;
    leads: number;
  }>;
  conversionRate: number;
  avgResponseTime: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      // TODO: Implementar API real
      // const response = await fetch(`/api/analytics?period=${period}`);
      // const analyticsData = await response.json();
      
      // Dados mockados
      const mockData: AnalyticsData = {
        views: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            views: Math.floor(Math.random() * 50) + 10,
          })),
          weekly: Array.from({ length: 12 }, (_, i) => ({
            week: `Semana ${i + 1}`,
            views: Math.floor(Math.random() * 300) + 100,
          })),
          monthly: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2025, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
            views: Math.floor(Math.random() * 1000) + 500,
          })),
        },
        leads: {
          daily: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            leads: Math.floor(Math.random() * 5),
          })),
          weekly: Array.from({ length: 12 }, (_, i) => ({
            week: `Semana ${i + 1}`,
            leads: Math.floor(Math.random() * 20) + 5,
          })),
          monthly: Array.from({ length: 12 }, (_, i) => ({
            month: new Date(2025, i, 1).toLocaleDateString('pt-BR', { month: 'short' }),
            leads: Math.floor(Math.random() * 50) + 10,
          })),
        },
        topCities: [
          { city: 'Miami', state: 'FL', views: 450, leads: 12 },
          { city: 'Orlando', state: 'FL', views: 320, leads: 8 },
          { city: 'Boston', state: 'MA', views: 280, leads: 6 },
          { city: 'Newark', state: 'NJ', views: 195, leads: 4 },
          { city: 'Los Angeles', state: 'CA', views: 150, leads: 3 },
        ],
        topPracticeAreas: [
          { area: 'Imigração', views: 680, leads: 18 },
          { area: 'Direito de Família', views: 320, leads: 9 },
          { area: 'Direito Criminal', views: 195, leads: 4 },
          { area: 'Acidentes', views: 150, leads: 2 },
        ],
        conversionRate: 3.2,
        avgResponseTime: 2.5,
      };
      
      setData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'daily':
        return 'Últimos 30 dias';
      case 'weekly':
        return 'Últimas 12 semanas';
      case 'monthly':
        return 'Últimos 12 meses';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <p className="text-red-600">Erro ao carregar analytics</p>
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
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/dashboard/analytics" className="text-blue-600 font-medium">
                Analytics
              </Link>
              <Link href="/dashboard/perfil" className="text-gray-700 hover:text-blue-600">
                Perfil
              </Link>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm">
                Sair
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">
                Acompanhe o desempenho do seu perfil
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.views[period].reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.leads[period].reduce((sum, item) => sum + item.leads, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-gray-900">{data.conversionRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Médio Resposta</p>
                <p className="text-2xl font-bold text-gray-900">{data.avgResponseTime}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Views Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Visualizações - {getPeriodLabel()}
            </h2>
            <div className="h-64 flex items-end justify-between">
              {data.views[period].slice(-12).map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{
                      height: `${(item.views / Math.max(...data.views[period].map(v => v.views))) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2 text-center">
                    {'month' in item ? item.month : 'week' in item ? item.week : 'date' in item ? item.date.split('-')[2] : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Leads Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Leads - {getPeriodLabel()}
            </h2>
            <div className="h-64 flex items-end justify-between">
              {data.leads[period].slice(-12).map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{
                      height: `${(item.leads / Math.max(...data.leads[period].map(l => l.leads))) * 100}%`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2 text-center">
                    {'month' in item ? item.month : 'week' in item ? item.week : 'date' in item ? item.date.split('-')[2] : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Cities and Practice Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Cities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Cidades</h2>
            <div className="space-y-3">
              {data.topCities.map((city: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900 w-6">{index + 1}</span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {city.city}, {city.state}
                      </p>
                      <p className="text-xs text-gray-600">{city.views} visualizações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {city.leads} leads
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Practice Areas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Áreas de Atuação</h2>
            <div className="space-y-3">
              {data.topPracticeAreas.map((area: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-gray-900 w-6">{index + 1}</span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{area.area}</p>
                      <p className="text-xs text-gray-600">{area.views} visualizações</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {area.leads} leads
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 text-center">
          <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Relatório PDF
          </button>
        </div>
      </div>
    </div>
  );
}
