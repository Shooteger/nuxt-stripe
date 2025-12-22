import Stripe from 'stripe'
import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

/**
 * useServerStripe composable
 *
 * Initializes and returns a Stripe instance for server-side usage in Nuxt.
 * Implements singleton pattern per event context to avoid unnecessary re-initializations.
 *
 * @param {H3Event} event - The H3 event object from the request handler
 * @returns {Stripe} - The Stripe server instance for the event context
 */
export const useServerStripe = (event: H3Event): Stripe => {
  // Return existing instance if already initialized in event context
  if (event.context._stripe) {
    return event.context._stripe
  }

  const { stripe: { key, options } } = useRuntimeConfig(event)

  if (!key) {
    console.warn('[@unlok-co/nuxt-stripe] No secret key configured for Stripe server.')
  }

  // @docs — https://stripe.com/docs/api/versioning
  const stripe = new Stripe(key, options)

  // Store the initialized Stripe instance in the event context for future use
  event.context._stripe = stripe

  return stripe
}
