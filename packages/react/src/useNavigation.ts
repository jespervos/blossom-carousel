import { useEffect, useState } from "react";
import {
  observeNavigationState,
  registerCommands,
} from "@blossom-carousel/navigation";

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

export function useNavigation(forId: string): NavigationState {
  const [state, setState] = useState<NavigationState>(INITIAL);

  useEffect(() => {
    setState({ ...INITIAL });
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
