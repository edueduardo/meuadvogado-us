import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    // BLOCKED: Autenticação não implementada
    return NextResponse.json(
      { error: 'Endpoint bloqueado: autenticação não está implementada. Implemente o sistema de autenticação para ativar este endpoint.' },
      { status: 401 }
    );

    // Quando autenticação estiver implementada, descomentar e usar userId/email real:
    // const userId = session.user.id; // Extrair de contexto autenticado (NextAuth, etc)
    // const userEmail = session.user.email;
    // const { plan } = await req.json();
    //
    // if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    //   return NextResponse.json(
    //     { error: 'Invalid plan' },
    //     { status: 400 }
    //   );
    // }
    //
    // const planDetails = PLANS[plan as keyof typeof PLANS];
    //
    // if (!planDetails.priceId) {
    //   return NextResponse.json(
    //     { error: 'Plan not available for purchase' },
    //     { status: 400 }
    //   );
    // }
    //
    // const session = await stripe.checkout.sessions.create({
    //   mode: 'subscription',
    //   payment_method_types: ['card'],
    //   line_items: [
    //     {
    //       price: planDetails.priceId,
    //       quantity: 1,
    //     },
    //   ],
    //   success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?cancelled=true`,
    //   customer_email: userEmail,
    //   client_reference_id: userId,
    //   metadata: {
    //     plan,
    //   },
    // });
    //
    // return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
