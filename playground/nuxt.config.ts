export default defineNuxtConfig({
  modules: ["../src/module"],
  devtools: { enabled: true },
  stripe: {
    client: {
      key: process.env.STRIPE_PUBLIC_KEY,
      manualClientLoad: true,
    },
    server: {
      key: process.env.STRIPE_SECRET_KEY,
    },
  },
  compatibilityDate: "2025-12-22",
});
