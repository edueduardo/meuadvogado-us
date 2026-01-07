// lib/features/feature-flags.ts
// Sistema de Feature Flags e Gating por Plano

// Planos disponíveis
export type PlanType = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

// Features disponíveis
export const Features = {
  // Básico (todos os planos)
  BASIC_PROFILE: 'basic_profile',
  CHAT_WITH_CLIENTS: 'chat_with_clients',
  RECEIVE_CASES: 'receive_cases',
  EMAIL_SUPPORT: 'email_support',
  
  // Professional+
  UNLIMITED_LEADS: 'unlimited_leads',
  FEATURED_PROFILE: 'featured_profile',
  VERIFIED_BADGE: 'verified_badge',
  PRIORITY_MATCHING: 'priority_matching',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  PRIORITY_SUPPORT: 'priority_support',
  WHATSAPP_NOTIFICATIONS: 'whatsapp_notifications',
  
  // Enterprise
  TOP_SEARCH_RESULTS: 'top_search_results',
  API_ACCESS: 'api_access',
  WHITE_LABEL: 'white_label',
  DEDICATED_MANAGER: 'dedicated_manager',
  CO_BRANDED_MARKETING: 'co_branded_marketing',
  CUSTOM_INTEGRATIONS: 'custom_integrations',
} as const;

export type Feature = typeof Features[keyof typeof Features];

// Limites por plano
export const PlanLimits: Record<PlanType, {
  leadsPerMonth: number;
  messagesPerDay: number;
  profileViews: number;
  responseTime: string;
}> = {
  STARTER: {
    leadsPerMonth: 3,
    messagesPerDay: 20,
    profileViews: 100,
    responseTime: '48h',
  },
  PROFESSIONAL: {
    leadsPerMonth: -1, // ilimitado
    messagesPerDay: -1,
    profileViews: -1,
    responseTime: '24h',
  },
  ENTERPRISE: {
    leadsPerMonth: -1,
    messagesPerDay: -1,
    profileViews: -1,
    responseTime: '4h',
  },
};

// Features por plano
export const PlanFeatures: Record<PlanType, Feature[]> = {
  STARTER: [
    Features.BASIC_PROFILE,
    Features.CHAT_WITH_CLIENTS,
    Features.RECEIVE_CASES,
    Features.EMAIL_SUPPORT,
  ],
  PROFESSIONAL: [
    // Inclui tudo do Starter
    Features.BASIC_PROFILE,
    Features.CHAT_WITH_CLIENTS,
    Features.RECEIVE_CASES,
    Features.EMAIL_SUPPORT,
    // Extras Professional
    Features.UNLIMITED_LEADS,
    Features.FEATURED_PROFILE,
    Features.VERIFIED_BADGE,
    Features.PRIORITY_MATCHING,
    Features.ADVANCED_ANALYTICS,
    Features.PRIORITY_SUPPORT,
    Features.WHATSAPP_NOTIFICATIONS,
  ],
  ENTERPRISE: [
    // Inclui tudo do Professional
    Features.BASIC_PROFILE,
    Features.CHAT_WITH_CLIENTS,
    Features.RECEIVE_CASES,
    Features.EMAIL_SUPPORT,
    Features.UNLIMITED_LEADS,
    Features.FEATURED_PROFILE,
    Features.VERIFIED_BADGE,
    Features.PRIORITY_MATCHING,
    Features.ADVANCED_ANALYTICS,
    Features.PRIORITY_SUPPORT,
    Features.WHATSAPP_NOTIFICATIONS,
    // Extras Enterprise
    Features.TOP_SEARCH_RESULTS,
    Features.API_ACCESS,
    Features.WHITE_LABEL,
    Features.DEDICATED_MANAGER,
    Features.CO_BRANDED_MARKETING,
    Features.CUSTOM_INTEGRATIONS,
  ],
};

// Serviço de Feature Flags
export const featureService = {
  // Verificar se plano tem feature
  hasFeature(plan: PlanType, feature: Feature): boolean {
    return PlanFeatures[plan]?.includes(feature) ?? false;
  },

  // Obter todas as features de um plano
  getFeatures(plan: PlanType): Feature[] {
    return PlanFeatures[plan] || [];
  },

  // Obter limites de um plano
  getLimits(plan: PlanType) {
    return PlanLimits[plan];
  },

  // Verificar se atingiu limite
  isWithinLimit(plan: PlanType, metric: keyof typeof PlanLimits['STARTER'], currentValue: number): boolean {
    const limit = PlanLimits[plan][metric];
    if (typeof limit === 'number' && limit === -1) return true; // ilimitado
    if (typeof limit === 'number') return currentValue < limit;
    return true;
  },

  // Obter próximo plano (para upgrade)
  getNextPlan(currentPlan: PlanType): PlanType | null {
    const order: PlanType[] = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
    const currentIndex = order.indexOf(currentPlan);
    return currentIndex < order.length - 1 ? order[currentIndex + 1] : null;
  },

  // Obter features que faltam para upgrade
  getMissingFeatures(currentPlan: PlanType, targetPlan: PlanType): Feature[] {
    const currentFeatures = new Set(PlanFeatures[currentPlan]);
    return PlanFeatures[targetPlan].filter(f => !currentFeatures.has(f));
  },

  // Verificar se pode fazer ação baseado no plano
  canPerformAction(plan: PlanType, action: string, context?: Record<string, any>): {
    allowed: boolean;
    reason?: string;
    upgradeRequired?: PlanType;
  } {
    switch (action) {
      case 'send_unlimited_messages':
        if (plan === 'STARTER') {
          return {
            allowed: false,
            reason: 'Plano Starter limitado a 20 mensagens/dia',
            upgradeRequired: 'PROFESSIONAL',
          };
        }
        return { allowed: true };

      case 'receive_unlimited_leads':
        if (plan === 'STARTER') {
          return {
            allowed: false,
            reason: 'Plano Starter limitado a 3 leads/mês',
            upgradeRequired: 'PROFESSIONAL',
          };
        }
        return { allowed: true };

      case 'access_analytics':
        if (!this.hasFeature(plan, Features.ADVANCED_ANALYTICS)) {
          return {
            allowed: false,
            reason: 'Analytics avançados disponíveis no plano Professional',
            upgradeRequired: 'PROFESSIONAL',
          };
        }
        return { allowed: true };

      case 'use_api':
        if (!this.hasFeature(plan, Features.API_ACCESS)) {
          return {
            allowed: false,
            reason: 'Acesso à API disponível apenas no plano Enterprise',
            upgradeRequired: 'ENTERPRISE',
          };
        }
        return { allowed: true };

      default:
        return { allowed: true };
    }
  },
};

// Descrições das features para UI
export const FeatureDescriptions: Record<Feature, {
  name: string;
  description: string;
  icon: string;
}> = {
  [Features.BASIC_PROFILE]: {
    name: 'Perfil Básico',
    description: 'Crie seu perfil com informações profissionais',
    icon: '👤',
  },
  [Features.CHAT_WITH_CLIENTS]: {
    name: 'Chat com Clientes',
    description: 'Converse com clientes pela plataforma',
    icon: '💬',
  },
  [Features.RECEIVE_CASES]: {
    name: 'Receber Casos',
    description: 'Receba casos compatíveis com seu perfil',
    icon: '📋',
  },
  [Features.EMAIL_SUPPORT]: {
    name: 'Suporte por Email',
    description: 'Suporte via email em até 48h',
    icon: '📧',
  },
  [Features.UNLIMITED_LEADS]: {
    name: 'Leads Ilimitados',
    description: 'Receba leads sem limite mensal',
    icon: '♾️',
  },
  [Features.FEATURED_PROFILE]: {
    name: 'Perfil Destacado',
    description: 'Apareça em destaque nas buscas',
    icon: '⭐',
  },
  [Features.VERIFIED_BADGE]: {
    name: 'Badge Verificado',
    description: 'Selo de advogado verificado no perfil',
    icon: '✅',
  },
  [Features.PRIORITY_MATCHING]: {
    name: 'Matching Prioritário',
    description: 'Prioridade no algoritmo de matching',
    icon: '🎯',
  },
  [Features.ADVANCED_ANALYTICS]: {
    name: 'Analytics Avançados',
    description: 'Métricas detalhadas do seu perfil',
    icon: '📊',
  },
  [Features.PRIORITY_SUPPORT]: {
    name: 'Suporte Prioritário',
    description: 'Resposta em até 24h',
    icon: '🚀',
  },
  [Features.WHATSAPP_NOTIFICATIONS]: {
    name: 'Notificações WhatsApp',
    description: 'Alertas de casos no WhatsApp',
    icon: '📱',
  },
  [Features.TOP_SEARCH_RESULTS]: {
    name: 'Primeiro nos Resultados',
    description: 'Apareça no topo das buscas',
    icon: '🏆',
  },
  [Features.API_ACCESS]: {
    name: 'Acesso à API',
    description: 'Integre com seus sistemas',
    icon: '🔌',
  },
  [Features.WHITE_LABEL]: {
    name: 'White Label',
    description: 'Personalize com sua marca',
    icon: '🏷️',
  },
  [Features.DEDICATED_MANAGER]: {
    name: 'Account Manager',
    description: 'Gerente de conta dedicado',
    icon: '👔',
  },
  [Features.CO_BRANDED_MARKETING]: {
    name: 'Marketing Co-branded',
    description: 'Campanhas conjuntas de marketing',
    icon: '📢',
  },
  [Features.CUSTOM_INTEGRATIONS]: {
    name: 'Integrações Customizadas',
    description: 'Desenvolvimento de integrações sob medida',
    icon: '🔧',
  },
};
