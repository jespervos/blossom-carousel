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

describe.each(["production", "development"])("Vue packaging built with NODE_ENV=%s", (nodeEnv) => {
  beforeAll(() => {
    execSync("pnpm run build", {
      cwd: packageDir,
      env: { ...process.env, NODE_ENV: nodeEnv },
      stdio: "pipe",
    });
  }, 120_000);

  it.each([
    {
      loader: "module",
      entry: pkg.exports["."].import,
      imports: `
        import { createSSRApp } from "vue";
        import { renderToString } from "vue/server-renderer";
        import { BlossomCarousel } from "@blossom-carousel/vue";
      `,
    },
    {
      loader: "commonjs",
      entry: pkg.exports["."].require,
      imports: `
        const { createSSRApp } = require("vue");
        const { renderToString } = require("vue/server-renderer");
        const { BlossomCarousel } = require("@blossom-carousel/vue");
      `,
    },
  ])("server-renders the $loader entry with production Vue", ({ loader, entry, imports }) => {
    const html = execFileSync(
      process.execPath,
      [
        `--input-type=${loader}`,
        "--eval",
        `${imports}
          renderToString(createSSRApp(BlossomCarousel)).then((html) => console.log(html));
        `,
      ],
      {
        cwd: packageDir,
        env: { ...process.env, NODE_ENV: "production" },
        encoding: "utf8",
      },
    );

    expect(html.trim()).toMatch(/^<div blossom-carousel="true"/);
    const bundle = fs.readFileSync(path.join(packageDir, entry), "utf8");
    expect(bundle).not.toContain("__file");
    expect(bundle).not.toContain(packageDir);
  });
});
