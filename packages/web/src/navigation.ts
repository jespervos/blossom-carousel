import {
  COMMANDS,
  observeNavigationState,
  registerCommands,
} from "@blossom-carousel/navigation";

// Re-declared locally (rather than imported) so the generated declaration files
// don't reference the internal, unpublished navigation package.
export interface NavigationState {
  activeIndex: number;
  count: number;
  canPrev: boolean;
  canNext: boolean;
}

const INITIAL: NavigationState = {
  activeIndex: -1,
  count: 0,
  canPrev: false,
  canNext: false,
};

/**
 * Base class for navigation controls. Connects to a carousel scroller (resolved
 * by the `for` attribute) using only native APIs: registers the command handler
 * and tracks the live navigation state. Never touches a Blossom instance, so it
 * works even when Blossom isn't initialized.
 *
 * Note: the controls' buttons live inside shadow DOM, where the `commandfor`
 * id reference can't cross the shadow boundary, so clicks dispatch the same
 * synthetic `command` event the navigation fallback uses.
 */
abstract class BlossomControl extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["for"];
  }

  private scroller: HTMLElement | null = null;
  private cleanup: (() => void) | null = null;

  connectedCallback(): void {
    this.attach();
  }

  disconnectedCallback(): void {
    this.detach();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this.attach();
  }

  private detach(): void {
    this.cleanup?.();
    this.cleanup = null;
    this.scroller = null;
  }

  private attach(): void {
    this.detach();
    this.update({ ...INITIAL });

    const id = this.getAttribute("for");
    if (!id) return;

    const scroller = document.getElementById(id);
    if (!scroller) {
      // The control may be parsed before the carousel; retry once the
      // document has finished parsing.
      if (document.readyState === "loading") {
        const retry = (): void => this.attach();
        document.addEventListener("DOMContentLoaded", retry, { once: true });
        this.cleanup = () =>
          document.removeEventListener("DOMContentLoaded", retry);
      }
      return;
    }

    this.scroller = scroller;
    const unregister = registerCommands(scroller);
    const unobserve = observeNavigationState(scroller, (next) => {
      this.update(next);
    });
    this.cleanup = () => {
      unregister();
      unobserve();
    };
  }

  protected dispatch(command: string): void {
    this.scroller?.dispatchEvent(
      new CustomEvent("command", { bubbles: false, detail: { command } }),
    );
  }

  protected abstract update(state: NavigationState): void;
}

function createControlButton(
  shadow: ShadowRoot,
  label: string,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.disabled = true;
  button.setAttribute("aria-label", label);
  const slot = document.createElement("slot");
  slot.textContent = label;
  button.appendChild(slot);
  shadow.appendChild(button);
  return button;
}

export class BlossomPrev extends BlossomControl {
  private button: HTMLButtonElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.button = createControlButton(shadow, "Previous");
    this.button.addEventListener("click", () => this.dispatch(COMMANDS.prev));
  }

  protected update(state: NavigationState): void {
    this.button.disabled = !state.canPrev;
  }
}

export class BlossomNext extends BlossomControl {
  private button: HTMLButtonElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.button = createControlButton(shadow, "Next");
    this.button.addEventListener("click", () => this.dispatch(COMMANDS.next));
  }

  protected update(state: NavigationState): void {
    this.button.disabled = !state.canNext;
  }
}

/*
  Dot styles live in the shadow root, so there are no specificity battles with
  page styles. The themeable values are exposed as custom properties, which
  inherit through the shadow boundary:
    --blossom-dots-gap, --blossom-dot-size, --blossom-dot-radius,
    --blossom-dot-color, --blossom-dot-opacity, --blossom-dot-hover-opacity,
    --blossom-dot-active-opacity
*/
const DOTS_STYLE = `
:host {
  display: flex;
  gap: var(--blossom-dots-gap, 0.5rem);
  align-items: center;
  justify-content: center;
}

button {
  inline-size: var(--blossom-dot-size, 0.625rem);
  block-size: var(--blossom-dot-size, 0.625rem);
  padding: 0;
  border: 0;
  border-radius: var(--blossom-dot-radius, 50%);
  background: var(--blossom-dot-color, currentColor);
  opacity: var(--blossom-dot-opacity, 0.35);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

button:hover {
  opacity: var(--blossom-dot-hover-opacity, 0.6);
}

button[aria-current="true"] {
  opacity: var(--blossom-dot-active-opacity, 1);
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
`;

export class BlossomDots extends BlossomControl {
  private buttons: HTMLButtonElement[] = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = DOTS_STYLE;
    shadow.appendChild(style);
    this.setAttribute("role", "group");
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", "Choose slide to display");
    }
  }

  protected update(state: NavigationState): void {
    if (this.buttons.length !== state.count) this.render(state.count);
    this.buttons.forEach((button, i) => {
      if (state.activeIndex === i) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  private render(count: number): void {
    for (const button of this.buttons) button.remove();
    this.buttons = Array.from({ length: count }, (_, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", `Go to slide ${i + 1}`);
      button.addEventListener("click", () =>
        this.dispatch(`${COMMANDS.gotoPrefix}${i}`),
      );
      this.shadowRoot!.appendChild(button);
      return button;
    });
  }
}
