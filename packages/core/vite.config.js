import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [dts({ skipDiagnostics: true })],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BlossomCarouselCore",
      fileName: "blossom-carousel-core",
      cssFileName: "style",
    },
  },
});
