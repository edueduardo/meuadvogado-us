// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { lawyerId, plan } = session.metadata || {};

        if (lawyerId && plan) {
          await prisma.lawyer.update({
            where: { id: lawyerId },
            data: {
              plan: plan as "FREE" | "PREMIUM" | "FEATURED",
            },
          });

          await prisma.payment.create({
            data: {
              lawyerId,
              stripeSessionId: session.id,
              stripePaymentId: session.payment_intent as string,
              amount: session.amount_total || 0,
              currency: session.currency || "usd",
              type: "subscription",
              description: `Plano ${plan}`,
              status: "completed",
              completedAt: new Date(),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const lawyerId = subscription.metadata?.lawyerId;

        if (lawyerId) {
          await prisma.lawyer.update({
            where: { id: lawyerId },
            data: { plan: "FREE" },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment succeeded:", invoice.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Payment failed:", invoice.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
