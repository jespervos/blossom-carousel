import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import { bundledDeclarations } from "../../scripts/bundledDeclarations.js";

export default defineConfig({
  plugins: [
    dts(bundledDeclarations(__dirname, { skipDiagnostics: true })),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: "blossom-carousel-core",
    },
  },
});
