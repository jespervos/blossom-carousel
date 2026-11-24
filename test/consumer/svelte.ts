import { mount } from "svelte";
import {
  BlossomCarousel,
  BlossomDots,
  BlossomPrev,
  useBlossomNavigation,
  type NavigationState,
} from "@blossom-carousel/svelte";

mount(BlossomCarousel, { target: document.body, props: { repeat: true } });
mount(BlossomPrev, { target: document.body, props: { forId: "c" } });
mount(BlossomDots, { target: document.body, props: { forId: "c" } });

// @ts-expect-error forId is a string
mount(BlossomPrev, { target: document.body, props: { forId: 1 } });

const state: NavigationState = useBlossomNavigation(() => "c");
export const count: number = state.count;
// @ts-expect-error not a navigation state field
state.missing;
