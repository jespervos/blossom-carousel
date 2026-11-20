import { describe, expect, it } from "vitest";
import { getLoop, LOOP_ATTR, selectActiveIndex } from "./markers";

// four targets every 300px, a 390px scrollport
const positions = [1000, 1300, 1600, 1900];

describe("selectActiveIndex", () => {
  it("picks the target at or before the position", () => {
    expect(selectActiveIndex(positions, 1000, 390)).toBe(0);
    expect(selectActiveIndex(positions, 1650, 390)).toBe(2);
  });

  it("stays on the last target past the end without a loop", () => {
    expect(selectActiveIndex(positions, 1900 + 1200 * 3, 390)).toBe(3);
  });

  describe("on a looping scroller", () => {
    const loop = 1200;

    it("takes the position modulo the loop, both ways", () => {
      for (const k of [-5, -1, 0, 1, 7]) {
        positions.forEach((p, i) => {
          expect(selectActiveIndex(positions, p + k * loop, 390, undefined, loop)).toBe(i);
          expect(selectActiveIndex(positions, p + 100 + k * loop, 390, undefined, loop)).toBe(i);
        });
      }
    });

    it("sees the last target of the previous loop just before the first one", () => {
      expect(selectActiveIndex(positions, 1000 - 250 + loop * 3, 390, undefined, loop)).toBe(3);
    });

    it("matches the same position without a loop inside the first loop", () => {
      for (let x = 1000; x < 1900; x += 37) {
        expect(selectActiveIndex(positions, x, 390, undefined, loop)).toBe(selectActiveIndex(positions, x, 390));
      }
    });
  });
});

describe("getLoop", () => {
  it("reads the loop length the repeat add-on sets, or 0", () => {
    const el = document.createElement("div");
    expect(getLoop(el)).toBe(0);
    el.setAttribute(LOOP_ATTR, "1790.5");
    expect(getLoop(el)).toBe(1790.5);
    el.setAttribute(LOOP_ATTR, "nonsense");
    expect(getLoop(el)).toBe(0);
  });
});
