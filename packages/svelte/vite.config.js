import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [svelte(), dts({ skipDiagnostics: true })],
  resolve: {
    alias: [
      {
        find: "@blossom-carousel/core/style.css",
        replacement: path.resolve(__dirname, "../core/style.css"),
      },
      {
        find: "@blossom-carousel/core",
        replacement: path.resolve(__dirname, "../core/blossom-carousel.ts"),
      },
    ],
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: "blossom-carousel-svelte",
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
