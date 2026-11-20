/**
 * Vendors the private `@blossom-carousel/navigation` and
 * `@blossom-carousel/repeat` workspace packages into `dist/vendor/<name>`,
 * then rewrites the shipped files to import the vendored copies.
 *
 * Needed because `svelte-package` transpiles file-by-file without bundling:
 * bare `@blossom-carousel/<name>` specifiers would be unresolvable for
 * consumers, since those packages are intentionally not published to npm.
 *
 * Runs after `svelte-package` (see the `build` script).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(pkgDir, "dist");
const vendored = [
  { name: "navigation", tsconfig: "tsconfig.vendor.json" },
  { name: "repeat", tsconfig: "tsconfig.vendor.repeat.json" },
];
const vendorRoot = path.join(distDir, "vendor");

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

for (const { name, tsconfig } of vendored) {
  // 1. Compile the package (JS + declarations) into dist/vendor/<name>.
  execSync(`tsc -p ${tsconfig}`, { cwd: pkgDir, stdio: "inherit" });

  // 2. Make the vendored copy's relative imports fully specified (`./x` ->
  //    `./x.js`), so the output adheres to Node's ESM resolution algorithm
  //    like the rest of the svelte-package output.
  for (const file of walk(path.join(vendorRoot, name))) {
    rewrite(file, (code) =>
      code.replace(
        /(from\s+["'])(\.{1,2}\/[^"']+?)(["'])/g,
        (match, pre, specifier, post) =>
          path.extname(specifier) ? match : `${pre}${specifier}.js${post}`,
      ),
    );
  }
}

// 3. Point every shipped file (.js/.svelte/.d.ts, all at the dist root) at
//    the vendored copies instead of the bare workspace specifiers.
for (const file of walk(distDir)) {
  if (file.startsWith(vendorRoot)) continue;
  rewrite(file, (code) =>
    vendored.reduce(
      (out, { name }) =>
        out.replaceAll(`@blossom-carousel/${name}`, `./vendor/${name}/index.js`),
      code,
    ),
  );
}

// Fail loudly if a bare specifier survived (e.g. a file in a subdirectory,
// where the fixed relative path above would be wrong).
for (const file of walk(distDir)) {
  const code = fs.readFileSync(file, "utf8");
  for (const { name } of vendored) {
    if (code.includes(`@blossom-carousel/${name}`)) {
      throw new Error(`Unrewritten ${name} import in ${file}`);
    }
  }
}

console.log(
  `Vendored ${vendored.map(({ name }) => `@blossom-carousel/${name}`).join(" and ")} into dist/vendor`,
);
