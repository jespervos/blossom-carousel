import { render } from "svelte/server";
import SsrFixture from "./SsrFixture.svelte";
import SlottedSsrFixture from "./SlottedSsrFixture.svelte";
import ContextFixture from "./ContextFixture.svelte";

/**
 * Loaded through the same Vite SSR module graph as `SsrFixture.svelte` (see
 * ssr.test.ts) so `render` and the compiled component share one `svelte`
 * module instance — mixing a directly Node-resolved `svelte/server` with a
 * component loaded via `ssrLoadModule` produces two divergent instances,
 * breaking Svelte's internal per-render context tracking.
 */
export function renderFixture(): string {
  return render(SsrFixture).body;
}

export function renderSlottedFixture(): string {
  return render(SlottedSsrFixture).body;
}

/** Fixture whose slides depend on `getContext` set outside the carousel. */
export function renderContextFixture(): string {
  return render(ContextFixture).body;
}
