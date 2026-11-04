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

describe("BlossomCarousel event props", () => {
  const roots: Root[] = [];
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    for (const root of roots) root.unmount();
    roots.length = 0;
    document.body.replaceChildren();
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  async function renderCarousel(props: Record<string, unknown>) {
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    roots.push(root);
    const ref = createRef<BlossomCarouselHandle>();

    const render = (nextProps: Record<string, unknown>) =>
      act(async () => {
        root.render(
          React.createElement(
            BlossomCarousel,
            { ref, ...nextProps },
            React.createElement("div", { "data-blossom-slide": "" }),
          ),
        );
      });

    await render(props);
    return { ref, render, element: ref.current!.element! };
  }

  it("calls onOverscroll for overscroll events on the root", async () => {
    const onOverscroll = vi.fn();
    const { element } = await renderCarousel({ onOverscroll });

    element.dispatchEvent(
      new CustomEvent("overscroll", { detail: { left: 12 }, cancelable: true }),
    );

    expect(onOverscroll).toHaveBeenCalledTimes(1);
    expect(onOverscroll.mock.calls[0][0].detail).toEqual({ left: 12 });
  });

  it("calls onCommand when goTo navigates", async () => {
    const onCommand = vi.fn();
    const { ref, element } = await renderCarousel({ onCommand });
    (element.firstElementChild as HTMLElement).scrollIntoView = vi.fn();

    ref.current?.goTo(0);

    expect(onCommand).toHaveBeenCalledTimes(1);
    expect(onCommand.mock.calls[0][0].detail.command).toBe("--blossom-goto-0");
  });

  it("does not pass the event props to the DOM", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    await renderCarousel({ onOverscroll: () => {}, onCommand: () => {} });

    const warnings = consoleError.mock.calls.filter((call) =>
      String(call[0]).includes("Unknown event handler property"),
    );
    expect(warnings).toHaveLength(0);
  });

  it("uses the latest handler after a re-render", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { render, element } = await renderCarousel({ onOverscroll: first });

    await render({ onOverscroll: second });
    element.dispatchEvent(new CustomEvent("overscroll", { detail: { left: 1 } }));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
