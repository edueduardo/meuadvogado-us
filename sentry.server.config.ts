// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    
    // Performance Monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Integrations
    integrations: [
      Sentry.prismaIntegration(),
      Sentry.postgresIntegration(),
    ],
    
    beforeSend(event, hint) {
      // Filtrar erros de desenvolvimento
      if (SENTRY_ENVIRONMENT === 'development') {
        console.log('Sentry server event (dev):', event);
        return null;
      }
      
      // Remover dados sensíveis
      if (event.request?.data) {
        const data = event.request.data;
        if (typeof data === 'object' && data !== null) {
          const safeData = data as Record<string, any>;
          delete safeData.password;
          delete safeData.token;
          delete safeData.apiKey;
          event.request.data = safeData;
        }
      }
      
      return event;
    },
  });
}
