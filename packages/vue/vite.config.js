import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [vue(), dts()],
  resolve: {
    alias: {
      "@blossom-carousel/core": path.resolve(
        __dirname,
        "../core/blossom-carousel.ts"
      ),
      "@blossom-carousel/core/style.css": path.resolve(
        __dirname,
        "../core/style.css"
      ),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: "blossom-carousel-vue",
    },
    rollupOptions: {
      // Don't bundle Vue, expect the app to provide it
      external: ["vue", "@blossom-carousel/core"],
      output: {
        globals: {
          vue: "Vue",
          "@blossom-carousel/core": "BlossomCarouselCore",
        },
      },
    },
  },
});
