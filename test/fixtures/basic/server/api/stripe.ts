import { defineEventHandler } from 'h3'
import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
  const stripe = useServerStripe(event)

  return {
    status: 200,
    version: stripe.VERSION,
  }
})
