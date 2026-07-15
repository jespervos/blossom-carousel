import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "./BlossomDots";

// jsdom does not implement ResizeObserver; the navigation package only uses
// it to detect layout shifts, which don't occur in these tests.
class StubResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??=
  StubResizeObserver;

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function setUpCarousel(slideCount: number): HTMLElement {
  const scroller = document.createElement("div");
  scroller.id = "my-carousel";
  for (let i = 0; i < slideCount; i++) {
    const slide = document.createElement("div");
    slide.setAttribute("data-blossom-slide", "");
    scroller.appendChild(slide);
  }
  document.body.appendChild(scroller);
  return scroller;
}

describe("BlossomDots renderDot", () => {
  let scroller: HTMLElement;
  let dots: HTMLElement;

  beforeEach(() => {
    scroller = setUpCarousel(3);
    dots = document.createElement("blossom-dots");
    dots.setAttribute("for", "my-carousel");
  });

  afterEach(() => {
    dots.remove();
    scroller.remove();
  });

  it("takes priority over a <blossom-dot> prototype when set", async () => {
    const prototype = document.createElement("blossom-dot");
    prototype.innerHTML = `<button class="prototype"></button>`;
    dots.appendChild(prototype);

    (dots as HTMLElement & { renderDot?: unknown }).renderDot = (
      index: number,
    ) => {
      const button = document.createElement("button");
      button.className = "custom";
      button.textContent = `dot-${index}`;
      return button;
    };

    document.body.appendChild(dots);
    await nextFrame();
    await nextFrame();

    const buttons = dots.querySelectorAll(":scope > button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0].className).toBe("custom");
    expect(buttons[0].textContent).toBe("dot-0");
    // The prototype is kept as a hidden template, not rendered as a dot.
    expect(dots.querySelectorAll(":scope > button.prototype")).toHaveLength(0);
  });

  it("re-renders immediately when renderDot is set after connection", async () => {
    document.body.appendChild(dots);
    await nextFrame();
    await nextFrame();

    expect(dots.querySelector("[data-blossom-dot]")).not.toBeNull();

    (dots as HTMLElement & { renderDot?: unknown }).renderDot = (
      index: number,
      active: boolean,
    ) => {
      const button = document.createElement("button");
      button.dataset.active = String(active);
      button.textContent = `dot-${index}`;
      return button;
    };

    const buttons = dots.querySelectorAll(":scope > button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0].hasAttribute("data-blossom-dot")).toBe(false);
    expect(buttons[0].textContent).toBe("dot-0");
  });
});

type BlossomDotsInternals = HTMLElement & {
  render: (
    state: { count: number; activeIndex: number },
    forId: string,
    force?: boolean,
  ) => void;
};

function renderDots(
  dots: HTMLElement,
  state: { count: number; activeIndex: number },
  force = false,
): void {
  (dots as BlossomDotsInternals).render(state, "my-carousel", force);
}

describe("BlossomDots in-place updates", () => {
  let dots: HTMLElement;

  beforeEach(() => {
    dots = document.createElement("blossom-dots");
    dots.setAttribute("for", "my-carousel");
    document.body.appendChild(dots);
    renderDots(dots, { count: 3, activeIndex: 0 });
  });

  afterEach(() => {
    dots.remove();
  });

  it("renders dots as direct children without an inner wrapper", () => {
    expect(dots.querySelector(":scope > div")).toBeNull();
    expect(dots.children.length).toBe(3);
    expect(dots.getAttribute("data-blossom-dots")).not.toBeNull();
    expect(dots.getAttribute("role")).toBe("group");
  });

  it("skips work when count and activeIndex are unchanged", () => {
    const buttons = [...dots.querySelectorAll(":scope > button")];
    renderDots(dots, { count: 3, activeIndex: 0 });

    const after = [...dots.querySelectorAll(":scope > button")];
    expect(after).toHaveLength(3);
    expect(after[0]).toBe(buttons[0]);
    expect(after[1]).toBe(buttons[1]);
    expect(after[2]).toBe(buttons[2]);
  });

  it("patches default dots in place when only activeIndex changes", () => {
    const buttons = [...dots.querySelectorAll(":scope > button")];
    renderDots(dots, { count: 3, activeIndex: 1 });

    const after = [...dots.querySelectorAll(":scope > button")];
    expect(after[0]).toBe(buttons[0]);
    expect(after[1]).toBe(buttons[1]);
    expect(after[2]).toBe(buttons[2]);
    expect(after[0].hasAttribute("aria-current")).toBe(false);
    expect(after[1].getAttribute("aria-current")).toBe("true");
    expect(after[2].hasAttribute("aria-current")).toBe(false);
  });

  it("rebuilds all dots when count changes", () => {
    const buttons = [...dots.querySelectorAll(":scope > button")];
    renderDots(dots, { count: 4, activeIndex: 0 });

    const after = [...dots.querySelectorAll(":scope > button")];
    expect(after).toHaveLength(4);
    expect(after[0]).not.toBe(buttons[0]);
  });

  it("re-invokes renderDot only for dots whose active state changed", () => {
    const renderDot = vi.fn((index: number, active: boolean) => {
      const button = document.createElement("button");
      button.dataset.active = String(active);
      button.textContent = `dot-${index}`;
      return button;
    });

    (dots as HTMLElement & { renderDot?: unknown }).renderDot = renderDot;
    renderDot.mockClear();

    const buttons = [...dots.querySelectorAll(":scope > button")];
    renderDots(dots, { count: 3, activeIndex: 1 });

    expect(renderDot).toHaveBeenCalledTimes(2);
    expect(renderDot).toHaveBeenCalledWith(0, false, "my-carousel");
    expect(renderDot).toHaveBeenCalledWith(1, true, "my-carousel");

    const after = [...dots.querySelectorAll(":scope > button")];
    expect(after[0]).not.toBe(buttons[0]);
    expect(after[1]).not.toBe(buttons[1]);
    expect(after[2]).toBe(buttons[2]);
    expect(after[1].dataset.active).toBe("true");
  });
});
