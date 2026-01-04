import { Resend } from 'resend'
import { render } from '@react-email/render'
import { prisma } from './prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

// Configurações
const FROM_EMAIL = 'noreply@meuadvogado.com'
const FROM_NAME = 'MeuAdvogado'
const RATE_LIMIT = 10 // emails por minuto por usuário

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email')
      return { success: false, error: 'Email not configured' }
    }

    const { data, error } = await resend.emails.send({
      from: 'MeuAdvogado <noreply@meuadvogado.us>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Template: Novo Lead para Advogado
export async function sendNewLeadEmail(
  lawyerEmail: string,
  lawyerName: string,
  caseData: {
    id: string
    practiceArea: string
    city: string
    state: string
    description: string
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .case-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Novo Lead Disponível!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${lawyerName}</strong>,</p>
            <p>Você tem um novo lead que corresponde ao seu perfil:</p>
            
            <div class="case-info">
              <h3>📋 Detalhes do Caso</h3>
              <p><strong>Área:</strong> ${caseData.practiceArea}</p>
              <p><strong>Localização:</strong> ${caseData.city}, ${caseData.state}</p>
              <p><strong>Descrição:</strong></p>
              <p>${caseData.description.substring(0, 200)}...</p>
            </div>

            <p>Entre em contato com o cliente o quanto antes para aumentar suas chances de conversão!</p>
            
            <a href="${process.env.NEXTAUTH_URL}/advogado/leads/${caseData.id}" class="button">
              Ver Lead Completo →
            </a>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              💡 <strong>Dica:</strong> Leads respondidos em até 1 hora têm 7x mais chance de conversão.
            </p>
          </div>
          <div class="footer">
            <p>MeuAdvogado.us - Conectando brasileiros aos melhores advogados nos EUA</p>
            <p><a href="${process.env.NEXTAUTH_URL}/advogado/perfil">Gerenciar Preferências</a></p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: lawyerEmail,
    subject: `🎯 Novo Lead: ${caseData.practiceArea} em ${caseData.city}`,
    html,
  })
}

// Template: Lead Aceito para Cliente
export async function sendLeadAcceptedEmail(
  clientEmail: string,
  clientName: string,
  lawyerData: {
    name: string
    city: string
    state: string
    practiceAreas: string[]
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .lawyer-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Um Advogado Aceitou Seu Caso!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${clientName}</strong>,</p>
            <p>Ótimas notícias! Um advogado especializado aceitou seu caso e está pronto para ajudá-lo:</p>
            
            <div class="lawyer-info">
              <h3>👨‍⚖️ ${lawyerData.name}</h3>
              <p><strong>Localização:</strong> ${lawyerData.city}, ${lawyerData.state}</p>
              <p><strong>Especialidades:</strong> ${lawyerData.practiceAreas.join(', ')}</p>
            </div>

            <p>Você pode conversar diretamente com o advogado através da nossa plataforma:</p>
            
            <a href="${process.env.NEXTAUTH_URL}/chat" class="button">
              Iniciar Conversa →
            </a>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              💡 <strong>Próximos Passos:</strong> O advogado entrará em contato em breve. Prepare seus documentos e dúvidas.
            </p>
          </div>
          <div class="footer">
            <p>MeuAdvogado.us - Conectando brasileiros aos melhores advogados nos EUA</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: clientEmail,
    subject: `✅ ${lawyerData.name} aceitou seu caso!`,
    html,
  })
}

// Template: Nova Mensagem
export async function sendNewMessageEmail(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Nova Mensagem</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${recipientName}</strong>,</p>
            <p><strong>${senderName}</strong> enviou uma nova mensagem:</p>
            
            <div class="message">
              <p>${messagePreview.substring(0, 150)}${messagePreview.length > 150 ? '...' : ''}</p>
            </div>
            
            <a href="${process.env.NEXTAUTH_URL}/chat/${conversationId}" class="button">
              Responder Mensagem →
            </a>
          </div>
          <div class="footer">
            <p>MeuAdvogado.us</p>
            <p><a href="${process.env.NEXTAUTH_URL}/advogado/perfil">Gerenciar Notificações</a></p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: recipientEmail,
    subject: `💬 Nova mensagem de ${senderName}`,
    html,
  })
}

// Template: Bem-vindo
export async function sendWelcomeEmail(
  userEmail: string,
  userName: string,
  userRole: 'CLIENT' | 'LAWYER'
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .step { margin: 15px 0; padding-left: 30px; position: relative; }
          .step:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bem-vindo ao MeuAdvogado!</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${userName}</strong>,</p>
            <p>Obrigado por se cadastrar! Estamos felizes em tê-lo(a) conosco.</p>
            
            ${userRole === 'CLIENT' ? `
              <div class="steps">
                <h3>📋 Próximos Passos:</h3>
                <div class="step">Descreva seu caso jurídico</div>
                <div class="step">Nossa IA analisa e encontra os melhores advogados</div>
                <div class="step">Converse diretamente com advogados especializados</div>
                <div class="step">Escolha o melhor profissional para seu caso</div>
              </div>
              <a href="${process.env.NEXTAUTH_URL}/caso" class="button">
                Criar Meu Primeiro Caso →
              </a>
            ` : `
              <div class="steps">
                <h3>📋 Próximos Passos:</h3>
                <div class="step">Complete seu perfil profissional</div>
                <div class="step">Adicione suas áreas de especialização</div>
                <div class="step">Receba leads qualificados automaticamente</div>
                <div class="step">Converta leads em clientes</div>
              </div>
              <a href="${process.env.NEXTAUTH_URL}/advogado/perfil" class="button">
                Completar Meu Perfil →
              </a>
            `}

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              💡 Precisa de ajuda? Responda este email e nossa equipe terá prazer em ajudá-lo(a).
            </p>
          </div>
          <div class="footer">
            <p>MeuAdvogado.us - Conectando brasileiros aos melhores advogados nos EUA</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: userEmail,
    subject: '🎉 Bem-vindo ao MeuAdvogado!',
    html,
  })
}
