import { getActiveMarkerIndex, getMarkerTargets } from "./markers";
import { canScroll } from "./scroll";
import type { NavigationState } from "./types";

/** Computes the current navigation state of a scroller via native reads. */
export function getNavigationState(scroller: HTMLElement): NavigationState {
  const targets = getMarkerTargets(scroller);
  return {
    count: targets.length,
    activeIndex: getActiveMarkerIndex(scroller, targets),
    canPrev: canScroll(scroller, "prev"),
    canNext: canScroll(scroller, "next"),
  };
}

/**
 * Subscribes to everything that can change the navigation state (scrolling,
 * snap settling, resizes, and added/removed slides) and pushes a fresh
 * `NavigationState` to the callback, coalesced to one update per frame. Returns
 * a cleanup function that detaches all listeners.
 */
export function observeNavigationState(
  scroller: HTMLElement,
  callback: (state: NavigationState) => void,
): () => void {
  let frame = 0;

  const emit = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => callback(getNavigationState(scroller)));
  };

  scroller.addEventListener("scroll", emit, { passive: true });
  scroller.addEventListener("scrollsnapchange", emit);

  const resizeObserver = new ResizeObserver(emit);
  resizeObserver.observe(scroller);

  const mutationObserver = new MutationObserver(emit);
  mutationObserver.observe(scroller, { childList: true, subtree: true });

  emit();

  return () => {
    cancelAnimationFrame(frame);
    scroller.removeEventListener("scroll", emit);
    scroller.removeEventListener("scrollsnapchange", emit);
    resizeObserver.disconnect();
    mutationObserver.disconnect();
  };
}
