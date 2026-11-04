// @vitest-environment node
import { execFileSync, execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const pkg = JSON.parse(
  fs.readFileSync(path.join(packageDir, "package.json"), "utf8"),
);

describe("Web packaging", () => {
  beforeAll(() => {
    execSync("pnpm run build", { cwd: packageDir, stdio: "pipe" });
  }, 120_000);

  it.each([
    ["main", pkg.main],
    ["module", pkg.module],
    ["types", pkg.types],
    ["unpkg", pkg.unpkg],
    ["jsdelivr", pkg.jsdelivr],
    ['exports["."].types', pkg.exports["."].types],
    ['exports["."].import', pkg.exports["."].import],
    ['exports["."].require', pkg.exports["."].require],
    ['exports["./style.css"]', pkg.exports["./style.css"]],
  ])("ships the file referenced by %s", (_field, file) => {
    expect(fs.existsSync(path.join(packageDir, file))).toBe(true);
  });

  it.each([
    {
      loader: "commonjs",
      code: `const web = require("@blossom-carousel/web"); console.log(typeof web.BlossomCarousel);`,
    },
    {
      loader: "module",
      code: `const web = await import("@blossom-carousel/web"); console.log(typeof web.BlossomCarousel);`,
    },
  ])("loads the $loader entry in Node", ({ loader, code }) => {
    const output = execFileSync(
      process.execPath,
      [`--input-type=${loader}`, "--eval", code],
      { cwd: packageDir, encoding: "utf8" },
    );
    expect(output.trim()).toBe("function");
  });
});
