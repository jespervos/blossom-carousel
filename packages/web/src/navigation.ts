import {
  observeNavigationState,
  registerCommands,
  type NavigationState,
} from "@blossom-carousel/navigation";

export function connectNavigation(
  forId: string,
  onUpdate: (state: NavigationState) => void,
): () => void {
  if (!forId) return () => {};

  const scroller = document.getElementById(forId);
  if (!scroller) return () => {};

  const unregister = registerCommands(scroller);
  const unobserve = observeNavigationState(scroller, onUpdate);

  return () => {
    unregister();
    unobserve();
  };
}

export function getForId(element: HTMLElement): string {
  return element.getAttribute("for") ?? "";
}
