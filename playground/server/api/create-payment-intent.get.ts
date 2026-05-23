import { defineEventHandler } from 'h3'
import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
  const stripe = useServerStripe(event)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'eur',
      amount: 2500,
      automatic_payment_methods: { enabled: true },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      error: null,
    }
  } catch (e) {
    return {
      clientSecret: null,
      error: e,
    }
  }
})
