/**
 * Nuxt configuration for the `@shooteger/nuxt-stripe` playground.
 *
 * Registers the local module source, enables devtools, and sets
 * `manualClientLoad: true` so each page/component controls when
 * the Stripe.js SDK is fetched instead of auto-loading on mount.
 */
export default defineNuxtConfig({
  // Point to the local module source (parent directory) during development.
  modules:           [ '../src/module' ],
  // Enable Nuxt DevTools for the playground.
  devtools:          { enabled: true },
  // Configure the Stripe module options.
  stripe:            {
    client: {
      // When `true`, `useClientStripe()` does NOT automatically load
      // `@stripe/stripe-js` on mount. The consumer must call
      // `loadStripe()` explicitly.
      manualClientLoad: true
    },
    // No server-specific overrides for the playground.
    server: {}
  },
  // Pinned compatibility date ensures Nuxt uses the correct behaviour
  // for APIs that have changed over time.
  compatibilityDate: '2026-05-22'
})
