<template>
  <main>
    <h1>Nuxt - Stripe module playground</h1>
    <section class="section">
      <h2>Stripe client — app.vue (manual load)</h2>
      <ClientOnly>
        <code>{{ stripe ? "Stripe loaded" : "Loading..." }}</code>
        <template #fallback>
          <code>⏳ SSR — client not loaded yet</code>
        </template>
      </ClientOnly>
    </section>
    <OtherComponent class="section" />
    <OtherOverride class="section" />
  </main>
</template>

<script setup lang="ts">
import { useNuxtApp, useClientStripe } from "#imports";

// manualClientLoad: true is set in nuxt.config.ts
// This means we control when and where Stripe loads instead of auto-loading on mount
const { loadStripe, stripe } = useClientStripe();
const nuxtApp = useNuxtApp();

// Pass publishableKey explicitly here since manualClientLoad bypasses auto-config
// Remove the argument to use NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY from .env automatically
stripe.value = await loadStripe(nuxtApp.$config.public.stripe.publishableKey);
</script>

<style>
html {
  background-color: #222;
  color: #fff;
  font-family: sans-serif;
  font-size: 1rem;
  margin: 1rem;
}

h1,
h2 {
  margin: 0 0 1.5rem;
}

section {
  background-color: #2f2d2d;
  border-radius: 1rem;
  font-family: monospace;
  padding: 1.5rem;
  white-space: pre-wrap;
}

.section {
  margin-bottom: 1.5rem;
}

.section:last-child {
  margin-bottom: 0;
}
</style>
