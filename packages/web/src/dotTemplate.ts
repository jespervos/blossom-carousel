import { COMMANDS } from "@blossom-carousel/navigation";

export type RenderDot = (
  index: number,
  active: boolean,
  forId: string,
) => Element;

export function mergeDotElement(
  element: HTMLButtonElement,
  index: number,
  active: boolean,
  forId: string,
): void {
  element.setAttribute("command", `${COMMANDS.gotoPrefix}${index}`);
  element.setAttribute("commandfor", forId);

  setDotActive(element, active);

  if (!element.hasAttribute("aria-label")) {
    element.setAttribute("aria-label", `Go to slide ${index + 1}`);
  }

  if (!element.hasAttribute("aria-controls")) {
    element.setAttribute("aria-controls", forId);
  }
}

export function setDotActive(element: HTMLButtonElement, active: boolean): void {
  if (active) element.setAttribute("aria-current", "true");
  else element.removeAttribute("aria-current");
}

export function findDotPrototype(host: Element): Element | null {
  return host.querySelector(":scope > blossom-dot");
}

function resolveDotButton(node: Element): HTMLButtonElement | null {
  return node instanceof HTMLButtonElement ? node : node.querySelector("button");
}

function applyDotAttributes(
  node: Element,
  index: number,
  active: boolean,
  forId: string,
): Element {
  const button = resolveDotButton(node);

  if (!button) {
    console.warn("[BlossomDot] Must contain a <button> element.");
    return node;
  }

  mergeDotElement(button, index, active, forId);
  return node;
}

export function cloneDotFromPrototype(
  prototype: Element,
  index: number,
  active: boolean,
  forId: string,
): Node {
  const clone = prototype.cloneNode(true) as Element;
  return applyDotAttributes(clone, index, active, forId);
}

/**
 * Runs a consumer-supplied render callback for a single dot, mirroring the
 * index/active render-prop pattern in the other framework packages. Unlike
 * `cloneDotFromPrototype`, the returned element's content can vary per index.
 */
export function renderCustomDot(
  renderDot: RenderDot,
  index: number,
  active: boolean,
  forId: string,
): Element {
  const node = renderDot(index, active, forId);
  return applyDotAttributes(node, index, active, forId);
}

/** Updates navigation attributes on an existing dot without recreating it. */
export function patchDotElement(
  node: Element,
  index: number,
  active: boolean,
  forId: string,
): void {
  applyDotAttributes(node, index, active, forId);
}

function createDotButton(
  index: number,
  active: boolean,
  forId: string,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("data-blossom-dot", "");
  mergeDotElement(button, index, active, forId);
  return button;
}

export function createDefaultDot(
  index: number,
  active: boolean,
  forId: string,
): HTMLButtonElement {
  const button = createDotButton(index, active, forId);
  const marker = document.createElement("span");
  marker.setAttribute("data-blossom-dot-marker", "");
  button.appendChild(marker);
  return button;
}
