import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue(), svelte()],
  resolve: {
    // Vitest resolves as Node, which picks Svelte's server runtime. Client
    // component tests need `mount` from the browser export.
    conditions: ["browser"],
  },
  test: {
    environment: "jsdom",
    include: ["packages/**/*.test.ts"],
  },
});
