import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Atualizar assinatura do usuário
      await prisma.user.update({
        where: { email: session.customer_email },
        data: {
          plan: session.metadata?.plan || 'FREE',
          subscriptionId: session.subscription as string,
        },
      });

      // Criar registro de assinatura
      await prisma.subscription.create({
        data: {
          userId: session.client_reference_id,
          stripeSubscriptionId: session.subscription as string,
          stripeCustomerId: session.customer as string,
          plan: session.metadata?.plan || 'FREE',
          status: 'active',
          currentPeriodStart: new Date(session.created * 1000),
          currentPeriodEnd: new Date(session.created * 1000 + 30 * 24 * 60 * 60 * 1000), // +30 dias
        },
      });

      console.log('✅ Payment successful, subscription created');
      break;

    case 'invoice.payment_succeeded':
      // Renovação mensal
      const invoice = event.data.object;
      console.log('✅ Monthly renewal successful');
      break;

    case 'customer.subscription.deleted':
      // Cancelamento
      const subscription = event.data.object;
      await prisma.user.update({
        where: { subscriptionId: subscription.id },
        data: { plan: 'FREE' },
      });
      
      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: 'cancelled' },
      });
      
      console.log('❌ Subscription cancelled');
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
