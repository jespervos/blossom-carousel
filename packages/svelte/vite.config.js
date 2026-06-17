import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [
    svelte(),
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
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [
        "svelte",
        "svelte/internal",
        "svelte/store",
        "@blossom-carousel/core",
        /^svelte\//,
      ],
      output: {
        preserveModules: false,
        exports: "named",
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.some((name) => name.endsWith(".css"))) {
            return "blossom-carousel-svelte.css";
          }
          return "assets/[name][extname]";
        },
        globals: {
          svelte: "svelte",
          "svelte/internal/client": "svelteInternalClient",
          "@blossom-carousel/core": "BlossomCarouselCore",
        },
      },
    },
  },
});
