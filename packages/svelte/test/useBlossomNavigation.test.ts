import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import NavigationFixture from "./NavigationFixture.svelte";

describe("useBlossomNavigation", () => {
  const cleanups: Array<() => Promise<void>> = [];

  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
    document.body.replaceChildren();
    vi.unstubAllGlobals();
  });

  function carouselWithSlides(id: string, slides: number) {
    const scroller = document.createElement("div");
    scroller.id = id;
    for (let i = 0; i < slides; i++) {
      const slide = document.createElement("div");
      slide.setAttribute("data-blossom-slide", "");
      scroller.append(slide);
    }
    document.body.append(scroller);
    return scroller;
  }

  it("reads the slide count of the linked carousel", () => {
    carouselWithSlides("nav-carousel", 3);

    const target = document.createElement("div");
    document.body.append(target);
    const view = mount(NavigationFixture, {
      target,
      props: { forId: "nav-carousel" },
    });
    flushSync();
    cleanups.push(() => unmount(view));

    expect(target.querySelector("[data-count]")?.textContent).toBe("3");
  });

  it("falls back to an empty state when the carousel does not exist", () => {
    const target = document.createElement("div");
    document.body.append(target);
    const view = mount(NavigationFixture, {
      target,
      props: { forId: "missing" },
    });
    flushSync();
    cleanups.push(() => unmount(view));

    expect(target.querySelector("[data-count]")?.textContent).toBe("0");
    expect(target.querySelector("[data-active]")?.textContent).toBe("-1");
    expect(target.querySelector("[data-next]")?.textContent).toBe("false");
  });
});
