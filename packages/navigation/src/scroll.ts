import {
  getSnapPositions,
  isRtl,
  logicalScrollLeft,
  type SnapPoint,
} from "./snap";
import { getSnapCache } from "./cache";
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
  points: SnapPoint[],
  current: number,
  dir: Direction,
): SnapPoint | null {
  // Skip cached points whose element was detached (a slide removed before the
  // cache refresh runs), mirroring the staleness guard in the goto command —
  // `scrollIntoView` on a detached element would silently no-op.
  if (dir === "next") {
    for (let i = 0; i < points.length; i++) {
      if (points[i].x > current + EPSILON && points[i].el.isConnected)
        return points[i];
    }
  } else {
    for (let i = points.length - 1; i >= 0; i--) {
      if (points[i].x < current - EPSILON && points[i].el.isConnected)
        return points[i];
    }
  }
  return null;
}

/**
 * Mirrors `::scroll-button()` activation: advance to the next/previous snap
 * point when scroll-snap is in use (brought into view with its own inline
 * alignment), otherwise page by ~85% of the scrollport.
 */
export function pageScroll(scroller: HTMLElement, dir: Direction): void {
  // Prefer the host-maintained cache; fall back to a live read for plain usage.
  const cache = getSnapCache(scroller);
  const points = cache?.pages ?? getSnapPositions(scroller);
  const rtl = cache?.rtl ?? isRtl(scroller);

  if (points.length) {
    const target = adjacentSnap(points, logicalScrollLeft(scroller, rtl), dir);
    if (!target) return;
    target.el.scrollIntoView({
      block: "nearest",
      inline: target.align,
      behavior: "smooth",
    });
    return;
  }

  const delta = scroller.clientWidth * PAGE_RATIO * (dir === "next" ? 1 : -1);
  // `scrollBy` takes a physical delta; flip it so "next" advances towards the
  // inline-end in RTL too.
  scroller.scrollBy({ left: rtl ? -delta : delta, behavior: "smooth" });
}
