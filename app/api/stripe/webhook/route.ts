import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/plans';

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

// Tipos para compatibilidade
type PlanType = 'FREE' | 'PREMIUM' | 'FEATURED';

function toPlan(planRaw?: string): PlanType {
  const plan = (planRaw || '').toUpperCase();
  if (plan === 'PREMIUM') return 'PREMIUM';
  if (plan === 'FEATURED') return 'FEATURED';
  return 'FREE';
}

function getStripePriceId(plan: PlanType): string | null {
  const key = plan as keyof typeof PLANS; // FREE | PREMIUM | FEATURED
  const entry = PLANS[key];
  return entry?.priceId ?? null;
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
    case 'checkout.session.completed': {
      const session = event.data.object;
      const plan = toPlan(session.metadata?.plan);

      // Atualizar plano do usuário (Plan enum)
      if (session.customer_email) {
        await prisma.user.update({
          where: { email: session.customer_email },
          data: { plan: plan as any }, // Cast para any para compatibilidade
        });
      }

      // Criar/atualizar assinatura usando o schema atual:
      // Subscription: userId (unique), stripeCustomerId (unique), stripePriceId, status, currentPeriodEnd
      if (session.client_reference_id && session.customer) {
        const stripePriceId = getStripePriceId(plan);

        // Period end real (se possível). Fallback: +30 dias.
        let currentPeriodEnd = new Date(
          (session.created || 0) * 1000 + 30 * 24 * 60 * 60 * 1000
        );

        if (session.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            currentPeriodEnd = new Date(sub.current_period_end * 1000);
          } catch (e) {
            console.warn(
              'Could not retrieve Stripe subscription period end, using fallback.',
              e
            );
          }
        }

        if (stripePriceId) {
          await prisma.subscription.upsert({
            where: { userId: session.client_reference_id },
            update: {
              stripeCustomerId: session.customer as string,
              stripePriceId,
              status: 'active',
              currentPeriodEnd,
            },
            create: {
              userId: session.client_reference_id,
              stripeCustomerId: session.customer as string,
              stripePriceId,
              status: 'active',
              currentPeriodEnd,
            },
          });
        }
      }

      console.log('✅ Payment successful, subscription processed');
      break;
    }

    case 'invoice.payment_succeeded':
      console.log('✅ Monthly renewal successful');
      break;

    case 'customer.subscription.deleted': {
      const sub = event.data.object as unknown as {
        id?: string;
        customer?: string | { id?: string };
        current_period_end?: number;
      };

      const stripeCustomerId =
        typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;

      const currentPeriodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : new Date();

      if (stripeCustomerId) {
        const record = await prisma.subscription.findFirst({
          where: { stripeCustomerId },
        });

        await prisma.subscription.updateMany({
          where: { stripeCustomerId },
          data: { status: 'cancelled', currentPeriodEnd },
        });

        if (record) {
          await prisma.user.update({
            where: { id: record.userId },
            data: { plan: 'FREE' as any },
          });
        }
      }

      console.log('❌ Subscription cancelled');
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
