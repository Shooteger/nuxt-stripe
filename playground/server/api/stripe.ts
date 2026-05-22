import { defineEventHandler } from 'h3'
import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
  const stripe = useServerStripe(event)
  console.info('Stripe instance:', stripe)

  return {
    version: stripe.VERSION,
    message: 'Inspect your terminal to see the full Stripe server object',
  }
})
