import { writable, type Readable } from "svelte/store";
import {
  observeNavigationState,
  registerCommands,
  type NavigationState as NavState,
} from "@blossom-carousel/navigation";

export type NavigationState = NavState;

const INITIAL: NavigationState = {
  activeIndex: -1,
  count: 0,
  canPrev: false,
  canNext: false,
};

export function createNavigationStore(): {
  subscribe: Readable<NavigationState>["subscribe"];
  connect: (forId: string) => void;
  disconnect: () => void;
} {
  const store = writable<NavigationState>(INITIAL);
  let cleanup: (() => void) | undefined;

  return {
    subscribe: store.subscribe,
    connect(forId: string) {
      cleanup?.();
      cleanup = undefined;
      store.set({ ...INITIAL });
      if (!forId) return;

      const scroller = document.getElementById(forId);
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
