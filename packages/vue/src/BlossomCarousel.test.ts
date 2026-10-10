import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createApp,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  type App,
} from "vue";
import BlossomCarousel from "./BlossomCarousel.vue";

type CarouselApi = {
  goTo: (index: number, options?: { behavior?: ScrollBehavior }) => void;
};

describe("BlossomCarousel commands", () => {
  const apps: App[] = [];
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    for (const app of apps) app.unmount();
    apps.length = 0;
    document.body.replaceChildren();
    window.matchMedia = originalMatchMedia;
  });

  it("scrolls to a slide from goTo without loading the drag engine", async () => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);

    let api: CarouselApi | undefined;
    const Root = defineComponent({
      setup() {
        const carousel = ref<CarouselApi>();
        onMounted(() => {
          api = carousel.value;
        });
        return () =>
          h(BlossomCarousel, { ref: carousel }, () =>
            h("div", { "data-blossom-slide": "" }),
          );
      },
    });

    const el = document.createElement("div");
    document.body.append(el);
    const app = createApp(Root);
    apps.push(app);
    app.mount(el);
    await nextTick();

    const slide = document.querySelector("[data-blossom-slide]") as HTMLElement;
    slide.scrollIntoView = vi.fn();
    api!.goTo(0, { behavior: "instant" });

    expect(slide.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
  });
});
