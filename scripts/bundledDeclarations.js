import fs from "node:fs";
import path from "node:path";

/**
 * Options for `vite-plugin-dts` shared by every Vite-built package.
 *
 * Declarations are bundled into a single self-contained `dist/index.d.ts`, so
 * what consumers load has no relative imports left to resolve. Per-file output
 * kept the sources' extensionless specifiers (`./types`), which TypeScript
 * rejects under `node16`/`nodenext` and quietly turns into `any` (#48), and it
 * leaked imports of the private navigation package, which is never published.
 *
 * The same file is also written as `dist/index.d.cts`: these packages are
 * `"type": "module"`, so a `.d.ts` describes an ES module, and the `require`
 * condition needs CommonJS-flavoured declarations to match the UMD bundle.
 *
 * test/publishedTypes.test.ts checks the result as an installed dependency.
 *
 * @param {string} packageDir
 * @param {import("vite-plugin-dts").PluginOptions} [overrides]
 * @returns {import("vite-plugin-dts").PluginOptions}
 */
export function bundledDeclarations(packageDir, overrides = {}) {
  const entry = path.resolve(packageDir, "dist/index.d.ts");

  return {
    // Without entryRoot the plugin infers a root from the TypeScript version
    // and flips between dist/ and dist/src/.
    entryRoot: "src",
    bundleTypes: {
      // Private workspace package: inline its types instead of importing them.
      bundledPackages: ["@blossom-carousel/navigation"],
    },
    afterBuild() {
      // The plugin only logs when bundling fails (for instance when
      // @microsoft/api-extractor is missing) and leaves per-file output behind.
      // Fail the build instead of publishing that.
      const stray = fs
        .readdirSync(path.dirname(entry), { recursive: true })
        .filter((file) => /\.d\.[cm]?ts$/.test(file) && !/^index\.d\.c?ts$/.test(file));
      if (!fs.existsSync(entry) || stray.length > 0) {
        throw new Error(
          `Declarations were not bundled into ${entry}` +
            (stray.length > 0 ? ` (found ${stray.join(", ")})` : ""),
        );
      }
      const relativeImport = /\b(?:from|import)\s*\(?\s*["']\.{1,2}\//;
      if (relativeImport.test(fs.readFileSync(entry, "utf8"))) {
        throw new Error(`${entry} still contains relative imports`);
      }
      fs.copyFileSync(entry, entry.replace(/\.d\.ts$/, ".d.cts"));
    },
    ...overrides,
  };
}
