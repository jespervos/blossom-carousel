import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [svelte(), dts({ skipDiagnostics: true })],
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
