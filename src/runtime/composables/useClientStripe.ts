import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeConstructorOptions } from "@stripe/stripe-js";
import { useNuxtApp, useState, onMounted } from "#imports";

export default function useClientStripe() {
  const nuxtApp = useNuxtApp();
  const stripe = useState<Stripe | null>("stripe-client", () => null);
  const isLoading = useState<boolean>("stripe-client-loading", () => false);

  async function _loadStripe(
    key?: string,
    options?: StripeConstructorOptions
  ): Promise<Stripe | null> {
    const config = nuxtApp.$config.public.stripe;
    const _key = key ?? config.key;
    const _options = options ?? config.options;

    // Return existing instance if already loaded and not in manual mode
    if (stripe.value && !config.manualClientLoad) {
      return stripe.value;
    }

    if (!_key) {
      console.warn("[@unlok-co/nuxt-stripe] No publishable key provided for Stripe client");
      return null;
    }

    // Don't start a new load if already loading
    if (isLoading.value) {
      // Wait for existing load to complete
      return new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (!isLoading.value) {
            clearInterval(checkLoaded);
            resolve(stripe.value);
          }
        }, 100);
      });
    }

    isLoading.value = true;

    try {
      const _stripe = await loadStripe(_key, _options);

      isLoading.value = false;

      // Only store in state if not in manual mode
      if (!config.manualClientLoad) {
        stripe.value = _stripe;
      }

      return _stripe;
    } catch (error) {
      isLoading.value = false;
      console.error("[@unlok-co/nuxt-stripe] Failed to load Stripe client:", error);
      return null;
    }
  }

  onMounted(async () => {
    const config = nuxtApp.$config.public.stripe;
    if (config.manualClientLoad) return;

    // Only load if not already loaded or loading
    if (!stripe.value && !isLoading.value) {
      await _loadStripe();
    }
  });

  return {
    loadStripe: _loadStripe,
    stripe,
    isLoading,
  };
}
