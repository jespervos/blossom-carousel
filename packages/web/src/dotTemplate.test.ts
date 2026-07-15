import { describe, expect, it, vi } from "vitest";
import {
  cloneDotFromPrototype,
  createDefaultDot,
  findDotPrototype,
  mergeDotElement,
  renderCustomDot,
} from "./dotTemplate";

describe("dotTemplate", () => {
  it("finds a blossom-dot prototype child", () => {
    const host = document.createElement("blossom-dots");
    host.innerHTML = `<blossom-dot><button class="my-dot"></button></blossom-dot>`;

    expect(findDotPrototype(host)?.localName).toBe("blossom-dot");
  });

  it("creates default dots with a marker span and command props", () => {
    const button = createDefaultDot(2, true, "my-carousel");

    expect(button.hasAttribute("data-blossom-dot")).toBe(true);
    expect(button.querySelector("[data-blossom-dot-marker]")).not.toBeNull();
    expect(button.getAttribute("command")).toBe("--blossom-goto-2");
    expect(button.getAttribute("commandfor")).toBe("my-carousel");
    expect(button.getAttribute("aria-current")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Go to slide 3");
    expect(button.getAttribute("aria-controls")).toBe("my-carousel");
  });

  it("clones a blossom-dot prototype and merges navigation props", () => {
    const prototype = document.createElement("blossom-dot");
    prototype.innerHTML = `<button type="button" class="my-dot">•</button>`;

    const dot = cloneDotFromPrototype(prototype, 1, false, "my-carousel");

    expect(dot).toBeInstanceOf(HTMLElement);
    const button = (dot as HTMLElement).querySelector("button");
    expect(button?.className).toBe("my-dot");
    expect(button?.hasAttribute("data-blossom-dot")).toBe(false);
    expect(button?.getAttribute("command")).toBe("--blossom-goto-1");
    expect(button?.getAttribute("commandfor")).toBe("my-carousel");
    expect(button?.getAttribute("aria-label")).toBe("Go to slide 2");
    expect(button?.hasAttribute("aria-current")).toBe(false);
  });

  it("does not override consumer aria attributes", () => {
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Custom label");
    mergeDotElement(button, 0, true, "my-carousel");

    expect(button.getAttribute("aria-label")).toBe("Custom label");
    expect(button.getAttribute("command")).toBe("--blossom-goto-0");
  });

  it("runs a renderDot callback per index and merges navigation props", () => {
    const renderDot = vi.fn((index: number) => {
      const button = document.createElement("button");
      const img = document.createElement("img");
      img.src = `/thumbs/${index}.jpg`;
      button.appendChild(img);
      return button;
    });

    const dot = renderCustomDot(renderDot, 2, true, "my-carousel");

    expect(renderDot).toHaveBeenCalledWith(2, true, "my-carousel");
    const button = dot as HTMLButtonElement;
    expect(button.querySelector("img")?.src).toContain("/thumbs/2.jpg");
    expect(button.getAttribute("command")).toBe("--blossom-goto-2");
    expect(button.getAttribute("commandfor")).toBe("my-carousel");
    expect(button.getAttribute("aria-current")).toBe("true");
  });

  it("warns when the prototype does not contain a button", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const prototype = document.createElement("blossom-dot");
    prototype.innerHTML = `<span>not a button</span>`;

    cloneDotFromPrototype(prototype, 0, false, "my-carousel");

    expect(warn).toHaveBeenCalledWith(
      "[BlossomDot] Must contain a <button> element.",
    );
    warn.mockRestore();
  });
});
