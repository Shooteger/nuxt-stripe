import type { Stripe, StripeConstructorOptions } from "@stripe/stripe-js";
import { useNuxtApp, useState } from "nuxt/app";
import { onMounted } from "vue";

interface ClientStripeConfig {
  publishableKey?: string
  options?: StripeConstructorOptions
  manualClientLoad?: boolean
}

export default function useClientStripe() {
  const nuxtApp = useNuxtApp();
  const stripe = useState<Stripe | null>("stripe-client", () => null);
  const isLoading = useState<boolean>("stripe-client-loading", () => false);

  async function _loadStripe(
    key?: string,
    options?: StripeConstructorOptions
  ): Promise<Stripe | null> {
    // Safety net — @stripe/stripe-js is an optional peer dependency
    let loadStripe: typeof import("@stripe/stripe-js").loadStripe;
    try {
      const stripeJs = await import("@stripe/stripe-js");
      loadStripe = stripeJs.loadStripe;
    } catch {
      console.error("[@shooteger/nuxt-stripe] @stripe/stripe-js is not installed. Install it to use useClientStripe().");
      return null;
    }

    const config = nuxtApp.$config.public.stripe as ClientStripeConfig;
    const _key = key ?? config.publishableKey;
    const _options = options ?? config.options;

    if (stripe.value && !config.manualClientLoad) {
      return stripe.value;
    }

    if (!_key) {
      console.warn("[@shooteger/nuxt-stripe] No publishable key provided. Set NUXT_PUBLIC_STRIPE_KEY in your .env");
      return null;
    }

    if (isLoading.value) {
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

      if (!config.manualClientLoad) {
        stripe.value = _stripe;
      }

      return _stripe;
    } catch (error) {
      isLoading.value = false;
      console.error("[@shooteger/nuxt-stripe] Failed to load Stripe client:", error);
      return null;
    }
  }

  onMounted(async () => {
    const config = nuxtApp.$config.public.stripe as ClientStripeConfig;
    if (config.manualClientLoad) return;

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
