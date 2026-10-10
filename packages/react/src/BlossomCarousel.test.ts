import { afterEach, describe, expect, it, vi } from "vitest";
import React, { act, createRef } from "react";
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
});
