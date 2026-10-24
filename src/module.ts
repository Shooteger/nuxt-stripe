import { fileURLToPath } from "node:url";
import { defineNuxtModule, createResolver, addServerImports, addTypeTemplate } from "@nuxt/kit";
import type { NuxtModule } from "@nuxt/schema";
import defu from "defu";
import type Stripe from "stripe";
import type { StripeConstructorOptions } from "@stripe/stripe-js";

type StripeConfig = ConstructorParameters<typeof Stripe>[1];

export interface ServerStripeOptions {
  secretKey?: string;
  options?: StripeConfig;
}

export interface ClientStripeOptions {
  publishableKey?: string;
  options?: StripeConstructorOptions;
  manualClientLoad?: boolean;
}

export interface ModuleOptions {
  server: ServerStripeOptions;
  client: ClientStripeOptions & { manualClientLoad?: boolean };
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@shooteger/nuxt-stripe",
    configKey: "stripe",
    compatibility: {
      nuxt: ">=3.1.0",
    },
  },
  defaults: {
    server: { secretKey: '', options: {} },
    client: { manualClientLoad: false, publishableKey: '', options: {} },
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // Written through untyped views: the RuntimeConfig type Nuxt generates for the consuming app
    // is derived from that app's config, so assigning to it directly does not type-check there.
    const publicConfig = nuxt.options.runtimeConfig.public as Record<string, unknown>;
    publicConfig.stripe = defu(
      publicConfig.stripe as Partial<ClientStripeOptions> | undefined,
      options.client
    );

    const privateConfig = nuxt.options.runtimeConfig as Record<string, unknown>;
    privateConfig.stripe = defu(
      privateConfig.stripe as Partial<ServerStripeOptions> | undefined,
      options.server
    );

    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));
    nuxt.options.build.transpile.push(runtimeDir);

    nuxt.hook("imports:dirs", (dirs: string[]) => {
      dirs.push(resolve(runtimeDir, "composables"));
    });

    // Registered on nuxt.options.alias (not only in Nitro) so the alias also lands in every
    // generated tsconfig — Nuxt 4's app tsconfig type-checks server routes for typed $fetch.
    nuxt.options.alias["#stripe/server"] = resolve(runtimeDir, "server/services");

    addServerImports([
      { name: "useServerStripe", from: resolve(runtimeDir, "server/services/useServerStripe") },
    ]);

    addTypeTemplate({
      filename: "types/nuxt-stripe.d.ts",
      getContents: () => `declare module 'h3' {
  interface H3EventContext {
    /** Per-request Stripe instance cached by useServerStripe() */
    _stripe?: import('stripe').default
  }
}

export {}
`,
    }, { nitro: true, nuxt: true });

    nuxt.hook("nitro:config", (nitroConfig) => {
      // `externals` is only typed when nitropack's types resolve, so don't depend on them here
      const config = nitroConfig as { externals?: unknown };
      config.externals = defu(
        config.externals && typeof config.externals === "object" ? config.externals as Record<string, unknown> : {},
        { inline: [resolve("./runtime")] }
      );
    });
  },
});

export default module;

export * from './types'
