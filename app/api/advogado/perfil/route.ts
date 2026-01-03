import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'LAWYER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!lawyer) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ lawyer })
  } catch (error) {
    console.error('Error fetching lawyer profile:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    if (session.user.role !== 'LAWYER') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await req.json()
    const { name, barNumber, city, state, practiceAreas, languages, bio } = body

    // Validação básica
    if (!name || !barNumber || !city || !state) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    if (!practiceAreas || practiceAreas.length === 0) {
      return NextResponse.json(
        { error: 'Selecione pelo menos uma área de atuação' },
        { status: 400 }
      )
    }

    // Atualizar nome do usuário
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    })

    // Atualizar perfil do advogado
    const lawyer = await prisma.lawyer.update({
      where: { userId: session.user.id },
      data: {
        barNumber,
        city,
        state,
        practiceAreas,
        languages: languages || [],
        bio: bio || '',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      lawyer,
    })
  } catch (error) {
    console.error('Error updating lawyer profile:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}
