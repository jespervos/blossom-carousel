// @vitest-environment node
//
// Guards the packaging contract: the published artifact must ship
// *uncompiled* .svelte source (so consumers' bundlers compile it per
// environment) and must be server-renderable. A previous packaging shipped a
// client-compiled bundle, which threw `document is not defined` during SSR —
// this test renders the actual `dist/` output to prevent a regression.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distDir = path.join(packageDir, "dist");

let server: ViteDevServer;

beforeAll(async () => {
  execSync("pnpm run build", { cwd: packageDir, stdio: "pipe" });

  server = await createServer({
    configFile: false,
    root: packageDir,
    logLevel: "warn",
    plugins: [svelte()],
    server: { middlewareMode: true },
    appType: "custom",
  });
}, 120_000);

afterAll(async () => {
  await server.close();
});

describe("packaging", () => {
  it("ships uncompiled .svelte source referenced by the svelte export condition", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(packageDir, "package.json"), "utf8"),
    );

    const entry = fs.readFileSync(path.join(packageDir, pkg.exports["."].svelte), "utf8");
    expect(entry).toContain('from "./BlossomCarousel.svelte"');

    const component = fs.readFileSync(
      path.join(distDir, "BlossomCarousel.svelte"),
      "utf8",
    );
    expect(component).toContain("<script");
  });

  it("maps the svelte/server-importing module to a browser stub", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(packageDir, "package.json"), "utf8"),
    );

    const importsServerRenderer = /from\s+["']svelte\/server["']/;
    for (const [source, stub] of Object.entries<string>(pkg.browser)) {
      expect(fs.readFileSync(path.join(packageDir, source), "utf8")).toMatch(
        importsServerRenderer,
      );
      expect(fs.readFileSync(path.join(packageDir, stub), "utf8")).not.toMatch(
        importsServerRenderer,
      );
    }
  });

  it("contains no bare imports of the private navigation package", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(fullPath);
        else files.push(fullPath);
      }
    };
    walk(distDir);

    for (const file of files) {
      expect(
        fs.readFileSync(file, "utf8").includes("@blossom-carousel/navigation"),
        `${file} imports the unpublished navigation package`,
      ).toBe(false);
    }
  });

  it("server-renders carousel and seeded dots from the built dist", async () => {
    const mod = await server.ssrLoadModule("./test/distRenderFixture.ts");
    const body: string = mod.renderDistFixture();

    expect(body).toContain('blossom-carousel="true"');
    expect(body.match(/data-blossom-slide/g)?.length).toBe(4);
    expect(body.match(/class="blossom-dot"/g)?.length).toBe(4);
    expect(body).toContain('commandfor="dist-carousel"');
  });
});
