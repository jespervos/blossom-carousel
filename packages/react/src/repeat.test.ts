import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { createRepeat } from "@blossom-carousel/repeat";
import { Blossom } from "@blossom-carousel/core";
import BlossomCarousel from "./BlossomCarousel";
import { copies, installLayout, realSlides, rest, uninstallLayout, wait } from "../../repeat/test/layout";

vi.mock("@blossom-carousel/repeat", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@blossom-carousel/repeat")>();
  return { ...actual, createRepeat: vi.fn(actual.createRepeat) };
});
vi.mock("@blossom-carousel/core", () => ({
  Blossom: vi.fn(() => ({ init: vi.fn(), destroy: vi.fn() })),
}));

const slides = (ids: number[]) =>
  ids.map((i) => React.createElement("div", { key: i, className: "slide", "data-i": i }, String(i + 1)));
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

describe("BlossomCarousel repeat", () => {
  const roots: Root[] = [];
  const originalMatchMedia = window.matchMedia;
  let host: HTMLElement;

  beforeAll(() => wait(200));
  beforeEach(() => {
    installLayout();
    vi.mocked(createRepeat).mockClear();
    vi.mocked(Blossom).mockClear();
    // a touch device: the drag engine is not loaded
    window.matchMedia = vi.fn(() => ({ matches: false }) as MediaQueryList);
    host = document.createElement("div");
    document.body.append(host);
  });
  afterEach(() => {
    for (const root of roots) act(() => root.unmount());
    roots.length = 0;
    document.body.replaceChildren();
    window.matchMedia = originalMatchMedia;
    uninstallLayout();
  });

  async function render(props: Record<string, unknown>, ids = range(12)) {
    const root = roots[0] ?? createRoot(host);
    if (!roots.length) roots.push(root);
    await act(async () => root.render(React.createElement(BlossomCarousel, props, slides(ids))));
    return host.firstElementChild as HTMLElement;
  }

  it("loops on a touch device, without the drag engine", async () => {
    const scroller = await render({ repeat: true });
    expect(createRepeat).toHaveBeenCalledTimes(1);
    expect(createRepeat).toHaveBeenCalledWith(scroller);
    expect(Blossom).not.toHaveBeenCalled();
    expect(scroller.getAttribute("blossom-repeat")).toBe("true");
    expect(copies(scroller)).toHaveLength(7 * 12);
  });

  it("does not create it without the repeat prop", async () => {
    const scroller = await render({});
    expect(createRepeat).not.toHaveBeenCalled();
    expect(copies(scroller)).toHaveLength(0);
  });

  it("destroys it when repeat turns off, and creates it again when it turns on", async () => {
    const plain = (await render({})).innerHTML;
    const scroller = await render({ repeat: true });
    const first = vi.mocked(createRepeat).mock.results[0].value;
    const destroy = vi.spyOn(first, "destroy");
    await render({ repeat: false });
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(scroller.innerHTML).toBe(plain);
    await render({ repeat: true });
    expect(createRepeat).toHaveBeenCalledTimes(2);
    expect(copies(scroller)).toHaveLength(7 * 12);
  });

  it("destroys it on unmount", async () => {
    await render({ repeat: true });
    const destroy = vi.spyOn(vi.mocked(createRepeat).mock.results[0].value, "destroy");
    act(() => roots.pop()!.unmount());
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it("loops alongside the drag engine with load always", async () => {
    const scroller = await render({ repeat: true, load: "always" });
    await act(() => wait(0)); // the engine is imported dynamically
    expect(Blossom).toHaveBeenCalledWith(scroller, {});
    expect(copies(scroller)).toHaveLength(7 * 12);
  });

  it("follows React adding, removing and reordering slides", async () => {
    const scroller = await render({ repeat: true });
    for (const ids of [range(13), [12, ...range(12).filter((i) => i !== 3)], [5, 4, 3, 2, 1, 0, 6, 7, 8, 9, 10, 11]]) {
      await render({ repeat: true }, ids);
      await act(rest);
      expect(realSlides(scroller).map((el) => (el as HTMLElement).dataset.i)).toEqual(ids.map(String));
      expect(copies(scroller)).toHaveLength(7 * ids.length);
      expect(realSlides(scroller)[0].getBoundingClientRect().left).toBe(0);
    }
    expect(createRepeat).toHaveBeenCalledTimes(1);
  });

  it("renders on the server without creating it", () => {
    const html = renderToString(React.createElement(BlossomCarousel, { repeat: true }, slides(range(3))));
    expect(html).not.toContain("data-blossom-clone");
    expect(createRepeat).not.toHaveBeenCalled();
  });
});
