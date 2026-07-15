import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BlossomCarousel from "./BlossomCarousel";
import BlossomDots from "./BlossomDots";
import BlossomDot from "./BlossomDot";

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

    expect(html.match(/<button[^>]*data-blossom-dot/g)?.length).toBe(4);
    expect(html.match(/data-blossom-dot-marker/g)?.length).toBe(4);
    expect(html).toContain('commandfor="my-carousel"');
  });

  it("merges command props onto BlossomDot elements", () => {
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
            ...Array.from({ length: 3 }, (_, index) =>
              h(
                "li",
                { key: index, "data-blossom-slide": "" },
                String(index + 1),
              ),
            ),
          ),
        ),
        h(BlossomDots, {
          for: "my-carousel",
          children: ({ index }: { index: number }) =>
            h(
              BlossomDot,
              { className: "my-dot", "aria-label": `Photo ${index + 1}` },
              String(index + 1),
            ),
        }),
      );

    const html = renderToString(h(App));

    expect(html.match(/<button[^>]*data-blossom-dot/g)?.length).toBe(3);
    expect(html.match(/class="my-dot"/g)?.length).toBe(3);
    expect(html.match(/commandfor="my-carousel"/g)?.length).toBe(3);
    expect(html.match(/command="--blossom-goto-/g)?.length).toBe(3);
    expect(html).toContain('aria-label="Photo 1"');
  });
});
