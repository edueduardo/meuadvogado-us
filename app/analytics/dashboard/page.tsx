'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, LineChart as LineChartIcon, Activity, Users, DollarSign, Clock } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeCases: number;
  conversionRate: number;
  revenue: number;
  avgResponseTime: number;
  clientSatisfaction: number;
  profileViews: number;
  leadConversionRate: number;
  realtime?: {
    activeUsers: number;
    onlineLawyers: number;
    pendingCases: number;
  };
  systemHealth?: {
    status: 'healthy' | 'degraded' | 'down';
    uptime: number;
    responseTime: number;
  };
  insights?: string[];
  trends?: {
    userGrowth: number;
    caseGrowth: number;
    revenueGrowth: number;
  };
}

interface DashboardStats {
  analytics: AnalyticsData;
  _meta: {
    timeframe: string;
    role: string;
    serviceUsed: string;
    dataFreshness: string;
    cacheDuration: string;
  };
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando analytics...</div>
      </div>
    );
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="text-green-400" size={20} />
    ) : (
      <TrendingDown className="text-red-400" size={20} />
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 p-8 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-300">Métricas e insights em tempo real da plataforma</p>
          </div>
          <div className="flex gap-3">
            {['7d', '30d', '90d'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tf === '7d' ? '7 dias' : tf === '30d' ? '30 dias' : '90 dias'}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-8">
        {stats && (
          <div className="space-y-8">
            {/* Real-time Metrics */}
            {stats.analytics.realtime && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg border border-green-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Usuários Ativos Agora</h3>
                    <Activity size={24} className="text-green-400" />
                  </div>
                  <p className="text-4xl font-bold">{stats.analytics.realtime.activeUsers}</p>
                  <p className="text-sm text-green-300 mt-2">Conectados em tempo real</p>
                </div>

                <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg border border-blue-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Advogados Online</h3>
                    <Users size={24} className="text-blue-400" />
                  </div>
                  <p className="text-4xl font-bold">{stats.analytics.realtime.onlineLawyers}</p>
                  <p className="text-sm text-blue-300 mt-2">Disponíveis para atender</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg border border-yellow-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Casos Pendentes</h3>
                    <Clock size={24} className="text-yellow-400" />
                  </div>
                  <p className="text-4xl font-bold">{stats.analytics.realtime.pendingCases}</p>
                  <p className="text-sm text-yellow-300 mt-2">Aguardando ação</p>
                </div>
              </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-600 transition">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-400">Usuários Total</p>
                  <Users size={20} className="text-blue-400" />
                </div>
                <p className="text-3xl font-bold">{stats.analytics.totalUsers}</p>
                {stats.analytics.trends && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    {getTrendIcon(stats.analytics.trends.userGrowth)}
                    <span className={stats.analytics.trends.userGrowth >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {stats.analytics.trends.userGrowth}% vs período anterior
                    </span>
                  </div>
                )}
              </div>

              {/* Active Cases */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-600 transition">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-400">Casos Ativos</p>
                  <BarChart3 size={20} className="text-purple-400" />
                </div>
                <p className="text-3xl font-bold">{stats.analytics.activeCases}</p>
                {stats.analytics.trends && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    {getTrendIcon(stats.analytics.trends.caseGrowth)}
                    <span className={stats.analytics.trends.caseGrowth >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {stats.analytics.trends.caseGrowth}% vs período anterior
                    </span>
                  </div>
                )}
              </div>

              {/* Conversion Rate */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-600 transition">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-400">Taxa de Conversão</p>
                  <PieChart size={20} className="text-green-400" />
                </div>
                <p className="text-3xl font-bold">{(stats.analytics.conversionRate * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-500 mt-2">Leads → Clientes</p>
              </div>

              {/* Revenue */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-600 transition">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-400">Revenue</p>
                  <DollarSign size={20} className="text-yellow-400" />
                </div>
                <p className="text-3xl font-bold">${stats.analytics.revenue.toLocaleString()}</p>
                {stats.analytics.trends && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    {getTrendIcon(stats.analytics.trends.revenueGrowth)}
                    <span className={stats.analytics.trends.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {stats.analytics.trends.revenueGrowth}% vs período anterior
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Tempo Médio Resposta</p>
                <p className="text-2xl font-bold text-blue-400">{stats.analytics.avgResponseTime.toFixed(1)}h</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Satisfação Clientes</p>
                <p className="text-2xl font-bold text-green-400">{stats.analytics.clientSatisfaction.toFixed(1)}/5.0</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Visualizações Perfil</p>
                <p className="text-2xl font-bold text-purple-400">{stats.analytics.profileViews.toLocaleString()}</p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Taxa Conv. Leads</p>
                <p className="text-2xl font-bold text-yellow-400">{(stats.analytics.leadConversionRate * 100).toFixed(1)}%</p>
              </div>
            </div>

            {/* Insights */}
            {stats.analytics.insights && stats.analytics.insights.length > 0 && (
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 rounded-lg border border-blue-700">
                <div className="flex items-center gap-2 mb-4">
                  <LineChartIcon size={20} className="text-blue-400" />
                  <h2 className="text-xl font-bold">Insights</h2>
                </div>
                <div className="space-y-2">
                  {stats.analytics.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded">
                      <span className="text-blue-400 font-bold">→</span>
                      <p className="text-sm text-gray-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Health */}
            {stats.analytics.systemHealth && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold mb-4">Saúde do Sistema</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-700 rounded">
                    <p className="text-sm text-gray-400 mb-2">Status</p>
                    <p className={`text-lg font-bold ${
                      stats.analytics.systemHealth.status === 'healthy'
                        ? 'text-green-400'
                        : stats.analytics.systemHealth.status === 'degraded'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}>
                      {stats.analytics.systemHealth.status === 'healthy'
                        ? '✓ Operacional'
                        : stats.analytics.systemHealth.status === 'degraded'
                        ? '⚠ Degradado'
                        : '✗ Inativo'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-700 rounded">
                    <p className="text-sm text-gray-400 mb-2">Uptime</p>
                    <p className="text-lg font-bold text-green-400">{stats.analytics.systemHealth.uptime}%</p>
                  </div>

                  <div className="p-4 bg-gray-700 rounded">
                    <p className="text-sm text-gray-400 mb-2">Response Time</p>
                    <p className="text-lg font-bold text-blue-400">{stats.analytics.systemHealth.responseTime}ms</p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-gray-500 text-center">
              <p>Dados atualizado em: {new Date(stats._meta.dataFreshness).toLocaleString('pt-BR')}</p>
              <p>Período: {stats._meta.timeframe} | Cache: {stats._meta.cacheDuration}</p>
            </div>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500">
        Atualização automática a cada 30s
      </div>
    </div>
  );
}
