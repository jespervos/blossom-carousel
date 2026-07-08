import { writable, type Readable } from "svelte/store";
import {
  getMarkerTargets,
  observeNavigationState,
  registerCommands,
  type NavigationState as NavState,
} from "@blossom-carousel/navigation";
import { getSlideCount } from "./slideRegistry.js";

export type NavigationState = NavState;

const INITIAL: NavigationState = {
  activeIndex: -1,
  count: 0,
  canPrev: false,
  canNext: false,
};

function seededState(forId: string): NavigationState {
  if (!forId) return { ...INITIAL };

  // Server: BlossomCarousel already rendered (document order) and registered
  // its slide count from a server-side snippet render (see ssrSlideCount.ts).
  if (typeof document === "undefined") {
    return { ...INITIAL, count: getSlideCount(forId) };
  }

  // Client: hydrating server-rendered HTML (or mounting later) — read the
  // live DOM directly, since the registry above only exists on the server.
  const scroller = document.getElementById(forId);
  return {
    ...INITIAL,
    count: scroller ? getMarkerTargets(scroller).length : 0,
  };
}

export function createNavigationStore(forId: string): {
  subscribe: Readable<NavigationState>["subscribe"];
  connect: (forId: string) => void;
  disconnect: () => void;
} {
  const store = writable<NavigationState>(seededState(forId));
  let cleanup: (() => void) | undefined;

  return {
    subscribe: store.subscribe,
    connect(id: string) {
      cleanup?.();
      cleanup = undefined;
      store.set(seededState(id));
      // Defense in depth: `connect` is only ever invoked from a client-only
      // `$effect`, but guard directly against SSR too, since it's cheap.
      if (!id || typeof document === "undefined") return;

      const scroller = document.getElementById(id);
      if (!scroller) return;

      const unregister = registerCommands(scroller);
      const unobserve = observeNavigationState(scroller, store.set);
      cleanup = () => {
        unregister();
        unobserve();
      };
    },
    disconnect() {
      cleanup?.();
      cleanup = undefined;
    },
  };
}
