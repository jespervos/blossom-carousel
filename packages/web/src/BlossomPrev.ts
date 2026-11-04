import { COMMANDS } from "@blossom-carousel/navigation";
import {
  applyNavLabel,
  connectNavigation,
  ensureNavButton,
  getForId,
  setCommandBehavior,
} from "./navigation";

const DEFAULT_LABEL = "Previous slide";

const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement === "undefined"
    ? (class {} as unknown as typeof HTMLElement)
    : HTMLElement;

export class BlossomPrev extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return ["behavior", "aria-label"];
  }

  private cleanup?: () => void;
  private button?: HTMLButtonElement;

  connectedCallback(): void {
    const forId = getForId(this);
    this.button = ensureNavButton(this, "Previous");
    this.button.setAttribute("command", COMMANDS.prev);
    this.button.setAttribute("commandfor", forId);
    this.button.setAttribute("aria-controls", forId);
    applyNavLabel(this, this.button, DEFAULT_LABEL);
    this.applyBehavior();

    this.cleanup = connectNavigation(forId, (state) => {
      if (this.button) this.button.disabled = !state.canPrev;
    });
  }

  attributeChangedCallback(name: string): void {
    if (name === "aria-label") {
      if (this.button) applyNavLabel(this, this.button, DEFAULT_LABEL);
      return;
    }
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
