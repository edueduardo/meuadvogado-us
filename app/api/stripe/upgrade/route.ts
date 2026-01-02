import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json();
    
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const planDetails = PLANS[plan as keyof typeof PLANS];
    
    // Verificar se o plano tem priceId
    if (!planDetails.priceId) {
      return NextResponse.json(
        { error: 'Plan not available for purchase' },
        { status: 400 }
      );
    }
    
    // Criar checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planDetails.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?cancelled=true`,
      customer_email: 'user@example.com', // TODO: Pegar email do usuário logado
      client_reference_id: 'user-id', // TODO: Pegar ID do usuário logado
      metadata: {
        plan,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
