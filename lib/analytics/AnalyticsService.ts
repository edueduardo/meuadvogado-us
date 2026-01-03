// =============================================================================
// LEGALAI - ANALYTICS & MONITORING SERVICE
// =============================================================================
import { prisma } from '@/lib/prisma';

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCases: number;
  openCases: number;
  closedCases: number;
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
  avgCaseValue: number;
  topPracticeAreas: Array<{
    area: string;
    count: number;
    percentage: number;
  }>;
  userGrowth: Array<{
    month: string;
    users: number;
    cases: number;
  }>;
  revenueGrowth: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface UserMetrics {
  totalCases: number;
  wonCases: number;
  lostCases: number;
  pendingCases: number;
  totalRevenue: number;
  avgResponseTime: number;
  clientSatisfaction: number;
  profileViews: number;
  conversionRate: number;
}

export interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  databaseConnections: number;
  cacheHitRate: number;
  storageUsed: number;
  bandwidthUsed: number;
}

export class AnalyticsService {
  // Dashboard Metrics for Admin
  async getDashboardMetrics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<DashboardMetrics> {
    const dateFilter = this.getDateFilter(timeRange);

    const [
      totalUsers,
      activeUsers,
      totalCases,
      openCases,
      closedCases,
      totalRevenue,
      monthlyRevenue,
      practiceAreas,
      userGrowth,
      revenueGrowth,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getActiveUsers(dateFilter),
      this.getTotalCases(),
      this.getOpenCases(),
      this.getClosedCases(),
      this.getTotalRevenue(),
      this.getMonthlyRevenue(),
      this.getTopPracticeAreas(),
      this.getUserGrowth(timeRange),
      this.getRevenueGrowth(timeRange),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalCases,
      openCases,
      closedCases,
      totalRevenue,
      monthlyRevenue,
      conversionRate: this.calculateConversionRate(totalCases, totalUsers),
      avgCaseValue: this.calculateAvgCaseValue(totalRevenue, closedCases),
      topPracticeAreas: practiceAreas,
      userGrowth,
      revenueGrowth,
    };
  }

  // User-specific Metrics
  async getUserMetrics(userId: string, userRole: 'LAWYER' | 'CLIENT'): Promise<UserMetrics> {
    if (userRole === 'LAWYER') {
      return this.getLawyerMetrics(userId);
    } else {
      return this.getClientMetrics(userId);
    }
  }

  private async getLawyerMetrics(lawyerId: string): Promise<UserMetrics> {
    const [
      totalCases,
      wonCases,
      lostCases,
      pendingCases,
      totalRevenue,
      avgResponseTime,
      clientSatisfaction,
      profileViews,
    ] = await Promise.all([
      prisma.case.count({ where: { matchedLawyerId: lawyerId } }),
      this.getWonCases(lawyerId),
      this.getLostCases(lawyerId),
      this.getPendingCases(lawyerId),
      this.getLawyerRevenue(lawyerId),
      this.getAvgResponseTime(lawyerId),
      this.getClientSatisfaction(lawyerId),
      this.getProfileViews(lawyerId),
    ]);

    return {
      totalCases,
      wonCases,
      lostCases,
      pendingCases,
      totalRevenue,
      avgResponseTime,
      clientSatisfaction,
      profileViews,
      conversionRate: this.calculateConversionRate(wonCases, totalCases),
    };
  }

  private async getClientMetrics(clientId: string): Promise<UserMetrics> {
    const [
      totalCases,
      wonCases,
      lostCases,
      pendingCases,
      totalSpent,
    ] = await Promise.all([
      prisma.case.count({ where: { clientId } }),
      this.getClientWonCases(clientId),
      this.getClientLostCases(clientId),
      this.getClientPendingCases(clientId),
      this.getClientSpent(clientId),
    ]);

    return {
      totalCases,
      wonCases,
      lostCases,
      pendingCases,
      totalRevenue: totalSpent,
      avgResponseTime: 0, // Not applicable for clients
      clientSatisfaction: 0, // Not applicable for clients
      profileViews: 0, // Not applicable for clients
      conversionRate: this.calculateConversionRate(wonCases, totalCases),
    };
  }

  // System Health Metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const [
      uptime,
      responseTime,
      errorRate,
      activeConnections,
      databaseConnections,
      cacheHitRate,
      storageUsed,
      bandwidthUsed,
    ] = await Promise.all([
      this.getUptime(),
      this.getAvgResponseTime(),
      this.getErrorRate(),
      this.getActiveConnections(),
      this.getDatabaseConnections(),
      this.getCacheHitRate(),
      this.getStorageUsed(),
      this.getBandwidthUsed(),
    ]);

    return {
      uptime,
      responseTime,
      errorRate,
      activeConnections,
      databaseConnections,
      cacheHitRate,
      storageUsed,
      bandwidthUsed,
    };
  }

  // Real-time Analytics
  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    onlineLawyers: number;
    onlineClients: number;
    activeConversations: number;
    messagesPerMinute: number;
    casesPerHour: number;
  }> {
    const [
      activeUsers,
      onlineLawyers,
      onlineClients,
      activeConversations,
      messagesPerMinute,
      casesPerHour,
    ] = await Promise.all([
      this.getActiveUsersNow(),
      this.getOnlineLawyers(),
      this.getOnlineClients(),
      this.getActiveConversations(),
      this.getMessagesPerMinute(),
      this.getCasesPerHour(),
    ]);

    return {
      activeUsers,
      onlineLawyers,
      onlineClients,
      activeConversations,
      messagesPerMinute,
      casesPerHour,
    };
  }

  // Business Intelligence
  async getBusinessIntelligence(): Promise<{
    marketTrends: Array<{
      practiceArea: string;
      growth: number;
      demand: 'high' | 'medium' | 'low';
    }>;
    competitorAnalysis: Array<{
      competitor: string;
      marketShare: number;
      strengths: string[];
      weaknesses: string[];
    }>;
    revenueForecast: Array<{
      month: string;
      projected: number;
      actual: number;
      confidence: number;
    }>;
    churnPrediction: {
      atRiskUsers: string[];
      riskFactors: string[];
      recommendations: string[];
    };
  }> {
    // Implement sophisticated BI algorithms
    return {
      marketTrends: await this.analyzeMarketTrends(),
      competitorAnalysis: await this.analyzeCompetitors(),
      revenueForecast: await this.forecastRevenue(),
      churnPrediction: await this.predictChurn(),
    };
  }

  // Helper Methods
  private getDateFilter(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private async getTotalUsers(): Promise<number> {
    return prisma.user.count();
  }

  private async getActiveUsers(dateFilter: Date): Promise<number> {
    return prisma.user.count({
      where: {
        updatedAt: { gte: dateFilter },
      },
    });
  }

  private async getTotalCases(): Promise<number> {
    return prisma.case.count();
  }

  private async getOpenCases(): Promise<number> {
    return prisma.case.count({
      where: {
        status: { in: ['NEW', 'ANALYZING', 'ANALYZED', 'MATCHED', 'CONTACTED'] },
      },
    });
  }

  private async getClosedCases(): Promise<number> {
    return prisma.case.count({
      where: {
        status: { in: ['CONVERTED', 'CLOSED'] },
      },
    });
  }

  private async getTotalRevenue(): Promise<number> {
    const payments = await prisma.payment.findMany({
      where: { status: 'completed' },
      select: { amount: true },
    });
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  private async getMonthlyRevenue(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: startOfMonth },
      },
      select: { amount: true },
    });
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  private async getTopPracticeAreas(): Promise<Array<{ area: string; count: number; percentage: number }>> {
    // Temporário - implementação simplificada
    return [
      { area: 'Imigração', count: 45, percentage: 35 },
      { area: 'Família', count: 30, percentage: 23 },
      { area: 'Criminal', count: 25, percentage: 19 },
      { area: 'Trabalhista', count: 20, percentage: 15 },
      { area: 'Civil', count: 10, percentage: 8 },
    ];
  }

  private async getUserGrowth(timeRange: string): Promise<Array<{ month: string; users: number; cases: number }>> {
    // Implement monthly growth calculation
    const months = this.getMonthsInRange(timeRange);
    const growth = [];

    for (const month of months) {
      const [users, cases] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: month.start,
              lt: month.end,
            },
          },
        }),
        prisma.case.count({
          where: {
            createdAt: {
              gte: month.start,
              lt: month.end,
            },
          },
        }),
      ]);

      growth.push({
        month: month.name,
        users,
        cases,
      });
    }

    return growth;
  }

  private async getRevenueGrowth(timeRange: string): Promise<Array<{ month: string; revenue: number }>> {
    const months = this.getMonthsInRange(timeRange);
    const growth = [];

    for (const month of months) {
      const payments = await prisma.payment.findMany({
        where: {
          status: 'completed',
          createdAt: {
            gte: month.start,
            lt: month.end,
          },
        },
        select: { amount: true },
      });

      const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      growth.push({
        month: month.name,
        revenue,
      });
    }

    return growth;
  }

  private getMonthsInRange(timeRange: string): Array<{ name: string; start: Date; end: Date }> {
    const months = [];
    const now = new Date();
    const monthsCount = timeRange === '7d' ? 1 : timeRange === '30d' ? 1 : timeRange === '90d' ? 3 : 12;

    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      
      months.push({
        name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        start,
        end,
      });
    }

    return months;
  }

  private calculateConversionRate(successful: number, total: number): number {
    return total > 0 ? (successful / total) * 100 : 0;
  }

  private calculateAvgCaseValue(totalRevenue: number, closedCases: number): number {
    return closedCases > 0 ? totalRevenue / closedCases : 0;
  }

  // Placeholder methods for complex analytics
  private async getWonCases(lawyerId: string): Promise<number> {
    return prisma.case.count({
      where: { lawyerId, status: 'CONVERTED' },
    });
  }

  private async getLostCases(lawyerId: string): Promise<number> {
    return prisma.case.count({
      where: { lawyerId, status: 'CLOSED' },
    });
  }

  private async getPendingCases(lawyerId: string): Promise<number> {
    return prisma.case.count({
      where: { 
        lawyerId, 
        status: { in: ['NEW', 'ANALYZING', 'ANALYZED', 'MATCHED', 'CONTACTED'] },
      },
    });
  }

  private async getLawyerRevenue(lawyerId: string): Promise<number> {
    // Implement based on payment sharing model
    return 0;
  }

  private async getAvgResponseTime(lawyerId: string): Promise<number> {
    // Calculate average response time for messages
    return 0;
  }

  private async getClientSatisfaction(lawyerId: string): Promise<number> {
    // Calculate average rating from reviews
    // const lawyer = await prisma.lawyer.findUnique({
    //   where: { id: lawyerId },
    //   select: { rating: true },
    // });
    // return lawyer?.rating || 0;
    return 4.5; // Temporário até adicionar campo rating
  }

  private async getProfileViews(lawyerId: string): Promise<number> {
    // Track profile views from audit logs
    return 0;
  }

  // System metrics placeholders
  private async getUptime(): Promise<number> {
    return 99.9;
  }

  private async getAvgResponseTime(): Promise<number> {
    return 150; // ms
  }

  private async getErrorRate(): Promise<number> {
    return 0.1; // percentage
  }

  private async getActiveConnections(): Promise<number> {
    return 150;
  }

  private async getDatabaseConnections(): Promise<number> {
    return 20;
  }

  private async getCacheHitRate(): Promise<number> {
    return 95.5; // percentage
  }

  private async getStorageUsed(): Promise<number> {
    return 2.5; // GB
  }

  private async getBandwidthUsed(): Promise<number> {
    return 50; // GB
  }

  // Real-time metrics placeholders
  private async getActiveUsersNow(): Promise<number> {
    return 45;
  }

  private async getOnlineLawyers(): Promise<number> {
    return 12;
  }

  private async getOnlineClients(): Promise<number> {
    return 33;
  }

  private async getActiveConversations(): Promise<number> {
    return 28;
  }

  private async getMessagesPerMinute(): Promise<number> {
    return 15;
  }

  private async getCasesPerHour(): Promise<number> {
    return 3;
  }

  // Business Intelligence placeholders
  private async analyzeMarketTrends(): Promise<any[]> {
    return [];
  }

  private async analyzeCompetitors(): Promise<any[]> {
    return [];
  }

  private async forecastRevenue(): Promise<any[]> {
    return [];
  }

  private async predictChurn(): Promise<any> {
    return {
      atRiskUsers: [],
      riskFactors: [],
      recommendations: [],
    };
  }

  // Client-specific methods
  private async getClientWonCases(clientId: string): Promise<number> {
    return prisma.case.count({
      where: { clientId, status: 'CONVERTED' },
    });
  }

  private async getClientLostCases(clientId: string): Promise<number> {
    return prisma.case.count({
      where: { clientId, status: 'CLOSED' },
    });
  }

  private async getClientPendingCases(clientId: string): Promise<number> {
    return prisma.case.count({
      where: { 
        clientId, 
        status: { in: ['NEW', 'ANALYZING', 'ANALYZED', 'MATCHED', 'CONTACTED'] },
      },
    });
  }

  private async getClientSpent(clientId: string): Promise<number> {
    return 0; // Implement based on payment tracking
  }
}

export const analyticsService = new AnalyticsService();
