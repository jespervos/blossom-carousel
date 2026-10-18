// @vitest-environment node
//
// The types path in package.json has drifted from the emitted file more than
// once (#22, #33, #37, #39): vite-plugin-dts switches between dist/index.d.ts
// and dist/src/index.d.ts when its inferred root changes. This builds each
// published package and checks that every declared types entry exists.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packagesRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const packages = ["core", "react", "vue", "web", "svelte"] as const;

function typeEntries(manifest: {
  types?: string;
  exports?: { "."?: { types?: string } };
}): string[] {
  return [manifest.types, manifest.exports?.["."]?.types].filter((entry): entry is string =>
    Boolean(entry),
  );
}

describe("published declaration paths", () => {
  it.each(packages)(
    "%s points types at a file the build emits",
    (name) => {
      const packageDir = path.join(packagesRoot, name);
      execSync("pnpm run build", {
        cwd: packageDir,
        stdio: "pipe",
        env: process.env,
      });

      const manifest = JSON.parse(fs.readFileSync(path.join(packageDir, "package.json"), "utf8"));
      const entries = typeEntries(manifest);
      expect(entries.length).toBeGreaterThan(0);

      for (const entry of entries) {
        expect(fs.existsSync(path.resolve(packageDir, entry)), entry).toBe(true);
      }
    },
    60_000,
  );
});
