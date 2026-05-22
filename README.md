# A Nuxt 3/4 module for integrating Stripe

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

With this Nuxt module you can use Stripe easily in your client or server side. Use `useServerStripe(event)` in your server routes and `useClientStripe()` on the client. `@stripe/stripe-js` is optional and only needed if you want to use client-side features of Stripe.

[Release Notes](/CHANGELOG.md) -
[Online playground](https://stackblitz.com/github/Shooteger/nuxt-stripe?file=playground%2Fapp.vue)

## Features

- **Server-side Stripe** via `useServerStripe(event)` — singleton per request context
- **Client-side Stripe** via `useClientStripe()` — wraps `loadStripe` with auto-load or manual mode
- **Runtime config support** — configure via module options or `runtimeConfig`
- **TypeScript first** — full types for both server and client
- **Nuxt 3 and 4 compatible** — Minimum Nuxt version is 3.1.0

## Installation

One of the changes over the original fork is, that this module uses stripe packages as **peer dependencies**, which gives you full control over which Stripe versions you use and avoids duplicate instances in your project.

```bash
# Server + client side (Stripe Elements, client-side UI)
npm install @shooteger/nuxt-stripe stripe @stripe/stripe-js

# Server side only (webhooks, payment intents, checkout sessions, ...)
npm install @shooteger/nuxt-stripe stripe
```

> **Peer dependency versions:** Both stripe and @stripe/stripe-js are peer dependencies — you control which versions you use and avoid duplicate instances in your project. stripe >= 17.0.0 and @stripe/stripe-js >= 5.0.0 are supported. @stripe/stripe-js is fully optional and only needed for client-side usage.

Add the module to your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ["@shooteger/nuxt-stripe"],
});
```

## Configuration

### Environment Variables

The recommended way to configure keys is via environment variables:

```env
NUXT_STRIPE_KEY=sk_test_...
NUXT_PUBLIC_STRIPE_KEY=pk_test_...
```

Nuxt picks these up automatically via its [runtime config](https://nuxt.com/docs/guide/going-further/runtime-config) convention.

### Via module options

```ts
export default defineNuxtConfig({
  modules: ["@shooteger/nuxt-stripe"],
  stripe: {
    server: {
      // key is read from NUXT_STRIPE_SECRET_KEY automatically
      options: {
        // https://github.com/stripe/stripe-node#configuration
      },
    },
    client: {
      // key is read from NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY automatically
      options: {
        // https://stripe.com/docs/js/initializing#init_stripe_js-options
      },
      // manualClientLoad: true, // disable auto-load on mount
    },
  },
});
```

### Via Runtime Config

```ts
export default defineNuxtConfig({
  modules: ["@shooteger/nuxt-stripe"],
  runtimeConfig: {
    stripe: {
      key: "", // NUXT_STRIPE_SECRET_KEY
      options: {},
    },
    public: {
      stripe: {
        key: "", // NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        options: {},
      },
    },
  },
});
```

## Usage

### Server side

Use `useServerStripe(event)` inside any server route or API handler. The Stripe instance is cached per request context, so it is only initialized once per request.

```ts
// server/api/payment-intent.get.ts
import { defineEventHandler } from "h3";
import { useServerStripe } from "#stripe/server";

export default defineEventHandler(async (event) => {
  const stripe = useServerStripe(event);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "eur",
      amount: 2500, // €25.00
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      error: null,
    };
  } catch (e) {
    return {
      clientSecret: null,
      error: e,
    };
  }
});
```

### Client side

`useClientStripe()` wraps `loadStripe` and exposes a reactive `stripe` ref. By default, Stripe loads automatically when the component mounts.

```vue
<script setup lang="ts">
const { stripe, isLoading } = useClientStripe();
</script>

<template>
  <div v-if="isLoading">Loading Stripe...</div>
  <div v-else-if="stripe">Stripe ready</div>
</template>
```

The composable returns:

| Property     | Type                  | Description                         |
| ------------ | --------------------- | ----------------------------------- |
| `stripe`     | `Ref<Stripe \| null>` | The Stripe.js instance              |
| `isLoading`  | `Ref<boolean>`        | Whether Stripe is currently loading |
| `loadStripe` | `Function`            | Manually trigger Stripe load        |

#### Manual load

If you want to control when Stripe loads (e.g. only on the checkout page), set `manualClientLoad: true` in your config and call `loadStripe()` yourself:

```ts
// nuxt.config.ts
stripe: {
  client: {
    manualClientLoad: true,
    key: process.env.STRIPE_PUBLISHABLE_KEY,
  },
}
```

```ts
const { loadStripe, stripe } = useClientStripe();

// Load only when needed
await loadStripe();
```

#### Full payment flow example

```vue
<script setup lang="ts">
const { stripe } = useClientStripe();

watch(stripe, async () => {
  if (!stripe.value) return;

  const { clientSecret } = await $fetch("/api/payment-intent");

  const elements = stripe.value.elements({ clientSecret });
  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
});
</script>
```

## Development

```bash
# Install dependencies
npm install

# Prepare dev environment (run this first)
npm run dev:prepare

# Start playground
npm run dev

# Build module
npm run prepack

# Run tests
npm run test

# Lint
npm run lint

# Release
npm run release
```

## License

[MIT](./LICENCE) — Originally forked from [`@unlok-co/nuxt-stripe`](https://www.npmjs.com/package/@unlok-co/nuxt-stripe) by [`flozero`](https://github.com/flozero/nuxt-stripe), now partly rewritten and independently maintained.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@shooteger/nuxt-stripe/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@shooteger/nuxt-stripe
[npm-downloads-src]: https://img.shields.io/npm/dm/@shooteger/nuxt-stripe.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@shooteger/nuxt-stripe
[license-src]: https://img.shields.io/npm/l/@shooteger/nuxt-stripe.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@shooteger/nuxt-stripe
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
