import { afterEach, describe, expect, it } from "vitest";
import { flushSync, mount, unmount } from "svelte";
import BlossomPrev from "../src/BlossomPrev.svelte";

describe("navigation behavior", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
    document.body.replaceChildren();
  });

  it("puts behavior on the command button", () => {
    const target = document.createElement("div");
    document.body.append(target);
    const prev = mount(BlossomPrev, {
      target,
      props: { forId: "gallery", behavior: "instant" },
    });
    flushSync();
    cleanups.push(() => unmount(prev));

    expect(
      target.querySelector("button")?.getAttribute("data-blossom-behavior"),
    ).toBe("instant");
  });

  it("lets an explicit data-blossom-behavior attribute win", () => {
    const target = document.createElement("div");
    document.body.append(target);
    const prev = mount(BlossomPrev, {
      target,
      props: {
        forId: "gallery",
        behavior: "instant",
        "data-blossom-behavior": "auto",
      },
    });
    flushSync();
    cleanups.push(() => unmount(prev));

    expect(
      target.querySelector("button")?.getAttribute("data-blossom-behavior"),
    ).toBe("auto");
  });
});
