import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import { createRepeat } from "@blossom-carousel/repeat";
import { Blossom } from "@blossom-carousel/core";
import RepeatFixture from "./RepeatFixture.svelte";
import { copies, installLayout, realSlides, rest, uninstallLayout, wait } from "../../repeat/test/layout";

vi.mock("@blossom-carousel/repeat", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@blossom-carousel/repeat")>();
  return { ...actual, createRepeat: vi.fn(actual.createRepeat) };
});
vi.mock("@blossom-carousel/core", () => ({
  Blossom: vi.fn(() => ({ init: vi.fn(), destroy: vi.fn() })),
}));

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
type Fixture = { update(next: { repeat?: boolean; ids?: number[] }): void };

describe("BlossomCarousel repeat", () => {
  const originalMatchMedia = window.matchMedia;
  let view: (Fixture & Record<string, unknown>) | undefined;

  beforeAll(() => wait(200));
  beforeEach(() => {
    installLayout();
    vi.mocked(createRepeat).mockClear();
    vi.mocked(Blossom).mockClear();
    // a touch device: the drag engine is not loaded
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
  });
  afterEach(() => {
    if (view) unmount(view);
    view = undefined;
    document.body.replaceChildren();
    window.matchMedia = originalMatchMedia;
    uninstallLayout();
  });

  function render(props: { initialRepeat?: boolean; load?: "always" | "conditional" }) {
    const target = document.createElement("div");
    document.body.append(target);
    view = mount(RepeatFixture, { target, props }) as unknown as Fixture & Record<string, unknown>;
    flushSync();
    return target.querySelector("[blossom-carousel]") as HTMLElement;
  }

  it("loops on a touch device, without the drag engine", () => {
    const scroller = render({ initialRepeat: true });
    expect(createRepeat).toHaveBeenCalledTimes(1);
    expect(createRepeat).toHaveBeenCalledWith(scroller);
    expect(Blossom).not.toHaveBeenCalled();
    expect(copies(scroller)).toHaveLength(7 * 12);
  });

  it("does not create it without the repeat prop", () => {
    const scroller = render({});
    expect(createRepeat).not.toHaveBeenCalled();
    expect(copies(scroller)).toHaveLength(0);
  });

  it("destroys it when repeat turns off, creates it when it turns on, and destroys it on unmount", () => {
    const scroller = render({});
    const plain = scroller.innerHTML;
    view!.update({ repeat: true });
    flushSync();
    expect(createRepeat).toHaveBeenCalledTimes(1);
    expect(copies(scroller)).toHaveLength(7 * 12);
    const first = vi.spyOn(vi.mocked(createRepeat).mock.results[0].value, "destroy");
    view!.update({ repeat: false });
    flushSync();
    expect(first).toHaveBeenCalledTimes(1);
    expect(scroller.innerHTML).toBe(plain);
    view!.update({ repeat: true });
    flushSync();
    const second = vi.spyOn(vi.mocked(createRepeat).mock.results[1].value, "destroy");
    unmount(view!);
    view = undefined;
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("loops alongside the drag engine with load always", async () => {
    const scroller = render({ initialRepeat: true, load: "always" });
    await wait(0); // the engine is imported dynamically
    expect(Blossom).toHaveBeenCalledWith(scroller, {});
    expect(copies(scroller)).toHaveLength(7 * 12);
  });

  it("follows Svelte adding, removing and reordering slides", async () => {
    const scroller = render({ initialRepeat: true });
    for (const ids of [range(13), [12, ...range(12).filter((i) => i !== 3)], [5, 4, 3, 2, 1, 0, 6, 7, 8, 9, 10, 11]]) {
      view!.update({ ids });
      flushSync();
      await rest();
      expect(realSlides(scroller).map((el) => (el as HTMLElement).dataset.i)).toEqual(ids.map(String));
      expect(copies(scroller)).toHaveLength(7 * ids.length);
      expect(realSlides(scroller)[0].getBoundingClientRect().left).toBe(0);
    }
  });
});
