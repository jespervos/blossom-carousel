import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BlossomCarousel from "./BlossomCarousel";
import BlossomDots from "./BlossomDots";

const h = React.createElement;

describe("SSR dots", () => {
  it("renders dot buttons from a children walk before mount", () => {
    const App = () =>
      h(
        "div",
        null,
        h(
          BlossomCarousel,
          { id: "my-carousel" },
          h(
            "ul",
            null,
            ...Array.from({ length: 4 }, (_, index) =>
              h(
                "li",
                { key: index, "data-blossom-slide": "" },
                String(index + 1),
              ),
            ),
          ),
        ),
        h(BlossomDots, { for: "my-carousel" }),
      );

    const html = renderToString(h(App));

    expect(html.match(/class="blossom-dot"/g)?.length).toBe(4);
    expect(html).toContain('commandfor="my-carousel"');
  });
});
