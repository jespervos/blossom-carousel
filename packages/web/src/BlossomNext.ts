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

export class BlossomNext extends HTMLElementBase {
  static get observedAttributes(): string[] {
    return ["behavior"];
  }

  private cleanup?: () => void;
  private button?: HTMLButtonElement;

  connectedCallback(): void {
    const forId = getForId(this);
    this.button = ensureNavButton(this, "Next");
    this.button.setAttribute("command", COMMANDS.next);
    this.button.setAttribute("commandfor", forId);
    this.button.setAttribute("aria-controls", forId);
    this.button.setAttribute("aria-label", "Next slide");
    this.applyBehavior();

    this.cleanup = connectNavigation(forId, (state) => {
      if (this.button) this.button.disabled = !state.canNext;
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
  !customElements.get("blossom-next")
) {
  customElements.define("blossom-next", BlossomNext);
}
