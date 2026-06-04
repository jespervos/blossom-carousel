import type { SnapTarget, SnapPoint } from "./snap";

/**
 * Per-scroller cache of computed snap geometry. Snap positions only change on
 * resize/layout shifts, never on scroll, so the host (e.g. a framework
 * composable) computes them once on init/resize/mutation and stores them here.
 * The command/paging logic then reads the cache instead of forcing layout on
 * every click. When a scroller has no cache — plain usage without a host — the
 * consumers fall back to computing live, so the cache is a pure optimization.
 */
export interface SnapCache {
  /**
   * Snap target per marker, in `getMarkerTargets` (tree) order. Used by the
   * `goto` command to `scrollIntoView` the target with its own inline align.
   */
  markers: SnapTarget[];
  /**
   * Sorted, de-duplicated snap points used by prev/next paging to find the
   * adjacent target and bring it into view with its own inline alignment.
   */
  pages: SnapPoint[];
  /**
   * Redistributed activation position per marker, in tree order. Scroll-
   * invariant, so the active-index selection reads only `scrollLeft` per frame
   * instead of forcing layout.
   */
  activePositions: number[];
}

const store = new WeakMap<HTMLElement, SnapCache>();

/** Stores the computed snap geometry for a scroller. */
export function setSnapCache(scroller: HTMLElement, cache: SnapCache): void {
  store.set(scroller, cache);
}

/** Reads the cached snap geometry for a scroller, or `undefined` when unset. */
export function getSnapCache(scroller: HTMLElement): SnapCache | undefined {
  return store.get(scroller);
}

/** Drops the cached snap geometry for a scroller. */
export function clearSnapCache(scroller: HTMLElement): void {
  store.delete(scroller);
}
