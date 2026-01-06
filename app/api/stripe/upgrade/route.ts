import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { LAWYER_PLANS } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'LAWYER') {
      return NextResponse.json(
        { error: 'Apenas advogados podem fazer upgrade de plano' },
        { status: 403 }
      );
    }

    const { plan } = await req.json();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan é obrigatório' },
        { status: 400 }
      );
    }

    // Validar plano
    const planDetails = LAWYER_PLANS.find(p => p.id === plan);
    if (!planDetails) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    // Se for plano FREE, não precisa de pagamento
    if (plan === 'free') {
      return NextResponse.json({
        success: true,
        message: 'Plano atualizado para FREE',
      });
    }

    // Validar se tem priceId configurado
    if (!planDetails.stripePriceIdMonthly) {
      return NextResponse.json(
        { error: 'Este plano não está disponível para compra no momento' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Validar se Stripe está configurado
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe não está configurado. Entre em contato com o suporte.' },
        { status: 503 }
      );
    }

    // Criar sessão de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planDetails.stripePriceIdMonthly,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/advogado/planos?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/advogado/planos?cancelled=true`,
      customer_email: session.user.email || '',
      client_reference_id: session.user.id,
      metadata: {
        plan,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Erro ao criar sessão de pagamento' },
      { status: 500 }
    );
  }
}
