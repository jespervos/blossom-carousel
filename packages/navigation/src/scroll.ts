import { getSnapPositions } from "./snap";
import type { Direction } from "./types";

/** ::scroll-button() pages ~85% of the scrollport. */
const PAGE_RATIO = 0.85;
const EPSILON = 1;

/**
 * Mirrors `::scroll-button():disabled`: a direction is scrollable only when the
 * scroller hasn't reached the corresponding edge. `scrollLeft` is normalized via
 * `Math.abs` so this also holds in RTL where it is negative.
 */
export function canScroll(scroller: HTMLElement, dir: Direction): boolean {
  const max = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
  const position = Math.abs(scroller.scrollLeft);
  return dir === "prev"
    ? position > EPSILON
    : position < max - EPSILON;
}

function adjacentSnap(
  positions: number[],
  current: number,
  dir: Direction,
): number | null {
  if (dir === "next") {
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] > current + EPSILON) return positions[i];
    }
  } else {
    for (let i = positions.length - 1; i >= 0; i--) {
      if (positions[i] < current - EPSILON) return positions[i];
    }
  }
  return null;
}

/**
 * Mirrors `::scroll-button()` activation: advance to the next/previous snap
 * position when scroll-snap is in use, otherwise page by ~85% of the scrollport.
 */
export function pageScroll(scroller: HTMLElement, dir: Direction): void {
  const positions = getSnapPositions(scroller);

  if (positions.length) {
    const target = adjacentSnap(positions, scroller.scrollLeft, dir);
    if (target === null) return;
    scroller.scrollTo({ left: target, behavior: "smooth" });
    return;
  }

  const delta = scroller.clientWidth * PAGE_RATIO * (dir === "next" ? 1 : -1);
  scroller.scrollBy({ left: delta, behavior: "smooth" });
}
