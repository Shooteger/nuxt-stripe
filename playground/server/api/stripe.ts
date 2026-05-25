/**
 * Server API endpoint — Stripe instance introspection.
 *
 * GET /api/stripe
 *
 * Returns the version of the Stripe Node.js SDK and logs the full
 * instance to the server console for debugging purposes.
 */
import { defineEventHandler } from 'h3'
import { useServerStripe } from '#stripe/server'

export default defineEventHandler(async (event) => {
  // Obtain a per-request singleton Stripe instance (cached on event.context).
  const stripe = useServerStripe(event)

  // Log the full Stripe object to the terminal for inspection.
  console.info('Stripe instance:', stripe)

  // Return a JSON payload with the SDK version and a hint to check the terminal.
  return {
    version: stripe.VERSION,
    message: 'Inspect your terminal to see the full Stripe server object',
  }
})
