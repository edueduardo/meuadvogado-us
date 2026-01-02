import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

interface StripeEvent {
  type: string;
  data: {
    object: {
      id?: string;
      customer?: string;
      customer_email?: string;
      subscription?: string;
      client_reference_id?: string;
      created?: number;
      metadata?: {
        plan?: string;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: StripeEvent;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    ) as StripeEvent;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Atualizar assinatura do usuário
      if (session.customer_email) {
        const planType = session.metadata?.plan || 'FREE';
        await prisma.user.update({
          where: { email: session.customer_email },
          data: {
            plan: planType as any, // Cast para any para evitar erro de tipo
            subscriptionId: session.subscription as string,
          },
        });
      }

      // Criar registro de assinatura
      if (session.client_reference_id && session.subscription) {
        await prisma.subscription.create({
          data: {
            userId: session.client_reference_id,
            stripeCustomerId: session.customer as string,
            stripePriceId: '', // Será preenchido posteriormente
            status: 'active',
            currentPeriodStart: new Date((session.created || 0) * 1000),
            currentPeriodEnd: new Date((session.created || 0) * 1000 + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

      console.log('✅ Payment successful, subscription created');
      break;

    case 'invoice.payment_succeeded':
      // Renovação de assinatura bem-sucedida
      console.log('Invoice payment succeeded');
      break;

    case 'customer.subscription.deleted':
      // Cancelamento de assinatura
      const subscription = event.data.object;
      if (subscription.customer) {
        await prisma.user.updateMany({
          where: { 
            subscription: {
              stripeCustomerId: subscription.customer as string
            }
          },
          data: { plan: 'FREE' as any },
        });
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
