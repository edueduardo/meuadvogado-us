import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const PLANS = {
  premium: {
    name: 'Premium',
    price: 19900, // $199.00 em centavos
    currency: 'brl',
  },
  featured: {
    name: 'Destaque',
    price: 39900, // $399.00 em centavos
    currency: 'brl',
  },
};
