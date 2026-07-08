import type { Snippet } from "svelte";
import { getAllContexts } from "svelte";
import { render } from "svelte/server";
import SlideProbe from "./SlideProbe.svelte";
import { countSlideMarkers } from "./countSlideMarkers.js";
import { setSlideCount } from "./slideRegistry.js";

/**
 * Server-only: unlike a Vue vnode tree or a React element tree, a Svelte
 * snippet is an opaque render function, not an introspectable data
 * structure. So slide count is derived by rendering the carousel's
 * `children` snippet through a tiny probe component and counting
 * `data-blossom-slide` occurrences in the resulting HTML string.
 *
 * Guarded to run only during SSR — on the client this is a no-op, since
 * dots seed their initial count directly from the live (already-hydrated)
 * DOM instead (see `navigation.ts`). Browser bundles don't even include
 * this module: the `browser` field in package.json swaps it for
 * `ssrSlideCount.client.ts`, keeping `svelte/server` out of client builds.
 */
export function registerSlideCountFromSnippet(
  id: string,
  children: Snippet | undefined,
): void {
  if (typeof document !== "undefined" || !children) return;

  // Forward the carousel's contexts, so slide components that call
  // `getContext` see the same values in the probe render as in the real
  // render. (Like the caller, this runs during component construction, so
  // reading the current context here is legal.)
  const context = getAllContexts();

  try {
    const { body } = render(SlideProbe, { props: { children }, context });
    setSlideCount(id, countSlideMarkers(body));
  } catch (error) {
    // Most likely async SSR (`experimental.async`) with `await` inside the
    // children snippet, which a synchronous probe render cannot handle.
    // Leave the count unseeded (dots render empty until hydration) instead
    // of failing the whole request.
    console.warn(
      `[blossom-carousel] Could not server-render the children of carousel "${id}" ` +
        `to count its slides; dots will seed on the client instead.`,
      error,
    );
  }
}
