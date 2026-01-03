// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe não configurado. Adicione STRIPE_SECRET_KEY nas variáveis de ambiente." },
        { status: 500 }
      );
    }

    const user = await getCurrentUser();
    if (!user || user.role !== "LAWYER") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { plan, interval } = await req.json();

    if (!plan || !interval) {
      return NextResponse.json({ error: "Plano e intervalo obrigatórios" }, { status: 400 });
    }

    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: user.id },
    });

    if (!lawyer) {
      return NextResponse.json({ error: "Advogado não encontrado" }, { status: 404 });
    }

    let priceId: string;
    if (plan === "PREMIUM" && interval === "monthly") {
      priceId = STRIPE_PLANS.PREMIUM_MONTHLY;
    } else if (plan === "PREMIUM" && interval === "annual") {
      priceId = STRIPE_PLANS.PREMIUM_ANNUAL;
    } else if (plan === "FEATURED" && interval === "monthly") {
      priceId = STRIPE_PLANS.FEATURED_MONTHLY;
    } else if (plan === "FEATURED" && interval === "annual") {
      priceId = STRIPE_PLANS.FEATURED_ANNUAL;
    } else {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/advogado/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/advogado/planos`,
      metadata: {
        userId: user.id,
        lawyerId: lawyer.id,
        plan,
        interval,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Erro ao criar sessão de checkout" }, { status: 500 });
  }
}
