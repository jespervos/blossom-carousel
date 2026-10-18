import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [
    dts({
      // Declarations land at dist/index.d.ts. Without entryRoot the plugin
      // infers a root from the TypeScript version and flips between dist/ and dist/src/.
      entryRoot: "src",
      skipDiagnostics: true,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: "blossom-carousel-core",
    },
  },
});
