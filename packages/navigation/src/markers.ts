import { inlineSnapAlign, snapPositionFor } from "./snap";

/** Attribute the author adds to each element that should get a dot. */
export const SLIDE_ATTR = "data-blossom-slide";
const SLIDE_SELECTOR = `[${SLIDE_ATTR}]`;

/** Tolerance (px) when comparing the scroll position against snap positions. */
const EPSILON = 1;

/**
 * Returns the marker targets for a scroller. Mirrors `::scroll-marker`
 * authoring: targets are explicitly opted-in via the `data-blossom-slide`
 * attribute and collected depth-agnostically (at any nesting level), in tree
 * order. There is no implicit detection from `scroll-snap-align` or direct
 * children; if nothing is marked, there are no markers.
 */
export function getMarkerTargets(scroller: HTMLElement): HTMLElement[] {
  return Array.from(scroller.querySelectorAll<HTMLElement>(SLIDE_SELECTOR));
}

/**
 * Returns the tree-order index of the active marker target, or -1 when there
 * are none, along the inline axis.
 *
 * Inspired by the CSS Overflow Level 5 active-marker algorithm (§3.1.8) but with
 * reachability-based edge handling instead of the spec's fixed `scrollport/8`
 * band. Each target's *real* snap position (per its own `scroll-snap-align`) is
 * computed unclamped; a target is only "redistributed" toward an edge when that
 * position falls outside the scrollable range `[0, scrollRange]` — i.e. when the
 * slide can never actually reach its snap position (the leading/trailing slides).
 * Reachable slides keep their exact snap position so they activate precisely
 * when snapped, and the unreachable ones are spread across the leftover space
 * between the edge and the first/last reachable slide so each can still become
 * active at the extremes.
 */
export function getActiveMarkerIndex(
  scroller: HTMLElement,
  targets: HTMLElement[],
): number {
  if (targets.length === 0) return -1;
  if (targets.length === 1) return 0;

  const scrollRange = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
  if (scrollRange <= 0) return 0;

  const position = scroller.scrollLeft;
  const scrollerRect = scroller.getBoundingClientRect();
  const scrollerStyles = getComputedStyle(scroller);
  const scrollPaddingStart =
    parseFloat(scrollerStyles.scrollPaddingInlineStart) || 0;
  const scrollPaddingEnd =
    parseFloat(scrollerStyles.scrollPaddingInlineEnd) || 0;

  // Each target's ideal (unclamped) snap position, respecting its own align.
  const positions = targets.map((target) => {
    const styles = getComputedStyle(target);
    const align = inlineSnapAlign(styles.scrollSnapAlign);
    return snapPositionFor(
      scroller,
      target,
      align === "none" ? "start" : align,
      scrollerRect,
      scrollPaddingStart,
      scrollPaddingEnd,
      styles,
    );
  });

  // Reachable slides can sit at their snap position within the scroll range.
  const reachable = positions.filter((p) => p >= 0 && p <= scrollRange);
  const firstReachable = reachable.length ? Math.min(...reachable) : 0;
  const lastReachable = reachable.length ? Math.max(...reachable) : scrollRange;

  // Spread the leading unreachable slides across [0, firstReachable].
  const before = positions
    .map((p, i) => ({ p, i }))
    .filter((o) => o.p < 0)
    .sort((a, b) => a.p - b.p);
  const startSpan = Math.max(firstReachable, 0);
  before.forEach((o, j) => {
    positions[o.i] = (j / before.length) * startSpan;
  });

  // Spread the trailing unreachable slides across [lastReachable, scrollRange].
  const after = positions
    .map((p, i) => ({ p, i }))
    .filter((o) => o.p > scrollRange)
    .sort((a, b) => a.p - b.p);
  const endSpan = Math.max(scrollRange - lastReachable, 0);
  after.forEach((o, j) => {
    positions[o.i] = lastReachable + ((j + 1) / after.length) * endSpan;
  });

  // Active = the last slide whose position is at/before the current scroll
  // position; ties resolve to the earliest target in tree order.
  let activeIndex = 0;
  let activePosition = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    if (p <= position + EPSILON && p > activePosition) {
      activePosition = p;
      activeIndex = i;
    }
  }

  return activeIndex;
}
