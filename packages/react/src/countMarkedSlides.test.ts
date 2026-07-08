import React, { Fragment } from "react";
import { describe, expect, it } from "vitest";
import { countMarkedSlides } from "./countMarkedSlides";

const h = React.createElement;

describe("countMarkedSlides", () => {
  it("counts marked elements at any depth", () => {
    const tree = h(
      "ul",
      null,
      h("li", { "data-blossom-slide": "" }, "1"),
      h("li", { "data-blossom-slide": "" }, "2"),
    );

    expect(countMarkedSlides(tree)).toBe(2);
  });

  it("counts elements inside fragments", () => {
    const tree = h(
      Fragment,
      null,
      h("li", { "data-blossom-slide": "" }, "1"),
      h("li", { "data-blossom-slide": "" }, "2"),
      h("li", { "data-blossom-slide": "" }, "3"),
    );

    expect(countMarkedSlides(tree)).toBe(3);
  });

  it("counts elements inside arrays produced by .map", () => {
    const tree = Array.from({ length: 4 }, (_, i) =>
      h("li", { key: i, "data-blossom-slide": "" }, String(i)),
    );

    expect(countMarkedSlides(tree)).toBe(4);
  });

  it("ignores unmarked elements", () => {
    const tree = h(
      "ul",
      null,
      h("li", null, "1"),
      h("li", { "data-blossom-slide": "" }, "2"),
    );

    expect(countMarkedSlides(tree)).toBe(1);
  });

  it("ignores strings, numbers, and null children", () => {
    const tree = h(
      "ul",
      null,
      "text",
      42,
      null,
      h("li", { "data-blossom-slide": "" }, "1"),
    );

    expect(countMarkedSlides(tree)).toBe(1);
  });
});
