// @vitest-environment node
//
// The workspace default is jsdom, which defines a global `document` — but
// our server/client branches (ssrSlideCount.ts, navigation.ts) key off
// `typeof document === "undefined"` to detect SSR, exactly as they would in
// a real Node SSR process. Running this file under jsdom would silently take
// the client branch and defeat the test.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createServer, type ViteDevServer } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Svelte compiles a component very differently for the client (imperative DOM
// mutation) vs the server (string-concatenation `render()`-compatible
// output) — unlike Vue, these are not interchangeable. Vitest's own module
// transform doesn't reliably ask for the server output, so this spins up a
// real Vite dev server in SSR mode (as SvelteKit would) and loads the fixture
// through `ssrLoadModule`, which correctly compiles `.svelte` imports (and
// their nested `.svelte` imports) for `svelte/server`.
let server: ViteDevServer;

beforeAll(async () => {
  const packageDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  server = await createServer({
    configFile: false,
    root: packageDir,
    logLevel: "warn",
    plugins: [svelte()],
    server: { middlewareMode: true },
    appType: "custom",
  });
});

afterAll(async () => {
  await server.close();
});

describe("SSR dots", () => {
  it("renders dot buttons from a server-rendered snippet count before mount", async () => {
    const mod = await server.ssrLoadModule("./test/ssrRenderFixture.ts");
    const body: string = mod.renderFixture();

    expect(body.match(/<button[^>]*data-blossom-dot/g)?.length).toBe(4);
    expect(body.match(/data-blossom-dot-marker/g)?.length).toBe(4);
    expect(body).toContain('commandfor="my-carousel"');
  });

  it("merges command props onto BlossomDot elements", async () => {
    const mod = await server.ssrLoadModule("./test/ssrRenderFixture.ts");
    const body: string = mod.renderSlottedFixture();

    expect(body.match(/<button[^>]*data-blossom-dot/g)?.length).toBe(3);
    expect(body.match(/class="my-dot"/g)?.length).toBe(3);
    expect(body.match(/commandfor="my-carousel"/g)?.length).toBe(3);
    expect(body.match(/command="--blossom-goto-/g)?.length).toBe(3);
    expect(body).toContain('aria-label="Photo 1"');
  });

  it("forwards the carousel's contexts into the probe render", async () => {
    const mod = await server.ssrLoadModule("./test/ssrRenderFixture.ts");
    const body: string = mod.renderContextFixture();

    // The slides call `getContext` — the probe render (which derives the dot
    // count) must see the same context values as the real render.
    expect(body.match(/<button[^>]*data-blossom-dot/g)?.length).toBe(3);
  });

  it("cleans up the slide count registry when the render completes", async () => {
    const mod = await server.ssrLoadModule("./test/ssrRenderFixture.ts");
    mod.renderFixture();

    // `BlossomCarousel` deletes its registry entry from `onDestroy`, which
    // runs on the server when the request's render finishes. A leftover
    // entry would leak memory across requests and could serve stale counts.
    const registry = await server.ssrLoadModule("./src/slideRegistry.ts");
    expect(registry.getSlideCount("my-carousel")).toBe(0);
  });
});
