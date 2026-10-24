import { defineEventHandler } from 'h3'

// No import: useServerStripe is registered as a Nitro auto-import
export default defineEventHandler((event) => {
  const stripe = useServerStripe(event)

  return {
    version: stripe.VERSION,
    cached: event.context._stripe === stripe,
  }
})
