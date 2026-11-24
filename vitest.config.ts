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
    include: ["packages/**/*.test.ts", "test/**/*.test.ts"],
    // Several test files rebuild a package's dist/ before inspecting it. Run
    // side by side, two builds of the same package delete each other's output.
    fileParallelism: false,
  },
});
