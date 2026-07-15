import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import BlossomCarousel from "./BlossomCarousel.vue";
import BlossomDot from "./BlossomDot.vue";
import BlossomDots from "./BlossomDots.vue";

describe("SSR dots", () => {
  it("renders dot buttons from slot vnode count before mount", async () => {
    const App = defineComponent({
      setup() {
        return () =>
          h("div", [
            h(
              BlossomCarousel,
              { id: "my-carousel" },
              {
                default: () =>
                  h(
                    "ul",
                    Array.from({ length: 4 }, (_, index) =>
                      h(
                        "li",
                        { key: index, "data-blossom-slide": "" },
                        String(index + 1),
                      ),
                    ),
                  ),
              },
            ),
            h(BlossomDots, { for: "my-carousel" }),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html.match(/<button[^>]*data-blossom-dot/g)?.length).toBe(4);
    expect(html.match(/data-blossom-dot-marker/g)?.length).toBe(4);
    expect(html).toContain('commandfor="my-carousel"');
  });

  it("merges command props onto BlossomDot elements", async () => {
    const App = defineComponent({
      setup() {
        return () =>
          h("div", [
            h(
              BlossomCarousel,
              { id: "my-carousel" },
              {
                default: () =>
                  h(
                    "ul",
                    Array.from({ length: 3 }, (_, index) =>
                      h(
                        "li",
                        { key: index, "data-blossom-slide": "" },
                        String(index + 1),
                      ),
                    ),
                  ),
              },
            ),
            h(
              BlossomDots,
              { for: "my-carousel" },
              {
                default: ({ index }: { index: number }) =>
                  h(
                    BlossomDot,
                    { class: "my-dot", "aria-label": `Photo ${index + 1}` },
                    String(index + 1),
                  ),
              },
            ),
          ]);
      },
    });

    const html = await renderToString(createSSRApp(App));

    expect(html.match(/<button[^>]*data-blossom-dot/g)?.length).toBe(3);
    expect(html.match(/class="my-dot"/g)?.length).toBe(3);
    expect(html.match(/commandfor="my-carousel"/g)?.length).toBe(3);
    expect(html.match(/command="--blossom-goto-/g)?.length).toBe(3);
    expect(html).toContain('aria-label="Photo 1"');
  });
});
