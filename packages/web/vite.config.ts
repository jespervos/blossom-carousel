import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: (format) => `blossom-carousel-web.${format}.js`,
    },
    rollupOptions: {
      // external: ["./style.css"],
      // output: {
      //   globals: {
      //     "@blossom-carousel/core": "BlossomCarouselCore",
      //   },
      // },
    },
  },
});
