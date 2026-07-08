import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue(), svelte()],
  test: {
    environment: "jsdom",
    include: ["packages/**/*.test.ts"],
  },
});
