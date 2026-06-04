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
 * The redistributed activation position of each target, in tree order (parallel
 * to `getMarkerTargets`). Scroll-invariant: it depends only on layout, never on
 * `scrollLeft`, so the host can compute it once on init/resize/mutation and
 * cache it. {@link selectActiveIndex} then maps the live `scrollLeft` onto it
 * each frame without touching layout.
 *
 * This is a single-axis (inline) implementation of the geometry behind the CSS
 * Overflow Level 5 "Calculating the Active Scroll Marker" algorithm (§3.1.8,
 * https://drafts.csswg.org/css-overflow-5/#active-scroll-markers-calculation):
 * each target's unclamped scroll-into-view position (respecting its own
 * `scroll-snap-align`), with the leading/trailing unreachable targets
 * redistributed across the `min(scrollport / 8, scrollRange / 2)` edge bands so
 * each gets a distinct activation point.
 */
export function getMarkerPositions(
  scroller: HTMLElement,
  targets: HTMLElement[],
): number[] {
  const scrollportSize = scroller.clientWidth;
  const scrollRange = scroller.scrollWidth - scrollportSize;

  const scrollerRect = scroller.getBoundingClientRect();
  const scrollerStyles = getComputedStyle(scroller);
  const scrollPaddingStart =
    parseFloat(scrollerStyles.scrollPaddingInlineStart) || 0;
  const scrollPaddingEnd =
    parseFloat(scrollerStyles.scrollPaddingInlineEnd) || 0;

  // The associated target position of each target — its scroll-into-view
  // position, respecting its own `scroll-snap-align`.
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

  // Redistribute unreachable target positions into the edge bands.
  if (scrollRange > 0) {
    const distributeRange = Math.min(scrollportSize / 8, scrollRange / 2);

    // Leading band. Targets whose position is before `distributeRange` are
    // remapped from `[minimum, distributeRange)` onto `[0, distributeRange)`.
    const beforeTargets = positions.filter((p) => p < distributeRange);
    if (beforeTargets.length > 0) {
      const minimum = Math.min(...beforeTargets);
      const denominator = distributeRange - minimum;
      if (denominator > 0) {
        for (let i = 0; i < positions.length; i++) {
          if (positions[i] < distributeRange) {
            positions[i] =
              ((positions[i] - minimum) / denominator) * distributeRange;
          }
        }
      }
    }

    // Trailing band. Targets whose position is past `scrollRange -
    // distributeRange` are remapped onto that band up to `scrollRange`.
    const upperEdge = scrollRange - distributeRange;
    const afterTargets = positions.filter((p) => p > upperEdge);
    if (afterTargets.length > 0) {
      const maximum = Math.max(...afterTargets);
      const denominator = maximum - upperEdge;
      if (denominator > 0) {
        for (let i = 0; i < positions.length; i++) {
          if (positions[i] > upperEdge) {
            positions[i] =
              ((positions[i] - upperEdge) / denominator) * distributeRange +
              upperEdge;
          }
        }
      }
    }
  }

  return positions;
}

/**
 * Maps the current `scrollLeft` onto precomputed marker `positions` and returns
 * the tree-order index of the active target. Pure and layout-free, so it can run
 * on every scroll frame.
 *
 * The selected position is the largest target position at or before the current
 * position, or — to surface section-header style markers early — one whose
 * nearest smaller target position sits more than half a scrollport behind and
 * which itself sits less than half a scrollport ahead. Ties resolve to the
 * earliest target in tree order.
 */
export function selectActiveIndex(
  positions: number[],
  position: number,
  scrollportSize: number,
): number {
  if (positions.length === 0) return -1;
  if (positions.length === 1) return 0;

  const halfScrollport = scrollportSize / 2;
  // Sort once: in ascending order each target's nearest smaller position is
  // simply its predecessor, turning the selection scan into O(n log n).
  const sorted = [...positions].sort((a, b) => a - b);

  let selectedPosition: number | null = null;
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const nearestSmaller = i > 0 ? sorted[i - 1] : Number.NEGATIVE_INFINITY;

    const qualifies =
      p <= position + EPSILON ||
      (nearestSmaller < position - halfScrollport &&
        p < position + halfScrollport);

    // Ascending order: the last qualifier is the largest qualifying position.
    if (qualifies) selectedPosition = p;
  }

  // Fall back to the first (smallest) position when nothing qualifies.
  if (selectedPosition === null) selectedPosition = sorted[0];

  // The active target is the earliest in tree order whose position resolves to
  // the selected position.
  for (let i = 0; i < positions.length; i++) {
    if (Math.abs(positions[i] - selectedPosition) <= EPSILON) return i;
  }

  return 0;
}

/**
 * Returns the tree-order index of the active marker target along the inline
 * axis, or -1 when there are none.
 *
 * Convenience wrapper that composes {@link getMarkerPositions} and
 * {@link selectActiveIndex} for live (uncached) use. Pass `positions` from a
 * host-maintained cache to skip the per-call layout reads on the scroll path.
 */
export function getActiveMarkerIndex(
  scroller: HTMLElement,
  targets: HTMLElement[],
  positions?: number[],
): number {
  if (targets.length === 0) return -1;
  if (targets.length === 1) return 0;

  const scrollportSize = scroller.clientWidth;
  // Non-scrollable scroller: everything fits, so the first target is active.
  if (scroller.scrollWidth - scrollportSize <= 0) return 0;

  const resolved = positions ?? getMarkerPositions(scroller, targets);
  return selectActiveIndex(resolved, scroller.scrollLeft, scrollportSize);
}
