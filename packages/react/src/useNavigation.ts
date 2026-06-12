import { useEffect, useState } from "react";
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

/**
 * Connects a control to a carousel scroller (resolved by element id) using only
 * native APIs: registers the Invoker command handler and tracks the live
 * navigation state. Never touches a Blossom instance, so it works even when
 * Blossom isn't initialized.
 */
export function useNavigation(forId: string): NavigationState {
  const [state, setState] = useState<NavigationState>(INITIAL);

  useEffect(() => {
    setState(INITIAL);
    if (!forId) return;

    const scroller = document.getElementById(forId);
    if (!scroller) return;

    const unregister = registerCommands(scroller);
    const unobserve = observeNavigationState(scroller, setState);
    return () => {
      unregister();
      unobserve();
    };
  }, [forId]);

  return state;
}
