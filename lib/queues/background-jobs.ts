// lib/queues/background-jobs.ts
// Background Jobs com Bull Queue - Processamento Assíncrono

import Bull, { Job, Queue } from 'bull';
import { redisService } from '@/lib/redis/upstash-redis';
import { emailService } from '@/lib/email/resend-service';
import { prisma } from '@/lib/prisma';

// Verificar se Redis está configurado
const REDIS_CONFIGURED = !!(process.env.REDIS_HOST || process.env.REDIS_URL);

// Configuração do Redis para Bull (só usa se configurado)
const redisConfig = REDIS_CONFIGURED ? {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
} : null;

// Tipos de Jobs
export enum JobType {
  SEND_EMAIL = 'send-email',
  PROCESS_WEBHOOK = 'process-webhook',
  CLEANUP_TOKENS = 'cleanup-tokens',
  GENERATE_REPORT = 'generate-report',
  UPDATE_ANALYTICS = 'update-analytics',
  SEND_NOTIFICATIONS = 'send-notifications',
}

// Interfaces de Jobs
export interface EmailJobData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
}

export interface WebhookJobData {
  event: string;
  data: any;
  retries?: number;
}

export interface CleanupJobData {
  type: 'password-tokens' | 'expired-sessions' | 'old-logs';
}

export interface ReportJobData {
  userId: string;
  type: 'monthly' | 'weekly' | 'daily';
  format: 'pdf' | 'csv' | 'json';
}

export interface NotificationJobData {
  userIds: string[];
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

// Filas
const queues: Record<string, Queue> = {};

// Inicializar filas
export function initializeQueues() {
  // Só inicializa se Redis estiver configurado
  if (!REDIS_CONFIGURED || !redisConfig) {
    console.log('⚠️ Redis não configurado - Background jobs desabilitados (usando fallback em memória)');
    return;
  }

  // Fila de Emails
  queues.email = new Bull(JobType.SEND_EMAIL, {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  });

  // Fila de Webhooks
  queues.webhooks = new Bull(JobType.PROCESS_WEBHOOK, {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  });

  // Fila de Manutenção
  queues.maintenance = new Bull('maintenance', {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 10,
      removeOnFail: 10,
      attempts: 1,
    },
  });

  // Fila de Relatórios
  queues.reports = new Bull(JobType.GENERATE_REPORT, {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 25,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
    },
  });

  // Fila de Notificações
  queues.notifications = new Bull(JobType.SEND_NOTIFICATIONS, {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 200,
      removeOnFail: 100,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1500,
      },
    },
  });

  // Setup processadores
  setupProcessors();
  
  console.log('✅ Background queues initialized');
}

// Processadores de Jobs
function setupProcessors() {
  // Processador de Emails
  queues.email.process(5, async (job: Job<EmailJobData>) => {
    const { to, subject, html, text, template, data } = job.data;
    
    try {
      if (template) {
        // Usar template específico
        switch (template) {
          case 'welcome':
            await emailService.sendWelcome(to, data?.name, data?.planName, data?.hasTrial);
            break;
          case 'password-reset':
            await emailService.sendPasswordReset({
              to,
              name: data?.name,
              resetUrl: data?.resetUrl,
              expiresHours: data?.expiresHours,
            });
            break;
          case 'payment-confirmation':
            await emailService.sendPaymentConfirmation(to, data?.name, data?.amount, data?.currency);
            break;
          default:
            await emailService.send({ to, subject, html: html || '', text });
        }
      } else {
        // Email genérico
        await emailService.send({ to, subject, html: html || '', text });
      }
      
      console.log(`✅ Email sent to ${to}`);
      return { success: true, sentTo: to };
    } catch (error) {
      console.error(`❌ Email failed to ${to}:`, error);
      throw error;
    }
  });

  // Processador de Webhooks
  queues.webhooks.process(3, async (job: Job<WebhookJobData>) => {
    const { event, data, retries = 0 } = job.data;
    
    try {
      console.log(`🔄 Processing webhook: ${event}`);
      
      // Processar diferentes tipos de webhooks
      switch (event) {
        case 'stripe.payment_intent.succeeded':
          await handlePaymentSuccess(data);
          break;
        case 'stripe.invoice.payment_failed':
          await handlePaymentFailed(data);
          break;
        case 'stripe.customer.subscription.created':
          await handleSubscriptionCreated(data);
          break;
        case 'user.registered':
          await handleUserRegistered(data);
          break;
        default:
          console.log(`ℹ️ Unknown webhook event: ${event}`);
      }
      
      return { success: true, event, processedAt: new Date() };
    } catch (error) {
      console.error(`❌ Webhook processing failed:`, error);
      
      // Retry logic
      if (retries < 3) {
        job.data.retries = retries + 1;
        throw error; // Bull vai retry automaticamente
      } else {
        // Log final failure
        await logWebhookFailure(event, data, error);
        throw error;
      }
    }
  });

  // Processador de Manutenção
  queues.maintenance.process(1, async (job: Job<CleanupJobData>) => {
    const { type } = job.data;
    
    try {
      switch (type) {
        case 'password-tokens':
          await cleanupPasswordTokens();
          break;
        case 'expired-sessions':
          await cleanupExpiredSessions();
          break;
        case 'old-logs':
          await cleanupOldLogs();
          break;
      }
      
      return { success: true, type, cleanedAt: new Date() };
    } catch (error) {
      console.error(`❌ Maintenance failed:`, error);
      throw error;
    }
  });

  // Processador de Relatórios
  queues.reports.process(2, async (job: Job<ReportJobData>) => {
    const { userId, type, format } = job.data;
    
    try {
      const report = await generateReport(userId, type, format);
      
      return { 
        success: true, 
        userId, 
        type, 
        format, 
        reportUrl: report.url,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error(`❌ Report generation failed:`, error);
      throw error;
    }
  });

  // Processador de Notificações
  queues.notifications.process(10, async (job: Job<NotificationJobData>) => {
    const { userIds, title, message, type } = job.data;
    
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notification = await createNotification({
          userId,
          title,
          message,
          type,
        });
        notifications.push(notification);
      }
      
      console.log(`✅ Sent ${notifications.length} notifications`);
      return { success: true, sentCount: notifications.length };
    } catch (error) {
      console.error(`❌ Notification sending failed:`, error);
      throw error;
    }
  });

  // Error handlers
  Object.values(queues).forEach(queue => {
    queue.on('error', (error) => {
      console.error(`❌ Queue error:`, error);
    });

    queue.on('waiting', (jobId) => {
      console.log(`⏳ Job ${jobId} waiting`);
    });

    queue.on('active', (job) => {
      console.log(`🔄 Processing job ${job.id} (${job.name})`);
    });

    queue.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed`);
    });

    queue.on('failed', (job, error) => {
      console.error(`❌ Job ${job.id} failed:`, error);
    });
  });
}

// Funções auxiliares
async function handlePaymentSuccess(data: any) {
  // Lógica de pagamento sucesso
  console.log('💰 Payment succeeded:', data);
  // Poderia enviar email de confirmação, atualizar dashboard, etc.
}

async function handlePaymentFailed(data: any) {
  // Lógica de pagamento falhou
  console.log('❌ Payment failed:', data);
  // Poderia enviar email de falha, notificar admin, etc.
}

async function handleSubscriptionCreated(data: any) {
  // Lógica de subscription criada
  console.log('📋 Subscription created:', data);
  // Poderia dar acesso a features, enviar boas-vindas, etc.
}

async function handleUserRegistered(data: any) {
  // Lógica de usuário registrado
  console.log('👤 User registered:', data);
  // Poderia enviar email de boas-vindas, criar perfil, etc.
}

async function cleanupPasswordTokens() {
  const deleted = await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true }
      ]
    }
  });
  console.log(`🧹 Cleaned ${deleted.count} expired password tokens`);
}

async function cleanupExpiredSessions() {
  // Implementar limpeza de sessões expiradas
  console.log('🧹 Cleaning expired sessions');
}

async function cleanupOldLogs() {
  // Implementar limpeza de logs antigos
  console.log('🧹 Cleaning old logs');
}

async function generateReport(userId: string, type: string, format: string) {
  // Implementar geração de relatórios
  console.log(`📊 Generating ${type} report for user ${userId} in ${format}`);
  return { url: `/reports/${userId}-${type}-${Date.now()}.${format}` };
}

async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: string;
}) {
  // Implementar criação de notificação
  return {
    id: `notif-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    read: false,
  };
}

async function logWebhookFailure(event: string, data: any, error: any) {
  // Log de falha de webhook para auditoria
  console.error(`💀 Webhook ${event} failed permanently:`, error);
}

// API para adicionar jobs
export const backgroundJobs = {
  // Adicionar job de email
  async addEmailJob(data: EmailJobData, options?: { delay?: number; priority?: number }) {
    if (!queues.email) {
      // Fallback: executar diretamente sem fila
      console.log('⚠️ Queue não disponível, executando email diretamente');
      try {
        await emailService.send({ to: data.to, subject: data.subject, html: data.html || '', text: data.text });
        return { id: 'direct-' + Date.now() };
      } catch (e) {
        console.error('Email direto falhou:', e);
        return null;
      }
    }
    return queues.email.add('send-email', data, {
      delay: options?.delay,
      priority: options?.priority || 0,
    });
  },

  // Adicionar job de webhook
  async addWebhookJob(event: string, data: any, options?: { delay?: number }) {
    if (!queues.webhooks) {
      console.log('⚠️ Queue webhooks não disponível');
      return null;
    }
    return queues.webhooks.add('process-webhook', { event, data }, {
      delay: options?.delay,
    });
  },

  // Adicionar job de manutenção
  async addMaintenanceJob(type: CleanupJobData['type'], options?: { delay?: number }) {
    if (!queues.maintenance) {
      console.log('⚠️ Queue maintenance não disponível');
      return null;
    }
    return queues.maintenance.add('cleanup', { type }, {
      delay: options?.delay,
    });
  },

  // Adicionar job de relatório
  async addReportJob(data: ReportJobData, options?: { delay?: number }) {
    if (!queues.reports) {
      console.log('⚠️ Queue reports não disponível');
      return null;
    }
    return queues.reports.add('generate-report', data, {
      delay: options?.delay,
    });
  },

  // Adicionar job de notificação
  async addNotificationJob(data: NotificationJobData, options?: { delay?: number }) {
    if (!queues.notifications) {
      console.log('⚠️ Queue notifications não disponível');
      return null;
    }
    return queues.notifications.add('send-notifications', data, {
      delay: options?.delay,
    });
  },

  // Agendar jobs recorrentes
  async scheduleRecurringJobs() {
    if (!queues.maintenance || !queues.reports) {
      console.log('⚠️ Queues não disponíveis - jobs recorrentes desabilitados');
      return;
    }
    
    // Cleanup diário às 2AM
    queues.maintenance.add('daily-cleanup', { type: 'password-tokens' }, {
      repeat: { cron: '0 2 * * *' }, // Cron pattern
    });

    // Relatório semanal aos usuários
    queues.reports.add('weekly-reports', {}, {
      repeat: { cron: '0 9 * * 1' }, // Segunda 9AM
    });

    console.log('📅 Recurring jobs scheduled');
  },

  // Status das filas
  async getQueueStatus() {
    if (Object.keys(queues).length === 0) {
      return { status: 'Redis não configurado - usando fallback em memória' };
    }
    
    const status: Record<string, any> = {};
    
    for (const [name, queue] of Object.entries(queues)) {
      const waiting = await queue.getWaiting();
      const active = await queue.getActive();
      const completed = await queue.getCompleted();
      const failed = await queue.getFailed();
      
      status[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    }
    
    return status;
  },

  // Limpar todas as filas
  async clearAllQueues() {
    if (Object.keys(queues).length === 0) return;
    
    for (const queue of Object.values(queues)) {
      await queue.clean(0, 'completed');
      await queue.clean(0, 'failed');
      try {
        await queue.clean(0, 'waiting' as any);
        await queue.clean(0, 'active' as any);
      } catch (e) {
        // Ignorar se não suportado
      }
    }
    console.log('🧹 All queues cleared');
  },

  // Fechar todas as filas
  async closeAllQueues() {
    if (Object.keys(queues).length === 0) return;
    
    for (const queue of Object.values(queues)) {
      await queue.close();
    }
    console.log('🔒 All queues closed');
  },
};

// Exportar filas para uso direto se necessário
export { queues };
