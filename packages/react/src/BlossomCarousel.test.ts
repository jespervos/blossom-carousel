import { afterEach, describe, expect, it, vi } from "vitest";
import React, { act, createRef, useLayoutEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import BlossomCarousel, { type BlossomCarouselHandle } from "./BlossomCarousel";

describe("BlossomCarousel commands", () => {
  const roots: Root[] = [];
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    for (const root of roots) root.unmount();
    roots.length = 0;
    document.body.replaceChildren();
    window.matchMedia = originalMatchMedia;
  });

  it("scrolls to a slide from goTo without loading the drag engine", async () => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);

    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    roots.push(root);
    const ref = createRef<BlossomCarouselHandle>();

    await act(async () => {
      root.render(
        React.createElement(
          BlossomCarousel,
          { ref },
          React.createElement("div", { "data-blossom-slide": "" }),
        ),
      );
    });

    const slide = host.querySelector("[data-blossom-slide]") as HTMLElement;
    slide.scrollIntoView = vi.fn();
    ref.current?.goTo(0, { behavior: "instant" });

    expect(slide.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
  });

  it("accepts goTo from a parent's layout effect, before the first paint", async () => {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
    const scrollIntoView = vi.fn();
    const original = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;

    function Gallery() {
      const ref = React.useRef<BlossomCarouselHandle>(null);
      useLayoutEffect(() => {
        ref.current?.goTo(1, { behavior: "instant" });
      }, []);
      return React.createElement(
        BlossomCarousel,
        { ref },
        React.createElement("div", { "data-blossom-slide": "" }),
        React.createElement("div", { "data-blossom-slide": "" }),
      );
    }

    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    roots.push(root);

    try {
      await act(async () => {
        root.render(React.createElement(Gallery));
      });
    } finally {
      HTMLElement.prototype.scrollIntoView = original;
    }

    const slides = host.querySelectorAll("[data-blossom-slide]");
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(slides[1]);
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
  });
});
