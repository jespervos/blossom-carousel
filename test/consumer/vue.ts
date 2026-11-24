import { h } from "vue";
import {
  BlossomCarousel,
  BlossomDots,
  BlossomPrev,
  useBlossomNavigation,
  type NavigationState,
} from "@blossom-carousel/vue";

const state = useBlossomNavigation("c");
const snapshot: NavigationState = state.value;
export const count: number = snapshot.count;

export const carousel = h(BlossomCarousel, { repeat: true });
export const prev = h(BlossomPrev, { for: "c" });
export const dots = h(BlossomDots, { for: "c" });

// @ts-expect-error repeat is a boolean
h(BlossomCarousel, { repeat: 1 });
// @ts-expect-error behavior is a ScrollBehavior
h(BlossomPrev, { for: "c", behavior: "sideways" });
// @ts-expect-error not a navigation state field
snapshot.missing;

const instance = new BlossomCarousel();
instance.goTo(1, { behavior: "smooth" });
// @ts-expect-error behavior is a ScrollBehavior
instance.goTo(1, { behavior: "sideways" });
