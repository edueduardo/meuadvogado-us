import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      },
    })

    // TODO: Criar match e registrar view após adicionar models ao schema
    // await prisma.match.create(...)
    // await prisma.leadView.create(...)

    return NextResponse.json({
      message: 'Lead aceito com sucesso',
      conversationId: conversation.id,
    })
  } catch (error) {
    console.error('Error accepting lead:', error)
    return NextResponse.json(
      { error: 'Erro ao aceitar lead' },
      { status: 500 }
    )
  }
}
