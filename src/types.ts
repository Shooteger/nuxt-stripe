/**
 * @module @shooteger/nuxt-stripe/types
 *
 * Barrel re-exports for all Stripe-related types used by the module.
 * Consumers can import these types directly from `@shooteger/nuxt-stripe`.
 */

// Re-export the Stripe server SDK class under an alias to avoid naming
// collisions with the client-side `Stripe` type from `@stripe/stripe-js`.
export type { Stripe as ServerStripe } from 'stripe'

// Re-export client-side Stripe.js types for convenience.
// These come from the optional `@stripe/stripe-js` peer dependency.

export type {
  Stripe,
  StripeConstructorOptions,
  StripeElements,
  StripeElement,
  StripePaymentElement
} from '@stripe/stripe-js'
