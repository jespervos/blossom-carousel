import type { Snippet } from "svelte";

/**
 * Browser replacement for `ssrSlideCount.ts`, wired up via the `browser`
 * field in package.json. Slide-count seeding through a probe render only
 * happens on the server; stubbing it out here keeps `svelte/server` (the
 * whole server renderer) out of client bundles. On the client, dots seed
 * their initial count from the live DOM instead (see `navigation.ts`).
 */
export function registerSlideCountFromSnippet(
  _id: string,
  _children: Snippet | undefined,
): void {}
