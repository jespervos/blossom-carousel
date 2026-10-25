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

describe.each(["production", "development"])("React packaging built with NODE_ENV=%s", (nodeEnv) => {
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
        import React from "react";
        import { renderToString } from "react-dom/server";
        import { BlossomCarousel } from "@blossom-carousel/react";
      `,
    },
    {
      loader: "commonjs",
      entry: pkg.exports["."].require,
      imports: `
        const React = require("react");
        const { renderToString } = require("react-dom/server");
        const { BlossomCarousel } = require("@blossom-carousel/react");
      `,
    },
  ])("server-renders the $loader entry with production React", ({ loader, entry, imports }) => {
    const html = execFileSync(
      process.execPath,
      [
        `--input-type=${loader}`,
        "--eval",
        `${imports}
          console.log(renderToString(React.createElement(BlossomCarousel)));
        `,
      ],
      {
        cwd: packageDir,
        env: { ...process.env, NODE_ENV: "production" },
        encoding: "utf8",
      },
    );

    expect(html.trim()).toBe('<div blossom-carousel="true"></div>');
    const bundle = fs.readFileSync(path.join(packageDir, entry), "utf8");
    expect(bundle).not.toContain("jsx-dev-runtime");
    expect(bundle).not.toContain("jsxDEV");
  });
});
