import { onMounted, onBeforeUnmount, ref, watch, type Ref } from "vue";
import { observeNavigationState, registerCommands } from "@blossom-carousel/navigation";

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
export function useNavigation(forId: Ref<string>): Ref<NavigationState> {
  const state = ref<NavigationState>({ ...INITIAL });
  let cleanup: (() => void) | null = null;

  function detach(): void {
    cleanup?.();
    cleanup = null;
  }

  function attach(id: string | undefined): void {
    detach();
    state.value = { ...INITIAL };
    if (!id) return;

    const scroller = document.getElementById(id);
    if (!scroller) return;

    const unregister = registerCommands(scroller);
    const unobserve = observeNavigationState(scroller, (next) => {
      state.value = next;
    });
    cleanup = () => {
      unregister();
      unobserve();
    };
  }

  onMounted(() => attach(forId.value));
  watch(forId, (id) => attach(id));
  onBeforeUnmount(detach);

  return state;
}
