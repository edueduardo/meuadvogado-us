// lib/stripe/stripe-service.ts
// Stripe Service - Pagamentos, Subscriptions, Webhooks

import Stripe from 'stripe';

// Inicializar Stripe (deixar API key vazia para configurar depois)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Verificar se Stripe está configurado
export const isStripeConfigured = () => !!STRIPE_SECRET_KEY;

// Cliente Stripe (só cria se configurado)
const stripe = STRIPE_SECRET_KEY 
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' as any })
  : null;

// Planos disponíveis
export const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    priceId: '', // Será preenchido após criar no Stripe
    features: [
      '3 leads por mês',
      'Perfil básico',
      'Chat com clientes',
      'Suporte por email',
    ],
    limits: {
      leadsPerMonth: 3,
      featuredProfile: false,
      verifiedBadge: false,
      priorityMatching: false,
      analytics: false,
    },
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 199,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
    features: [
      'Leads ilimitados',
      'Perfil destacado',
      'Badge verificado',
      'Prioridade no matching',
      'Analytics avançados',
      'Suporte prioritário',
    ],
    limits: {
      leadsPerMonth: -1, // ilimitado
      featuredProfile: true,
      verifiedBadge: true,
      priorityMatching: true,
      analytics: true,
    },
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    features: [
      'Tudo do Professional',
      'Primeiro nos resultados',
      'API de integração',
      'White-label disponível',
      'Account manager dedicado',
      'Marketing co-branded',
    ],
    limits: {
      leadsPerMonth: -1,
      featuredProfile: true,
      verifiedBadge: true,
      priorityMatching: true,
      analytics: true,
      apiAccess: true,
      dedicatedSupport: true,
    },
  },
};

export type PlanId = keyof typeof PLANS;

// Serviço Stripe
export const stripeService = {
  // Verificar se está configurado
  isConfigured: () => isStripeConfigured(),

  // Criar sessão de checkout
  async createCheckoutSession({
    userId,
    email,
    planId,
    successUrl,
    cancelUrl,
  }: {
    userId: string;
    email: string;
    planId: PlanId;
    successUrl: string;
    cancelUrl: string;
  }) {
    if (!stripe) {
      console.warn('⚠️ Stripe não configurado');
      return { url: null, error: 'Stripe não configurado' };
    }

    const plan = PLANS[planId];
    if (!plan || !plan.priceId) {
      return { url: null, error: 'Plano inválido ou não configurado' };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        customer_email: email,
        client_reference_id: userId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planId,
        },
        subscription_data: {
          metadata: {
            userId,
            planId,
          },
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });

      return { url: session.url, sessionId: session.id, error: null };
    } catch (error: any) {
      console.error('Erro ao criar checkout:', error);
      return { url: null, error: error.message };
    }
  },

  // Criar portal do cliente (gerenciar assinatura)
  async createPortalSession({
    customerId,
    returnUrl,
  }: {
    customerId: string;
    returnUrl: string;
  }) {
    if (!stripe) {
      return { url: null, error: 'Stripe não configurado' };
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return { url: session.url, error: null };
    } catch (error: any) {
      console.error('Erro ao criar portal:', error);
      return { url: null, error: error.message };
    }
  },

  // Buscar assinatura do cliente
  async getSubscription(subscriptionId: string) {
    if (!stripe) return null;

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Erro ao buscar subscription:', error);
      return null;
    }
  },

  // Cancelar assinatura
  async cancelSubscription(subscriptionId: string, immediately = false) {
    if (!stripe) {
      return { success: false, error: 'Stripe não configurado' };
    }

    try {
      if (immediately) {
        await stripe.subscriptions.cancel(subscriptionId);
      } else {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao cancelar subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Reativar assinatura cancelada
  async reactivateSubscription(subscriptionId: string) {
    if (!stripe) {
      return { success: false, error: 'Stripe não configurado' };
    }

    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Buscar cliente por email
  async getCustomerByEmail(email: string) {
    if (!stripe) return null;

    try {
      const customers = await stripe.customers.list({
        email,
        limit: 1,
      });
      return customers.data[0] || null;
    } catch (error) {
      console.error('Erro ao buscar customer:', error);
      return null;
    }
  },

  // Criar cliente
  async createCustomer({
    email,
    name,
    metadata,
  }: {
    email: string;
    name: string;
    metadata?: Record<string, string>;
  }) {
    if (!stripe) return null;

    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });
      return customer;
    } catch (error) {
      console.error('Erro ao criar customer:', error);
      return null;
    }
  },

  // Verificar assinatura de webhook
  constructWebhookEvent(payload: string | Buffer, signature: string) {
    if (!stripe || !STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe webhook não configurado');
    }

    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  },

  // Buscar faturas do cliente
  async getInvoices(customerId: string, limit = 10) {
    if (!stripe) return [];

    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit,
      });
      return invoices.data;
    } catch (error) {
      console.error('Erro ao buscar invoices:', error);
      return [];
    }
  },

  // Upgrade de plano
  async upgradePlan({
    subscriptionId,
    newPriceId,
  }: {
    subscriptionId: string;
    newPriceId: string;
  }) {
    if (!stripe) {
      return { success: false, error: 'Stripe não configurado' };
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      });

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tipos de eventos de webhook
export type StripeWebhookEvent = 
  | 'checkout.session.completed'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed';

// Handler de webhooks
export async function handleStripeWebhook(
  event: Stripe.Event,
  handlers: {
    onCheckoutComplete?: (session: Stripe.Checkout.Session) => Promise<void>;
    onSubscriptionCreated?: (subscription: Stripe.Subscription) => Promise<void>;
    onSubscriptionUpdated?: (subscription: Stripe.Subscription) => Promise<void>;
    onSubscriptionDeleted?: (subscription: Stripe.Subscription) => Promise<void>;
    onPaymentSucceeded?: (invoice: Stripe.Invoice) => Promise<void>;
    onPaymentFailed?: (invoice: Stripe.Invoice) => Promise<void>;
  }
) {
  switch (event.type) {
    case 'checkout.session.completed':
      if (handlers.onCheckoutComplete) {
        await handlers.onCheckoutComplete(event.data.object as Stripe.Checkout.Session);
      }
      break;
    case 'customer.subscription.created':
      if (handlers.onSubscriptionCreated) {
        await handlers.onSubscriptionCreated(event.data.object as Stripe.Subscription);
      }
      break;
    case 'customer.subscription.updated':
      if (handlers.onSubscriptionUpdated) {
        await handlers.onSubscriptionUpdated(event.data.object as Stripe.Subscription);
      }
      break;
    case 'customer.subscription.deleted':
      if (handlers.onSubscriptionDeleted) {
        await handlers.onSubscriptionDeleted(event.data.object as Stripe.Subscription);
      }
      break;
    case 'invoice.payment_succeeded':
      if (handlers.onPaymentSucceeded) {
        await handlers.onPaymentSucceeded(event.data.object as Stripe.Invoice);
      }
      break;
    case 'invoice.payment_failed':
      if (handlers.onPaymentFailed) {
        await handlers.onPaymentFailed(event.data.object as Stripe.Invoice);
      }
      break;
  }
}
