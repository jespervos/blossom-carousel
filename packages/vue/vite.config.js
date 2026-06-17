import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [vue(), dts()],
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
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((name) => name.endsWith(".css"))) {
            return "blossom-carousel-vue.css";
          }
          return "assets/[name][extname]";
        },
        globals: {
          vue: "Vue",
          "@blossom-carousel/core": "BlossomCarouselCore",
        },
      },
    },
  },
});
