export const PLANS = {
  FREE: {
    name: 'Gratuito',
    price: 0,
    priceId: null,
    features: [
      'Perfil no diretório',
      '1 área de atuação',
      'Contato básico',
    ],
    limits: {
      practiceAreas: 1,
      leadsPerMonth: 0,
      featured: false,
    }
  },
  PREMIUM: {
    name: 'Premium',
    price: 199,
    priceId: process.env.STRIPE_PRICE_PREMIUM,
    stripePriceId: 'price_1Oxxxx', // Atualizar
    features: [
      'Tudo do Gratuito',
      'Até 5 áreas de atuação',
      'Badge "Premium"',
      'Prioridade na busca',
      'Até 10 leads/mês',
      'Analytics básico',
    ],
    limits: {
      practiceAreas: 5,
      leadsPerMonth: 10,
      featured: false,
    }
  },
  FEATURED: {
    name: 'Destaque',
    price: 399,
    priceId: process.env.STRIPE_PRICE_FEATURED,
    stripePriceId: 'price_1Oxxxx', // Atualizar
    features: [
      'Tudo do Premium',
      'Áreas ilimitadas',
      'Topo da cidade',
      'Badge "Verificado"',
      'Leads ilimitados',
      'Analytics completo',
      'Suporte prioritário',
    ],
    limits: {
      practiceAreas: 999,
      leadsPerMonth: 999,
      featured: true,
    }
  }
};

export function getPlanLimits(plan: string) {
  return PLANS[plan as keyof typeof PLANS].limits;
}

export function canAddPracticeArea(plan: string, currentAreas: number): boolean {
  return currentAreas < getPlanLimits(plan).practiceAreas;
}

export function canReceiveLeads(plan: string, leadsThisMonth: number): boolean {
  return leadsThisMonth < getPlanLimits(plan).leadsPerMonth;
}
