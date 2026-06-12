import {
  getActiveMarkerIndex,
  getMarkerPositions,
  getMarkerTargets,
} from "./markers";
import { canScroll } from "./scroll";
import { getMarkerSnaps, getSnapPositions, isRtl } from "./snap";
import { clearSnapCache, getSnapCache, setSnapCache } from "./cache";
import type { NavigationState } from "./types";

/**
 * Computes the current navigation state of a scroller via native reads. Uses
 * the cached, scroll-invariant marker list and geometry when available so the
 * per-frame work on the scroll hot loop is free of DOM queries, style reads,
 * sorts, and allocations — only the scroll metrics are read live.
 */
export function getNavigationState(scroller: HTMLElement): NavigationState {
  const cache = getSnapCache(scroller);
  const targets = cache?.targets ?? getMarkerTargets(scroller);
  return {
    count: targets.length,
    activeIndex: getActiveMarkerIndex(scroller, targets, cache),
    canPrev: canScroll(scroller, "prev"),
    canNext: canScroll(scroller, "next"),
  };
}

/** Recomputes and caches the scroll-invariant snap geometry for a scroller. */
function refreshSnapCache(scroller: HTMLElement): void {
  const targets = getMarkerTargets(scroller);
  const activePositions = getMarkerPositions(scroller, targets);
  setSnapCache(scroller, {
    targets,
    markers: getMarkerSnaps(targets),
    pages: getSnapPositions(scroller),
    activePositions,
    sortedActivePositions: [...activePositions].sort((a, b) => a - b),
    rtl: isRtl(scroller),
  });
}

const OBSERVERS = Symbol.for("blossom-carousel.navigation.observers");

type Subscriber = (state: NavigationState) => void;

interface ObserverRegistration {
  subscribers: Set<Subscriber>;
  /** Schedules a coalesced recompute + notify on the next frame. */
  flush: () => void;
  teardown: () => void;
}

type WithObservers = HTMLElement & { [OBSERVERS]?: ObserverRegistration };

/** Sets up the single shared observer set + frame loop for a scroller. */
function createRegistration(scroller: HTMLElement): ObserverRegistration {
  const subscribers = new Set<Subscriber>();
  let frame = 0;
  let snapsDirty = true;

  const flush = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (snapsDirty) {
        snapsDirty = false;
        refreshSnapCache(scroller);
      }
      const state = getNavigationState(scroller);
      for (const subscriber of subscribers) subscriber(state);
    });
  };

  // Scroll/snap settling: nav state changes, snap geometry does not.
  const emit = () => flush();

  // Layout shifts: snap geometry must be recomputed before the next flush.
  const onLayoutChange = () => {
    snapsDirty = true;
    flush();
  };

  scroller.addEventListener("scroll", emit, { passive: true });
  scroller.addEventListener("scrollend", emit, { passive: true });

  const resizeObserver = new ResizeObserver(onLayoutChange);
  resizeObserver.observe(scroller);

  const mutationObserver = new MutationObserver(onLayoutChange);
  mutationObserver.observe(scroller, { childList: true, subtree: true });

  const teardown = () => {
    cancelAnimationFrame(frame);
    scroller.removeEventListener("scroll", emit);
    scroller.removeEventListener("scrollend", emit);
    resizeObserver.disconnect();
    mutationObserver.disconnect();
    clearSnapCache(scroller);
  };

  return { subscribers, flush, teardown };
}

/**
 * Subscribes to everything that can change the navigation state (scrolling,
 * snap settling, resizes, and added/removed slides) and pushes a fresh
 * `NavigationState` to the callback, coalesced to one update per frame. Returns
 * a cleanup function that removes the subscriber.
 *
 * Ref-counted per scroller: multiple controls pointing at the same scroller
 * share one observer set and one frame loop, computing the state once and
 * fanning it out to every subscriber. The observers (and the per-scroller snap
 * cache they maintain — off the scroll path, since snap geometry only changes
 * on resize/mutation) are torn down once the last subscriber unsubscribes.
 */
export function observeNavigationState(
  scroller: HTMLElement,
  callback: Subscriber,
): () => void {
  const el = scroller as WithObservers;
  const registration = el[OBSERVERS] ?? createRegistration(scroller);
  el[OBSERVERS] = registration;

  registration.subscribers.add(callback);
  // Deliver an initial state to the new subscriber (coalesced with any others).
  registration.flush();

  return () => {
    const current = el[OBSERVERS];
    if (!current) return;
    current.subscribers.delete(callback);
    if (current.subscribers.size === 0) {
      current.teardown();
      delete el[OBSERVERS];
    }
  };
}
