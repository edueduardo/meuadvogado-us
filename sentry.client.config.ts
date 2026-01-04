// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    
    // Performance Monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],
    
    // Filters
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
    
    beforeSend(event, hint) {
      // Filtrar erros de desenvolvimento
      if (SENTRY_ENVIRONMENT === 'development') {
        console.log('Sentry event (dev):', event);
        return null;
      }
      
      // Adicionar contexto extra
      if (event.user) {
        event.user.ip_address = '{{auto}}';
      }
      
      return event;
    },
  });
}
