import {
  BlossomCarousel,
  BlossomDot,
  BlossomDots,
  BlossomNext,
  BlossomPrev,
} from "@blossom-carousel/web";

const carousel = new BlossomCarousel();
carousel.goTo(2, { behavior: "smooth" });
// @ts-expect-error behavior is a ScrollBehavior
carousel.goTo(2, { behavior: "sideways" });

const dots = new BlossomDots();
dots.renderDot = (index, active, forId) => {
  const dot = document.createElement("button");
  dot.textContent = `${index.toFixed(0)} ${active ? forId.toUpperCase() : ""}`;
  return dot;
};
// @ts-expect-error renderDot must return an Element
dots.renderDot = () => "dot";

// @ts-expect-error a class, not a symbol
export const prev: symbol = BlossomPrev;
export const elements: HTMLElement[] = [new BlossomNext(), new BlossomDot()];
