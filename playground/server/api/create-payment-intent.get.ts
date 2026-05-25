/**
 * Server API endpoint — Create a Stripe PaymentIntent.
 *
 * GET /api/create-payment-intent
 *
 * Creates a 25.00 EUR PaymentIntent with automatic payment methods enabled.
 * Returns the `client_secret` on success or the error object on failure.
 * The client secret is used on the front-end by Stripe Elements to
 * confirm the payment.
 */
import { defineEventHandler } from 'h3'
import { useServerStripe }    from '#stripe/server'

export default defineEventHandler(async (event) => {
  // Obtain a per-request singleton Stripe instance.
  const stripe = useServerStripe(event)

  try {
    // Create a PaymentIntent with a fixed amount and currency.
    // `automatic_payment_methods: { enabled: true }` lets Stripe
    // dynamically present eligible payment methods to the end user.
    const paymentIntent = await stripe.paymentIntents.create({
      currency:                  'eur',
      amount:                    2500, // Amount in cents (25.00 EUR)
      automatic_payment_methods: { enabled: true }
    })

    // Return the client secret so the front-end can complete the payment.
    return {
      clientSecret: paymentIntent.client_secret,
      error:        null
    }
  } catch (e) {
    // Return a structured error response instead of throwing — the
    // front-end can inspect `error` to surface user-friendly messages.
    return {
      clientSecret: null,
      error:        e
    }
  }
})
