import { COMMANDS } from "@blossom-carousel/navigation";
import {
  connectNavigation,
  ensureNavButton,
  getForId,
  setCommandBehavior,
} from "./navigation";

const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement === "undefined"
    ? (class {} as unknown as typeof HTMLElement)
    : HTMLElement;

export class BlossomPrev extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return ["behavior"];
  }

  private cleanup?: () => void;
  private button?: HTMLButtonElement;

  connectedCallback(): void {
    const forId = getForId(this);
    this.button = ensureNavButton(this, "Previous");
    this.button.setAttribute("command", COMMANDS.prev);
    this.button.setAttribute("commandfor", forId);
    this.button.setAttribute("aria-controls", forId);
    this.button.setAttribute("aria-label", "Previous slide");
    this.applyBehavior();

    this.cleanup = connectNavigation(forId, (state) => {
      if (this.button) this.button.disabled = !state.canPrev;
    });
  }

  attributeChangedCallback(): void {
    this.applyBehavior();
  }

  private applyBehavior(): void {
    if (this.button) setCommandBehavior(this.button, this.getAttribute("behavior"));
  }

  disconnectedCallback(): void {
    this.cleanup?.();
  }
}

if (
  typeof customElements !== "undefined" &&
  !customElements.get("blossom-prev")
) {
  customElements.define("blossom-prev", BlossomPrev);
}
