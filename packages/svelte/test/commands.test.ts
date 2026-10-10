import { afterEach, describe, expect, it, vi } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import BlossomCarousel from "../src/BlossomCarousel.svelte";

describe("BlossomCarousel commands", () => {
  const cleanups: Array<() => Promise<void>> = [];
  const originalMatchMedia = window.matchMedia;

  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
    document.body.replaceChildren();
    window.matchMedia = originalMatchMedia;
  });

  it("scrolls to a slide from goTo without loading the drag engine", async () => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);

    const target = document.createElement("div");
    document.body.append(target);
    const carousel = mount(BlossomCarousel, { target });
    flushSync();
    cleanups.push(() => unmount(carousel));

    const root = target.querySelector("[blossom-carousel]") as HTMLElement;
    const slide = document.createElement("div");
    slide.setAttribute("data-blossom-slide", "");
    slide.scrollIntoView = vi.fn();
    root.append(slide);

    carousel.goTo(0, { behavior: "instant" });

    expect(slide.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
  });
});
