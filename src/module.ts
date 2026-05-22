import { fileURLToPath } from "node:url";
import { defineNuxtModule, createResolver } from "@nuxt/kit";
import defu from "defu";
import type Stripe from "stripe";
import type { StripeConstructorOptions } from "@stripe/stripe-js";
import type { NitroOptions } from 'nitropack'

type StripeConfig = ConstructorParameters<typeof Stripe>[1];

export interface ServerStripeOptions {
  key?: string | null;
  options?: StripeConfig;
}

export interface ClientStripeOptions {
  key?: string | null;
  options?: StripeConstructorOptions;
}

export interface ModuleOptions {
  server: ServerStripeOptions;
  client: ClientStripeOptions & { manualClientLoad?: boolean };
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@shooteger/nuxt-stripe",
    configKey: "stripe",
    compatibility: {
      nuxt: ">=3.1.0",
    },
  },
  defaults: {
    server: { key: null, options: {} },
    client: { manualClientLoad: false, key: null, options: {} },
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.runtimeConfig.public.stripe = defu(
      nuxt.options.runtimeConfig.public.stripe as Partial<ClientStripeOptions>,
      options.client
    );

    nuxt.options.runtimeConfig.stripe = defu(
      nuxt.options.runtimeConfig.stripe as Partial<ServerStripeOptions>,
      options.server
    );

    const runtimeDir = fileURLToPath(new URL("./runtime", import.meta.url));
    nuxt.options.build.transpile.push(runtimeDir);

    nuxt.hook("imports:dirs", (dirs: string[]) => {
      dirs.push(resolve(runtimeDir, "composables"));
    });

    nuxt.options.typescript.tsConfig.include?.push('./types/stripe-module.d.ts');

    // @ts-expect-error - nitro:config not in NuxtHooks type but exists at runtime
    nuxt.hook('nitro:config', (nitroConfig: NitroOptions) => {
      nitroConfig.alias = nitroConfig.alias || {};
      nitroConfig.externals = defu(
        typeof nitroConfig.externals === "object" ? nitroConfig.externals : {},
        { inline: [resolve("./runtime")] }
      );
      nitroConfig.alias["#stripe/server"] = resolve(runtimeDir, "./server/services");
    });
  },
});
