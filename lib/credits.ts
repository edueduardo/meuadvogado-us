/**
 * SERVIÇO DE CRÉDITOS - SISTEMA DE PAGAMENTOS
 * 
 * Funcionalidades:
 * - Gerenciar saldo de créditos
 * - Processar compras via Stripe
 * - Consumir créditos ao aceitar lead
 * - Histórico de transações
 * - Webhooks do Stripe
 */

import { prisma } from './prisma'
import Stripe from 'stripe'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia'
    })
  : null

// Configurações
const CREDITS_PER_LEAD = 1 // créditos consumidos por lead aceito
const CURRENCY = 'brl'

export interface CreditBalance {
  lawyerId: string
  credits: number
  lastUpdated: Date
}

export interface CreditTransaction {
  id: string
  type: 'PURCHASE' | 'CONSUME' | 'REFUND' | 'BONUS' | 'EXPIRE'
  amount: number
  balance: number
  description: string
  stripePaymentIntentId?: string
  createdAt: Date
}

export interface CreditPackage {
  id: string
  name: string
  description: string
  credits: number
  price: number
  popular: boolean
  bonus: number
}

/**
 * Obtém saldo de créditos de um advogado
 */
export async function getCreditBalance(lawyerId: string): Promise<CreditBalance> {
  const balance = await prisma.creditBalance.findUnique({
    where: { lawyerId }
  })

  if (!balance) {
    // Criar saldo inicial se não existir
    const newBalance = await prisma.creditBalance.create({
      data: {
        lawyerId,
        credits: 0
      }
    })
    return {
      lawyerId: newBalance.lawyerId,
      credits: newBalance.credits,
      lastUpdated: newBalance.lastUpdated
    }
  }

  return {
    lawyerId: balance.lawyerId,
    credits: balance.credits,
    lastUpdated: balance.lastUpdated
  }
}

/**
 * Adiciona créditos (compra, bônus, etc)
 */
export async function addCredits(
  lawyerId: string,
  amount: number,
  type: 'PURCHASE' | 'BONUS' | 'REFUND',
  description: string,
  stripePaymentIntentId?: string,
  packageId?: string
): Promise<CreditTransaction> {
  return await prisma.$transaction(async (tx) => {
    // Buscar ou criar saldo
    let balance = await tx.creditBalance.findUnique({
      where: { lawyerId }
    })

    if (!balance) {
      balance = await tx.creditBalance.create({
        data: { lawyerId, credits: 0 }
      })
    }

    // Atualizar saldo
    const newBalance = await tx.creditBalance.update({
      where: { lawyerId },
      data: {
        credits: balance.credits + amount,
        lastUpdated: new Date()
      }
    })

    // Registrar transação
    const transaction = await tx.creditTransaction.create({
      data: {
        lawyerId,
        type,
        amount,
        balance: newBalance.credits,
        description,
        stripePaymentIntentId,
        packageId,
        metadata: {
          previousBalance: balance.credits,
          newBalance: newBalance.credits
        }
      }
    })

    return {
      id: transaction.id,
      type: transaction.type as any,
      amount: transaction.amount,
      balance: transaction.balance,
      description: transaction.description,
      stripePaymentIntentId: transaction.stripePaymentIntentId || undefined,
      createdAt: transaction.createdAt
    }
  })
}

/**
 * Consome créditos (ao aceitar lead)
 */
export async function consumeCredits(
  lawyerId: string,
  leadId: string,
  amount: number = CREDITS_PER_LEAD
): Promise<{ success: boolean; transaction?: CreditTransaction; error?: string }> {
  return await prisma.$transaction(async (tx) => {
    // Buscar saldo
    const balance = await tx.creditBalance.findUnique({
      where: { lawyerId }
    })

    if (!balance) {
      return {
        success: false,
        error: 'Saldo de créditos não encontrado'
      }
    }

    // Verificar saldo suficiente
    if (balance.credits < amount) {
      return {
        success: false,
        error: `Saldo insuficiente. Você tem ${balance.credits} créditos, mas precisa de ${amount}.`
      }
    }

    // Verificar se lead já foi consumido
    const existingUsage = await tx.creditUsage.findUnique({
      where: {
        lawyerId_leadId: {
          lawyerId,
          leadId
        }
      }
    })

    if (existingUsage) {
      return {
        success: false,
        error: 'Este lead já foi consumido por este advogado'
      }
    }

    // Atualizar saldo
    const newBalance = await tx.creditBalance.update({
      where: { lawyerId },
      data: {
        credits: balance.credits - amount,
        lastUpdated: new Date()
      }
    })

    // Registrar transação de consumo
    const transaction = await tx.creditTransaction.create({
      data: {
        lawyerId,
        type: 'CONSUME',
        amount: -amount,
        balance: newBalance.credits,
        description: `Consumo de ${amount} crédito(s) - Lead ${leadId}`,
        leadId,
        metadata: {
          previousBalance: balance.credits,
          newBalance: newBalance.credits,
          leadId
        }
      }
    })

    // Registrar uso do lead
    await tx.creditUsage.create({
      data: {
        lawyerId,
        leadId,
        credits: amount,
        reason: 'Lead acceptance'
      }
    })

    return {
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type as any,
        amount: transaction.amount,
        balance: transaction.balance,
        description: transaction.description,
        createdAt: transaction.createdAt
      }
    }
  })
}

/**
 * Obtém histórico de transações
 */
export async function getCreditTransactions(
  lawyerId: string,
  options: {
    limit?: number
    offset?: number
    type?: string
    dateFrom?: Date
    dateTo?: Date
  } = {}
): Promise<CreditTransaction[]> {
  const {
    limit = 50,
    offset = 0,
    type,
    dateFrom,
    dateTo
  } = options

  const where: any = { lawyerId }

  if (type) where.type = type
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = dateFrom
    if (dateTo) where.createdAt.lte = dateTo
  }

  const transactions = await prisma.creditTransaction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  })

  return transactions.map(t => ({
    id: t.id,
    type: t.type as any,
    amount: t.amount,
    balance: t.balance,
    description: t.description,
    stripePaymentIntentId: t.stripePaymentIntentId || undefined,
    createdAt: t.createdAt
  }))
}

/**
 * Obtém pacotes de créditos disponíveis
 */
export async function getCreditPackages(): Promise<CreditPackage[]> {
  const packages = await prisma.creditPackage.findMany({
    where: { active: true },
    orderBy: { price: 'asc' }
  })

  return packages.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    credits: p.credits,
    price: p.price,
    popular: p.popular,
    bonus: p.bonus
  }))
}

/**
 * Cria checkout session do Stripe
 */
export async function createStripeCheckout(
  lawyerId: string,
  packageId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ sessionId: string; url: string }> {
  if (!stripe) {
    throw new Error('Stripe não configurado')
  }

  // Buscar pacote
  const creditPackage = await prisma.creditPackage.findUnique({
    where: { id: packageId, active: true }
  })

  if (!creditPackage) {
    throw new Error('Pacote de créditos não encontrado')
  }

  // Buscar dados do advogado
  const lawyer = await prisma.lawyer.findUnique({
    where: { id: lawyerId },
    include: {
      user: {
        select: { email: true, name: true }
      }
    }
  })

  if (!lawyer?.user?.email) {
    throw new Error('Advogado não encontrado')
  }

  // Criar checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: lawyer.user.email,
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: creditPackage.name,
            description: creditPackage.description,
            images: []
          },
          unit_amount: creditPackage.price
        },
        quantity: 1
      }
    ],
    metadata: {
      lawyerId,
      packageId,
      credits: creditPackage.credits.toString(),
      bonus: creditPackage.bonus.toString()
    },
    success_url: successUrl,
    cancel_url: cancelUrl
  })

  return {
    sessionId: session.id,
    url: session.url!
  }
}

/**
 * Processa webhook do Stripe
 */
export async function handleStripeWebhook(
  signature: string,
  payload: Buffer
): Promise<{ processed: boolean; error?: string }> {
  if (!stripe) {
    return { processed: false, error: 'Stripe não configurado' }
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      if (session.metadata?.lawyerId && session.metadata?.packageId) {
        const packageId = session.metadata.packageId
        const lawyerId = session.metadata.lawyerId
        const credits = parseInt(session.metadata.credits || '0')
        const bonus = parseInt(session.metadata.bonus || '0')
        const totalCredits = credits + bonus

        // Adicionar créditos
        await addCredits(
          lawyerId,
          totalCredits,
          'PURCHASE',
          `Compra do pacote "${session.metadata.packageId}"`,
          session.payment_intent as string,
          packageId
        )

        console.log(`✅ Créditos adicionados: ${totalCredits} para lawyer ${lawyerId}`)
        return { processed: true }
      }
    }

    return { processed: false }
  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error)
    return { processed: false, error: error.message }
  }
}

/**
 * Obtém estatísticas de créditos
 */
export async function getCreditStats(lawyerId: string): Promise<{
  currentBalance: number
  totalPurchased: number
  totalConsumed: number
  totalRefunded: number
  thisMonthPurchased: number
  thisMonthConsumed: number
}> {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    balance,
    purchaseStats,
    consumeStats,
    refundStats,
    thisMonthPurchase,
    thisMonthConsume
  ] = await Promise.all([
    getCreditBalance(lawyerId),
    prisma.creditTransaction.aggregate({
      where: { lawyerId, type: 'PURCHASE' },
      _sum: { amount: true }
    }),
    prisma.creditTransaction.aggregate({
      where: { lawyerId, type: 'CONSUME' },
      _sum: { amount: true }
    }),
    prisma.creditTransaction.aggregate({
      where: { lawyerId, type: 'REFUND' },
      _sum: { amount: true }
    }),
    prisma.creditTransaction.aggregate({
      where: {
        lawyerId,
        type: 'PURCHASE',
        createdAt: { gte: thisMonth }
      },
      _sum: { amount: true }
    }),
    prisma.creditTransaction.aggregate({
      where: {
        lawyerId,
        type: 'CONSUME',
        createdAt: { gte: thisMonth }
      },
      _sum: { amount: true }
    })
  ])

  return {
    currentBalance: balance.credits,
    totalPurchased: purchaseStats._sum.amount || 0,
    totalConsumed: Math.abs(consumeStats._sum.amount || 0),
    totalRefunded: refundStats._sum.amount || 0,
    thisMonthPurchased: thisMonthPurchase._sum.amount || 0,
    thisMonthConsumed: Math.abs(thisMonthConsume._sum.amount || 0)
  }
}

// Exportar funções principais
export default {
  getCreditBalance,
  addCredits,
  consumeCredits,
  getCreditTransactions,
  getCreditPackages,
  createStripeCheckout,
  handleStripeWebhook,
  getCreditStats
}
