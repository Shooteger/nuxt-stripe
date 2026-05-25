/**
 * @module @shooteger/nuxt-stripe/runtime/composables/useClientStripe
 *
 * Client-side composable for integrating Stripe.js into Nuxt applications.
 *
 * Provides a reactive, shared `stripe` ref and an async `loadStripe()`
 * function that dynamically imports `@stripe/stripe-js` (an optional peer
 * dependency). Supports both automatic (on mount) and manual loading.
 */

import type { Stripe, StripeConstructorOptions } from '@stripe/stripe-js'
import { useNuxtApp, useState }                  from 'nuxt/app'
import { onMounted }                             from 'vue'

/**
 * Shape of the client-side Stripe config stored in public runtime config.
 */
interface ClientStripeConfig {
  /** Publishable key for initialising Stripe.js. */
  publishableKey?: string

  /** Additional options for the Stripe.js constructor. */
  options?: StripeConstructorOptions

  /** If `true`, disables auto-load on mount. */
  manualClientLoad?: boolean
}

/**
 * Composable that provides a shared, reactive Stripe.js instance.
 *
 * @returns An object containing:
 *  - `loadStripe(key?, options?)` — Async function to manually load Stripe.js
 *    and return the Stripe instance. Falls back to runtime config values when
 *    arguments are omitted.
 *  - `stripe` — A `Ref<Stripe | null>` that is shared across all components
 *    via `useState('stripe-client')`.
 *  - `isLoading` — A `Ref<boolean>` that is `true` while Stripe.js is being
 *    fetched.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { loadStripe, stripe, isLoading } = useClientStripe()
 * await loadStripe()  // Only needed when manualClientLoad: true
 * </script>
 * ```
 */
export function useClientStripe() {
  // Access the Nuxt app instance for runtime config lookups.
  const nuxtApp = useNuxtApp()

  // Shared state — all calls to `useClientStripe()` across components
  // reference the same refs, so Stripe is only loaded once.
  const stripe    = useState<Stripe | null>('stripe-client', () => null)
  const isLoading = useState<boolean>('stripe-client-loading', () => false)

  /**
   * Internal loader that does the actual dynamic import and initialisation.
   *
   * @param key   - Optional override publishable key. Defaults to runtime config.
   * @param options - Optional override constructor options. Defaults to runtime config.
   * @returns The Stripe.js instance, or `null` if loading failed or no key is set.
   */
  async function _loadStripe(
    key?: string,
    options?: StripeConstructorOptions
  ): Promise<Stripe | null> {
    // Attempt to dynamically import the optional peer dependency
    // `@stripe/stripe-js` is an optional peer; if not installed, we
    // gracefully log an error and return null instead of crashing.
    let loadStripe: typeof import('@stripe/stripe-js').loadStripe
    try {
      const stripeJs = await import('@stripe/stripe-js')
      loadStripe     = stripeJs.loadStripe
    } catch {
      console.error(
        '[@shooteger/nuxt-stripe] @stripe/stripe-js is not installed. ' +
        'Install it to use useClientStripe().'
      )
      return null
    }

    // Resolve key and options from arguments or runtime config
    const config                                  = nuxtApp.$config.public.stripe as ClientStripeConfig
    const _key                    = key ?? config.publishableKey
    const _options = options ?? config.options

    // If Stripe is already loaded and auto-load is enabled, return the
    // existing instance immediately.
    if (stripe.value && !config.manualClientLoad) {
      return stripe.value
    }

    // Bail if no publishable key is available.
    if (!_key) {
      console.warn(
        '[@shooteger/nuxt-stripe] No publishable key provided. ' +
        'Set NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env'
      )
      return null
    }

    // Deduplicate concurrent load calls
    // If another caller is already loading, wait for it to finish by polling
    // the `isLoading` flag every 100 ms.
    if (isLoading.value) {
      return new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (!isLoading.value) {
            clearInterval(checkLoaded)
            resolve(stripe.value)
          }
        }, 100) // milliseconds
      })
    }

    // Mark loading as in progress.
    isLoading.value = true

    try {
      // Actually load Stripe.js from the Stripe CDN.
      const _stripe   = await loadStripe(_key, _options)
      isLoading.value = false

      // Only write to the shared `stripe` ref when auto-load is enabled.
      // In manual mode the consumer is responsible for assigning the value.
      if (!config.manualClientLoad) {
        stripe.value = _stripe
      }

      return _stripe
    } catch (error) {
      isLoading.value = false
      console.error('[@shooteger/nuxt-stripe] Failed to load Stripe client:', error)
      return null
    }
  }

  // Auto-load on mount (unless manualClientLoad is true)
  onMounted(async () => {
    const config = nuxtApp.$config.public.stripe as ClientStripeConfig
    if (config.manualClientLoad) return

    // Only auto-load if not already loaded or in-flight.
    if (!stripe.value && !isLoading.value) {
      await _loadStripe()
    }
  })

  return {
    loadStripe: _loadStripe,
    stripe,
    isLoading
  }
}
