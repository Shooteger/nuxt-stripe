import { defineEventHandler } from "h3";
import { useServerStripe } from "#stripe/server";

export default defineEventHandler(async (event) => {
  // Create a PaymentIntent with the amount, currency, and a payment method type.
  //
  // See the documentation [0] for the full list of supported parameters.
  //
  // [0] https://stripe.com/docs/api/payment_intents/create
  const stripe = useServerStripe(event);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "eur",
      amount: 2500, // €25.00
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      error: null,
    };
  } catch (e) {
    return {
      clientSecret: null,
      error: e,
    };
  }
});
