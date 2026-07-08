/**
 * Vendors the private `@blossom-carousel/navigation` workspace package into
 * `dist/vendor/navigation`, then rewrites the shipped files to import the
 * vendored copy.
 *
 * Needed because `svelte-package` transpiles file-by-file without bundling:
 * bare `@blossom-carousel/navigation` specifiers would be unresolvable for
 * consumers, since that package is intentionally not published to npm.
 *
 * Runs after `svelte-package` (see the `build` script).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(pkgDir, "dist");
const vendorDir = path.join(distDir, "vendor", "navigation");

// 1. Compile the navigation package (JS + declarations) into dist/vendor.
execSync("tsc -p tsconfig.vendor.json", { cwd: pkgDir, stdio: "inherit" });

/** Recursively yields all files under a directory. */
function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(fullPath);
    else yield fullPath;
  }
}

function rewrite(file, transform) {
  const code = fs.readFileSync(file, "utf8");
  const next = transform(code);
  if (next !== code) fs.writeFileSync(file, next);
}

// 2. Make the vendored copy's relative imports fully specified (`./x` ->
//    `./x.js`), so the output adheres to Node's ESM resolution algorithm
//    like the rest of the svelte-package output.
for (const file of walk(vendorDir)) {
  rewrite(file, (code) =>
    code.replace(
      /(from\s+["'])(\.{1,2}\/[^"']+?)(["'])/g,
      (match, pre, specifier, post) =>
        path.extname(specifier) ? match : `${pre}${specifier}.js${post}`,
    ),
  );
}

// 3. Point every shipped file (.js/.svelte/.d.ts, all at the dist root) at
//    the vendored copy instead of the bare workspace specifier.
for (const file of walk(distDir)) {
  if (file.startsWith(vendorDir)) continue;
  rewrite(file, (code) =>
    code.replaceAll("@blossom-carousel/navigation", "./vendor/navigation/index.js"),
  );
}

// Fail loudly if a bare specifier survived (e.g. a file in a subdirectory,
// where the fixed relative path above would be wrong).
for (const file of walk(distDir)) {
  if (fs.readFileSync(file, "utf8").includes("@blossom-carousel/navigation")) {
    throw new Error(`Unrewritten navigation import in ${file}`);
  }
}

console.log("Vendored @blossom-carousel/navigation into dist/vendor/navigation");
