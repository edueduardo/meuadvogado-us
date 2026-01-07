// app/api/stripe/webhooks/route.ts
// Webhook handler para eventos do Stripe

import { NextRequest, NextResponse } from 'next/server'
import { stripeService, handleStripeWebhook, PLANS } from '@/lib/stripe/stripe-service'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email/resend-service'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripeService.constructWebhookEvent(payload, signature)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Processar eventos
    await handleStripeWebhook(event, {
      // Checkout completado
      onCheckoutComplete: async (session) => {
        console.log('✅ Checkout completed:', session.id)
        
        const userId = session.metadata?.userId || session.client_reference_id
        const planId = session.metadata?.planId
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (!userId) {
          console.error('No userId in checkout session')
          return
        }

        // Atualizar usuário com Stripe customer ID
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: customerId,
          },
        })

        // Atualizar advogado com plano
        const lawyer = await prisma.lawyer.findFirst({
          where: { userId },
        })

        if (lawyer && planId) {
          await prisma.lawyer.update({
            where: { id: lawyer.id },
            data: {
              plan: planId.toUpperCase() as any,
              stripeSubscriptionId: subscriptionId,
              planExpiresAt: null, // Subscription ativa, não expira
            },
          })
        }

        // Buscar user para email
        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (user?.email) {
          await emailService.sendPaymentConfirmation(
            user.email,
            user.name || 'Advogado',
            PLANS[planId as keyof typeof PLANS]?.price || 0,
            'USD'
          )
        }
      },

      // Subscription criada
      onSubscriptionCreated: async (subscription) => {
        console.log('📋 Subscription created:', subscription.id)
        
        const userId = subscription.metadata?.userId
        const planId = subscription.metadata?.planId

        if (userId && planId) {
          const lawyer = await prisma.lawyer.findFirst({
            where: { userId },
          })

          if (lawyer) {
            await prisma.lawyer.update({
              where: { id: lawyer.id },
              data: {
                plan: planId.toUpperCase() as any,
                stripeSubscriptionId: subscription.id,
              },
            })
          }
        }
      },

      // Subscription atualizada
      onSubscriptionUpdated: async (subscription) => {
        console.log('🔄 Subscription updated:', subscription.id)
        
        const lawyer = await prisma.lawyer.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (lawyer) {
          // Verificar status
          if (subscription.status === 'active') {
            await prisma.lawyer.update({
              where: { id: lawyer.id },
              data: {
                planExpiresAt: null,
              },
            })
          } else if (subscription.cancel_at_period_end) {
            // Cancelamento agendado
            await prisma.lawyer.update({
              where: { id: lawyer.id },
              data: {
                planExpiresAt: new Date(subscription.current_period_end * 1000),
              },
            })
          }
        }
      },

      // Subscription deletada
      onSubscriptionDeleted: async (subscription) => {
        console.log('❌ Subscription deleted:', subscription.id)
        
        const lawyer = await prisma.lawyer.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        })

        if (lawyer) {
          // Voltar para plano gratuito
          await prisma.lawyer.update({
            where: { id: lawyer.id },
            data: {
              plan: 'STARTER',
              stripeSubscriptionId: null,
              planExpiresAt: null,
            },
          })

          // Notificar
          const user = await prisma.user.findUnique({
            where: { id: lawyer.userId },
          })

          if (user?.email) {
            await emailService.send({
              to: user.email,
              subject: 'Sua assinatura foi cancelada - Meu Advogado',
              html: `
                <h2>Olá ${user.name},</h2>
                <p>Sua assinatura do plano foi cancelada.</p>
                <p>Você voltou para o plano Starter gratuito.</p>
                <p>Sinta-se à vontade para reativar a qualquer momento!</p>
              `,
            })
          }
        }
      },

      // Pagamento sucedido
      onPaymentSucceeded: async (invoice) => {
        console.log('💰 Payment succeeded:', invoice.id)
        
        const customerId = invoice.customer as string
        
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user?.email) {
          await emailService.send({
            to: user.email,
            subject: 'Pagamento confirmado - Meu Advogado',
            html: `
              <h2>Pagamento recebido!</h2>
              <p>Seu pagamento de $${(invoice.amount_paid / 100).toFixed(2)} foi processado com sucesso.</p>
              <p>Obrigado por usar o Meu Advogado!</p>
            `,
          })
        }
      },

      // Pagamento falhou
      onPaymentFailed: async (invoice) => {
        console.log('❌ Payment failed:', invoice.id)
        
        const customerId = invoice.customer as string
        
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user?.email) {
          await emailService.send({
            to: user.email,
            subject: '⚠️ Problema com seu pagamento - Meu Advogado',
            html: `
              <h2>Olá ${user.name},</h2>
              <p>Houve um problema ao processar seu pagamento.</p>
              <p>Por favor, atualize seu método de pagamento para evitar a suspensão do seu plano.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/advogado/planos">Atualizar pagamento</a>
            `,
          })
        }
      },
    })

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
