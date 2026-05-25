<script setup lang="ts">
  /**
   * OtherOverride.vue
   *
   * Demonstrates passing a different publishable key to `loadStripe()` than
   * the one configured globally. Useful for scenarios where a section of the
   * app uses a separate Stripe account (e.g. Connect platforms).
   */
  import type { Stripe } from '@stripe/stripe-js'

  // Destructure the manual loader — no auto-load because `manualClientLoad: true`.
  const { loadStripe } = useClientStripe()

  // Local ref to hold the Stripe instance loaded with an override key.
  const stripeOverride = ref<Stripe | null>(null)

  onMounted(async () => {
    // Load Stripe with a hard-coded override publishable key instead of
    // the one from runtime config.
    stripeOverride.value = await loadStripe('pk_test_override')
  })
</script>

<template>
  <section>
    <h2>Stripe client OtherOverride</h2>
    <code>{{ stripeOverride ? 'loaded': 'Loading...' }}</code>
  </section>
</template>

