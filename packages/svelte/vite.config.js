import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// Only used for the local dev playground (`pnpm dev` serving index.html).
// The publishable build is produced by `svelte-package` (see the `build`
// script), which ships uncompiled .svelte source so consumers compile it
// for the right environment (client vs. server).
export default defineConfig({
  plugins: [svelte()],
  build: {
    // `dist` belongs to svelte-package; keep a stray `vite build` of the
    // playground from clobbering the publishable output.
    outDir: "dev/dist",
  },
});
