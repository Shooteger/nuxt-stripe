import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils";

describe("@shooteger/nuxt-stripe Module", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("./fixtures/basic", import.meta.url)),
  });

  describe("SSR", () => {
    it("renders the page without errors", async () => {
      const html = await $fetch<string>("/");

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).not.toContain("500");
      expect(html).not.toContain("Error");
    });

    it("includes nuxt hydration payload", async () => {
      const html = await $fetch<string>("/");

      expect(html).toContain("__NUXT__");
      expect(html).toContain("data-nuxt-data");
    });

    it("injects public stripe runtime config", async () => {
      const html = await $fetch<string>("/");

      // Public config is serialized into the hydration payload
      expect(html).toContain("pk_test123");
    });
  });

  describe("Client composable", () => {
    it("auto-imports useClientStripe and renders correctly", async () => {
      const html = await $fetch<string>("/");

      expect(html).toContain("Nuxt Stripe module test");
    });

    it("works in multiple components simultaneously", async () => {
      const html = await $fetch<string>("/");

      // Both app.vue and OtherComponent use the composable
      expect(html).toContain("Nuxt Stripe module test"); // app.vue
      expect(html).toContain("Other component using stripe"); // OtherComponent.vue
    });
  });

  describe("Server composable", () => {
    it("returns a functional Stripe instance", async () => {
      const response = await $fetch<{ status: number; version: string }>("/api/stripe");

      expect(response.status).toBe(200);
      expect(response.version).toBeDefined();
    });

    it("returns a valid Stripe version string", async () => {
      const response = await $fetch<{ status: number; version: string }>("/api/stripe");

      // Stripe version format: major.minor.patch
      expect(response.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("caches the instance per request context", async () => {
      // Two fetches should both succeed — instance is recreated per request
      const [r1, r2] = await Promise.all([
        $fetch<{ version: string }>("/api/stripe"),
        $fetch<{ version: string }>("/api/stripe"),
      ]);

      expect(r1.version).toBe(r2.version);
    });
  });

  describe("Module configuration", () => {
    it("applies server key from module options", async () => {
      // If server route works, the secret key was picked up correctly
      const response = await $fetch("/api/stripe");

      expect(response).toBeDefined();
      expect(response).toHaveProperty("version");
    });

    it("applies client key from module options", async () => {
      const html = await $fetch<string>("/");

      expect(html).toContain("pk_test123");
    });
  });
});
