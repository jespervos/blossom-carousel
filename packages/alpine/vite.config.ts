import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";

export default defineConfig({
  plugins: [dts()],
  resolve: {
    alias: {
			"@blossom-carousel/core/style.css": path.resolve(
				__dirname,
				"../core/src/style.css"
			),
      "@blossom-carousel/core": path.resolve(
        __dirname,
        "../core/src/blossom-carousel.ts"
      ),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: "blossom-carousel-alpine",
    },
    rollupOptions: {
      external: ["alpinejs", "@blossom-carousel/core"],
      output: {
        globals: {
          alpinejs: "Alpine",
          "@blossom-carousel/core": "BlossomCarouselCore",
        },
      },
    },
  },
});
