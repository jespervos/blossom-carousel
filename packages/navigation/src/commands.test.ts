import { afterEach, describe, expect, it, vi } from "vitest";
import { createCommands, registerCommands } from "./commands";

function scrollerWithSlide(): { scroller: HTMLElement; slide: HTMLElement } {
  const scroller = document.createElement("div");
  const slide = document.createElement("div");
  slide.setAttribute("data-blossom-slide", "");
  slide.scrollIntoView = vi.fn();
  scroller.append(slide);
  document.body.append(scroller);
  return { scroller, slide };
}

describe("createCommands", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("scrolls the indexed slide into view", () => {
    const { scroller, slide } = scrollerWithSlide();
    const unregister = registerCommands(scroller);
    const commands = createCommands(() => scroller);

    commands.goTo(0);

    expect(slide.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
      inline: "start",
      behavior: "smooth",
    });
    unregister();
  });

  it("passes an explicit scroll behavior through the command", () => {
    const { scroller, slide } = scrollerWithSlide();
    const unregister = registerCommands(scroller);
    const commands = createCommands(() => scroller);

    commands.goTo(0, { behavior: "instant" });

    expect(slide.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
    unregister();
  });

  it("pages to the next slide with the requested behavior", () => {
    const scroller = document.createElement("div");
    scroller.scrollBy = vi.fn();
    document.body.append(scroller);
    const unregister = registerCommands(scroller);
    const commands = createCommands(() => scroller);

    commands.next({ behavior: "instant" });

    expect(scroller.scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
    unregister();
  });

  it("reads the scroller when the method is called", () => {
    const { scroller, slide } = scrollerWithSlide();
    const unregister = registerCommands(scroller);
    let current: HTMLElement | null = null;
    const commands = createCommands(() => current);

    commands.goTo(0);
    expect(slide.scrollIntoView).not.toHaveBeenCalled();

    current = scroller;
    commands.goTo(0);
    expect(slide.scrollIntoView).toHaveBeenCalledOnce();
    unregister();
  });

  it("reads scroll behavior from the button that sent the command", () => {
    const { scroller, slide } = scrollerWithSlide();
    const unregister = registerCommands(scroller);
    const button = document.createElement("button");
    button.setAttribute("data-blossom-behavior", "instant");
    const event = new Event("command");
    Object.assign(event, { command: "--blossom-goto-0", source: button });

    scroller.dispatchEvent(event);

    expect(slide.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
    unregister();
  });

  it("copies the button behavior through the click fallback", () => {
    const { scroller, slide } = scrollerWithSlide();
    scroller.id = "gallery";
    const unregister = registerCommands(scroller);
    const button = document.createElement("button");
    button.setAttribute("command", "--blossom-goto-0");
    button.setAttribute("commandfor", "gallery");
    button.setAttribute("data-blossom-behavior", "instant");
    document.body.append(button);

    button.click();

    expect(slide.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "instant" }),
    );
    unregister();
  });

  it("prefers an explicit behavior over the button attribute", () => {
    const { scroller, slide } = scrollerWithSlide();
    const unregister = registerCommands(scroller);
    const button = document.createElement("button");
    button.setAttribute("data-blossom-behavior", "instant");

    scroller.dispatchEvent(
      new CustomEvent("command", {
        detail: {
          command: "--blossom-goto-0",
          behavior: "smooth",
          source: button,
        },
      }),
    );

    expect(slide.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: "smooth" }),
    );
    unregister();
  });

  it("does nothing when the scroller is missing", () => {
    const commands = createCommands(() => null);
    expect(() => commands.prev()).not.toThrow();
    expect(() => commands.goTo(3)).not.toThrow();
  });
});
