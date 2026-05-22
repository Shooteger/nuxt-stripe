export default defineNuxtConfig({
  ssr: true,
  modules: [
    '../../../src/module',
  ],
  stripe: {
    client: {
      publishableKey: 'pk_test123',
    },
    server: {
      secretKey: 'sk_test123',
    },
  },
})
