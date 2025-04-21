import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [react(), dts()],
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
      fileName: (format) => `blossom-carousel-react.${format}.js`,
      cssFileName: () => "blossom-carousel-react.css",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
