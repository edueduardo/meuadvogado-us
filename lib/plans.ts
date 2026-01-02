// lib/plans.ts
// Sistema de planos SIMPLIFICADO (sem créditos confusos)
// FREE → PREMIUM → FEATURED

export interface LawyerPlan {
  id: string;
  name: string;
  namePt: string;
  price: number;
  priceAnnual: number;
  features: string[];
  featuresPt: string[];
  highlighted?: boolean;
  stripePriceIdMonthly?: string;
  stripePriceIdAnnual?: string;
}

export const LAWYER_PLANS: LawyerPlan[] = [
  {
    id: "free",
    name: "Free",
    namePt: "Gratuito",
    price: 0,
    priceAnnual: 0,
    features: [
      "Basic profile listing",
      "Receive lead notifications",
      "Must upgrade to view leads",
      "Email support",
    ],
    featuresPt: [
      "Perfil básico no diretório",
      "Recebe notificação de leads",
      "Precisa upgrade para ver leads",
      "Suporte por email",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    namePt: "Premium",
    price: 14900, // $149/mês
    priceAnnual: 142800, // $1,428/ano (~20% desconto)
    features: [
      "Enhanced profile with photos",
      "UNLIMITED lead views ✓",
      "Priority search ranking",
      "Verified badge",
      "Response to reviews",
      "Analytics dashboard",
      "Priority support",
    ],
    featuresPt: [
      "Perfil completo com fotos",
      "Visualizações ILIMITADAS de leads ✓",
      "Destaque na busca",
      "Selo de verificado",
      "Responder avaliações",
      "Painel de estatísticas",
      "Suporte prioritário",
    ],
    highlighted: true,
    stripePriceIdMonthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    stripePriceIdAnnual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
  },
  {
    id: "featured",
    name: "Featured",
    namePt: "Destaque",
    price: 29900, // $299/mês
    priceAnnual: 286800, // $2,868/ano (~20% desconto)
    features: [
      "Everything in Premium",
      "Unlimited lead views",
      "TOP position in search ⭐",
      "Featured badge",
      "Homepage showcase",
      "Social media promotion",
      "Dedicated account manager",
      "Priority lead distribution",
    ],
    featuresPt: [
      "Tudo do Premium",
      "Visualizações ilimitadas de leads",
      "TOPO dos resultados de busca ⭐",
      "Selo de destaque",
      "Destaque na página inicial",
      "Promoção em redes sociais",
      "Gerente de conta dedicado",
      "Prioridade nos leads",
    ],
    stripePriceIdMonthly: process.env.STRIPE_FEATURED_MONTHLY_PRICE_ID,
    stripePriceIdAnnual: process.env.STRIPE_FEATURED_ANNUAL_PRICE_ID,
  },
];

// Pacotes de leads avulsos (pay-per-lead)
export interface LeadPackage {
  id: string;
  name: string;
  namePt: string;
  leads: number;
  price: number;
  pricePerLead: number;
  stripePriceId?: string;
}

export const LEAD_PACKAGES: LeadPackage[] = [
  {
    id: "lead_1",
    name: "1 Lead",
    namePt: "1 Lead",
    leads: 1,
    price: 2000, // $20
    pricePerLead: 2000,
    stripePriceId: process.env.STRIPE_LEAD_1_PRICE_ID,
  },
  {
    id: "lead_5",
    name: "5 Leads",
    namePt: "5 Leads",
    leads: 5,
    price: 9000, // $90 = $18/lead
    pricePerLead: 1800,
    stripePriceId: process.env.STRIPE_LEAD_5_PRICE_ID,
  },
  {
    id: "lead_10",
    name: "10 Leads",
    namePt: "10 Leads",
    leads: 10,
    price: 15000, // $150 = $15/lead
    pricePerLead: 1500,
    stripePriceId: process.env.STRIPE_LEAD_10_PRICE_ID,
  },
];

export function getPlanById(id: string): LawyerPlan | undefined {
  return LAWYER_PLANS.find((p) => p.id === id);
}

export function getLeadPackageById(id: string): LeadPackage | undefined {
  return LEAD_PACKAGES.find((p) => p.id === id);
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}`;
}

export function formatPricePt(cents: number): string {
  if (cents === 0) return "Grátis";
  return `$${(cents / 100).toFixed(0)}`;
}

export function canViewLeads(plan: string): boolean {
  return plan === "PREMIUM" || plan === "FEATURED";
}

export function getLeadPriority(plan: string): number {
  switch (plan) {
    case "FEATURED":
      return 3; // Highest priority
    case "PREMIUM":
      return 2;
    case "FREE":
      return 1;
    default:
      return 0;
  }
}
