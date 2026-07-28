import {
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
  type App,
  type Ref,
} from "vue";
import {
  observeNavigationState,
  registerCommands,
} from "@blossom-carousel/navigation";

const REGISTRY_KEY = Symbol.for("blossom-carousel.slideCounts");

type SlideCountRegistry = Map<string, number>;

type AppWithRegistry = App & {
  [REGISTRY_KEY]?: SlideCountRegistry;
};

function getRegistry(app: App): SlideCountRegistry {
  const scoped = app as AppWithRegistry;
  if (!scoped[REGISTRY_KEY]) {
    scoped[REGISTRY_KEY] = new Map();
  }
  return scoped[REGISTRY_KEY];
}

/** Registers a slide count for a carousel id on the current Vue app instance. */
export function setSlideCount(app: App, id: string, count: number): void {
  getRegistry(app).set(id, count);
}

function getSlideCount(app: App, id: string | undefined): number {
  if (!id) return 0;
  return getRegistry(app).get(id) ?? 0;
}

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
  // Captured once, in setup scope: getCurrentInstance() returns null once we're
  // inside a watch callback or lifecycle-hook microtask, so it can't be read lazily.
  const app = getCurrentInstance()?.appContext.app;

  function seededState(id: string | undefined): NavigationState {
    const count = app ? getSlideCount(app, id) : 0;
    return { ...INITIAL, count };
  }

  const state = ref<NavigationState>(seededState(forId.value));
  let cleanup: (() => void) | null = null;
  // Distinguishes "not yet mounted" from "attach() ran but found nothing", so a
  // pre-mount `forId` change doesn't get mistaken for a live attachment to retry.
  let mounted = false;

  function detach(): void {
    cleanup?.();
    cleanup = null;
  }

  function attach(id: string | undefined): void {
    detach();
    state.value = seededState(id);
    if (!id) return;
    if (typeof document === "undefined") return;

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

  watch(
    forId,
    (id) => {
      if (mounted) {
        attach(id);
        return;
      }
      state.value = seededState(id);
    },
    { flush: "sync" },
  );

  onMounted(() => {
    mounted = true;
    attach(forId.value);
  });
  onBeforeUnmount(detach);

  return state;
}
