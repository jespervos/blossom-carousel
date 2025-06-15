import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        // Ensure proper component compilation for Svelte 5
        generate: "dom",
      },
    }),
    dts({
      insertTypesEntry: true,
      include: ["src/**/*"],
      exclude: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "BlossomCarousel",
      fileName: "blossom-carousel-svelte",
      formats: ["es", "umd"], // ES modules and UMD for broader compatibility
    },
    rollupOptions: {
      external: [
        "svelte",
        "svelte/internal",
        "svelte/store",
        "@blossom-carousel/core",
        /^svelte\//, // Match any svelte/* imports
      ],
      output: {
        preserveModules: false,
        exports: "named",
        globals: {
          svelte: "svelte",
          "@blossom-carousel/core": "BlossomCarouselCore",
        },
      },
    },
  },
});
