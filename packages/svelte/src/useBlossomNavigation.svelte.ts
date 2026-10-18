import { get } from "svelte/store";
import { createNavigationStore, type NavigationState } from "./navigation.js";

/**
 * Reactive navigation state for the carousel with the given id: the same state
 * the built-in controls use. Call it during component initialization. Pass the
 * id, or a getter that returns it to follow a changing id.
 *
 * Never touches a Blossom instance, so it works even when Blossom isn't
 * initialized.
 */
export function useBlossomNavigation(
  forId: string | (() => string),
): NavigationState {
  const resolveId = () => (typeof forId === "function" ? forId() : forId);

  const nav = createNavigationStore(resolveId());
  let state = $state<NavigationState>(get(nav));

  $effect(() => {
    nav.connect(resolveId());
    const unsubscribe = nav.subscribe((next) => {
      state = next;
    });

    return () => {
      unsubscribe();
      nav.disconnect();
    };
  });

  return {
    get activeIndex() {
      return state.activeIndex;
    },
    get count() {
      return state.count;
    },
    get canPrev() {
      return state.canPrev;
    },
    get canNext() {
      return state.canNext;
    },
  };
}
