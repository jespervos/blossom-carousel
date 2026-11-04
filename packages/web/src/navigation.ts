import {
  BEHAVIOR_ATTR,
  observeNavigationState,
  registerCommands,
  type NavigationState,
} from "@blossom-carousel/navigation";

export function connectNavigation(
  forId: string,
  onUpdate: (state: NavigationState) => void,
): () => void {
  if (!forId) return () => {};

  const scroller = document.getElementById(forId);
  if (!scroller) return () => {};

  const unregister = registerCommands(scroller);
  const unobserve = observeNavigationState(scroller, onUpdate);

  return () => {
    unregister();
    unobserve();
  };
}

export function getForId(element: HTMLElement): string {
  return element.getAttribute("for") ?? "";
}

const stampedBehavior = new WeakSet<Element>();

/**
 * Copies a host `behavior` attribute onto the button that sends the command.
 * A behavior the author set on the button itself takes precedence.
 */
export function setCommandBehavior(
  button: HTMLElement,
  behavior: string | null,
): void {
  if (button.hasAttribute(BEHAVIOR_ATTR) && !stampedBehavior.has(button)) {
    return;
  }
  if (behavior) {
    button.setAttribute(BEHAVIOR_ATTR, behavior);
    stampedBehavior.add(button);
  } else {
    button.removeAttribute(BEHAVIOR_ATTR);
    stampedBehavior.delete(button);
  }
}

const LABEL_ATTR = "aria-label";
const labelOrigin = new WeakMap<Element, "default" | "host">();

/**
 * Names the inner button. A label the author set on the button wins; otherwise
 * a host `aria-label` is moved onto the button (a label on the custom element
 * itself isn't exposed to assistive technology); otherwise the default is used.
 */
export function applyNavLabel(
  host: HTMLElement,
  button: HTMLElement,
  defaultLabel: string,
): void {
  if (button.hasAttribute(LABEL_ATTR) && !labelOrigin.has(button)) return;

  const hostLabel = host.getAttribute(LABEL_ATTR);
  if (hostLabel) {
    button.setAttribute(LABEL_ATTR, hostLabel);
    labelOrigin.set(button, "host");
    host.removeAttribute(LABEL_ATTR);
    return;
  }

  if (labelOrigin.get(button) === "host") return;
  button.setAttribute(LABEL_ATTR, defaultLabel);
  labelOrigin.set(button, "default");
}

function isAuthorContent(node: Node): boolean {
  if (node.nodeType === Node.ELEMENT_NODE) return true;
  return node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim());
}

/** Reuses a generated or author-provided button so reconnects stay idempotent. */
export function ensureNavButton(
  host: HTMLElement,
  fallbackLabel: string,
): HTMLButtonElement {
  const existing = host.querySelector(":scope > button");
  if (existing instanceof HTMLButtonElement) {
    return existing;
  }

  const button = document.createElement("button");
  button.type = "button";
  const content = Array.from(host.childNodes).filter(isAuthorContent);
  if (content.length > 0) {
    button.replaceChildren(...content);
  } else {
    button.textContent = fallbackLabel;
  }
  host.replaceChildren(button);
  return button;
}
