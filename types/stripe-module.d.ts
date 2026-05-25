/**
 * Type augmentation file for `@shooteger/nuxt-stripe`.
 *
 * Extends H3 and Nuxt runtime config interfaces with Stripe-related
 * properties so that TypeScript recognises:
 *  - `event.context._stripe` (per-request singleton)
 *  - `useRuntimeConfig().stripe` (private server config)
 *  - `useRuntimeConfig().public.stripe` (public client config)
 */

/**
 * Augment H3's `H3EventContext` so the per-request Stripe singleton
 * is properly typed when accessed via `event.context._stripe`.
 */
declare module 'h3' {
  interface H3EventContext {
    /** Per-request cached Stripe server instance. */
    _stripe?: import('stripe').default
  }
}

/**
 * Augment Nuxt's runtime config schemas so the module's config keys
 * (`stripe` for server, `public.stripe` for client) are recognised
 * and type-checked.
 */
declare module 'nuxt/schema' {
  interface RuntimeConfig {
    /** Private (server-only) Stripe configuration. */
    stripe: {
      /** Secret key for authenticating with the Stripe API. */
      secretKey: string
      /** Additional options forwarded to the Stripe Node.js SDK constructor. */
      options: ConstructorParameters<typeof import('stripe').default>[1]
    }
  }

  interface PublicRuntimeConfig {
    /** Public (client-side) Stripe configuration. */
    stripe: {
      /** Publishable key for initialising Stripe.js in the browser. */
      publishableKey: string
      /** Additional options forwarded to the Stripe.js constructor. */
      options?: import('@stripe/stripe-js').StripeConstructorOptions
      /**
       * When `true`, Stripe.js will not auto-load on mount.
       * The consumer must call `loadStripe()` manually.
       */
      manualClientLoad?: boolean
    }
  }
}

export { }
