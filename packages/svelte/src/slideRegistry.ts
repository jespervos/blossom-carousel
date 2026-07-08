/**
 * Module-level slide count registry, keyed by carousel id.
 *
 * Server-only in practice: `BlossomCarousel` only writes to it during SSR
 * (see `ssrSlideCount.ts`), and `createNavigationStore` only reads it when
 * `typeof document === "undefined"`. On the client, dots seed their count
 * directly from the live DOM instead (the registry doesn't survive from
 * server process to browser).
 *
 * Safe for Node SSR: a request's component tree renders synchronously, in
 * document order, on a single thread, so the carousel (rendered first)
 * always writes before its sibling `BlossomDots` (rendered next) reads.
 *
 * Entries are short-lived: `BlossomCarousel` deletes its entry from
 * `onDestroy`, which on the server runs when the request's render
 * completes. This keeps the registry from growing unboundedly in
 * long-running SSR processes and prevents a later request from reading a
 * stale count (e.g. when dots are rendered before their carousel in
 * document order, they now reliably read 0).
 */
const registry = new Map<string, number>();

/** Registers the slide count for a carousel id. */
export function setSlideCount(id: string, count: number): void {
  registry.set(id, count);
}

/** Returns the registered slide count for a carousel id, or 0 when unknown. */
export function getSlideCount(id: string): number {
  return registry.get(id) ?? 0;
}

/** Removes a carousel's entry (called when its render/lifetime ends). */
export function deleteSlideCount(id: string): void {
  registry.delete(id);
}
