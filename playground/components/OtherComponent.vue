<script setup lang="ts">
  /**
   * OtherComponent.vue
   *
   * Watches the shared Stripe instance and, once loaded, fetches a
   * PaymentIntent client secret from the server, then mounts a
   * Link Authentication element for a streamlined checkout experience.
   */
  // Access the shared Stripe instance (same `useState` across all components).
  const { stripe } = useClientStripe()

  // Reactively watch the Stripe instance. `immediate: true` runs the handler
  // right away so it picks up Stripe even if it was already loaded before
  // this component mounted.
  watch(
    stripe,
    async () => {
      // Guard: bail out if the Stripe instance isn't ready yet.
      if (!stripe.value) return

      // Fetch a fresh PaymentIntent client secret from the server API.
      const { clientSecret, error } = await $fetch<{ clientSecret: string | null; error: unknown }>(
        '/api/create-payment-intent'
      )

      // Handle server-side errors gracefully.
      if (error || !clientSecret) {
        console.error(error ?? 'Client secret not initialized')
        return
      }

      // Create an Elements group scoped to this PaymentIntent.
      const elements                  = stripe.value.elements({ clientSecret })
      // Create and mount a Link Authentication element (email collection).
      const linkAuthenticationElement = elements.create('linkAuthentication')
      linkAuthenticationElement.mount('#linkAuthenticationElement')
    },
    { immediate: true }
  )
</script>

<template>
  <section>
    <h2>Stripe client OtherComponent</h2>
    <code>
      <span id="linkAuthenticationElement" />
    </code>
  </section>
</template>
