import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [
    svelte(),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*"],
      exclude: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: "blossom-carousel-svelte",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["svelte", "@blossom-carousel/core"],
      output: {
        globals: {
          svelte: "Svelte",
          "@blossom-carousel/core": "BlossomCarouselCore",
        },
      },
    },
  },
});
