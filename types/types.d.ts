declare module 'h3' {
  interface H3EventContext {
    _stripe?: import('stripe').Stripe
  }
}

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    stripe: {
      key: string
      options: import('stripe').Stripe.StripeConfig
    }
  }

  interface PublicRuntimeConfig {
    stripe: {
      key: string
      options?: import('@stripe/stripe-js').StripeConstructorOptions
      manualClientLoad?: boolean
    }
  }
}

export {}
