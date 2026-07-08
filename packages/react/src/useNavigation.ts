import { useEffect, useState } from "react";
import {
  observeNavigationState,
  registerCommands,
} from "@blossom-carousel/navigation";
import { getSlideCount } from "./slideRegistry";

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

function seededState(forId: string): NavigationState {
  return { ...INITIAL, count: getSlideCount(forId) };
}

export function useNavigation(forId: string): NavigationState {
  const [state, setState] = useState<NavigationState>(() => seededState(forId));

  useEffect(() => {
    // Seed (not reset to 0) on every id change, so a `for` change never
    // flashes an empty dot list before the observer's first callback, and so
    // client hydration matches the server-rendered dot count.
    setState(seededState(forId));
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
