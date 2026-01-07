// lib/email/templates/case-notification.ts
import { baseTemplate } from './base-template';

export const newCaseNotificationTemplate = ({
  lawyerName,
  caseTitle,
  caseArea,
  caseUrgency,
  clientLocation,
  caseId,
}: {
  lawyerName: string;
  caseTitle: string;
  caseArea: string;
  caseUrgency: string;
  clientLocation: string;
  caseId: string;
}) => baseTemplate(`
  <h1>🔔 Novo caso disponível, Dr(a). ${lawyerName}!</h1>
  
  <p>Um cliente brasileiro precisa de ajuda na sua área de atuação. Seja um dos primeiros a responder!</p>
  
  <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
    <p style="margin: 0; color: #92400e;">
      ⚡ <strong>Dica:</strong> Advogados que respondem em até 2 horas têm 5x mais chances de fechar o caso.
    </p>
  </div>
  
  <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0;">
    <h2 style="margin-top: 0;">📋 Detalhes do Caso</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280; width: 120px;">Área:</td>
        <td style="padding: 8px 0; color: #111827; font-weight: 600;">${caseArea}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Urgência:</td>
        <td style="padding: 8px 0;">
          <span style="background-color: ${caseUrgency === 'URGENT' ? '#fee2e2' : '#dbeafe'}; color: ${caseUrgency === 'URGENT' ? '#991b1b' : '#1e40af'}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
            ${caseUrgency === 'URGENT' ? '🔴 Urgente' : caseUrgency === 'HIGH' ? '🟠 Alta' : '🟢 Normal'}
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Localização:</td>
        <td style="padding: 8px 0; color: #111827;">${clientLocation}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Resumo:</td>
        <td style="padding: 8px 0; color: #111827;">${caseTitle}</td>
      </tr>
    </table>
  </div>
  
  <div style="text-align: center;">
    <a href="https://meuadvogado-us.vercel.app/advogado/casos/${caseId}" class="button">
      👀 Ver Caso Completo
    </a>
  </div>
  
  <div class="divider"></div>
  
  <p style="text-align: center; color: #6b7280; font-size: 14px;">
    Não quer receber notificações de novos casos? <a href="https://meuadvogado-us.vercel.app/advogado/configuracoes">Ajustar preferências</a>
  </p>
`, `Novo caso de ${caseArea} disponível na sua região!`);

export const caseResponseTemplate = ({
  clientName,
  lawyerName,
  caseArea,
  message,
}: {
  clientName: string;
  lawyerName: string;
  caseArea: string;
  message?: string;
}) => baseTemplate(`
  <h1>🎉 Ótimas notícias, ${clientName}!</h1>
  
  <p>O advogado <strong>Dr(a). ${lawyerName}</strong>, especialista em ${caseArea}, respondeu ao seu caso.</p>
  
  ${message ? `
  <div class="highlight-box">
    <p><strong>Mensagem do advogado:</strong></p>
    <p style="font-style: italic; margin-top: 8px;">"${message}"</p>
  </div>
  ` : ''}
  
  <div style="text-align: center;">
    <a href="https://meuadvogado-us.vercel.app/cliente/mensagens" class="button button-green">
      💬 Ver Mensagem
    </a>
  </div>
  
  <div class="divider"></div>
  
  <p style="color: #6b7280;">
    <strong>Lembrete:</strong> A primeira consulta é gratuita. Aproveite para tirar suas dúvidas!
  </p>
`, `Dr(a). ${lawyerName} respondeu ao seu caso!`);
