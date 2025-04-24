import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: "blossom-carousel-react",
    },
    rollupOptions: {
      external: ["react", "react-dom", "@blossom-carousel/core"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "@blossom-carousel/core": "BlossomCarouselCore",
        },
      },
    },
  },
});
