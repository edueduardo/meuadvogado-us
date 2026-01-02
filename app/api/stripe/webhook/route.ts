import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

interface StripeEvent {
  type: string;
  data: {
    object: {
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
        await prisma.user.update({
          where: { email: session.customer_email },
          data: {
            plan: session.metadata?.plan || 'FREE',
            subscriptionId: session.subscription as string,
          },
        });
      }

      // Criar registro de assinatura
      if (session.client_reference_id && session.subscription) {
        await prisma.subscription.create({
          data: {
            userId: session.client_reference_id,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer as string,
            plan: session.metadata?.plan || 'FREE',
            status: 'active',
            currentPeriodStart: new Date((session.created || 0) * 1000),
            currentPeriodEnd: new Date((session.created || 0) * 1000 + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }

      console.log('✅ Payment successful, subscription created');
      break;

    case 'invoice.payment_succeeded':
      // Renovação mensal
      console.log('✅ Monthly renewal successful');
      break;

    case 'customer.subscription.deleted':
      // Cancelamento
      const subscription = event.data.object;
      if (subscription.id) {
        await prisma.user.update({
          where: { subscriptionId: subscription.id },
          data: { plan: 'FREE' },
        });
        
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'cancelled' },
        });
      }
      
      console.log('❌ Subscription cancelled');
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
