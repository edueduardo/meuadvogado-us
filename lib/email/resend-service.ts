// lib/email/resend-service.ts
// Resend Email Service REAL - com fallback para desenvolvimento
import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'MeuAdvogado US';

// Cliente Resend REAL
let resendClient: Resend | null = null;

const getResendClient = (): Resend | null => {
  if (!resendClient && RESEND_API_KEY) {
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
};

// Interface de email
interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
}

// Serviço de email REAL
export const emailService = {
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const client = getResendClient();
    
    if (!client) {
      console.log('📧 [DEV MODE] Email would be sent:', {
        to: options.to,
        subject: options.subject,
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
      });
      return { success: true, messageId: `dev-${Date.now()}` };
    }

    try {
      const result = await client.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      });

      console.log('✅ Email sent successfully:', {
        messageId: result.data?.id,
        to: options.to,
        subject: options.subject,
      });

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('❌ Email send error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  // Templates específicos
  async sendWelcome(email: string, name: string, planName: string, hasTrial: boolean): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Bem-vindo ao MeuAdvogado US!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${name}</strong>,</p>
              
              <p>Seja bem-vindo ao MeuAdvogado US! Estamos muito felizes em tê-lo conosco.</p>
              
              <p><strong>Seu Plano:</strong> ${planName}</p>
              ${hasTrial ? '<p>✨ <strong>Período de teste ativo!</strong> Aproveite todos os recursos premium gratuitamente.</p>' : ''}
              
              <p>Agora você tem acesso a:</p>
              <ul>
                <li>✅ Dashboard completo com analytics</li>
                <li>✅ Análise de casos com IA</li>
                <li>✅ Chat em tempo real com clientes</li>
                <li>✅ Sistema de pagamentos integrado</li>
                <li>✅ Matching inteligente de casos</li>
              </ul>
              
              <a href="${process.env.NEXTAUTH_URL}/advogado/dashboard" class="button">Acessar Dashboard</a>
              
              <p>Se precisar de ajuda, nossa equipe está sempre disponível.</p>
              
              <p>Sucesso! 🚀</p>
              <p><strong>Equipe MeuAdvogado US</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MeuAdvogado US. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.send({
      to: email,
      subject: `🎉 Bem-vindo ao MeuAdvogado US - Plano ${planName}`,
      html,
      text: `Olá ${name}, bem-vindo ao MeuAdvogado US! Seu plano ${planName} está ativo.`,
    });
  },

  async sendPlanUpdate(email: string, name: string, oldPlan: string, newPlan: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .upgrade-box { background: #f0f7ff; border: 2px solid #667eea; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⬆️ Plano Atualizado!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${name}</strong>,</p>
              
              <p>Seu plano foi atualizado com sucesso!</p>
              
              <div class="upgrade-box">
                <p style="text-align: center; font-size: 18px;">
                  <strong>${oldPlan}</strong> ➡️ <strong>${newPlan}</strong>
                </p>
              </div>
              
              <p>Com o plano <strong>${newPlan}</strong>, você agora tem acesso a:</p>
              <ul>
                <li>✨ Recursos premium exclusivos</li>
                <li>📊 Analytics avançados</li>
                <li>🚀 Prioridade no matching de casos</li>
                <li>💬 Suporte prioritário</li>
              </ul>
              
              <a href="${process.env.NEXTAUTH_URL}/advogado/dashboard" class="button">Ver Novos Recursos</a>
              
              <p>Aproveite ao máximo! 🎉</p>
              <p><strong>Equipe MeuAdvogado US</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MeuAdvogado US. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.send({
      to: email,
      subject: `⬆️ Plano Atualizado: ${oldPlan} → ${newPlan}`,
      html,
      text: `Olá ${name}, seu plano foi atualizado de ${oldPlan} para ${newPlan}!`,
    });
  },

  async sendCancellation(email: string, name: string, immediate: boolean, endDate?: Date): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .info-box { background: #fff3cd; border: 2px solid #ffc107; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Assinatura Cancelada</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${name}</strong>,</p>
              
              <p>Lamentamos informar que sua assinatura foi cancelada.</p>
              
              ${immediate ? `
                <div class="info-box">
                  <p><strong>⚠️ Cancelamento Imediato</strong></p>
                  <p>Seu acesso aos recursos premium foi encerrado.</p>
                </div>
              ` : `
                <div class="info-box">
                  <p><strong>ℹ️ Cancelamento no fim do período</strong></p>
                  <p>Você terá acesso até: <strong>${endDate?.toLocaleDateString('pt-BR')}</strong></p>
                </div>
              `}
              
              <p>Sentiremos sua falta! Se mudou de ideia:</p>
              
              <a href="${process.env.NEXTAUTH_URL}/advogado/planos" class="button">Reativar Assinatura</a>
              
              <p>Agradecemos por ter feito parte do MeuAdvogado US.</p>
              <p><strong>Equipe MeuAdvogado US</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MeuAdvogado US. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.send({
      to: email,
      subject: 'Assinatura Cancelada - MeuAdvogado US',
      html,
      text: `Olá ${name}, sua assinatura foi cancelada. ${immediate ? 'Cancelamento imediato.' : `Acesso até ${endDate?.toLocaleDateString('pt-BR')}`}`,
    });
  },

  async sendPaymentConfirmation(email: string, name: string, amount: number, currency: string): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .amount { font-size: 36px; color: #10b981; font-weight: bold; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Pagamento Confirmado!</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${name}</strong>,</p>
              
              <p>Recebemos seu pagamento com sucesso!</p>
              
              <div class="amount">${formattedAmount}</div>
              
              <p><strong>Detalhes:</strong></p>
              <ul>
                <li>Data: ${new Date().toLocaleString('pt-BR')}</li>
                <li>Valor: ${formattedAmount}</li>
                <li>Status: Confirmado ✅</li>
              </ul>
              
              <a href="${process.env.NEXTAUTH_URL}/advogado/dashboard" class="button">Ver Dashboard</a>
              
              <p>Obrigado pela preferência!</p>
              <p><strong>Equipe MeuAdvogado US</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MeuAdvogado US. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.send({
      to: email,
      subject: `✅ Pagamento Confirmado - ${formattedAmount}`,
      html,
      text: `Olá ${name}, pagamento de ${formattedAmount} confirmado com sucesso!`,
    });
  },

  async sendPaymentFailed(email: string, name: string, amount: number, reason?: string): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .alert-box { background: #fee; border: 2px solid #ef4444; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Pagamento Falhou</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${name}</strong>,</p>
              
              <p>Não conseguimos processar seu pagamento.</p>
              
              <div class="alert-box">
                <p><strong>Valor:</strong> ${formattedAmount}</p>
                ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
              </div>
              
              <p><strong>O que fazer:</strong></p>
              <ul>
                <li>Verifique se há saldo suficiente</li>
                <li>Confirme os dados do cartão</li>
                <li>Entre em contato com seu banco</li>
                <li>Tente outro método de pagamento</li>
              </ul>
              
              <a href="${process.env.NEXTAUTH_URL}/advogado/planos" class="button">Tentar Novamente</a>
              
              <p>Se precisar de ajuda, estamos aqui!</p>
              <p><strong>Equipe MeuAdvogado US</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MeuAdvogado US. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.send({
      to: email,
      subject: `⚠️ Falha no Pagamento - ${formattedAmount}`,
      html,
      text: `Olá ${name}, não conseguimos processar seu pagamento de ${formattedAmount}. ${reason || 'Por favor, verifique seus dados de pagamento.'}`,
    });
  },

  async sendRefund(email: string, name: string, amount: number, reason?: string): Promise<void> {
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
            .info-box { background: #eff6ff; border: 2px solid #3b82f6; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .amount { font-size: 36px; color: #3b82f6; font-weight: bold; text-align: center; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Reembolso Processado</h1>
            </div>
            <div class="content">
              <p>Olá <strong>${name}</strong>,</p>
              
              <p>Seu reembolso foi processado com sucesso!</p>
              
              <div class="amount">${formattedAmount}</div>
              
              <div class="info-box">
                <p><strong>Informações:</strong></p>
                <ul>
                  <li>Valor: ${formattedAmount}</li>
                  <li>Data: ${new Date().toLocaleDateString('pt-BR')}</li>
                  ${reason ? `<li>Motivo: ${reason}</li>` : ''}
                  <li>Status: Processado ✅</li>
                </ul>
              </div>
              
              <p>O valor será creditado em sua conta em 5-10 dias úteis, dependendo do seu banco.</p>
              
              <p>Obrigado pela compreensão!</p>
              <p><strong>Equipe MeuAdvogado US</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MeuAdvogado US. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.send({
      to: email,
      subject: `💰 Reembolso Processado - ${formattedAmount}`,
      html,
      text: `Olá ${name}, seu reembolso de ${formattedAmount} foi processado. O valor será creditado em 5-10 dias úteis.`,
    });
  },

  // Status
  isConfigured(): boolean {
    return RESEND_API_KEY !== undefined;
  },

  getMode(): 'production' | 'development' {
    return RESEND_API_KEY ? 'production' : 'development';
  },
};
