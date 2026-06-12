import { writable, type Readable } from "svelte/store";
import {
  observeNavigationState,
  registerCommands,
} from "@blossom-carousel/navigation";

// Re-declared locally (rather than imported) so the generated declaration files
// don't reference the internal, unpublished navigation package.
export interface NavigationState {
  activeIndex: number;
  count: number;
  canPrev: boolean;
  canNext: boolean;
}

const INITIAL: NavigationState = {
  activeIndex: -1,
  count: 0,
  canPrev: false,
  canNext: false,
};

export interface Navigation {
  state: Readable<NavigationState>;
  attach: (id: string | undefined) => void;
  detach: () => void;
}

/**
 * Connects a control to a carousel scroller (resolved by element id) using only
 * native APIs: registers the Invoker command handler and tracks the live
 * navigation state. Never touches a Blossom instance, so it works even when
 * Blossom isn't initialized.
 */
export function createNavigation(): Navigation {
  const state = writable<NavigationState>({ ...INITIAL });
  let cleanup: (() => void) | null = null;

  function detach(): void {
    cleanup?.();
    cleanup = null;
  }

  function attach(id: string | undefined): void {
    detach();
    state.set({ ...INITIAL });
    if (!id) return;

    const scroller = document.getElementById(id);
    if (!scroller) return;

    const unregister = registerCommands(scroller);
    const unobserve = observeNavigationState(scroller, (next) => {
      state.set(next);
    });
    cleanup = () => {
      unregister();
      unobserve();
    };
  }

  return { state, attach, detach };
}
