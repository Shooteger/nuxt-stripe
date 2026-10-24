import type Stripe from 'stripe'

// Server-side types
// Declared as a local alias (not `export { Stripe as ServerStripe } from 'stripe'`) because
// @nuxt/module-builder drops the rename when generating dist/types.d.mts, which made it resolve to `any`.
export type ServerStripe = Stripe

// Client-side types
export type { Stripe, StripeConstructorOptions, StripeElements, StripeElement, StripePaymentElement } from '@stripe/stripe-js'
