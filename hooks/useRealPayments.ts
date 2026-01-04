// hooks/useRealPayments.ts
import { useState, useEffect, useCallback } from 'react';
// import { loadStripe } from '@stripe/stripe-js'; // Temporário - dependência não instalada
import { useSession } from 'next-auth/react';

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'annual';
  features: string[];
  popular?: boolean;
}

interface PaymentSession {
  sessionId: string;
  url: string;
  subscriptionId: string;
  planDetails: PaymentPlan;
}

interface SubscriptionStatus {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  plan: string;
  cancelAtPeriodEnd: boolean;
}

interface UseRealPaymentsOptions {
  autoLoadPlans?: boolean;
  enableSubscriptionManagement?: boolean;
}

export function useRealPayments(options: UseRealPaymentsOptions = {}) {
  const { data: session } = useSession();
  const [stripe, setStripe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  
  const {
    autoLoadPlans = true,
    enableSubscriptionManagement = true,
  } = options;

  // 🚨 INICIALIZAR STRIPE (temporário - dependência não instalada)
  useEffect(() => {
    // const initStripe = async () => {
    //   if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    //     const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    //     setStripe(stripeInstance);
    //   }
    // };
    // 
    // initStripe();
    
    // Temporário - simular Stripe carregado
    setStripe({ loaded: true });
  }, []);

  // 🎯 CARREGAR PLANOS DISPONÍVEIS
  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('💳 HOOK PAYMENTS REAL - Carregando planos');
      
      // Planos hardcoded por enquanto (poderia vir da API)
      const availablePlans: PaymentPlan[] = [
        {
          id: 'premium_monthly',
          name: 'Premium',
          price: 99,
          interval: 'monthly',
          features: [
            'Até 20 casos/mês',
            'Análise IA ilimitada',
            'Chat em tempo real',
            'Relatórios avançados',
            'Suporte prioritário',
          ],
        },
        {
          id: 'premium_annual',
          name: 'Premium',
          price: 990,
          interval: 'annual',
          features: [
            'Até 20 casos/mês',
            'Análise IA ilimitada',
            'Chat em tempo real',
            'Relatórios avançados',
            'Suporte prioritário',
            '2 meses grátis',
          ],
          popular: true,
        },
        {
          id: 'featured_monthly',
          name: 'Featured',
          price: 199,
          interval: 'monthly',
          features: [
            'Casos ilimitados',
            'Análise IA ilimitada',
            'Chat em tempo real',
            'Relatórios avançados',
            'Suporte dedicado',
            'Destaque no perfil',
            'Video chamadas',
          ],
        },
        {
          id: 'featured_annual',
          name: 'Featured',
          price: 1990,
          interval: 'annual',
          features: [
            'Casos ilimitados',
            'Análise IA ilimitada',
            'Chat em tempo real',
            'Relatórios avançados',
            'Suporte dedicado',
            'Destaque no perfil',
            'Video chamadas',
            '2 meses grátis',
          ],
        },
      ];

      setPlans(availablePlans);
      console.log('✅ HOOK PAYMENTS REAL - Planos carregados:', availablePlans.length);
      
    } catch (err) {
      console.error('🚨 HOOK PAYMENTS ERROR - Carregando planos:', err);
      setError('Erro ao carregar planos disponíveis');
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚨 CRIAR SESSÃO DE CHECKOUT REAL
  const createCheckoutSession = useCallback(async (
    planId: string,
    interval: 'monthly' | 'annual' = 'monthly'
  ): Promise<PaymentSession | null> => {
    if (!session?.user) {
      setError('Usuário não autenticado');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('💳 HOOK PAYMENTS REAL - Criando checkout:', {
        userId: session.user.id,
        planId,
        interval,
      });

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan: planId.split('_')[0].toUpperCase(),
          interval,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const result = await response.json();
      
      console.log('✅ HOOK PAYMENTS REAL - Checkout criado:', {
        sessionId: result.sessionId,
        subscriptionId: result._meta?.subscriptionId,
        planDetails: result._meta?.planDetails,
      });

      const paymentSession: PaymentSession = {
        sessionId: result.sessionId,
        url: result.url,
        subscriptionId: result._meta?.subscriptionId,
        planDetails: result._meta?.planDetails,
      };

      return paymentSession;

    } catch (err: any) {
      console.error('🚨 HOOK PAYMENTS ERROR - Checkout:', err);
      setError(err.message || 'Erro ao criar sessão de pagamento');
      return null;
    } finally {
      setLoading(false);
    }
  }, [session]);

  // 🎯 REDIRECIONAR PARA CHECKOUT
  const redirectToCheckout = useCallback(async (
    planId: string,
    interval: 'monthly' | 'annual' = 'monthly'
  ): Promise<boolean> => {
    if (!stripe) {
      setError('Stripe não carregado');
      return false;
    }

    const session = await createCheckoutSession(planId, interval);
    
    if (!session) {
      return false;
    }

    try {
      // Redirecionar para o checkout do Stripe
      window.location.href = session.url;
      return true;
    } catch (err) {
      console.error('Erro ao redirecionar para checkout:', err);
      setError('Erro ao redirecionar para página de pagamento');
      return false;
    }
  }, [stripe, createCheckoutSession]);

  // 🚨 CARREGAR STATUS DA ASSINATURA
  const loadSubscriptionStatus = useCallback(async () => {
    if (!session?.user || !enableSubscriptionManagement) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/payments/subscription');
      
      if (response.ok) {
        const subscriptionData = await response.json();
        setSubscription(subscriptionData);
        
        console.log('✅ HOOK PAYMENTS REAL - Status da assinatura:', {
          status: subscriptionData.status,
          plan: subscriptionData.plan,
          currentPeriodEnd: subscriptionData.currentPeriodEnd,
        });
      }
    } catch (err) {
      console.error('Erro ao carregar status da assinatura:', err);
      // Não setar erro aqui, pode ser que usuário não tenha assinatura
    } finally {
      setLoading(false);
    }
  }, [session, enableSubscriptionManagement]);

  // 🎯 CANCELAR ASSINATURA
  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    if (!session?.user) {
      setError('Usuário não autenticado');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/subscription', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      await loadSubscriptionStatus();
      
      console.log('✅ HOOK PAYMENTS REAL - Assinatura cancelada');
      return true;

    } catch (err: any) {
      console.error('🚨 HOOK PAYMENTS ERROR - Cancelar:', err);
      setError(err.message || 'Erro ao cancelar assinatura');
      return false;
    } finally {
      setLoading(false);
    }
  }, [session, loadSubscriptionStatus]);

  // 🚨 CARREGAR HISTÓRICO DE PAGAMENTOS
  const loadPaymentHistory = useCallback(async () => {
    if (!session?.user) {
      return;
    }

    try {
      const response = await fetch('/api/payments/history');
      
      if (response.ok) {
        const history = await response.json();
        setPaymentHistory(history.payments || []);
        
        console.log('✅ HOOK PAYMENTS REAL - Histórico carregado:', history.payments?.length);
      }
    } catch (err) {
      console.error('Erro ao carregar histórico de pagamentos:', err);
    }
  }, [session]);

  // 🎯 CARREGAR DADOS INICIAIS
  useEffect(() => {
    if (autoLoadPlans) {
      loadPlans();
    }
    if (enableSubscriptionManagement && session?.user) {
      loadSubscriptionStatus();
      loadPaymentHistory();
    }
  }, [autoLoadPlans, enableSubscriptionManagement, session, loadPlans, loadSubscriptionStatus, loadPaymentHistory]);

  // 🚨 MÉTRICAS E ESTADOS DERIVADOS
  const metrics = {
    hasActiveSubscription: subscription?.status === 'active',
    isCanceled: subscription?.status === 'canceled',
    isPastDue: subscription?.status === 'past_due',
    daysUntilRenewal: subscription?.currentPeriodEnd 
      ? Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
    totalPayments: paymentHistory.length,
    lastPaymentAmount: paymentHistory[0]?.amount || 0,
  };

  // 🎯 ESTADOS REAIS
  const isReady = !loading && !error && plans.length > 0;
  const canSubscribe: boolean = !!session?.user && !metrics.hasActiveSubscription;
  const canManageSubscription: boolean = !!session?.user && metrics.hasActiveSubscription;

  return {
    // 💳 DADOS
    plans,
    subscription,
    paymentHistory,
    stripe,
    
    // 🔄 ESTADOS
    loading,
    error,
    
    // 🎯 MÉTODOS
    loadPlans,
    createCheckoutSession,
    redirectToCheckout,
    loadSubscriptionStatus,
    cancelSubscription,
    loadPaymentHistory,
    
    // 📊 MÉTRICAS
    metrics,
    
    // 🚨 ESTADOS DERIVADOS
    isReady,
    canSubscribe,
    canManageSubscription,
  };
}

// 🎯 HOOK ESPECÍFICO PARA WEBHOOKS
export function usePaymentWebhooks() {
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const processWebhook = useCallback(async (event: any) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        const result = await response.json();
        setWebhookEvents(prev => [result, ...prev.slice(0, 49)]); // Manter últimas 50
        return result;
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    webhookEvents,
    loading,
    processWebhook,
    clearEvents: () => setWebhookEvents([]),
  };
}
