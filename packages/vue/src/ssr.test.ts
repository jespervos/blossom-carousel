import { createSSRApp, defineComponent, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";
import BlossomCarousel from "./BlossomCarousel.vue";
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

    expect(html.match(/class="blossom-dot"/g)?.length).toBe(4);
    expect(html).toContain('commandfor="my-carousel"');
  });
});
