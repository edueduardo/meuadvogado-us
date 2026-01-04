/**
 * API STRIPE CHECKOUT - CRIAR SESSÃO DE PAGAMENTO
 * 
 * Endpoint: POST /api/stripe/checkout
 * 
 * Body:
 * {
 *   "packageId": "credit_package_id"
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createStripeCheckout, getCreditPackages } from '@/lib/credits'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Apenas advogados podem comprar créditos' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json(
        { error: 'packageId é obrigatório' },
        { status: 400 }
      )
    }

    // Validar packageId
    const packages = await getCreditPackages()
    const packageExists = packages.some(p => p.id === packageId)

    if (!packageExists) {
      return NextResponse.json(
        { error: 'Pacote de créditos inválido' },
        { status: 400 }
      )
    }

    // Buscar lawyerId
    const lawyer = await prisma.lawyer.findFirst({
      where: { userId: session.user.id }
    })

    if (!lawyer) {
      return NextResponse.json(
        { error: 'Advogado não encontrado' },
        { status: 404 }
      )
    }

    // Criar checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const successUrl = `${baseUrl}/advogado/credits/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/advogado/credits/packages`

    const checkout = await createStripeCheckout(
      lawyer.id,
      packageId,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({
      success: true,
      sessionId: checkout.sessionId,
      url: checkout.url
    })

  } catch (error: any) {
    console.error('Error creating Stripe checkout:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const packages = await getCreditPackages()

    return NextResponse.json({
      success: true,
      packages
    })

  } catch (error: any) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar pacotes de créditos' },
      { status: 500 }
    )
  }
}
