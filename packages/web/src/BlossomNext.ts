import { COMMANDS } from "@blossom-carousel/navigation";
import { connectNavigation, getForId } from "./navigation";

const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement === "undefined"
    ? (class {} as unknown as typeof HTMLElement)
    : HTMLElement;

export class BlossomNext extends HTMLElementBase {
  private cleanup?: () => void;
  private button?: HTMLButtonElement;

  connectedCallback(): void {
    const forId = getForId(this);
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.setAttribute("command", COMMANDS.next);
    this.button.setAttribute("commandfor", forId);
    this.button.setAttribute("aria-controls", forId);
    this.button.setAttribute("aria-label", "Next slide");
    this.button.textContent = this.textContent?.trim() || "Next";
    this.replaceChildren(this.button);

    this.cleanup = connectNavigation(forId, (state) => {
      if (this.button) this.button.disabled = !state.canNext;
    });
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
