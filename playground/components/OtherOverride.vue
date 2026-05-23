<script setup lang="ts">
import type { Stripe } from '@stripe/stripe-js'

const { loadStripe } = useClientStripe()
const stripeOverride = ref<Stripe | null>(null)

onMounted(async () => {
  stripeOverride.value = await loadStripe('pk_test_override')
})
</script>

<template>
  <section>
    <h2>Stripe client OtherOverride</h2>
    <code>{{ stripeOverride ? 'loaded' : 'Loading...' }}</code>
  </section>
</template>
