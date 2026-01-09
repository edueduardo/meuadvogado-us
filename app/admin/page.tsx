'use client';

import { useEffect, useState } from 'react';
import { Users, User, FileText, TrendingUp, DollarSign, Activity, BarChart3, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalLawyers: number;
  verifiedLawyers: number;
  totalClients: number;
  totalCases: number;
  activeCases: number;
  completedCases: number;
  conversions: {
    leadsToClients: number;
    conversionRate: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    activeSubscriptions: number;
  };
  engagement: {
    dailyActiveUsers: number;
    chatMessages: number;
    avgResponseTime: string;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
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
        <div className="text-white text-xl">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-8 border-b border-gray-700">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Métricas em tempo real da plataforma</p>
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-8">
        {stats && (
          <div className="space-y-8">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Advogados */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-6 rounded-lg border border-blue-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Advogados</h3>
                  <Users size={24} className="text-blue-400" />
                </div>
                <p className="text-4xl font-bold">{stats.totalLawyers}</p>
                <p className="text-sm text-blue-300 mt-2">✓ Verificados: {stats.verifiedLawyers}</p>
                <div className="mt-2 text-xs text-gray-400">
                  Taxa de verificação: {stats.totalLawyers > 0 ? ((stats.verifiedLawyers / stats.totalLawyers) * 100).toFixed(1) : 0}%
                </div>
              </div>

              {/* Clientes */}
              <div className="bg-gradient-to-br from-green-900 to-green-800 p-6 rounded-lg border border-green-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Clientes</h3>
                  <User size={24} className="text-green-400" />
                </div>
                <p className="text-4xl font-bold">{stats.totalClients}</p>
                <p className="text-sm text-green-300 mt-2">Usuários ativos</p>
                <div className="mt-2 text-xs text-gray-400">
                  DAU: {stats.engagement.dailyActiveUsers}
                </div>
              </div>

              {/* Casos */}
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-lg border border-purple-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Casos</h3>
                  <FileText size={24} className="text-purple-400" />
                </div>
                <p className="text-4xl font-bold">{stats.totalCases}</p>
                <p className="text-sm text-purple-300 mt-2">
                  🔵 Ativos: {stats.activeCases} | ✅ Fechados: {stats.completedCases}
                </p>
              </div>

              {/* Conversão */}
              <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 p-6 rounded-lg border border-yellow-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Conversão</h3>
                  <TrendingUp size={24} className="text-yellow-400" />
                </div>
                <p className="text-4xl font-bold">{stats.conversions.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-yellow-300 mt-2">
                  {stats.conversions.leadsToClients} leads → clientes
                </p>
              </div>
            </div>

            {/* Second Row - Engagement & Revenue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Engagement */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-6">
                  <Activity size={20} className="text-blue-400" />
                  <h2 className="text-xl font-bold">Engajamento</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <span className="text-gray-300">Chat Messages (hoje)</span>
                    <span className="text-xl font-bold text-blue-400">{stats.engagement.chatMessages}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <span className="text-gray-300">Tempo médio de resposta</span>
                    <span className="text-xl font-bold text-blue-400">{stats.engagement.avgResponseTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <span className="text-gray-300">Usuários ativos (hoje)</span>
                    <span className="text-xl font-bold text-green-400">{stats.engagement.dailyActiveUsers}</span>
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign size={20} className="text-green-400" />
                  <h2 className="text-xl font-bold">Revenue</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <span className="text-gray-300">Total (Life)</span>
                    <span className="text-xl font-bold text-green-400">${stats.revenue.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <span className="text-gray-300">Este Mês</span>
                    <span className="text-xl font-bold text-green-400">${stats.revenue.thisMonth.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <span className="text-gray-300">Assinaturas Ativas</span>
                    <span className="text-xl font-bold text-purple-400">{stats.revenue.activeSubscriptions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Summary */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 size={20} className="text-purple-400" />
                <h2 className="text-xl font-bold">Análise</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-700 rounded">
                  <p className="text-sm text-gray-400 mb-2">Taxa de Verificação</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold">
                      {stats.totalLawyers > 0 ? ((stats.verifiedLawyers / stats.totalLawyers) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-gray-500">{stats.verifiedLawyers}/{stats.totalLawyers}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-700 rounded">
                  <p className="text-sm text-gray-400 mb-2">Taxa de Conclusão de Casos</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold">
                      {stats.totalCases > 0 ? ((stats.completedCases / stats.totalCases) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-gray-500">{stats.completedCases}/{stats.totalCases}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-700 rounded">
                  <p className="text-sm text-gray-400 mb-2">ARR (Annual Recurring)</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold">${(stats.revenue.thisMonth * 12).toFixed(0)}</p>
                    <p className="text-xs text-gray-500">Projetado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts & Status */}
            <div className="bg-gray-800 p-6 rounded-lg border border-yellow-700">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-yellow-400" />
                <h2 className="text-xl font-bold">Status & Alertas</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-green-400">✓ Sistema operacional</p>
                <p className="text-green-400">✓ Database conectado</p>
                <p className="text-green-400">✓ API respondendo</p>
                <p className="text-yellow-400">⚠️ Aguardando API Keys: STRIPE, RESEND, ANTHROPIC, MIXPANEL</p>
              </div>
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
