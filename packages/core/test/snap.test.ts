import { describe, expect, it } from "vitest";
import {
  dragSnap,
  findSnapPositions,
  onSnapChanging,
  shouldSnap,
  snapSelect,
} from "../src/snap";
import { createState } from "../src/state";

describe("shouldSnap", () => {
  it("returns false when snapping is disabled", () => {
    const state = createState();
    state.snapPositions = [{ target: null, x: 100, y: 0 }];

    expect(shouldSnap(90, 0, 0.5, state)).toBe(false);
  });

  it("returns false when snap positions have not been discovered yet", () => {
    const state = createState();
    state.hasSnap = true;

    expect(shouldSnap(90, 0, 0.5, state)).toBe(false);
  });

  it("returns true when snap is mandatory", () => {
    const state = createState();
    state.hasSnap = true;
    state.snapMandatory = true;

    state.snapPositions = [{ target: null, x: 250, y: 0 }];

    expect(shouldSnap(0, 0, 0.5, state)).toBe(true);
  });

  it("returns true when the resting position is close to a snap point", () => {
    const state = createState();
    state.hasSnap = true;
    state.scrollerWidth = 300;
    state.scrollPadding = { start: 0, end: 0 };

    state.snapPositions = [{ target: null, x: 150, y: 0 }];

    expect(shouldSnap(140, 0, 0.5, state)).toBe(true);
  });

  it("returns false when the resting position is too far away", () => {
    const state = createState();
    state.hasSnap = true;
    state.scrollerWidth = 300;
    state.scrollPadding = { start: 0, end: 0 };

    state.snapPositions = [{ target: null, x: 250, y: 0 }];

    expect(shouldSnap(0, 0, 0.5, state)).toBe(false);
  });
});

describe("findSnapPositions", () => {
  it("keeps the first duplicate position and drops unsupported alignments", () => {
    const scroller = document.createElement("div");
    const first = document.createElement("div");
    const duplicate = document.createElement("div");
    const unsupported = document.createElement("div");
    first.style.scrollSnapAlign = "start";
    duplicate.style.scrollSnapAlign = "start";
    unsupported.style.scrollSnapAlign = "start end";
    scroller.append(first, duplicate, unsupported);

    Object.defineProperty(scroller, "getBoundingClientRect", {
      value: () => rect(0),
    });
    Object.defineProperty(first, "getBoundingClientRect", {
      value: () => rect(10),
    });
    Object.defineProperty(duplicate, "getBoundingClientRect", {
      value: () => rect(10),
    });
    Object.defineProperty(unsupported, "getBoundingClientRect", {
      value: () => rect(20),
    });

    const state = createState();
    findSnapPositions(scroller, state);

    expect(state.snapPositions).toHaveLength(1);
    expect(state.snapPositions[0]).toMatchObject({ target: first, x: 10 });
  });
});

describe("snapSelect", () => {
  it("selects the nearest snap position", () => {
    const state = createState();
    state.snapPositions = [
      { target: null, x: 0, y: 0 },
      { target: null, x: 100, y: 0 },
      { target: null, x: 240, y: 0 },
    ];

    const selected = snapSelect(180, 0, 0.5, state);

    expect(selected).toBe(state.snapPositions[2]);
  });

  it("uses the projected resting position when choosing a snap", () => {
    const state = createState();
    state.snapPositions = [
      { target: null, x: 100, y: 0 },
      { target: null, x: 220, y: 0 },
    ];

    const selected = snapSelect(100, 60, 0.5, state);

    expect(selected).toBe(state.snapPositions[1]);
  });

  it("clamps the fallback position when no snap points exist", () => {
    const state = createState();
    state.end = -200;

    expect(snapSelect(500, 0, 0.5, state)).toEqual({
      target: null,
      x: 0,
      y: 0,
    });
  });

  it("clamps to the lower bound when the fallback goes past the end", () => {
    const state = createState();
    state.end = -200;

    expect(snapSelect(-500, 0, 0.5, state)).toEqual({
      target: null,
      x: -200,
      y: 0,
    });
  });
});

describe("scrollsnapchanging events", () => {
  it("dispatches the selected target on pointer release", () => {
    const state = createState();
    const scroller = document.createElement("div");
    const target = document.createElement("div");
    const position = { target, x: 100, y: 0 };
    state.scroller = scroller;
    state.snapPositions = [position];
    const events: CustomEvent[] = [];

    scroller.addEventListener("scrollsnapchanging", (event) => {
      events.push(event as CustomEvent);
    });

    dragSnap(100, 0, 0.5, state);
    dragSnap(100, 0, 0.5, state);

    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({
      snapTargetInline: target,
      snapTargetBlock: target,
    });
  });

  it("dispatches the selected target during drag frames", () => {
    const state = createState();
    const scroller = document.createElement("div");
    const target = document.createElement("div");
    const position = { target, x: 100, y: 0 };
    state.scroller = scroller;
    state.snapPositions = [position];
    const events: CustomEvent[] = [];

    scroller.addEventListener("scrollsnapchanging", (event) => {
      events.push(event as CustomEvent);
    });

    onSnapChanging(100, 0, 0.5, state);
    onSnapChanging(100, 0, 0.5, state);

    expect(events).toHaveLength(1);
    expect(events[0].detail).toEqual({
      snapTargetInline: target,
      snapTargetBlock: target,
    });
  });
});

function rect(left: number): DOMRect {
  return {
    x: left,
    y: 0,
    left,
    top: 0,
    right: left + 20,
    bottom: 20,
    width: 20,
    height: 20,
    toJSON: () => ({}),
  };
}
