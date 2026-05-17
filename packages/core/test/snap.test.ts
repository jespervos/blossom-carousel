import { describe, expect, it } from "vitest";
import { shouldSnap, snapSelect } from "../src/snap";
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
