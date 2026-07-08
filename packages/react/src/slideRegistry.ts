/**
 * Module-level slide count registry, keyed by carousel id.
 *
 * Safe for `renderToString`/`renderToPipeableStream`: React SSR renders a
 * given request's component tree synchronously in tree order on a single
 * thread, so the carousel (rendered first) always writes before its sibling
 * `BlossomDots` (rendered next) reads. The only theoretical race is two
 * concurrent requests reusing the exact same carousel `id` with a different
 * slide count and interleaving mid-render — extremely unlikely, and no worse
 * than any other id-collision bug.
 */
const registry = new Map<string, number>();

/** Registers the slide count for a carousel id. */
export function setSlideCount(id: string, count: number): void {
  registry.set(id, count);
}

/** Returns the registered slide count for a carousel id, or 0 when unknown. */
export function getSlideCount(id: string | undefined): number {
  if (!id) return 0;
  return registry.get(id) ?? 0;
}
