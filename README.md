# A Nuxt module for integrating Stripe

[![npm version][npm-version-src]][npm-version-href] [![npm downloads][npm-downloads-src]][npm-downloads-href] [![License][license-src]][license-href] [![Nuxt][nuxt-src]][nuxt-href]

This Nuxt module enables seamless integration of Stripe on both the client and server sides. Use `useServerStripe(event)` within your server routes and `useClientStripe()` on the client. The `@stripe/stripe-js` library is optional and required only if you wish to access Stripe's client-side features.

**Table of Contents**

- [Features](#features)
- [Installation](#installation)
  - [1. Server and clients](#1-server-and-clients)
  - [2. Server-side only](#2-server-side-only)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Via module options](#via-module-options)
  - [Via Runtime Config](#via-runtime-config)
- [TypeScript](#typescript)
- [Usage](#usage-1)
  - [Server side](#server-side)
  - [Client side](#client-side)
    - [Manual load](#manual-load)
    - [Full payment flow example](#full-payment-flow-example)
- [Development](#development)
- [License](#license)

**Resources:**

* [Release Notes](/CHANGELOG.md)
* [Online playground](https://stackblitz.com/github/Shooteger/nuxt-stripe?file=playground%2Fapp.vue)

## Features

- **Server-side Stripe**: Usage via `useServerStripe(event)` — singleton per request context
- **Client-side Stripe** Usage via `useClientStripe()` — wraps `loadStripe` with auto-load or manual mode
- **Runtime config**: Configure via module options or `runtimeConfig`
- **TypeScript first**: Full types for both server and client
- **Nuxt 3 and 4 compatible**: Minimum Nuxt version is `v3.1.0`

## Installation

> [!IMPORTANT]
>
> If you are using Nuxt 3, make sure to upgrade at least to `v3.1.0` or higher.

This module differs from the original fork by using Stripe packages as **peer dependencies**, allowing you to fully control the Stripe versions you use and preventing duplicate instances within your project.

### 1. Server and clients

Access to `StripeElements` and client-side UI.

```bash
# Install via one packager manager: npm, yarn, bun, pnpm, deno
npm install @shooteger/nuxt-stripe stripe @stripe/stripe-js
```

### 2. Server-side only

This is used for webhooks, payment intents, checkout sessions, and others.

```bash
# Server-side only
npm install @shooteger/nuxt-stripe stripe
```

> [!TIP]
>
> **Peer dependency versions**
>
> Both stripe and `@stripe/stripe-js` are peer dependencies. Your responsibility is to specify compatible versions to prevent duplicate instances in your project.
>
> **Supported versions**
>
> * `stripe` >= `17.0.0`
> * `@stripe/stripe-js` >= `5.0.0`
>
> `@stripe/stripe-js` is optional and required only for client-side implementation.

Add the module to your Nuxt configuration file:

```ts
// File: nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    "@shooteger/nuxt-stripe"
    // Your other Nuxt modules...
  ],
});
```

## Configuration

### Environment Variables

This module requires Stripe's secret key and public key for your organization. You will find both on Stripe's Dashboard (depending on your selection, either production or test version) → "Settings" (⚙️ on the top right) → "Developers" → "Manage API keys".

> [!TIP]
>
> You can verify whether you are using the test keys by checking if the secret starts with `sk_test_...` and the public key `pk_test_...`.

The recommended way to configure keys is via an `.env` environment file:

```bash
cp -n .env.example .env
```

Open `.env` and fill out:

```env
// File: .env

NUXT_STRIPE_SECRET_KEY=sk_test_...
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Nuxt picks these up automatically via its [runtime config](https://nuxt.com/docs/guide/going-further/runtime-config) convention.

You can add the keys also directly into your Nuxt configuration file

### Via module options

```ts
// File: nuxt.config.ts

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

## TypeScript

All Stripe types are re-exported directly from this module. No need to import from `stripe` or `@stripe/stripe-js` separately:

```ts
import type { ServerStripe, Stripe, StripeElements } from '@shooteger/nuxt-stripe'
```

| Type                   | Source              | Description                                                  |
| ---------------------- | ------------------- | ------------------------------------------------------------ |
| `ServerStripe`         | `stripe`            | Server-side Stripe instance (aliased to avoid collision with client `Stripe`) |
| `Stripe`               | `@stripe/stripe-js` | Client-side Stripe.js instance                               |
| `StripeElements`       | `@stripe/stripe-js` | Stripe Elements container                                    |
| `StripeElement`        | `@stripe/stripe-js` | Individual Stripe Element                                    |
| `StripePaymentElement` | `@stripe/stripe-js` | Payment Element specifically                                 |

## Usage

### Server side

Use `useServerStripe(event)` in any server route or API handler. The Stripe instance is cached per request context, so it is initialized only once per request.

```ts
// File: server/api/payment-intent.get.ts

import { defineEventHandler } from "h3";
import { useServerStripe } from "#stripe/server";

export default defineEventHandler(async (event) => {
  const stripe = useServerStripe(event);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "eur",
      amount: 2500, // € 25.00
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

`useClientStripe()` wraps `loadStripe` and exposes a reactive Stripe reactive variable (`ref`). By default, Stripe loads automatically when the component mounts.

```vue
<!-- Example file: app/pages/StripePayment.vue -->
<script lang="ts" setup>
	const { stripe, isLoading } = useClientStripe();
</script>

<template>
  <div v-if="isLoading">Loading Stripe...</div>
  <div v-else-if="stripe">Stripe ready</div>
	<div v-else=>Could not load Stripe</div>
</template>
```

`useClientStripe()` returns the following data:

| Property     | Type                  | Description                         |
| ------------ | --------------------- | ----------------------------------- |
| `stripe`     | `Ref<Stripe \| null>` | The Stripe.js instance              |
| `isLoading`  | `Ref<boolean>`        | Whether Stripe is currently loading |
| `loadStripe` | `Function`            | Manually trigger Stripe load        |

#### Manual load

If you want to control when Stripe loads, e.g., only on the checkout page, set `manualClientLoad` to `true` in your configuration and call `loadStripe()` yourself as seen in this example:

```ts
// File: nuxt.config.ts

stripe: {
  client: {
    manualClientLoad: true,
    key: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
}
```

```ts
// Example file: app/pages/StripeCheckout.vue

const { loadStripe, stripe } = useClientStripe();

// Load only when needed
await loadStripe();
```

#### Full payment flow example

The following is an example displaying the full payment flow within the `<script>` part of a Nuxt page:

```vue
<!-- Example file: app/pages/StripePayment.vue -->

<script lang="ts" setup>
const { stripe } = useClientStripe();

watch(stripe, async () => {
  if (!stripe.value) return;

  const { clientSecret } 	= await $fetch("/api/payment-intent");
  const elements 					= stripe.value.elements({ clientSecret });
  const paymentElement 		= elements.create("payment");
  
  paymentElement.mount("#payment-element");
});
</script>
```

## Development

To turn this module into a production-ready Nuxt module, follow these steps:

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

# Release into dist/ directory
npm run release
```

## License

[MIT](./LICENCE)

Originally forked from [`@unlok-co/nuxt-stripe`](https://www.npmjs.com/package/@unlok-co/nuxt-stripe) by [`flozero`](https://github.com/flozero/nuxt-stripe), now partly rewritten and independently maintained.

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@shooteger/nuxt-stripe/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@shooteger/nuxt-stripe
[npm-downloads-src]: https://img.shields.io/npm/dm/@shooteger/nuxt-stripe.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@shooteger/nuxt-stripe
[license-src]: https://img.shields.io/npm/l/@shooteger/nuxt-stripe.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@shooteger/nuxt-stripe
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
