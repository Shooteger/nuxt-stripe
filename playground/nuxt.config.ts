export default defineNuxtConfig({
  modules: ["../src/module"],
  devtools: { enabled: true },
  stripe: {
    client: {
      manualClientLoad: true,
    },
    server: {},
  },
  compatibilityDate: "2026-05-22",
});
