import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import path from "path";
import { bundledDeclarations } from "../../scripts/bundledDeclarations.js";

export default defineConfig(({ command }) => {
  // Vite reads NODE_ENV after loading this file. A development NODE_ENV in the
  // shell would otherwise compile dev-only code and absolute `__file` paths into dist.
  if (command === "build") process.env.NODE_ENV = "production";

  return {
    plugins: [
      vue(),
      dts(
        bundledDeclarations(__dirname, {
          include: ["src/**/*.ts", "src/**/*.vue"],
          exclude: ["src/**/*.test.ts"],
        }),
      ),
    ],
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
  };
});
