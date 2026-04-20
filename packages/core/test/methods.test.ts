import { describe, expect, it, vi } from "vitest";
import { next, prev } from "../src/methods";
import { createState } from "../src/state";

function createFakeScroller(scrollLeft: number) {
  return {
    scrollLeft,
    scrollTo: vi.fn(),
  } as unknown as HTMLElement;
}

describe("next", () => {
  it("scrolls to the next slide position", () => {
    const state = createState();
    const scroller = createFakeScroller(100);
    state.scroller = scroller;
    state.slidePositions = [
      { x: 20, y: 0, target: null, width: 100, height: 40 },
      { x: 120, y: 0, target: null, width: 100, height: 40 },
      { x: 240, y: 0, target: null, width: 100, height: 40 },
    ];

    next(state);

    expect(scroller.scrollTo).toHaveBeenCalledWith({
      left: 120,
      behavior: "smooth",
    });
  });

  it("prefers snap positions when they are available", () => {
    const state = createState();
    state.hasSnap = true;
    const scroller = createFakeScroller(10);
    state.scroller = scroller;
    state.slidePositions = [
      { x: 200, y: 0, target: null, width: 100, height: 40 },
      { x: 320, y: 0, target: null, width: 100, height: 40 },
    ];

    state.snapPositions = [
      { target: null, x: 0, y: 0 },
      { target: null, x: 80, y: 0 },
      { target: null, x: 160, y: 0 },
    ];

    next(state);

    expect(scroller.scrollTo).toHaveBeenCalledWith({
      left: 80,
      behavior: "smooth",
    });
  });

  it("does nothing when there is no next slide", () => {
    const state = createState();
    const scroller = createFakeScroller(240);
    state.scroller = scroller;
    state.slidePositions = [
      { x: 20, y: 0, target: null, width: 100, height: 40 },
      { x: 120, y: 0, target: null, width: 100, height: 40 },
      { x: 240, y: 0, target: null, width: 100, height: 40 },
    ];

    next(state);

    expect(scroller.scrollTo).not.toHaveBeenCalled();
  });
});

describe("prev", () => {
  it("scrolls to the previous slide position", () => {
    const state = createState();
    const scroller = createFakeScroller(240);
    state.scroller = scroller;
    state.slidePositions = [
      { x: 20, y: 0, target: null, width: 100, height: 40 },
      { x: 120, y: 0, target: null, width: 100, height: 40 },
      { x: 240, y: 0, target: null, width: 100, height: 40 },
    ];

    prev(state);

    expect(scroller.scrollTo).toHaveBeenCalledWith({
      left: 120,
      behavior: "smooth",
    });
  });

  it("does nothing when there is no previous slide", () => {
    const state = createState();
    const scroller = createFakeScroller(20);
    state.scroller = scroller;
    state.slidePositions = [
      { x: 20, y: 0, target: null, width: 100, height: 40 },
      { x: 120, y: 0, target: null, width: 100, height: 40 },
      { x: 240, y: 0, target: null, width: 100, height: 40 },
    ];

    prev(state);

    expect(scroller.scrollTo).not.toHaveBeenCalled();
  });
});
