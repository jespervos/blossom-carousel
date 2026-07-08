import { render } from "svelte/server";
import DistSsrFixture from "./DistSsrFixture.svelte";

/**
 * Same single-module-graph trick as `ssrRenderFixture.ts`, but rendering the
 * *built* package from `dist/` — i.e. exactly what a consumer installs.
 */
export function renderDistFixture(): string {
  return render(DistSsrFixture).body;
}
