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
/**
 * Playground entry point — Root application component.
 *
 * Demonstrates manual client-side Stripe loading with an explicit publishable key
 * passed to `loadStripe()` rather than relying on auto-config.
 */
import { useNuxtApp, useClientStripe } from "#imports";

// Destructure the manual-load helpers from the client Stripe composable.
// Because `manualClientLoad: true` is set in nuxt.config.ts, Stripe does NOT
// auto-initialise on mount — we must call `loadStripe()` ourselves.
const { loadStripe, stripe } = useClientStripe();

// Access the Nuxt runtime app to read public runtime config values.
const nuxtApp = useNuxtApp();

// Explicitly pass the publishable key from the public runtime config.
// When called without arguments, `loadStripe()` reads
// `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from the environment automatically.
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
