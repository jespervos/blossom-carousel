import { afterEach, beforeEach, describe, expect, it } from "vitest";
import "./BlossomNext";
import "./BlossomPrev";

class StubResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??=
  StubResizeObserver;

describe.each([
  { tag: "blossom-next", defaultLabel: "Next slide" },
  { tag: "blossom-prev", defaultLabel: "Previous slide" },
] as const)("$tag aria-label", ({ tag, defaultLabel }) => {
  let control: HTMLElement;
  const label = () =>
    control.querySelector(":scope > button")?.getAttribute("aria-label");

  beforeEach(() => {
    control = document.createElement(tag);
    control.setAttribute("for", "missing-carousel");
  });

  afterEach(() => {
    control.remove();
  });

  it("uses the default label", () => {
    document.body.appendChild(control);
    expect(label()).toBe(defaultLabel);
  });

  it("keeps a label set on an author-provided button", () => {
    control.innerHTML = `<button type="button" aria-label="Show more products"></button>`;
    document.body.appendChild(control);
    expect(label()).toBe("Show more products");
  });

  it("moves a host aria-label onto the button", () => {
    control.setAttribute("aria-label", "More products");
    document.body.appendChild(control);

    expect(label()).toBe("More products");
    expect(control.hasAttribute("aria-label")).toBe(false);
  });

  it("prefers the button's own label over the host label", () => {
    control.setAttribute("aria-label", "From host");
    control.innerHTML = `<button type="button" aria-label="From button"></button>`;
    document.body.appendChild(control);
    expect(label()).toBe("From button");
  });

  it("applies a host label set after connecting", () => {
    document.body.appendChild(control);
    control.setAttribute("aria-label", "More products");

    expect(label()).toBe("More products");
    expect(control.hasAttribute("aria-label")).toBe(false);
  });

  it("keeps the label across a reconnect", () => {
    control.setAttribute("aria-label", "More products");
    document.body.appendChild(control);
    control.remove();
    document.body.appendChild(control);

    expect(label()).toBe("More products");
  });
});

describe.each([
  { tag: "blossom-next", fallback: "Next" },
  { tag: "blossom-prev", fallback: "Previous" },
] as const)("$tag content", ({ tag, fallback }) => {
  let control: HTMLElement;

  beforeEach(() => {
    control = document.createElement(tag);
    control.setAttribute("for", "missing-carousel");
  });

  afterEach(() => {
    control.remove();
  });

  it("copies behavior onto the inner button", () => {
    control.setAttribute("behavior", "instant");
    document.body.appendChild(control);

    expect(
      control.querySelector("button")?.getAttribute("data-blossom-behavior"),
    ).toBe("instant");
  });

  it("keeps a behavior set on an author-provided button", () => {
    control.setAttribute("behavior", "instant");
    control.innerHTML = `<button type="button" data-blossom-behavior="auto"></button>`;
    document.body.appendChild(control);
    control.removeAttribute("behavior");

    expect(
      control.querySelector("button")?.getAttribute("data-blossom-behavior"),
    ).toBe("auto");
  });

  it("clears the behavior when the host attribute is removed", () => {
    control.setAttribute("behavior", "instant");
    document.body.appendChild(control);
    control.removeAttribute("behavior");

    expect(
      control.querySelector("button")?.hasAttribute("data-blossom-behavior"),
    ).toBe(false);
  });

  it("uses the default label when empty", () => {
    document.body.appendChild(control);

    const button = control.querySelector<HTMLButtonElement>(":scope > button");
    expect(control.querySelectorAll("button")).toHaveLength(1);
    expect(button?.textContent).toBe(fallback);
  });

  it("falls back to the default label for whitespace-only children", () => {
    control.append("  \n  ");
    document.body.appendChild(control);

    const button = control.querySelector<HTMLButtonElement>(":scope > button");
    expect(button?.textContent).toBe(fallback);
  });

  it("moves SVG children into the inner button", () => {
    control.innerHTML = `<svg data-icon></svg>`;
    document.body.appendChild(control);

    const button = control.querySelector<HTMLButtonElement>(":scope > button");
    expect(button?.querySelector("svg[data-icon]")).not.toBeNull();
    expect(control.querySelectorAll("button")).toHaveLength(1);
  });

  it("reuses the generated button on reconnect instead of nesting", () => {
    control.innerHTML = `<svg data-icon></svg>`;
    document.body.appendChild(control);

    const firstButton = control.querySelector<HTMLButtonElement>(":scope > button");
    expect(firstButton).not.toBeNull();

    control.remove();
    document.body.appendChild(control);

    expect(control.querySelectorAll("button")).toHaveLength(1);
    expect(control.querySelectorAll("button button")).toHaveLength(0);
    expect(control.querySelector(":scope > button")).toBe(firstButton);
    expect(firstButton?.querySelector("svg[data-icon]")).not.toBeNull();
  });
});
