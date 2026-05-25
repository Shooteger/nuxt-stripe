/**
 * @module @shooteger/nuxt-stripe/runtime/server/services/useServerStripe
 *
 * Server-side composable that creates and caches a per-request singleton
 * Stripe instance. Uses the private runtime config (`NUXT_STRIPE_SECRET_KEY`)
 * to authenticate with the Stripe API.
 */

import Stripe               from 'stripe'
import type { H3Event }     from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'

/**
 * Returns a Stripe server SDK instance for the given H3 event.
 *
 * Implements a **per-request singleton** pattern — the instance is created
 * once and cached on `event.context._stripe` so subsequent calls within the
 * same request reuse the same object. This avoids re-authenticating with
 * Stripe on every usage.
 *
 * @param event - The H3 event object originating from the Nuxt server handler.
 * @returns A configured Stripe instance ready for server-side API calls.
 *
 * @example
 * ```ts
 * import { defineEventHandler } from 'h3'
 * import { useServerStripe } from '#stripe/server'
 *
 * export default defineEventHandler(async (event) => {
 *   const stripe = useServerStripe(event)
 *   const product = await stripe.products.retrieve('prod_xxx')
 *   return product
 * })
 * ```
 */
export const useServerStripe = (event: H3Event): Stripe => {
  // Return cached instance if already initialised for this request.
  if (event.context._stripe) {
    return event.context._stripe
  }

  // Read the secret key and SDK options from the private runtime config.
  const { stripe: { secretKey, options } } = useRuntimeConfig(event)

  // Warn if no secret key is configured (the Stripe constructor will still
  // be called but calls will fail at the API level).
  if (!secretKey) {
    console.warn(
      '[@shooteger/nuxt-stripe] No secret key configured. ' +
      'Set NUXT_STRIPE_SECRET_KEY in your .env'
    )
  }

  // Initialise a new Stripe SDK instance.
  // Ref: https://stripe.com/docs/api/versioning
  const stripe = new Stripe(secretKey, options)

  // Cache the instance on the event context so subsequent calls in the same
  // request handler skip initialisation.
  event.context._stripe = stripe

  return stripe
}
