// hooks/useRealAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

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
  insights?: string[];
  trends?: {
    userGrowth: number;
    caseGrowth: number;
    revenueGrowth: number;
  };
}

interface UseRealAnalyticsOptions {
  timeframe?: '7d' | '30d' | '90d' | '1y';
  lawyerId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useRealAnalytics(options: UseRealAnalyticsOptions = {}) {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const {
    timeframe = '30d',
    lawyerId,
    autoRefresh = true,
    refreshInterval = 30000, // 30 segundos
  } = options;

  const fetchAnalytics = useCallback(async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeframe,
        ...(lawyerId && { lawyerId }),
      });

      console.log('📊 HOOK REAL - Buscando analytics:', {
        userId: session.user.id,
        timeframe,
        lawyerId,
      });

      const response = await fetch(`/api/analytics/dashboard?${params}`);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ HOOK REAL - Analytics recebidos:', {
        totalUsers: result.analytics.totalUsers,
        activeCases: result.analytics.activeCases,
        revenue: result.analytics.revenue,
        serviceUsed: result._meta?.serviceUsed,
      });

      setData(result.analytics);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('🚨 HOOK ANALYTICS ERROR:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  }, [session, timeframe, lawyerId]);

  // 🚨 AUTO-REFRESH REAL
  useEffect(() => {
    fetchAnalytics();

    if (autoRefresh) {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAnalytics, autoRefresh, refreshInterval]);

  // 🎯 MÉTODO PARA FORÇAR REFRESH
  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // 🎯 MÉTODO PARA ATUALIZAR TIMEFRAME
  const updateTimeframe = useCallback((newTimeframe: UseRealAnalyticsOptions['timeframe']) => {
    // Este método atualizaria o estado do pai se necessário
    fetchAnalytics();
  }, [fetchAnalytics]);

  // 🚨 CÁLCULOS DERIVADOS EM TEMPO REAL
  const metrics = {
    // Performance indicators
    isPerformingWell: data ? (data.conversionRate > 0.1 && data.clientSatisfaction > 4.0) : false,
    needsAttention: data ? (data.conversionRate < 0.05 || data.clientSatisfaction < 3.5) : false,
    
    // Growth indicators
    isGrowing: data?.trends ? (
      data.trends.userGrowth > 0 && 
      data.trends.caseGrowth > 0 && 
      data.trends.revenueGrowth > 0
    ) : false,
    
    // Real-time alerts
    alerts: data ? [
      ...(data.realtime?.pendingCases && data.realtime.pendingCases > 10 
        ? ['Alto número de casos pendentes'] 
        : []),
      ...(data.realtime?.activeUsers && data.realtime.activeUsers < 5 
        ? ['Baixo número de usuários ativos'] 
        : []),
      ...(data.avgResponseTime > 24 
        ? ['Tempo de resposta acima do esperado'] 
        : []),
    ] : [],
  };

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    updateTimeframe,
    metrics,
    // 🎯 ESTADOS REAIS
    isRealData: !!data,
    isStale: lastUpdated ? (Date.now() - lastUpdated.getTime()) > 60000 : false, // 1 minuto
  };
}

// 🎯 HOOK ESPECÍFICO PARA MÉTRICAS DE PERFORMANCE
export function usePerformanceMetrics(lawyerId?: string) {
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    conversionRate: 0,
    satisfaction: 0,
    casesPerMonth: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: 'performance',
          timeframe: '30d',
          filters: lawyerId ? { lawyerId } : {},
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMetrics(result.metrics);
      }
    } catch (error) {
      console.error('Performance metrics error:', error);
    } finally {
      setLoading(false);
    }
  }, [lawyerId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, refresh: fetchMetrics };
}
