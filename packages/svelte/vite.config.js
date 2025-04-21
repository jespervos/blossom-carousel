import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [
    svelte(),
    dts({ skipDiagnostics: true }),
  ],
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
      fileName: (format) => `blossom-carousel-svelte.${format}.js`,
      cssFileName: () => "blossom-carousel-svelte.css",
    },
    rollupOptions: {
      external: ["svelte"],
      output: {
        globals: {
          svelte: "Svelte",
        },
      },
    },
  },
});
