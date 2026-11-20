import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, createSSRApp, h, nextTick, ref, type App } from "vue";
import { renderToString } from "vue/server-renderer";
import { createRepeat } from "@blossom-carousel/repeat";
import { Blossom } from "@blossom-carousel/core";
import BlossomCarousel from "./BlossomCarousel.vue";
import { copies, installLayout, realSlides, rest, uninstallLayout, wait } from "../../repeat/test/layout";

vi.mock("@blossom-carousel/repeat", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@blossom-carousel/repeat")>();
  return { ...actual, createRepeat: vi.fn(actual.createRepeat) };
});
vi.mock("@blossom-carousel/core", () => ({
  Blossom: vi.fn(() => ({ init: vi.fn(), destroy: vi.fn() })),
}));

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("BlossomCarousel repeat", () => {
  const originalMatchMedia = window.matchMedia;
  let app: App | undefined;

  beforeAll(() => wait(200));
  beforeEach(() => {
    installLayout();
    vi.mocked(createRepeat).mockClear();
    vi.mocked(Blossom).mockClear();
    // a touch device: the drag engine is not loaded
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
  });
  afterEach(() => {
    app?.unmount();
    app = undefined;
    document.body.replaceChildren();
    window.matchMedia = originalMatchMedia;
    uninstallLayout();
  });

  async function mount(props: Record<string, unknown>) {
    const repeat = ref(props.repeat as boolean | undefined);
    const ids = ref(range(12));
    const host = document.createElement("div");
    document.body.append(host);
    app = createApp({
      render: () =>
        h(BlossomCarousel, { ...props, repeat: repeat.value }, () =>
          ids.value.map((i) => h("div", { key: i, class: "slide", "data-i": i }, String(i + 1))),
        ),
    });
    app.mount(host);
    await nextTick();
    await wait(0); // the add-on is imported only when repeat is set
    return { scroller: host.firstElementChild as HTMLElement, repeat, ids };
  }

  it("loops on a touch device, without the drag engine", async () => {
    const { scroller } = await mount({ repeat: true });
    expect(createRepeat).toHaveBeenCalledTimes(1);
    expect(createRepeat).toHaveBeenCalledWith(scroller);
    expect(Blossom).not.toHaveBeenCalled();
    expect(copies(scroller)).toHaveLength(7 * 12);
  });

  it("does not create it without the repeat prop", async () => {
    const { scroller } = await mount({});
    expect(createRepeat).not.toHaveBeenCalled();
    expect(copies(scroller)).toHaveLength(0);
  });

  it("destroys it when repeat turns off, creates it when it turns on, and destroys it on unmount", async () => {
    const { scroller, repeat } = await mount({ repeat: false });
    const plain = scroller.innerHTML;
    repeat.value = true;
    await nextTick();
    await wait(0); // the add-on is imported only when repeat is set
    expect(createRepeat).toHaveBeenCalledTimes(1);
    expect(copies(scroller)).toHaveLength(7 * 12);
    const first = vi.spyOn(vi.mocked(createRepeat).mock.results[0].value, "destroy");
    repeat.value = false;
    await nextTick();
    expect(first).toHaveBeenCalledTimes(1);
    expect(scroller.innerHTML).toBe(plain);
    repeat.value = true;
    await nextTick();
    await wait(0); // the add-on is imported only when repeat is set
    const second = vi.spyOn(vi.mocked(createRepeat).mock.results[1].value, "destroy");
    app!.unmount();
    app = undefined;
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("loops alongside the drag engine with load always", async () => {
    const { scroller } = await mount({ repeat: true, load: "always" });
    await wait(0); // the engine is imported dynamically
    expect(Blossom).toHaveBeenCalledWith(scroller, {});
    expect(copies(scroller)).toHaveLength(7 * 12);
  });

  it("follows Vue adding, removing and reordering slides", async () => {
    const { scroller, ids } = await mount({ repeat: true });
    for (const next of [range(13), [12, ...range(12).filter((i) => i !== 3)], [5, 4, 3, 2, 1, 0, 6, 7, 8, 9, 10, 11]]) {
      ids.value = next;
      await nextTick();
      await rest();
      expect(realSlides(scroller).map((el) => (el as HTMLElement).dataset.i)).toEqual(next.map(String));
      expect(copies(scroller)).toHaveLength(7 * next.length);
      expect(realSlides(scroller)[0].getBoundingClientRect().left).toBe(0);
    }
  });

  it("renders on the server without creating it", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(BlossomCarousel, { repeat: true }, () => h("div", "1")) }),
    );
    expect(html).not.toContain("data-blossom-clone");
    expect(createRepeat).not.toHaveBeenCalled();
  });
});
