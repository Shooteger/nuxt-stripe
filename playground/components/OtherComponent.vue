<template>
  <section>
    <h2>Stripe client OtherComponent</h2>
    <code>
      <div id="linkAuthenticationElement" />
    </code>
  </section>
</template>

<script setup lang="ts">
import { useClientStripe } from "#imports";
import { watch } from "vue";

const { stripe } = useClientStripe();

watch(
  stripe,
  async () => {
    if (!stripe.value) return;

    const { clientSecret, error } = await $fetch<{ clientSecret: string | null; error: unknown }>(
      "/api/create-payment-intent"
    );

    if (error || !clientSecret) {
      console.error(error ?? "Client secret not initialized");
      return;
    }

    const elements = stripe.value.elements({ clientSecret });
    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#linkAuthenticationElement");
  },
  { immediate: true }
);
</script>
