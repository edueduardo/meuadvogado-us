import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import NewLeadEmail from '@/emails/new-lead-email'
import { getTopLawyersForLead } from '@/lib/matching-algorithm'
import { consumeCredits, getCreditBalance } from '@/lib/credits'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'LAWYER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id: leadId } = await params

    // Buscar o advogado
    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: session.user.id },
    })

    if (!lawyer) {
      return NextResponse.json({ error: 'Perfil de advogado não encontrado' }, { status: 404 })
    }

    // Buscar o lead (case)
    const lead = await prisma.case.findUnique({
      where: { id: leadId },
      include: {
        client: true,
      },
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    if (!lead.clientId) {
      return NextResponse.json({ error: 'Lead sem cliente associado' }, { status: 400 })
    }

    // Verificar se já existe uma conversa entre este advogado e cliente
    let conversation = await prisma.conversation.findFirst({
      where: {
        lawyerId: lawyer.id,
        clientId: lead.clientId,
      },
    })

    // Se não existe, criar nova conversa
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          lawyerId: lawyer.id,
          clientId: lead.clientId,
          caseId: lead.id,
          status: 'ACTIVE',
        },
      })

      // Criar mensagem automática de boas-vindas
      const practiceAreaName = await prisma.practiceArea.findUnique({
        where: { id: lead.practiceAreaId },
        select: { name: true },
      })
      
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          content: `Olá! Recebi seu caso sobre ${practiceAreaName?.name || 'sua questão jurídica'} e gostaria de ajudá-lo(a). Vamos conversar sobre os detalhes?`,
        },
      })
    }

    // Atualizar o status do lead para CONTACTED
    await prisma.case.update({
      where: { id: leadId },
      data: {
        status: 'CONTACTED',
        matchedLawyerId: session.user.id,
        matchedAt: new Date(),
      },
    })

    // Criar match de lead
    await prisma.leadMatch.create({
      data: {
        caseId: leadId,
        lawyerId: lawyer.id,
        status: 'ACTIVE',
        matchedAt: new Date(),
        matchScore: 85, // Score default, pode ser calculado depois
      },
    })

    // 💳 VERIFICAR E CONSUMIR CRÉDITOS
    const creditResult = await consumeCredits(lawyer.id, leadId)
    
    if (!creditResult.success) {
      return NextResponse.json(
        { 
          error: creditResult.error || 'Erro ao processar créditos',
          requiresCredits: true,
          currentBalance: (await getCreditBalance(lawyer.id)).credits
        },
        { status: 402 } // Payment Required
      )
    }

    // Registrar view do lead
    await prisma.leadView.upsert({
      where: {
        caseId_lawyerId: {
          caseId: leadId,
          lawyerId: lawyer.id,
        },
      },
      create: {
        caseId: leadId,
        lawyerId: lawyer.id,
        viewedAt: new Date(),
      },
      update: {
        viewedAt: new Date(),
      },
    })

    // 📧 ENVIAR NOTIFICAÇÕES PARA OUTROS ADVOGADOS RECOMENDADOS
    try {
      // Buscar dados do lead para incluir no email
      const caseData = await prisma.case.findUnique({
        where: { id: leadId },
        include: {
          practiceArea: true
        }
      })

      const topLawyers = await getTopLawyersForLead(leadId, 5)
      
      if (!caseData) {
        console.error('Case data not found for email notifications')
        return NextResponse.json({
          message: 'Lead aceito com sucesso',
          conversationId: conversation.id,
          notificationsSent: false
        })
      }
      
      for (const lawyerMatch of topLawyers) {
        // Não enviar email para quem já aceitou
        if (lawyerMatch.lawyerId === lawyer.id) continue
        
        const lawyerData = await prisma.lawyer.findUnique({
          where: { id: lawyerMatch.lawyerId },
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        })
        
        if (lawyerData?.user?.email) {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Novo Lead Disponível - MeuAdvogado</title>
            </head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc;">
                <div style="background-color: #1e40af; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🎯 Novo Lead Disponível!</h1>
                    <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 16px;">Oportunidade imperdível para sua área de atuação</p>
                </div>
                <div style="background-color: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <p style="font-size: 18px; color: #374151; margin-bottom: 24px;">Olá, <strong>${lawyerData.user.name}</strong>!</p>
                    <p style="font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
                        Um lead acabou de ser publicado e nosso algoritmo identificou que você é um dos profissionais mais qualificados para este caso.
                    </p>
                    <div style="background-color: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <h3 style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 12px 0;">${caseData.title || 'Novo Caso'}</h3>
                        <div style="margin-bottom: 16px;">
                            <strong style="color: #374151;">Área:</strong> <span style="color: #4b5563;">${caseData.practiceArea?.name || 'N/A'}</span>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <strong style="color: #374151;">Score de Matching:</strong> 
                            <span style="color: #10b981; font-weight: bold;"> 🎯 ${lawyerMatch.score}%</span>
                        </div>
                        <div style="margin-bottom: 16px;">
                            <strong style="color: #374151;">Descrição:</strong>
                            <p style="color: #4b5563; margin: 8px 0 0 0; line-height: 1.5; font-size: 14px;">
                                ${caseData.description?.substring(0, 200)}${caseData.description?.length > 200 ? '...' : ''}
                            </p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-bottom: 24px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/advogado/leads/${leadId}" 
                           style="display: inline-block; background-color: #10b981; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            ✅ Ver e Aceitar Lead
                        </a>
                    </div>
                    <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                        <p style="margin: 0; font-size: 14px; color: #92400e; text-align: center;">
                            ⚡ <strong>Ação rápida recomendada!</strong> Primeiros a responder têm 80% mais chances de conversão.
                        </p>
                    </div>
                </div>
            </body>
            </html>
          `
          
          await sendEmail({
            to: lawyerData.user.email,
            subject: `🎯 Novo Lead Disponível - ${lawyerMatch.score}% Match - ${caseData.practiceArea?.name}`,
            html: emailHtml
          })
          
          console.log(`📧 Email enviado para ${lawyerData.user.email} - Score: ${lawyerMatch.score}%`)
        }
      }
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError)
      // Não falhar a operação principal se email falhar
    }

    // Obter saldo atualizado
    const currentBalance = await getCreditBalance(lawyer.id)

    return NextResponse.json({
      message: 'Lead aceito com sucesso',
      conversationId: conversation.id,
      notificationsSent: true,
      credits: {
        consumed: creditResult.transaction?.amount || 0,
        balance: currentBalance.credits,
        transactionId: creditResult.transaction?.id
      }
    })
  } catch (error) {
    console.error('Error accepting lead:', error)
    return NextResponse.json(
      { error: 'Erro ao aceitar lead' },
      { status: 500 }
    )
  }
}

// GET /api/advogado/leads/[id]/accept
// Histórico de matches deste lead (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas admin pode ver histórico de matches' },
        { status: 403 }
      )
    }

    const { id: leadId } = await params

    // Verificar se lead existe
    const lead = await prisma.case.findUnique({
      where: { id: leadId },
      select: { 
        id: true, 
        title: true, 
        status: true,
        createdAt: true
      }
    })

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 }
      )
    }

    // Buscar todos os matches deste lead
    const matches = await prisma.leadMatch.findMany({
      where: { caseId: leadId },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          }
        },
        lawyer: {
          select: {
            id: true,
            slug: true,
            headline: true,
            bio: true,
            city: true,
            state: true,
            verified: true,
            featured: true,
            user: {
              select: { 
                email: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { matchedAt: 'desc' }
    })

    // Calcular estatísticas
    const stats = {
      total: matches.length,
      active: matches.filter(m => m.status === 'ACTIVE').length,
      converted: matches.filter(m => m.status === 'CONVERTED').length,
      declined: matches.filter(m => m.status === 'DECLINED').length,
      expired: matches.filter(m => m.status === 'EXPIRED').length,
      conversionRate: matches.length > 0 
        ? Math.round((matches.filter(m => m.status === 'CONVERTED').length / matches.length) * 100)
        : 0
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        title: lead.title,
        status: lead.status,
        createdAt: lead.createdAt
      },
      matches: matches.map(m => ({
        id: m.id,
        status: m.status,
        matchedAt: m.matchedAt,
        respondedAt: m.respondedAt,
        convertedAt: m.convertedAt,
        matchScore: m.matchScore,
        metadata: m.metadata,
        case: m.case,
        lawyer: m.lawyer
      })),
      stats,
      total: matches.length
    })

  } catch (error: any) {
    console.error('Error fetching lead matches:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar histórico de matches' },
      { status: 500 }
    )
  }
}

// PUT /api/advogado/leads/[id]/accept
// Atualizar status: ACTIVE → CONVERTED/DECLINED/EXPIRED
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas admin pode atualizar status de match' },
        { status: 403 }
      )
    }

    const { id: leadId } = await params
    const body = await req.json()
    
    // Validar status
    const validStatuses = ['ACTIVE', 'CONVERTED', 'DECLINED', 'EXPIRED']
    const { status, reason } = body
    
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: 'Status inválido',
          validStatuses,
          received: status
        },
        { status: 400 }
      )
    }

    // Buscar match existente
    const existingMatch = await prisma.leadMatch.findFirst({
      where: { caseId: leadId },
      include: {
        case: {
          select: { id: true, title: true, status: true }
        },
        lawyer: {
          select: { 
            id: true,
            user: { select: { email: true } }
          }
        }
      },
      orderBy: { matchedAt: 'desc' }
    })

    if (!existingMatch) {
      return NextResponse.json(
        { error: 'Nenhum match encontrado para este lead' },
        { status: 404 }
      )
    }

    // Preparar dados de atualização
    const currentMetadata = existingMatch.metadata ? existingMatch.metadata as any : {}
    const updateData: any = {
      status,
      metadata: {
        ...currentMetadata,
        statusHistory: [
          ...(currentMetadata.statusHistory || []),
          {
            from: existingMatch.status,
            to: status,
            at: new Date().toISOString(),
            by: session.user.id,
            reason: reason || null
          }
        ]
      }
    }

    // Adicionar timestamps baseado no status
    if (status === 'CONVERTED' && !existingMatch.convertedAt) {
      updateData.convertedAt = new Date()
    } else if (status === 'DECLINED' && !existingMatch.respondedAt) {
      updateData.respondedAt = new Date()
    } else if (status === 'EXPIRED' && !existingMatch.respondedAt) {
      updateData.respondedAt = new Date()
    }

    // Atualizar match em transação
    const updatedMatch = await prisma.$transaction(async (tx) => {
      // Atualizar LeadMatch
      const match = await tx.leadMatch.update({
        where: { id: existingMatch.id },
        data: updateData,
        include: {
          case: {
            select: { id: true, title: true, status: true }
          },
          lawyer: {
            select: { 
              id: true,
              slug: true,
              user: { select: { email: true, name: true } }
            }
          }
        }
      })

      // Se todos os matches foram declined/expired, atualizar status do lead
      if (status === 'DECLINED' || status === 'EXPIRED') {
        const otherMatches = await tx.leadMatch.findMany({
          where: { 
            caseId: leadId,
            id: { not: existingMatch.id }
          }
        })

        const allDeclinedOrExpired = otherMatches.every(m => 
          m.status === 'DECLINED' || m.status === 'EXPIRED'
        )

        if (allDeclinedOrExpired) {
          await tx.case.update({
            where: { id: leadId },
            data: { status: 'NEW' } // Voltar para disponível
          })
        }
      }

      // Se convertido, atualizar status do lead
      if (status === 'CONVERTED') {
        await tx.case.update({
          where: { id: leadId },
          data: { 
            status: 'CONVERTED',
            matchedLawyerId: existingMatch.lawyerId
          }
        })
      }

      return match
    })

    // Buscar estatísticas atualizadas
    const allMatches = await prisma.leadMatch.findMany({
      where: { caseId: leadId },
      select: { status: true }
    })

    const stats = {
      total: allMatches.length,
      active: allMatches.filter(m => m.status === 'ACTIVE').length,
      converted: allMatches.filter(m => m.status === 'CONVERTED').length,
      declined: allMatches.filter(m => m.status === 'DECLINED').length,
      expired: allMatches.filter(m => m.status === 'EXPIRED').length,
    }

    return NextResponse.json({
      success: true,
      message: `Status atualizado para ${status}`,
      match: updatedMatch,
      stats,
      previousStatus: existingMatch.status,
      updatedBy: session.user.email
    })

  } catch (error: any) {
    console.error('Error updating lead match status:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar status do match' },
      { status: 500 }
    )
  }
}
