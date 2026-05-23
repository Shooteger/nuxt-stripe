<script setup lang="ts">
const { stripe, isLoading } = useClientStripe()
</script>

<template>
  <h1>Nuxt Stripe module test</h1>
  <client-only>
    <div v-if="isLoading">Loading Stripe...</div>
    <code v-else-if="stripe">
      Stripe loaded: {{ stripe }}
    </code>
    <div v-else>Stripe not available</div>
  </client-only>
  <OtherComponent />
</template>
