// lib/email/templates/payment.ts
import { baseTemplate } from './base-template';

export const paymentConfirmationTemplate = ({
  name,
  amount,
  currency,
  planName,
  nextBillingDate,
}: {
  name: string;
  amount: number;
  currency: string;
  planName: string;
  nextBillingDate?: string;
}) => baseTemplate(`
  <h1>✅ Pagamento confirmado!</h1>
  
  <p>Olá ${name},</p>
  
  <p>Seu pagamento foi processado com sucesso. Obrigado por confiar no Meu Advogado!</p>
  
  <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
    <p style="margin: 0; font-size: 14px; color: #166534;">Valor pago</p>
    <p style="margin: 8px 0 0 0; font-size: 36px; font-weight: 700; color: #15803d;">
      ${currency === 'USD' ? '$' : 'R$'}${amount.toFixed(2)}
    </p>
  </div>
  
  <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Plano:</td>
        <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right;">${planName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Status:</td>
        <td style="padding: 8px 0; text-align: right;">
          <span style="background-color: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 14px;">Ativo</span>
        </td>
      </tr>
      ${nextBillingDate ? `
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Próxima cobrança:</td>
        <td style="padding: 8px 0; color: #111827; text-align: right;">${nextBillingDate}</td>
      </tr>
      ` : ''}
    </table>
  </div>
  
  <div style="text-align: center;">
    <a href="https://meuadvogado-us.vercel.app/advogado/dashboard" class="button">
      📊 Acessar Dashboard
    </a>
  </div>
  
  <div class="divider"></div>
  
  <p style="color: #6b7280; font-size: 14px;">
    Precisa de um recibo? <a href="https://meuadvogado-us.vercel.app/advogado/faturas">Acesse suas faturas</a>
  </p>
`, `Pagamento de ${currency === 'USD' ? '$' : 'R$'}${amount.toFixed(2)} confirmado!`);

export const paymentFailedTemplate = ({
  name,
  amount,
  currency,
  reason,
}: {
  name: string;
  amount: number;
  currency: string;
  reason?: string;
}) => baseTemplate(`
  <h1>⚠️ Problema com seu pagamento</h1>
  
  <p>Olá ${name},</p>
  
  <p>Infelizmente, não conseguimos processar seu pagamento de <strong>${currency === 'USD' ? '$' : 'R$'}${amount.toFixed(2)}</strong>.</p>
  
  ${reason ? `
  <div style="background-color: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 24px 0;">
    <p style="margin: 0; color: #991b1b;">
      <strong>Motivo:</strong> ${reason}
    </p>
  </div>
  ` : ''}
  
  <p>Para evitar a suspensão do seu plano, por favor atualize seu método de pagamento.</p>
  
  <div style="text-align: center;">
    <a href="https://meuadvogado-us.vercel.app/advogado/pagamento" class="button" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
      💳 Atualizar Pagamento
    </a>
  </div>
  
  <div class="divider"></div>
  
  <p style="color: #6b7280; font-size: 14px;">
    Precisa de ajuda? Entre em contato: <a href="mailto:suporte@meuadvogado.us">suporte@meuadvogado.us</a>
  </p>
`, `Problema com seu pagamento - ação necessária`);
