/**
 * @module @shooteger/nuxt-stripe/module
 *
 * Nuxt module definition — the entry point of `@shooteger/nuxt-stripe`.
 * Registers server and client Stripe composables, sets up runtime config,
 * configures Nitro aliases, and ensures type augmentation is included.
 */

import { fileURLToPath }                    from 'node:url'
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import defu                                 from 'defu'
import type Stripe                          from 'stripe'
import type { StripeConstructorOptions }    from '@stripe/stripe-js'
import type { NitroOptions }                from 'nitropack'


/**
 * Stripe server-side SDK constructor options.
 * Mirrors the second argument of `new Stripe(secretKey, options)`.
 */
type StripeConfig = ConstructorParameters<typeof Stripe>[1];


/**
 * Server-side Stripe configuration exposed via `nuxt.config.ts` → `stripe.server`.
 */
export interface ServerStripeOptions {
  /**
   * Stripe secret key used to authenticate server-side API requests.
   * Falls back to `NUXT_STRIPE_SECRET_KEY` environment variable at runtime.
   */
  secretKey?: string;
  /**
   * Additional constructor options forwarded to the Stripe Node.js SDK.
   */
  options?: StripeConfig;
}

/**
 * Client-side Stripe configuration exposed via `nuxt.config.ts` → `stripe.client`.
 */
export interface ClientStripeOptions {
  /**
   * Publishable key used to initialise Stripe.js in the browser.
   * Falls back to `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variable.
   */
  publishableKey?: string;
  /**
   * Constructor options forwarded to `@stripe/stripe-js`.
   */
  options?: StripeConstructorOptions;
  /**
   * When `true`, `useClientStripe()` will NOT auto-load Stripe.js on mount.
   * Consumers must call `loadStripe()` explicitly.
   */
  manualClientLoad?: boolean;
}

/**
 * Module options shape accepted under the `stripe` key in `nuxt.config.ts`.
 */
export interface ModuleOptions {
  /** Server-side Stripe configuration (secret key, SDK options). */
  server: ServerStripeOptions;
  /** Client-side Stripe configuration (publishable key, JS options, manual load flag). */
  client: ClientStripeOptions & { manualClientLoad?: boolean };
}


/**
 * Nuxt module that integrates Stripe SDKs into both server and client runtimes.
 *
 * Features:
 * - Server: per-request singleton Stripe instance via `useServerStripe()`.
 * - Client: shared reactive Stripe instance via `useClientStripe()` with
 *   optional manual load control.
 * - Auto-imports composables and registers Nitro aliases for easy imports.
 *
 * @example
 * ```ts
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['@shooteger/nuxt-stripe'],
 *   stripe: {
 *     server: { secretKey: process.env.NUXT_STRIPE_SECRET_KEY },
 *     client: { publishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }
 *   }
 * })
 * ```
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@shooteger/nuxt-stripe',

    /** Config key used under `runtimeConfig` and `nuxt.config`. */
    configKey:     'stripe',
    compatibility: {
      nuxt: '>=3.1.0'
    }
  },

  /** Sensible defaults when the user provides no options. */
  defaults: {
    server: { secretKey: '', options: {} },
    client: { manualClientLoad: false, publishableKey: '', options: {} }
  },
  setup(options, nuxt) {
    // Resolver for deriving paths relative to the module's location.
    const { resolve } = createResolver(import.meta.url)

    // Public runtime config (client-side)
    // Deep-merge the user-provided client options into the existing public
    // runtime config so user values take priority but module defaults fill gaps.
    nuxt.options.runtimeConfig.public.stripe = defu(
      nuxt.options.runtimeConfig.public.stripe as Partial<ClientStripeOptions>,
      options.client
    )

    // Private runtime config (server-side)
    // Deep-merge the user-provided server options into the private runtime
    // config (only accessible in server context).
    nuxt.options.runtimeConfig.stripe = defu(
      nuxt.options.runtimeConfig.stripe as Partial<ServerStripeOptions>,
      options.server
    )

    // Ensure the runtime directory is transpiled by Nuxt's build pipeline.
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    nuxt.options.build.transpile.push(runtimeDir)

    // Register the composables directory so Nuxt auto-imports them in
    // any `.vue` file or `setup` script.
    nuxt.hook('imports:dirs', (dirs: string[]) => {
      dirs.push(resolve(runtimeDir, 'composables'))
    })

    // Include the module's type augmentation file in the project's TS config.
    nuxt.options.typescript.tsConfig.include?.push('./types/stripe-module.d.ts')

    // Configure Nitro internals for server-side Stripe services.
    // @ts-expect-error - `nitro:config` hook is not declared in NuxtHooks types
    // but is available at runtime.
    nuxt.hook('nitro:config', (nitroConfig: NitroOptions) => {
      // Inline the runtime directory so it is bundled with the user's app
      // instead of being externalised.
      nitroConfig.alias                   = nitroConfig.alias || {}
      nitroConfig.externals               = defu(
        typeof nitroConfig.externals==='object' ? nitroConfig.externals: {},
        { inline: [ resolve('./runtime') ] }
      )
      // Create a convenient `#stripe/server` alias pointing to the server services.
      nitroConfig.alias['#stripe/server'] = resolve(runtimeDir, './server/services')
    })
  }
})

// Re-export all public types for external consumers.
export * from './types'
