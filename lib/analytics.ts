/**
 * SERVIÇO DE ANALYTICS - MÉTRICAS E DASHBOARDS
 * 
 * Funcionalidades:
 * - KPIs de leads e conversões
 * - Métricas de receita
 * - Análise de tendências
 * - Gráficos e relatórios
 * - Cache de dados
 */

import { prisma } from './prisma'
import { startOfDay, endOfDay, subDays, subMonths, format } from 'date-fns'

export interface KPIMetrics {
  totalLeads: number
  activeLeads: number
  convertedLeads: number
  conversionRate: number
  totalRevenue: number
  averageRevenuePerLead: number
  activeLawyers: number
  totalClients: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
    tension?: number
  }[]
}

export interface AnalyticsData {
  kpis: KPIMetrics
  leadsChart: ChartData
  revenueChart: ChartData
  conversionChart: ChartData
  topPracticeAreas: Array<{
    name: string
    leads: number
    conversions: number
    revenue: number
  }>
  topLawyers: Array<{
    name: string
    leads: number
    conversions: number
    revenue: number
    conversionRate: number
  }>
}

/**
 * Obtém KPIs gerais do sistema
 */
export async function getKPIMetrics(
  dateFrom?: Date,
  dateTo?: Date
): Promise<KPIMetrics> {
  const dateFilter = dateFrom || dateTo ? {
    createdAt: {
      gte: dateFrom || subDays(new Date(), 30),
      lte: dateTo || new Date()
    }
  } : {}

  const [
    totalLeads,
    activeLeads,
    convertedLeads,
    totalRevenue,
    activeLawyers,
    totalClients
  ] = await Promise.all([
    prisma.case.count({
      where: dateFilter
    }),
    prisma.case.count({
      where: {
        ...dateFilter,
        status: { in: ['NEW', 'ANALYZING', 'ANALYZED', 'MATCHED', 'CONTACTED'] }
      }
    }),
    prisma.case.count({
      where: {
        ...dateFilter,
        status: 'CONVERTED'
      }
    }),
    prisma.payment.aggregate({
      where: {
        status: 'completed',
        createdAt: dateFilter.createdAt || undefined
      },
      _sum: { amount: true }
    }),
    prisma.lawyer.count({
      where: {
        active: true,
        verified: true
      }
    }),
    prisma.client.count()
  ])

  const conversionRate = totalLeads > 0 
    ? Math.round((convertedLeads / totalLeads) * 100)
    : 0

  const revenue = totalRevenue._sum.amount || 0
  const averageRevenuePerLead = convertedLeads > 0 
    ? Math.round(revenue / convertedLeads)
    : 0

  return {
    totalLeads,
    activeLeads,
    convertedLeads,
    conversionRate,
    totalRevenue: revenue,
    averageRevenuePerLead,
    activeLawyers,
    totalClients
  }
}

/**
 * Obtém dados de leads para gráfico
 */
export async function getLeadsChartData(days: number = 30): Promise<ChartData> {
  const data = []
  const labels = []

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const [total, converted] = await Promise.all([
      prisma.case.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      }),
      prisma.case.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          },
          status: 'CONVERTED'
        }
      })
    ])

    labels.push(format(date, 'dd/MM'))
    data.push({ total, converted })
  }

  return {
    labels,
    datasets: [
      {
        label: 'Total de Leads',
        data: data.map((d: any) => d.total),
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        tension: 0.4
      },
      {
        label: 'Convertidos',
        data: data.map((d: any) => d.converted),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        tension: 0.4
      }
    ]
  }
}

/**
 * Obtém dados de receita para gráfico
 */
export async function getRevenueChartData(months: number = 6): Promise<ChartData> {
  const data = []
  const labels = []

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const revenue = await prisma.payment.aggregate({
      where: {
        status: 'completed',
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      _sum: { amount: true }
    })

    labels.push(format(date, 'MMM/yyyy'))
    data.push(revenue._sum.amount || 0)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Receita (R$)',
        data,
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderColor: 'rgba(168, 85, 247, 1)',
        tension: 0.4
      }
    ]
  }
}

/**
 * Obtém dados de conversão para gráfico
 */
export async function getConversionChartData(days: number = 30): Promise<ChartData> {
  const data = []
  const labels = []

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    const dayStart = startOfDay(date)
    const dayEnd = endOfDay(date)

    const [total, converted] = await Promise.all([
      prisma.case.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      }),
      prisma.case.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          },
          status: 'CONVERTED'
        }
      })
    ])

    const rate = total > 0 ? Math.round((converted / total) * 100) : 0
    labels.push(format(date, 'dd/MM'))
    data.push(rate)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Taxa de Conversão (%)',
        data,
        backgroundColor: 'rgba(251, 146, 60, 0.2)',
        borderColor: 'rgba(251, 146, 60, 1)',
        tension: 0.4
      }
    ]
  }
}

/**
 * Obtém áreas de prática mais populares
 */
export async function getTopPracticeAreas(limit: number = 10): Promise<Array<{
  name: string
  leads: number
  conversions: number
  revenue: number
}>> {
  const practiceAreas = await prisma.practiceArea.findMany({
    include: {
      cases: true
    }
  })

  const results = practiceAreas.map((area: any) => {
    const leads = area.cases.length
    const conversions = area.cases.filter((c: any) => c.status === 'CONVERTED').length
    // Simplificado: calcular receita baseado em estimativa
    const revenue = conversions * 500 // Estimativa de R$500 por conversão

    return {
      name: area.name,
      leads,
      conversions,
      revenue
    }
  })

  return results
    .sort((a: any, b: any) => b.leads - a.leads)
    .slice(0, limit)
}

/**
 * Obtém advogados com melhor performance
 */
export async function getTopLawyers(limit: number = 10): Promise<Array<{
  name: string
  leads: number
  conversions: number
  revenue: number
  conversionRate: number
}>> {
  const lawyers = await prisma.lawyer.findMany({
    where: { active: true },
    include: {
      user: { select: { name: true } },
      cases: true
    },
    take: limit * 2 // Pegar mais para filtrar depois
  })

  const results = lawyers.map((lawyer: any) => {
    const leads = lawyer.cases.length
    const conversions = lawyer.cases.filter((c: any) => c.status === 'CONVERTED').length
    const conversionRate = leads > 0 ? Math.round((conversions / leads) * 100) : 0
    // Simplificado: calcular receita baseado em estimativa
    const revenue = conversions * 500 // Estimativa de R$500 por conversão

    return {
      name: lawyer.user.name || 'Nome não disponível',
      leads,
      conversions,
      revenue,
      conversionRate
    }
  })

  return results
    .filter((l: any) => l.leads > 0) // Apenas com leads
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, limit)
}

/**
 * Obtém dados completos para o dashboard
 */
export async function getAnalyticsData(
  options: {
    days?: number
    months?: number
    dateFrom?: Date
    dateTo?: Date
  } = {}
): Promise<AnalyticsData> {
  const { days = 30, months = 6, dateFrom, dateTo } = options

  const [
    kpis,
    leadsChart,
    revenueChart,
    conversionChart,
    topPracticeAreas,
    topLawyers
  ] = await Promise.all([
    getKPIMetrics(dateFrom, dateTo),
    getLeadsChartData(days),
    getRevenueChartData(months),
    getConversionChartData(days),
    getTopPracticeAreas(),
    getTopLawyers()
  ])

  return {
    kpis,
    leadsChart,
    revenueChart,
    conversionChart,
    topPracticeAreas,
    topLawyers
  }
}

/**
 * Obtém métricas de um advogado específico
 */
export async function getLawyerAnalytics(
  lawyerId: string,
  days: number = 30
): Promise<{
  leads: number
  conversions: number
  conversionRate: number
  revenue: number
  averageResponseTime: number
  rating: number
}> {
  const dateFrom = subDays(new Date(), days)

  const [
    leads,
    conversions,
    revenueResult,
    avgRating,
    responseTime
  ] = await Promise.all([
    prisma.case.count({
      where: {
        matchedLawyerId: lawyerId,
        createdAt: { gte: dateFrom }
      }
    }),
    prisma.case.count({
      where: {
        matchedLawyerId: lawyerId,
        status: 'CONVERTED',
        createdAt: { gte: dateFrom }
      }
    }),
    prisma.payment.aggregate({
      where: {
        lawyerId,
        status: 'completed',
        createdAt: { gte: dateFrom }
      },
      _sum: { amount: true }
    }),
    prisma.review.aggregate({
      where: { lawyerId },
      _avg: { rating: true }
    }),
    prisma.lawyer.findUnique({
      where: { id: lawyerId },
      select: { responseTime: true }
    })
  ])

  const conversionRate = leads > 0 
    ? Math.round((conversions / leads) * 100)
    : 0

  const revenue = revenueResult._sum.amount || 0
  const rating = Math.round(avgRating._avg.rating || 0)
  const averageResponseTime = responseTime?.responseTime || 0

  return {
    leads,
    conversions,
    conversionRate,
    revenue,
    averageResponseTime,
    rating
  }
}

// Exportar funções principais
export default {
  getAnalyticsData,
  getKPIMetrics,
  getLeadsChartData,
  getRevenueChartData,
  getConversionChartData,
  getTopPracticeAreas,
  getTopLawyers,
  getLawyerAnalytics
}
