import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      include: ["src/**/*"],
      exclude: ["vite.config.ts"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: (format) => `blossom-carousel-web.${format}.js`,
      cssFileName: "blossom-carousel-web",
    },
  },
});
