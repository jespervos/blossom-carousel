import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { copyFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * The package is `"type": "module"`, so Node only loads the UMD bundle through
 * `require` under a `.cjs` name. CDN snippets in the wild point at `.umd.js`,
 * so that name is kept as a copy for browsers.
 */
function cdnUmdCopy(): Plugin {
  return {
    name: "blossom-cdn-umd-copy",
    apply: "build",
    closeBundle() {
      const dist = resolve(__dirname, "dist");
      copyFileSync(
        resolve(dist, "blossom-carousel-web.umd.cjs"),
        resolve(dist, "blossom-carousel-web.umd.js"),
      );
    },
  };
}

export default defineConfig({
  plugins: [
    dts({
      // Declarations land at dist/index.d.ts. Without entryRoot the plugin
      // infers a root from the TypeScript version and flips between dist/ and dist/src/.
      entryRoot: "src",
      include: ["src/**/*"],
      exclude: ["vite.config.ts", "src/**/*.test.ts"],
    }),
    cdnUmdCopy(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: (format) =>
        format === "umd"
          ? "blossom-carousel-web.umd.cjs"
          : `blossom-carousel-web.${format}.js`,
      cssFileName: "blossom-carousel-web",
    },
  },
});
