// lib/analytics/analytics-service.ts
// Serviço de Analytics com Mixpanel

// API Key (deixar vazio para configurar depois)
const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '';

// Verificar se está configurado
export const isAnalyticsConfigured = () => !!MIXPANEL_TOKEN;

// Eventos padronizados
export const AnalyticsEvents = {
  // Página
  PAGE_VIEW: 'Page View',
  
  // Auth
  USER_SIGNED_UP: 'User Signed Up',
  USER_LOGGED_IN: 'User Logged In',
  USER_LOGGED_OUT: 'User Logged Out',
  
  // Casos
  CASE_STARTED: 'Case Started',
  CASE_SUBMITTED: 'Case Submitted',
  CASE_VIEWED: 'Case Viewed',
  
  // Advogados
  LAWYER_PROFILE_VIEWED: 'Lawyer Profile Viewed',
  LAWYER_CONTACTED: 'Lawyer Contacted',
  LAWYER_SEARCH: 'Lawyer Search',
  
  // Matching
  AI_MATCH_REQUESTED: 'AI Match Requested',
  AI_MATCH_COMPLETED: 'AI Match Completed',
  LAWYER_SELECTED: 'Lawyer Selected',
  
  // Pagamentos
  CHECKOUT_STARTED: 'Checkout Started',
  CHECKOUT_COMPLETED: 'Checkout Completed',
  SUBSCRIPTION_CREATED: 'Subscription Created',
  SUBSCRIPTION_CANCELLED: 'Subscription Cancelled',
  
  // Chat
  MESSAGE_SENT: 'Message Sent',
  CHAT_STARTED: 'Chat Started',
  
  // Verificação
  VERIFICATION_SUBMITTED: 'Verification Submitted',
  VERIFICATION_APPROVED: 'Verification Approved',
  
  // Engajamento
  CTA_CLICKED: 'CTA Clicked',
  WHATSAPP_CLICKED: 'WhatsApp Clicked',
  FEATURE_USED: 'Feature Used',
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

// Interface para propriedades de usuário
interface UserProperties {
  $email?: string;
  $name?: string;
  $phone?: string;
  role?: 'CLIENT' | 'LAWYER' | 'ADMIN';
  plan?: string;
  signupDate?: string;
  state?: string;
  verified?: boolean;
  [key: string]: any;
}

// Interface para propriedades de evento
interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

// Cliente Mixpanel (client-side)
class AnalyticsClient {
  private initialized = false;
  private mixpanel: any = null;

  async init() {
    if (this.initialized || typeof window === 'undefined') return;
    
    if (!MIXPANEL_TOKEN) {
      console.log('⚠️ Mixpanel não configurado');
      return;
    }

    try {
      const mixpanel = await import('mixpanel-browser');
      mixpanel.default.init(MIXPANEL_TOKEN, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
      });
      this.mixpanel = mixpanel.default;
      this.initialized = true;
      console.log('✅ Mixpanel inicializado');
    } catch (error) {
      console.error('Erro ao inicializar Mixpanel:', error);
    }
  }

  // Identificar usuário
  identify(userId: string, properties?: UserProperties) {
    if (!this.mixpanel) {
      console.log('[Analytics] identify:', userId, properties);
      return;
    }

    this.mixpanel.identify(userId);
    
    if (properties) {
      this.mixpanel.people.set(properties);
    }
  }

  // Reset (logout)
  reset() {
    if (!this.mixpanel) return;
    this.mixpanel.reset();
  }

  // Trackear evento
  track(event: AnalyticsEvent | string, properties?: EventProperties) {
    const eventData = {
      ...properties,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    if (!this.mixpanel) {
      console.log('[Analytics] track:', event, eventData);
      return;
    }

    this.mixpanel.track(event, eventData);
  }

  // Track page view
  trackPageView(pageName: string, properties?: EventProperties) {
    this.track(AnalyticsEvents.PAGE_VIEW, {
      page: pageName,
      ...properties,
    });
  }

  // Incrementar propriedade numérica do usuário
  increment(property: string, value: number = 1) {
    if (!this.mixpanel) return;
    this.mixpanel.people.increment(property, value);
  }

  // Setar propriedade do usuário uma vez (não sobrescreve)
  setOnce(properties: UserProperties) {
    if (!this.mixpanel) return;
    this.mixpanel.people.set_once(properties);
  }

  // Time event (para medir duração)
  timeEvent(event: AnalyticsEvent | string) {
    if (!this.mixpanel) return;
    this.mixpanel.time_event(event);
  }

  // Registrar super properties (enviadas em todos os eventos)
  registerSuperProperties(properties: EventProperties) {
    if (!this.mixpanel) return;
    this.mixpanel.register(properties);
  }
}

// Singleton
export const analytics = new AnalyticsClient();

// Funções helper
export const trackEvent = (event: AnalyticsEvent | string, properties?: EventProperties) => {
  analytics.track(event, properties);
};

export const identifyUser = (userId: string, properties?: UserProperties) => {
  analytics.identify(userId, properties);
};

export const trackCTAClick = (ctaName: string, location: string) => {
  analytics.track(AnalyticsEvents.CTA_CLICKED, {
    cta_name: ctaName,
    location,
  });
};

export const trackWhatsAppClick = (lawyerId?: string) => {
  analytics.track(AnalyticsEvents.WHATSAPP_CLICKED, {
    lawyer_id: lawyerId,
  });
};

// Server-side tracking (para APIs)
export const serverAnalytics = {
  async track(event: string, distinctId: string, properties?: EventProperties) {
    if (!MIXPANEL_TOKEN) {
      console.log('[Server Analytics]', event, distinctId, properties);
      return;
    }

    try {
      // Usar API HTTP do Mixpanel para server-side
      const data = Buffer.from(JSON.stringify({
        event,
        properties: {
          token: MIXPANEL_TOKEN,
          distinct_id: distinctId,
          time: Date.now(),
          ...properties,
        },
      })).toString('base64');

      await fetch(`https://api.mixpanel.com/track?data=${data}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Server analytics error:', error);
    }
  },
};
