// app/api/stripe/subscribe/route.ts
// API para criar subscription de planos de advogados

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripeService, PLANS, PlanId } from '@/lib/stripe/stripe-service'
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

    // Verificar se Stripe está configurado
    if (!stripeService.isConfigured()) {
      return NextResponse.json(
        { error: 'Sistema de pagamentos não configurado. Entre em contato com o suporte.' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { planId } = body as { planId: PlanId }

    if (!planId || !PLANS[planId]) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const plan = PLANS[planId]

    // Plano Starter é gratuito
    if (plan.price === 0) {
      return NextResponse.json(
        { error: 'Plano Starter não requer pagamento' },
        { status: 400 }
      )
    }

    // URLs de retorno
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/advogado/dashboard?subscription=success`
    const cancelUrl = `${baseUrl}/advogado/planos`

    // Criar checkout session
    const result = await stripeService.createCheckoutSession({
      userId: session.user.id,
      email: session.user.email || '',
      planId,
      successUrl,
      cancelUrl,
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
      sessionId: result.sessionId,
    })

  } catch (error: any) {
    console.error('Error creating subscription checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    )
  }
}

// GET - Retorna planos disponíveis
export async function GET() {
  return NextResponse.json({
    success: true,
    plans: Object.values(PLANS),
    stripeConfigured: stripeService.isConfigured(),
  })
}
