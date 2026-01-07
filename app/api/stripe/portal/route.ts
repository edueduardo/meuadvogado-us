// app/api/stripe/portal/route.ts
// API para criar portal de billing do cliente

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripeService } from '@/lib/stripe/stripe-service'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    if (!stripeService.isConfigured()) {
      return NextResponse.json(
        { error: 'Sistema de pagamentos não configurado' },
        { status: 503 }
      )
    }

    // Buscar Stripe customer ID do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true },
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Você não possui uma assinatura ativa' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/advogado/dashboard`

    const result = await stripeService.createPortalSession({
      customerId: user.stripeCustomerId,
      returnUrl,
    })

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
    })

  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao abrir portal de pagamentos' },
      { status: 500 }
    )
  }
}
