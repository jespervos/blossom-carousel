import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: "blossom-carousel-web",
    },
    rollupOptions: {
      external: ["@blossom-carousel/core"],
      output: {
        globals: {
          "@blossom-carousel/core": "BlossomCarouselCore",
        },
      },
    },
  },
});
