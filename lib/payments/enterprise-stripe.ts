// =============================================================================
// ENTERPRISE STRIPE SERVICE - PAGAMENTOS ROBUSTOS E COMPLETOS
// =============================================================================
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import Redis from 'ioredis';
import { validateSession } from '@/lib/auth/enterprise-auth';

// Redis para cache e filas
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Stripe configurado
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Configurações de pagamento
const PAYMENT_CONFIG = {
  CURRENCY: 'brl',
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // 1 segundo
  WEBHOOK_TIMEOUT: 30000, // 30 segundos
  SUBSCRIPTION_GRACE_PERIOD: 7, // dias
  MINIMUM_AMOUNT: 100, // R$ 1,00
  MAXIMUM_AMOUNT: 10000000, // R$ 100.000,00
  REFUND_WINDOW_DAYS: 30,
  DISPUTE_AUTO_RESPONSE: true
};

// Planos de assinatura
const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'price_basic_monthly',
    name: 'Plano Básico',
    amount: 9700, // R$ 97,00
    currency: 'brl',
    interval: 'month',
    features: [
      'Até 10 casos/mês',
      'Chat ilimitado',
      'Análise de casos básica',
      'Suporte por email'
    ],
    limits: {
      casesPerMonth: 10,
      aiAnalysesPerMonth: 5,
      storageGB: 1
    }
  },
  professional: {
    id: 'price_professional_monthly',
    name: 'Plano Profissional',
    amount: 19700, // R$ 197,00
    currency: 'brl',
    interval: 'month',
    features: [
      'Casos ilimitados',
      'Chat ilimitado',
      'Análise de casos avançada',
      'Videochamadas',
      'Suporte prioritário',
      'API access'
    ],
    limits: {
      casesPerMonth: -1, // ilimitado
      aiAnalysesPerMonth: 50,
      storageGB: 10
    }
  },
  enterprise: {
    id: 'price_enterprise_monthly',
    name: 'Plano Enterprise',
    amount: 49700, // R$ 497,00
    currency: 'brl',
    interval: 'month',
    features: [
      'Tudo do Professional +',
      'White label',
      'Integrações customizadas',
      'Dedicado success manager',
      'SLA garantido',
      'Treinamento equipe'
    ],
    limits: {
      casesPerMonth: -1,
      aiAnalysesPerMonth: -1,
      storageGB: 100
    }
  }
};

export class EnterpriseStripeService {
  private static instance: EnterpriseStripeService;
  
  private constructor() {}

  public static getInstance(): EnterpriseStripeService {
    if (!EnterpriseStripeService.instance) {
      EnterpriseStripeService.instance = new EnterpriseStripeService();
    }
    return EnterpriseStripeService.instance;
  }

  // Criar cliente Stripe
  async createStripeCustomer(lawyerId: string): Promise<Stripe.Customer> {
    try {
      const lawyer = await prisma.lawyer.findUnique({
        where: { id: lawyerId },
        include: { user: true }
      });

      if (!lawyer) {
        throw new Error('Advogado não encontrado');
      }

      // Verificar se já existe cliente
      if (lawyer.user.email) {
        const existingCustomers = await stripe.customers.list({
          email: lawyer.user.email,
          limit: 1
        });

        if (existingCustomers.data.length > 0) {
          return existingCustomers.data[0];
        }
      }

      // Criar novo cliente
      const customer = await stripe.customers.create({
        email: lawyer.user.email,
        name: lawyer.user.name,
        phone: lawyer.user.phone,
        address: {
          line1: lawyer.officeAddress,
          city: lawyer.user.client?.city,
          state: lawyer.user.client?.state,
          postal_code: lawyer.user.client?.zipCode,
          country: 'BR'
        },
        metadata: {
          lawyerId: lawyer.id,
          userId: lawyer.user.id,
          oabNumber: lawyer.oabNumber
        },
        preferred_locales: ['pt-BR']
      });

      // Salvar ID do cliente no banco
      await prisma.lawyer.update({
        where: { id: lawyerId },
        data: { stripeCustomerId: customer.id }
      });

      return customer;

    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Falha ao criar cliente Stripe');
    }
  }

  // Criar assinatura
  async createSubscription(
    lawyerId: string,
    planId: keyof typeof SUBSCRIPTION_PLANS,
    paymentMethodId: string,
    trialDays: number = 0
  ): Promise<Stripe.Subscription> {
    try {
      const lawyer = await prisma.lawyer.findUnique({
        where: { id: lawyerId },
        include: { user: true }
      });

      if (!lawyer) {
        throw new Error('Advogado não encontrado');
      }

      // Criar ou obter cliente Stripe
      let customer = lawyer.stripeCustomerId 
        ? await stripe.customers.retrieve(lawyer.stripeCustomerId) as Stripe.Customer
        : await this.createStripeCustomer(lawyerId);

      // Anexar método de pagamento
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      });

      // Definir como método padrão
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Configuração da assinatura
      const plan = SUBSCRIPTION_PLANS[planId];
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customer.id,
        items: [{ price: plan.id }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
          payment_method_types: ['card']
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          lawyerId: lawyer.id,
          planType: planId
        }
      };

      // Adicionar trial se solicitado
      if (trialDays > 0) {
        subscriptionData.trial_period_days = trialDays;
      }

      // Criar assinatura
      const subscription = await stripe.subscriptions.create(subscriptionData);

      // Salvar no banco
      await prisma.subscription.create({
        data: {
          lawyerId: lawyer.id,
          planId: plan.id,
          stripeId: subscription.id,
          status: this.mapStripeStatus(subscription.status),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
        }
      });

      // Enviar email de boas-vindas
      await this.sendWelcomeEmail(lawyer.user.email, plan.name, trialDays > 0);

      return subscription;

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Falha ao criar assinatura');
    }
  }

  // Atualizar assinatura
  async updateSubscription(
    subscriptionId: string,
    newPlanId: keyof typeof SUBSCRIPTION_PLANS
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const newPlan = SUBSCRIPTION_PLANS[newPlanId];

      // Atualizar assinatura
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPlan.id
        }],
        metadata: {
          ...subscription.metadata,
          planType: newPlanId,
          updated_at: new Date().toISOString()
        }
      });

      // Atualizar no banco
      await prisma.subscription.update({
        where: { stripeId: subscriptionId },
        data: {
          planId: newPlan.id,
          status: this.mapStripeStatus(updatedSubscription.status),
          updatedAt: new Date()
        }
      });

      // Notificar usuário
      const lawyerId = subscription.metadata.lawyerId;
      if (lawyerId) {
        const lawyer = await prisma.lawyer.findUnique({
          where: { id: lawyerId },
          include: { user: true }
        });

        if (lawyer) {
          await this.sendPlanUpdateEmail(lawyer.user.email, newPlan.name);
        }
      }

      return updatedSubscription;

    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Falha ao atualizar assinatura');
    }
  }

  // Cancelar assinatura
  async cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false,
    reason?: string
  ): Promise<Stripe.Subscription> {
    try {
      let canceledSubscription: Stripe.Subscription;

      if (immediate) {
        // Cancelamento imediato
        canceledSubscription = await stripe.subscriptions.cancel(subscriptionId, {
          metadata: {
            ...((await stripe.subscriptions.retrieve(subscriptionId)).metadata),
            canceled_at: new Date().toISOString(),
            cancellation_reason: reason || 'user_requested'
          }
        });
      } else {
        // Cancelar no final do período
        canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
          metadata: {
            ...((await stripe.subscriptions.retrieve(subscriptionId)).metadata),
            scheduled_cancellation: new Date().toISOString(),
            cancellation_reason: reason || 'user_requested'
          }
        });
      }

      // Atualizar no banco
      await prisma.subscription.update({
        where: { stripeId: subscriptionId },
        data: {
          status: this.mapStripeStatus(canceledSubscription.status),
          canceledAt: immediate ? new Date() : null,
          updatedAt: new Date()
        }
      });

      // Enviar email de cancelamento
      const lawyerId = canceledSubscription.metadata.lawyerId;
      if (lawyerId) {
        const lawyer = await prisma.lawyer.findUnique({
          where: { id: lawyerId },
          include: { user: true }
        });

        if (lawyer) {
          await this.sendCancellationEmail(lawyer.user.email, immediate);
        }
      }

      return canceledSubscription;

    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Falha ao cancelar assinatura');
    }
  }

  // Criar pagamento único
  async createPaymentIntent(
    lawyerId: string,
    amount: number,
    description: string,
    metadata: Record<string, string> = {}
  ): Promise<Stripe.PaymentIntent> {
    try {
      // Validar amount
      if (amount < PAYMENT_CONFIG.MINIMUM_AMOUNT || amount > PAYMENT_CONFIG.MAXIMUM_AMOUNT) {
        throw new Error('Valor fora dos limites permitidos');
      }

      const lawyer = await prisma.lawyer.findUnique({
        where: { id: lawyerId },
        include: { user: true }
      });

      if (!lawyer) {
        throw new Error('Advogado não encontrado');
      }

      // Criar cliente se não existir
      if (!lawyer.stripeCustomerId) {
        await this.createStripeCustomer(lawyerId);
      }

      // Criar Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // converter para centavos
        currency: PAYMENT_CONFIG.CURRENCY,
        customer: lawyer.stripeCustomerId!,
        description,
        metadata: {
          lawyerId: lawyer.id,
          userId: lawyer.user.id,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true
        },
        payment_method_options: {
          card: {
            installments: {
              enabled: true,
              max_installments: 12
            }
          }
        }
      });

      // Salvar pagamento pendente
      await prisma.payment.create({
        data: {
          lawyerId: lawyer.id,
          stripeId: paymentIntent.id,
          amount: new Decimal(amount),
          currency: PAYMENT_CONFIG.CURRENCY,
          status: 'PENDING',
          type: 'OTHER',
          description,
          metadata: JSON.stringify(paymentIntent.metadata)
        }
      });

      return paymentIntent;

    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Falha ao criar pagamento');
    }
  }

  // Processar reembolso
  async createRefund(
    paymentId: string,
    amount?: number,
    reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' = 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment || !payment.stripeId) {
        throw new Error('Pagamento não encontrado');
      }

      // Verificar janela de reembolso
      const paymentDate = payment.createdAt;
      const daysSincePayment = Math.floor((Date.now() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSincePayment > PAYMENT_CONFIG.REFUND_WINDOW_DAYS) {
        throw new Error('Fora da janela de reembolso');
      }

      // Criar reembolso
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: payment.stripeId,
        reason,
        metadata: {
          original_payment_id: payment.id,
          refunded_by: 'system',
          refund_reason: reason
        }
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);

      // Atualizar pagamento
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: refund.status === 'succeeded' ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refundedAmount: new Decimal(refund.amount / 100),
          refundedAt: new Date()
        }
      });

      // Notificar usuário
      if (payment.lawyerId) {
        const lawyer = await prisma.lawyer.findUnique({
          where: { id: payment.lawyerId },
          include: { user: true }
        });

        if (lawyer) {
          await this.sendRefundEmail(lawyer.user.email, refund.amount / 100);
        }
      }

      return refund;

    } catch (error) {
      console.error('Error creating refund:', error);
      throw new Error('Falha ao processar reembolso');
    }
  }

  // Webhook handler
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
          
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
          
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
          
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;
          
        case 'charge.dispute.created':
          await this.handleDisputeCreated(event.data.object as Stripe.Dispute);
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  // Handlers específicos de webhook
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;

    const subscription = await prisma.subscription.findUnique({
      where: { stripeId: invoice.subscription as string },
      include: { lawyer: { include: { user: true } } }
    });

    if (!subscription) return;

    // Atualizar status
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    });

    // Enviar confirmação
    await this.sendPaymentConfirmationEmail(
      subscription.lawyer.user.email,
      invoice.amount_paid / 100,
      invoice.currency
    );
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (!invoice.subscription) return;

    const subscription = await prisma.subscription.findUnique({
      where: { stripeId: invoice.subscription as string },
      include: { lawyer: { include: { user: true } } }
    });

    if (!subscription) return;

    // Atualizar status
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAST_DUE',
        updatedAt: new Date()
      }
    });

    // Enviar alerta de pagamento
    await this.sendPaymentFailedEmail(
      subscription.lawyer.user.email,
      invoice.amount_due / 100
    );

    // Agendar retry automático
    await this.schedulePaymentRetry(subscription.id);
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    await prisma.subscription.upsert({
      where: { stripeId: stripeSubscription.id },
      update: {
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        updatedAt: new Date()
      },
      create: {
        lawyerId: stripeSubscription.metadata.lawyerId,
        planId: stripeSubscription.items.data[0].price.id,
        stripeId: stripeSubscription.id,
        status: this.mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
      }
    });
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    await prisma.subscription.update({
      where: { stripeId: stripeSubscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await prisma.payment.updateMany({
      where: { stripeId: paymentIntent.id },
      data: {
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await prisma.payment.updateMany({
      where: { stripeId: paymentIntent.id },
      data: {
        status: 'FAILED',
        failureReason: paymentIntent.last_payment_error?.message || 'Unknown error',
        updatedAt: new Date()
      }
    });
  }

  private async handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    // Log de disputa
    console.warn(`Dispute created: ${dispute.id} for charge ${dispute.charge}`);
    
    // Na implementação real, notificar equipe financeira
    // e possivelmente criar ticket no sistema de suporte
    
    if (PAYMENT_CONFIG.DISPUTE_AUTO_RESPONSE) {
      // Resposta automática inicial
      await this.autoRespondToDispute(dispute);
    }
  }

  // Métodos utilitários
  private mapStripeStatus(stripeStatus: string): string {
    const statusMap: Record<string, string> = {
      'trialing': 'TRIALING',
      'active': 'ACTIVE',
      'past_due': 'PAST_DUE',
      'canceled': 'CANCELED',
      'unpaid': 'UNPAID',
      'incomplete': 'PENDING',
      'incomplete_expired': 'CANCELED'
    };
    
    return statusMap[stripeStatus] || 'UNKNOWN';
  }

  private async schedulePaymentRetry(subscriptionId: string): Promise<void> {
    // Implementar lógica de retry com exponential backoff
    for (let attempt = 1; attempt <= PAYMENT_CONFIG.MAX_RETRY_ATTEMPTS; attempt++) {
      const delay = PAYMENT_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
      
      setTimeout(async () => {
        try {
          // Tentar cobrar novamente
          await this.retryPayment(subscriptionId);
        } catch (error) {
          console.error(`Retry attempt ${attempt} failed:`, error);
        }
      }, delay);
    }
  }

  private async retryPayment(subscriptionId: string): Promise<void> {
    // Lógica de retry de pagamento
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) return;

    // Na implementação real, usar Stripe API para tentar cobrar
    console.log(`Retrying payment for subscription ${subscriptionId}`);
  }

  // Métodos de email (simulados)
  private async sendWelcomeEmail(email: string, planName: string, hasTrial: boolean): Promise<void> {
    console.log(`📧 Welcome email sent to ${email} - Plan: ${planName}, Trial: ${hasTrial}`);
    // Implementar com SendGrid/SES na produção
  }

  private async sendPlanUpdateEmail(email: string, newPlanName: string): Promise<void> {
    console.log(`📧 Plan update email sent to ${email} - New plan: ${newPlanName}`);
    // Implementar com SendGrid/SES na produção
  }

  private async sendCancellationEmail(email: string, immediate: boolean): Promise<void> {
    console.log(`📧 Cancellation email sent to ${email} - Immediate: ${immediate}`);
    // Implementar com SendGrid/SES na produção
  }

  private async sendPaymentConfirmationEmail(email: string, amount: number, currency: string): Promise<void> {
    console.log(`📧 Payment confirmation sent to ${email} - Amount: ${amount} ${currency}`);
    // Implementar com SendGrid/SES na produção
  }

  private async sendPaymentFailedEmail(email: string, amount: number): Promise<void> {
    console.log(`📧 Payment failed email sent to ${email} - Amount: ${amount}`);
    // Implementar com SendGrid/SES na produção
  }

  private async sendRefundEmail(email: string, amount: number): Promise<void> {
    console.log(`📧 Refund email sent to ${email} - Amount: ${amount}`);
    // Implementar com SendGrid/SES na produção
  }

  private async autoRespondToDispute(dispute: Stripe.Dispute): Promise<void> {
    console.log(`🤖 Auto-responding to dispute ${dispute.id}`);
    // Implementar lógica de resposta automática
  }

  // Métodos públicos
  public getPlans() {
    return SUBSCRIPTION_PLANS;
  }

  public async getSubscriptionStatus(lawyerId: string): Promise<any> {
    const subscription = await prisma.subscription.findFirst({
      where: { 
        lawyerId,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] }
      },
      include: {
        lawyer: {
          include: { user: true }
        }
      }
    });

    if (!subscription) {
      return { status: 'NO_SUBSCRIPTION' };
    }

    return {
      status: subscription.status,
      plan: subscription.planId,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialEnd: subscription.trialEnd,
      cancelAtPeriodEnd: subscription.canceledAt !== null
    };
  }

  public async getPaymentHistory(lawyerId: string, limit: number = 50): Promise<any[]> {
    return await prisma.payment.findMany({
      where: { lawyerId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

export const stripeService = EnterpriseStripeService.getInstance();
