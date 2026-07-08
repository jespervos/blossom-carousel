import { Comment, Fragment, h } from "vue";
import { describe, expect, it } from "vitest";
import { countMarkedSlideVnodes } from "./countMarkedSlides";

describe("countMarkedSlideVnodes", () => {
  it("counts marked elements at any depth", () => {
    const vnodes = [
      h("ul", [
        h("li", { "data-blossom-slide": "" }, "1"),
        h("li", { "data-blossom-slide": "" }, "2"),
      ]),
    ];

    expect(countMarkedSlideVnodes(vnodes)).toBe(2);
  });

  it("counts v-for fragments", () => {
    const vnodes = [
      h(Fragment, [
        h("li", { "data-blossom-slide": "" }, "1"),
        h("li", { "data-blossom-slide": "" }, "2"),
        h("li", { "data-blossom-slide": "" }, "3"),
      ]),
    ];

    expect(countMarkedSlideVnodes(vnodes)).toBe(3);
  });

  it("ignores unmarked elements", () => {
    const vnodes = [
      h("ul", [
        h("li", "1"),
        h("li", { "data-blossom-slide": "" }, "2"),
      ]),
    ];

    expect(countMarkedSlideVnodes(vnodes)).toBe(1);
  });

  it("ignores comments", () => {
    const vnodes = [
      h(Comment, "ignored"),
      h("li", { "data-blossom-slide": "" }, "1"),
    ];

    expect(countMarkedSlideVnodes(vnodes)).toBe(1);
  });
});
