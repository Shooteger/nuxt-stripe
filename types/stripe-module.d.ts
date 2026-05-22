declare module 'h3' {
  interface H3EventContext {
    _stripe?: import('stripe').default
  }
}

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    stripe: {
      secretKey: string
      options: ConstructorParameters<typeof import('stripe').default>[1]
    }
  }

  interface PublicRuntimeConfig {
    stripe: {
      publishableKey: string
      options?: import('@stripe/stripe-js').StripeConstructorOptions
      manualClientLoad?: boolean
    }
  }
}

export { }
