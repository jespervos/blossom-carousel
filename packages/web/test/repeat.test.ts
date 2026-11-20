import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createRepeat } from "@blossom-carousel/repeat";
import { Blossom } from "@blossom-carousel/core";
import "../src/index";
import { copies, installLayout, uninstallLayout, wait } from "../../repeat/test/layout";

vi.mock("@blossom-carousel/repeat", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@blossom-carousel/repeat")>();
  return { ...actual, createRepeat: vi.fn(actual.createRepeat) };
});
vi.mock("@blossom-carousel/core", () => ({
  Blossom: vi.fn(() => ({ init: vi.fn(), destroy: vi.fn() })),
}));

const markup = (attrs = "") =>
  `<blossom-carousel ${attrs}>${Array.from({ length: 12 }, (_, i) => `<div class="slide" data-i="${i}">${i + 1}</div>`).join("")}</blossom-carousel>`;

describe("<blossom-carousel repeat>", () => {
  beforeAll(() => wait(200));
  beforeEach(() => {
    installLayout();
    vi.mocked(createRepeat).mockClear();
    vi.mocked(Blossom).mockClear();
  });
  afterEach(() => {
    document.body.replaceChildren();
    uninstallLayout();
  });

  function render(attrs?: string) {
    document.body.innerHTML = markup(attrs);
    return document.body.firstElementChild as HTMLElement;
  }

  it("loops with the repeat attribute, after core is set up", () => {
    const el = render("repeat");
    expect(createRepeat).toHaveBeenCalledTimes(1);
    expect(createRepeat).toHaveBeenCalledWith(el);
    expect(vi.mocked(Blossom).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(createRepeat).mock.invocationCallOrder[0],
    );
    expect(copies(el)).toHaveLength(7 * 12);
  });

  it("does not loop without it", () => {
    const el = render();
    expect(createRepeat).not.toHaveBeenCalled();
    expect(copies(el)).toHaveLength(0);
  });

  it("follows the attribute, and stops when the element leaves the page", () => {
    const el = render();
    const plain = el.innerHTML;
    el.setAttribute("repeat", "");
    expect(copies(el)).toHaveLength(7 * 12);
    el.setAttribute("repeat", "true"); // still on: no second instance
    expect(createRepeat).toHaveBeenCalledTimes(1);
    const first = vi.spyOn(vi.mocked(createRepeat).mock.results[0].value, "destroy");
    el.removeAttribute("repeat");
    expect(first).toHaveBeenCalledTimes(1);
    expect(el.innerHTML).toBe(plain);
    el.toggleAttribute("repeat", true);
    const second = vi.spyOn(vi.mocked(createRepeat).mock.results[1].value, "destroy");
    el.remove();
    expect(second).toHaveBeenCalledTimes(1);
    expect(el.innerHTML).toBe(plain);
    document.body.append(el); // and starts again when it comes back
    expect(createRepeat).toHaveBeenCalledTimes(3);
    expect(copies(el)).toHaveLength(7 * 12);
  });
});
