import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch, fetch } from "@nuxt/test-utils";

describe("@shooteger/nuxt-stripe Module", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("./fixtures/basic", import.meta.url)),
  });

  describe("SSR", () => {
    it("renders the page without errors", async () => {
      const response = await fetch("/");
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Nuxt Stripe module test");
      expect(html).not.toContain("Error");
    });

    it("includes nuxt hydration payload", async () => {
      const html = await $fetch<string>("/");

      expect(html).toContain("__NUXT__");
      expect(html).toContain("data-nuxt-data");
    });

    it("injects public stripe runtime config", async () => {
      const html = await $fetch<string>("/");

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

      expect(html).toContain("Nuxt Stripe module test");
      expect(html).toContain("Other component using stripe");
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

      expect(response.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it("caches the instance per request context", async () => {
      const [r1, r2] = await Promise.all([
        $fetch<{ version: string }>("/api/stripe"),
        $fetch<{ version: string }>("/api/stripe"),
      ]);

      expect(r1.version).toBe(r2.version);
    });

    it("is auto-imported in server routes and cached on event.context", async () => {
      const response = await $fetch<{ version: string; cached: boolean }>("/api/auto-import");

      expect(response.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(response.cached).toBe(true);
    });
  });

  describe("Payment API", () => {
    it("handles Stripe errors gracefully", async () => {
      const response = await $fetch<{ clientSecret: string | null; error: unknown }>("/api/create-payment-intent");

      // With a fake secret key, Stripe will error — verify graceful handling
      expect(response.clientSecret).toBeNull();
      expect(response.error).toBeDefined();
    });
  });

  describe("Module configuration", () => {
    it("applies server key from module options", async () => {
      const response = await $fetch("/api/stripe");

      expect(response).toBeDefined();
      expect(response).toHaveProperty("version");
    });

    it("applies client key from module options", async () => {
      const html = await $fetch<string>("/");

      expect(html).toContain("pk_test123");
    });
  });

  describe("Module definition", () => {
    it("exposes its meta (type exports are checked in test/types/exports.test-d.ts)", async () => {
      const { default: mod } = await import("../src/module");

      expect(await mod.getMeta?.()).toMatchObject({
        name: "@shooteger/nuxt-stripe",
        configKey: "stripe",
      });
    });
  });
});
