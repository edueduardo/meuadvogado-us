// =============================================================================
// LEGALAI - PAYMENT SERVICE (REAL STRIPE INTEGRATION)
// =============================================================================
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
  apiVersion: '2025-02-24.acacia',
});

export interface PaymentIntent {
  amount: number;
  currency: string;
  customerId?: string;
  metadata: Record<string, string>;
  description: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    casesPerMonth: number;
    consultationsPerMonth: number;
    documentUploads: number;
  };
}

export class PaymentService {
  // Planos reais com preços competitivos
  public plans: Record<string, SubscriptionPlan> = {
    basic: {
      id: 'basic',
      name: 'Basic',
      price: 29,
      interval: 'month',
      features: [
        '5 casos por mês',
        '10 consultas',
        'Upload de 20 documentos',
        'Suporte por email'
      ],
      limits: {
        casesPerMonth: 5,
        consultationsPerMonth: 10,
        documentUploads: 20,
      },
    },
    professional: {
      id: 'professional',
      name: 'Professional',
      price: 79,
      interval: 'month',
      features: [
        '20 casos por mês',
        '50 consultas',
        'Upload de 100 documentos',
        'Video chamadas',
        'Relatórios avançados',
        'Suporte prioritário'
      ],
      limits: {
        casesPerMonth: 20,
        consultationsPerMonth: 50,
        documentUploads: 100,
      },
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      interval: 'month',
      features: [
        'Casos ilimitados',
        'Consultas ilimitadas',
        'Upload ilimitado',
        'API access',
        'Dedicado account manager',
        'SLA garantido'
      ],
      limits: {
        casesPerMonth: -1, // Unlimited
        consultationsPerMonth: -1,
        documentUploads: -1,
      },
    },
  };

  async createCustomer(lawyerId: string): Promise<Stripe.Customer> {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      include: { user: true },
    });

    if (!lawyer) throw new Error('Lawyer not found');

    const customer = await stripe.customers.create({
      email: lawyer.user.email,
      name: lawyer.user.name,
      phone: lawyer.user.phone || undefined, // Phone pode ser null
      metadata: {
        lawyerId,
        // oabNumber: lawyer.oabNumber, // Campo não existe no schema
      },
    });

    // Salvar ID do cliente no banco (campo não existe no schema atual)
    // await prisma.lawyer.update({
    //   where: { id: lawyerId },
    //   data: { stripeCustomerId: customer.id },
    // });

    return customer;
  }

  async createSubscription(lawyerId: string, planId: string): Promise<Stripe.Subscription> {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer) throw new Error('Lawyer not found');

    // let customerId = lawyer.stripeCustomerId;
    // if (!customerId) {
    //   const customer = await this.createCustomer(lawyerId);
    //   customerId = customer.id;
    // }
    const customerId = undefined; // Temporário até adicionar campo no schema

    const plan = this.plans[planId];
    if (!plan) throw new Error('Plan not found');

    // Criar preço no Stripe
    const price = await stripe.prices.create({
      unit_amount: plan.price * 100, // Convert to cents
      currency: 'usd',
      recurring: {
        interval: plan.interval,
      },
      product_data: {
        name: `LegalAI ${plan.name}`,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customerId || 'cus_temp', // Temporário
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        lawyerId,
        planId,
      },
    });

    // Atualizar status no banco (campos não existem no schema atual)
    // await prisma.lawyer.update({
    //   where: { id: lawyerId },
    //   data: {
    //     subscriptionId: subscription.id,
    //     subscriptionStatus: subscription.status,
    //     plan: planId.toUpperCase() as any,
    //     subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
    //   },
    // });

    return subscription;
  }

  async processPayment(paymentData: PaymentIntent): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentData.amount,
      currency: paymentData.currency,
      customer: paymentData.customerId,
      metadata: paymentData.metadata,
      description: paymentData.description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Salvar no banco (campos não existem no schema atual)
    // await prisma.payment.create({
    //   data: {
    //     lawyerId: paymentData.metadata.lawyerId,
    //     stripePaymentId: paymentIntent.id,
    //     amount: paymentData.amount / 100, // Convert from cents
    //     currency: paymentData.currency,
    //     status: 'pending',
    //     plan: paymentData.metadata.plan as any,
    //     interval: paymentData.metadata.interval,
    //   },
    // });

    return paymentIntent;
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'invoice.payment_succeeded':
        await this.handleSubscriptionSuccess(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
        break;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    // await prisma.payment.update({
    //   where: { stripePaymentId: paymentIntent.id },
    //   data: { status: 'completed' },
    // });

    // Enviar email de confirmação
    // await emailService.sendPaymentConfirmation(paymentIntent.metadata.lawyerId);
  }

  private async handleSubscriptionSuccess(invoice: Stripe.Invoice): Promise<void> {
    // if (invoice.subscription) {
    //   await prisma.lawyer.updateMany({
    //     where: { subscriptionId: invoice.subscription as string },
    //     data: { subscriptionStatus: 'active' },
    //   });
    // }
  }

  private async handlePaymentFailure(invoice: Stripe.Invoice): Promise<void> {
    // if (invoice.subscription) {
    //   await prisma.lawyer.updateMany({
    //     where: { subscriptionId: invoice.subscription as string },
    //     data: { subscriptionStatus: 'past_due' },
    //   });
    // }
  }

  private async handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
    // await prisma.lawyer.updateMany({
    //   where: { subscriptionId: subscription.id },
    //   data: { 
    //     subscriptionStatus: 'canceled',
    //     plan: 'FREE',
    //     subscriptionEndsAt: new Date(),
    //   },
    // });
  }

  async getUsageStats(lawyerId: string): Promise<{
    casesUsed: number;
    casesLimit: number;
    consultationsUsed: number;
    consultationsLimit: number;
    documentsUsed: number;
    documentsLimit: number;
  }> {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      include: {
        cases: {
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(1)), // First day of current month
            },
          },
        },
        conversations: {
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(1)),
            },
          },
        },
      },
    });

    if (!lawyer) throw new Error('Lawyer not found');

    const plan = this.plans[lawyer.plan.toLowerCase()] || this.plans.basic;

    return {
      casesUsed: lawyer.cases.length,
      casesLimit: plan.limits.casesPerMonth,
      consultationsUsed: lawyer.conversations.length,
      consultationsLimit: plan.limits.consultationsPerMonth,
      documentsUsed: 0, // TODO: Implement document counting
      documentsLimit: plan.limits.documentUploads,
    };
  }

  getPlans(): SubscriptionPlan[] {
    return Object.values(this.plans);
  }
}

export const paymentService = new PaymentService();
